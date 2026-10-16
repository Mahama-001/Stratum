import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { getJournalEntries, getJournalAnalytics, createJournalEntry } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    // Use default test/demo user if not logged in so traders can explore
    let userId = 'usr_guest_demo';
    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        userId = session.userId;
      }
    }

    const entries = getJournalEntries(userId);
    const analytics = getJournalAnalytics(userId);

    return NextResponse.json({
      success: true,
      entries,
      analytics,
    });
  } catch (error) {
    console.error('Fetch journal error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade journal entries.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    let userId = 'usr_guest_demo';
    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        userId = session.userId;
      }
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const {
      asset,
      direction,
      entryPrice,
      stopLoss,
      takeProfit,
      exitPrice,
      lotSize,
      pnl,
      riskReward,
      strategyTag,
      emotionalState,
      notes,
      status,
      openedAt,
      closedAt,
    } = (body || {}) as Record<string, unknown>;

    if (!asset || typeof asset !== 'string') {
      return NextResponse.json({ error: 'Asset instrument symbol is required.' }, { status: 400 });
    }

    if (direction !== 'BUY' && direction !== 'SELL') {
      return NextResponse.json({ error: 'Direction must be BUY or SELL.' }, { status: 400 });
    }

    const numEntry = Number(entryPrice);
    const numSl = Number(stopLoss);
    const numTp = Number(takeProfit);
    const numLots = Number(lotSize) || 1.0;

    if (isNaN(numEntry) || numEntry <= 0) {
      return NextResponse.json({ error: 'Valid entry price is required.' }, { status: 400 });
    }

    const newEntry = createJournalEntry({
      userId,
      asset: asset.trim(),
      direction,
      entryPrice: numEntry,
      stopLoss: isNaN(numSl) ? numEntry : numSl,
      takeProfit: isNaN(numTp) ? numEntry : numTp,
      exitPrice: exitPrice ? Number(exitPrice) : null,
      lotSize: numLots,
      pnl: pnl !== undefined ? Number(pnl) : 0,
      riskReward: riskReward !== undefined ? Number(riskReward) : 0,
      strategyTag: typeof strategyTag === 'string' ? strategyTag.trim() : null,
      emotionalState: typeof emotionalState === 'string' ? emotionalState.trim() : null,
      notes: typeof notes === 'string' ? notes.trim() : null,
      status: (status as 'OPEN' | 'CLOSED' | 'CANCELLED') || 'CLOSED',
      openedAt: typeof openedAt === 'string' ? openedAt : undefined,
      closedAt: typeof closedAt === 'string' ? closedAt : undefined,
    });

    const analytics = getJournalAnalytics(userId);

    return NextResponse.json({
      success: true,
      entry: newEntry,
      analytics,
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry.' },
      { status: 500 }
    );
  }
}
