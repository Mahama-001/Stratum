import { NextResponse } from 'next/server';
import { findUserByEmail, sanitizeUser } from '@/lib/db';
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { loginRateLimiter, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = loginRateLimiter.check(`login:${ip}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.reset - Math.ceil(Date.now() / 1000)),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object.' },
        { status: 400 }
      );
    }

    const { email, password } = body as Record<string, unknown>;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required and must be strings.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Guard against oversized payloads
    if (cleanEmail.length > 254 || password.length > 128) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = findUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    loginRateLimiter.reset(`login:${ip}`);

    // Two-Factor Authentication Check
    if (user.twoFactorEnabled === 1) {
      const { generateVerificationCode, sendTwoFactorEmail } = await import('@/lib/email');
      const { saveTwoFactorChallenge } = await import('@/lib/db');
      const code = generateVerificationCode();
      saveTwoFactorChallenge(cleanEmail, code, 5);
      const emailResult = await sendTwoFactorEmail(cleanEmail, code, user.name);

      if (!emailResult.success) {
        return NextResponse.json(
          { error: emailResult.error || 'Failed to dispatch 2FA security code.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        email: cleanEmail,
        message: 'A 6-digit two-factor verification code has been sent to your email.',
        previewCode: emailResult.previewCode,
      });
    }

    const safeUser = sanitizeUser(user);

    // Create session token
    const token = await createSessionToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      user: safeUser,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error while logging in.' },
      { status: 500 }
    );
  }
}
