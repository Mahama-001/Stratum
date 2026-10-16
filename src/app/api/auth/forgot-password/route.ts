import { NextResponse } from 'next/server';
import { findUserByEmail, savePasswordReset } from '@/lib/db';
import { generateVerificationCode, sendPasswordResetEmail } from '@/lib/email';
import { signupRateLimiter, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = signupRateLimiter.check(`forgot-pw:${ip}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { email } = (body || {}) as Record<string, unknown>;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = findUserByEmail(cleanEmail);

    // If user exists, generate reset code and dispatch email
    if (user) {
      const code = generateVerificationCode();
      savePasswordReset(cleanEmail, code, 10);
      const emailResult = await sendPasswordResetEmail(cleanEmail, code, user.name);

      if (!emailResult.success) {
        return NextResponse.json(
          { error: emailResult.error || 'Failed to dispatch password reset email.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'A 6-digit reset code has been sent to your email address.',
        email: cleanEmail,
        previewCode: emailResult.previewCode,
      });
    }

    // Generic safe response to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset code has been dispatched.',
      email: cleanEmail,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing password reset.' },
      { status: 500 }
    );
  }
}
