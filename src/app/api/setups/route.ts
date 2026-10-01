import { NextResponse } from 'next/server';
import { INITIAL_STRATEGY_SETUPS } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    setups: INITIAL_STRATEGY_SETUPS
  });
}
