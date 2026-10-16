import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getDatabaseMetadata, getTableRecords, executeAdminQuery, logAuditEvent } from '@/lib/db';

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    if (table) {
      const records = getTableRecords(table, { limit, offset });
      return NextResponse.json(records);
    } else {
      const metadata = getDatabaseMetadata();
      return NextResponse.json(metadata);
    }
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Database inspection error',
    }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'SQL query cannot be empty' }, { status: 400 });
    }

    const trimmed = query.trim();

    // Log raw SQL execution
    logAuditEvent('RAW_SQL_EXECUTE', 'admin', `Executed SQL: ${trimmed.substring(0, 150)}${trimmed.length > 150 ? '...' : ''}`);

    const result = executeAdminQuery(trimmed);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'SQL query failed',
    }, { status: 400 });
  }
}
