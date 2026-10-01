import { NextResponse } from 'next/server';
import { INITIAL_ECONOMIC_EVENTS } from '@/lib/mockData';
import { EconomicEvent, TrafficLightStatus } from '@/lib/types';

export async function GET() {
  const now = Date.now();

  const events: EconomicEvent[] = INITIAL_ECONOMIC_EVENTS.map((evt) => {
    const scheduled = new Date(evt.scheduledTimeUtc).getTime();
    const diffMinutes = Math.round((scheduled - now) / 60000);

    let status: TrafficLightStatus = 'GREEN';
    let warning: string | undefined = undefined;

    // Traffic light indicator rules:
    // GREEN: Normal market conditions (>60m from event)
    // AMBER: 15m to 60m to red-folder event (Warning: Volatility spike, reduce position size)
    // RED: Blackout Zone (<15m before or after event)
    if (Math.abs(diffMinutes) <= 15) {
      status = 'RED';
      warning = 'PROP FIRM RULE ALERT: News trading prohibited/unprotected slippage zone (<15m window).';
    } else if (diffMinutes > 15 && diffMinutes <= 60) {
      status = 'AMBER';
      warning = `HIGH VOLATILITY WARNING: ${diffMinutes}m to Red Folder release. Reduce position size by 50%.`;
    } else {
      status = 'GREEN';
    }

    return {
      ...evt,
      minutesUntil: diffMinutes,
      status,
      blackoutWarning: warning
    };
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    events
  });
}
