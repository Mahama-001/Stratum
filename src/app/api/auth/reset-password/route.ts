import { NextResponse } from 'next/server';
import { verifyAndResetPassword } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { signupRateLimiter, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = signupRateLimiter.check(`reset-pw:${ip}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { email, code, newPassword } = (body || {}) as Record<string, unknown>;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'Password cannot exceed 128 characters.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const passwordHash = await hashPassword(newPassword);

    const result = verifyAndResetPassword(cleanEmail, cleanCode, passwordHash);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Password reset failed.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating password.' },
      { status: 500 }
    );
  }
}
