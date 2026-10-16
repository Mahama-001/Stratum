import { NextResponse } from 'next/server';
import { generateLiveEconomicEvents } from '@/lib/mockData';

export async function GET() {
  const events = generateLiveEconomicEvents(Date.now());

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    events
  });
}
