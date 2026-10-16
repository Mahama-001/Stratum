import { NextResponse } from 'next/server';
import { verifyTwoFactorChallenge } from '@/lib/db';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { signupRateLimiter, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = signupRateLimiter.check(`2fa-verify:${ip}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { email, code } = (body || {}) as Record<string, unknown>;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const result = verifyTwoFactorChallenge(cleanEmail, cleanCode);
    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error || '2FA verification failed.' }, { status: 400 });
    }

    // Generate JWT session cookie
    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Two-factor authentication verified successfully.',
      user: result.user,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during 2FA verification.' },
      { status: 500 }
    );
  }
}
