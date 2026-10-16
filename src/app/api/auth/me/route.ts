import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      authenticated: !!user,
      user,
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
}
