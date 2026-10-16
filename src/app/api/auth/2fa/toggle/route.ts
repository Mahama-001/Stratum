import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { setUserTwoFactor, findUserById } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { enabled } = (body || {}) as Record<string, unknown>;
    const isEnabled = Boolean(enabled);

    setUserTwoFactor(session.userId, isEnabled);

    const updatedUser = findUserById(session.userId);

    return NextResponse.json({
      success: true,
      twoFactorEnabled: isEnabled ? 1 : 0,
      message: `Two-factor authentication has been ${isEnabled ? 'enabled' : 'disabled'}.`,
      user: updatedUser ? { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, twoFactorEnabled: updatedUser.twoFactorEnabled } : undefined,
    });
  } catch (error) {
    console.error('2FA toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating 2FA settings.' },
      { status: 500 }
    );
  }
}
