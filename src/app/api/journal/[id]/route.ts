import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { updateJournalEntry, deleteJournalEntry, getJournalAnalytics } from '@/lib/db';

export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    let userId = 'usr_guest_demo';
    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        userId = session.userId;
      }
    }

    let updates: unknown;
    try {
      updates = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const success = updateJournalEntry(id, userId, (updates || {}) as Record<string, unknown>);
    if (!success) {
      return NextResponse.json({ error: 'Journal entry not found or unauthorized.' }, { status: 404 });
    }

    const analytics = getJournalAnalytics(userId);

    return NextResponse.json({
      success: true,
      message: 'Journal entry updated.',
      analytics,
    });
  } catch (error) {
    console.error('Update journal error:', error);
    return NextResponse.json({ error: 'Failed to update journal entry.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    let userId = 'usr_guest_demo';
    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        userId = session.userId;
      }
    }

    const success = deleteJournalEntry(id, userId);
    if (!success) {
      return NextResponse.json({ error: 'Journal entry not found or unauthorized.' }, { status: 404 });
    }

    const analytics = getJournalAnalytics(userId);

    return NextResponse.json({
      success: true,
      message: 'Journal entry deleted.',
      analytics,
    });
  } catch (error) {
    console.error('Delete journal error:', error);
    return NextResponse.json({ error: 'Failed to delete journal entry.' }, { status: 500 });
  }
}
