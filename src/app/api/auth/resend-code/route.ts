import { NextResponse } from 'next/server';
import { getEmailVerification, saveEmailVerification } from '@/lib/db';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';
import { signupRateLimiter, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = signupRateLimiter.check(`resend:${ip}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many resend attempts. Please wait 60 seconds before requesting another code.' },
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
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingVerification = getEmailVerification(cleanEmail);

    if (!existingVerification) {
      return NextResponse.json(
        { error: 'No pending registration found for this email. Please initiate registration first.' },
        { status: 404 }
      );
    }

    const newCode = generateVerificationCode();
    saveEmailVerification({
      email: cleanEmail,
      name: existingVerification.name,
      passwordHash: existingVerification.passwordHash,
      code: newCode,
      expiresInMinutes: 10,
    });

    const emailResult = await sendVerificationEmail(cleanEmail, newCode, existingVerification.name);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to dispatch verification email.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A fresh verification code has been dispatched to your email.',
      previewCode: emailResult.previewCode,
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json(
      { error: 'Internal server error while resending verification code.' },
      { status: 500 }
    );
  }
}
