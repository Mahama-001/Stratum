import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { answerGeneralQuestion } from '@/lib/copilotKnowledge';
import { aiRateLimiter, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const SYSTEM_INSTRUCTION = `You are Stratum AI — an expert trading and general-purpose intelligence co-pilot embedded in the Stratum prop trading platform.

PRIMARY DIRECTIVE:
1. DIRECT ANSWER FIRST: Always answer the user's question directly, clearly, factually, and completely. Provide direct definitions, calculations, code snippets, explanations, or market insights immediately.
2. GENERAL PURPOSE CAPABILITY: You can answer ANY question the user asks — whether about trading strategies (ICT, SMC, Order Blocks, FVGs, Wyckoff), macroeconomics (CPI, NFP, interest rates, DXY), prop firm mechanics (trailing drawdowns, daily limits, consistency rules), mathematics, general world knowledge, programming, or everyday queries.
3. CONTEXT INTEGRATION (WHEN RELEVANT): You have background telemetry from the user's dashboard (active account, buffer, lot size, asset, killzone).
   - If the user asks specifically about their trade, account, risk, or setup, utilize their live telemetry numbers directly.
   - If the user asks a general-purpose or educational question, answer the concept directly first; you may optionally add a brief, practical 1-sentence note showing how it applies to their active session if helpful.
   - NEVER deflect or refuse to answer a question because it is "general purpose" or "unrelated to the dashboard".
4. FORMATTING: Use clean, structured formatting with bold headings, clean bullet points, and readable syntax for formulas. Never leave unclosed formatting marks, raw syntax artifacts, or excessive asterisks.
5. KEEP IT SIMPLE & ACCESSIBLE: Keep explanations direct, concise, and easy to digest. Avoid convoluted academic theory, overwhelming walls of text, or needless complexity unless the user specifically requests deep technical derivations.
6. COMPLIANCE & SAFETY: Frame trading analysis as risk management, mathematical expectancy, and educational market analysis rather than personalized financial advice.`;

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = aiRateLimiter.check(`ai_chat:${ip}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be an object.' }, { status: 400 });
    }

    const { messages, context } = body as { messages?: unknown; context?: unknown };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    // Sanitize and bound conversation history (max 20 messages, max 4000 chars each)
    const sanitizedMessages: ChatMessage[] = messages
      .slice(-20)
      .filter((m): m is ChatMessage => m && typeof m === 'object' && typeof (m as ChatMessage).content === 'string')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content).slice(0, 4000),
      }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json({ error: 'At least one valid message is required.' }, { status: 400 });
    }

    const lastMsg = sanitizedMessages[sanitizedMessages.length - 1].content;
    const cleanContext = typeof context === 'string' ? context.slice(0, 10000) : '';

    const apiKey = process.env.GEMINI_API_KEY;

    // Helper to stream text smoothly in chunks
    const streamFallback = async (controller: ReadableStreamDefaultController, text: string, encoder: TextEncoder) => {
      const words = text.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const slice = words.slice(i, i + 3).join(' ') + ' ';
        const chunk = JSON.stringify({ type: 'delta', text: slice }) + '\n';
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 25));
      }
      const done = JSON.stringify({ type: 'done' }) + '\n';
      controller.enqueue(encoder.encode(done));
    };

    const encoder = new TextEncoder();

    // If no valid Gemini API key is configured, immediately stream the direct knowledge answer
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const directAnswer = answerGeneralQuestion(lastMsg, cleanContext);

      const stream = new ReadableStream({
        async start(controller) {
          try {
            await streamFallback(controller, directAnswer, encoder);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // When API key is present, attempt live streaming with Gemini models
    const client = new GoogleGenAI({ apiKey });

    // Format conversation history and telemetry context
    const contextBlock = cleanContext
      ? `\n\n[CURRENT DASHBOARD CONTEXT]\n${cleanContext}\n[END CONTEXT]\n\n`
      : '';

    const conversationHistory = sanitizedMessages
      .map((m) => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`))
      .join('\n\n');

    const fullInput = `${contextBlock}${conversationHistory}`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let receivedAnyChunk = false;

          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Stream connect timeout')), 10000)
            );

            // Use active gemini-3.8-flash with generateContentStream
            const responseStream = await Promise.race([
              client.models.generateContentStream({
                model: 'gemini-3.8-flash',
                contents: fullInput,
                config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                  temperature: 0.7,
                  maxOutputTokens: 1500,
                },
              }),
              timeoutPromise,
            ]);

            for await (const chunk of responseStream) {
              if (chunk.text) {
                receivedAnyChunk = true;
                const delta = JSON.stringify({ type: 'delta', text: chunk.text }) + '\n';
                controller.enqueue(encoder.encode(delta));
              }
            }
          } catch (streamErr) {
            console.warn('Streaming error, attempting standard generateContent fallback with gemini-3.8-flash:', streamErr);
            // Non-streaming fallback retry
            const res = await client.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: fullInput,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
                maxOutputTokens: 1500,
              },
            });
            if (res.text) {
              receivedAnyChunk = true;
              await streamFallback(controller, res.text, encoder);
            } else {
              throw streamErr;
            }
          }

          if (!receivedAnyChunk) {
            throw new Error('Empty response from model');
          }

          const done = JSON.stringify({ type: 'done' }) + '\n';
          controller.enqueue(encoder.encode(done));
        } catch (err: unknown) {
          console.warn('Gemini chat fallback activated:', err);
          const directAnswer = answerGeneralQuestion(lastMsg, cleanContext);
          await streamFallback(controller, directAnswer, encoder);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    console.error('Chat route error:', err);
    return NextResponse.json({ error: 'Internal server error while processing chat.' }, { status: 500 });
  }
}
