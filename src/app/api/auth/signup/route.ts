import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/db';
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { signupRateLimiter, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = signupRateLimiter.check(`signup:${ip}`);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
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

    const { email, password, name } = body as Record<string, unknown>;

    // Email validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { error: 'Please enter a valid email address (maximum 254 characters).' },
        { status: 400 }
      );
    }

    // Password validation (min 6, max 128 to prevent bcrypt DoS)
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required and must be a string.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: 'Password cannot exceed 128 characters.' },
        { status: 400 }
      );
    }

    // Name sanitization
    let cleanName: string | null = null;
    if (typeof name === 'string' && name.trim()) {
      cleanName = name.trim().slice(0, 100).replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    }

    const existing = findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const { generateVerificationCode, sendVerificationEmail } = await import('@/lib/email');
    const { saveEmailVerification } = await import('@/lib/db');

    const code = generateVerificationCode();
    saveEmailVerification({
      email: cleanEmail,
      name: cleanName,
      passwordHash,
      code,
      expiresInMinutes: 10,
    });

    const emailResult = await sendVerificationEmail(cleanEmail, code, cleanName);

    if (!emailResult.success) {
      const { deleteEmailVerification } = await import('@/lib/db');
      deleteEmailVerification(cleanEmail);
      return NextResponse.json(
        { error: emailResult.error || 'Failed to dispatch verification email.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        message: 'A 6-digit verification code has been sent to your email.',
        previewCode: emailResult.previewCode,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign-up error:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating account.' },
      { status: 500 }
    );
  }
}
