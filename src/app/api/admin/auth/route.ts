import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSession, getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/db';

export async function GET() {
  const isAdmin = await verifyAdminSession();
  const currentUser = await getCurrentUser();

  return NextResponse.json({
    authenticated: isAdmin,
    user: currentUser ? {
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role || 'trader',
    } : null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passkey } = body;
    const masterKey = process.env.ADMIN_SECRET_KEY || 'stratum_admin_master_2026';

    if (!passkey || passkey !== masterKey) {
      logAuditEvent('ADMIN_LOGIN_FAILED', 'unknown', 'Invalid admin passkey attempt');
      return NextResponse.json({ error: 'Invalid master passkey' }, { status: 401 });
    }

    logAuditEvent('ADMIN_LOGIN_SUCCESS', 'master_admin', 'Admin portal unlocked via master passkey');

    const response = NextResponse.json({
      success: true,
      message: 'Admin authorization granted',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: masterKey,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({
      error: 'Server error processing admin authorization',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out of admin session' });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
