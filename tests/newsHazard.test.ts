import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateLiveEconomicEvents } from '../src/lib/mockData.ts';

describe('Live Economic News Timing Engine', () => {
  it('generates events dynamically anchored to current timestamp', () => {
    const fixedNow = new Date('2026-10-12T14:00:00Z').getTime();
    const events = generateLiveEconomicEvents(fixedNow);

    assert.ok(events.length >= 10, 'Should generate a rich economic calendar');

    // All events should have valid ISO scheduled times and minutesUntil calculated relative to referenceTime
    events.forEach((evt) => {
      assert.ok(evt.id, 'Event must have an ID');
      assert.ok(evt.title, 'Event must have a title');
      assert.ok(evt.currency, 'Event must have a currency');
      assert.ok(evt.scheduledTimeUtc, 'Event must have scheduled time');
      assert.strictEqual(typeof evt.minutesUntil, 'number', 'minutesUntil must be numeric');
      
      const parsedTime = new Date(evt.scheduledTimeUtc).getTime();
      assert.ok(!isNaN(parsedTime), 'Scheduled time must be a valid date');
      const expectedDiff = Math.round((parsedTime - fixedNow) / 60000);
      assert.strictEqual(evt.minutesUntil, expectedDiff, 'minutesUntil must accurately reflect offset from reference time');
    });
  });

  it('correctly classifies prop firm blackout zone (RED) within ±15m of high impact release', () => {
    const fixedNow = new Date('2026-10-12T14:00:00Z').getTime();
    const events = generateLiveEconomicEvents(fixedNow);

    // Look for high-impact event that was released ~12 mins ago (e.g., ECB statement)
    const blackoutEvent = events.find((e) => e.impact === 'HIGH' && Math.abs(e.minutesUntil) <= 15);
    assert.ok(blackoutEvent, 'Should identify an active blackout event');
    assert.strictEqual(blackoutEvent.status, 'RED');
    assert.ok(blackoutEvent.blackoutWarning?.includes('BLACKOUT'), 'Warning must emphasize active prop blackout');
  });

  it('correctly classifies volatility alert zone (AMBER) between 15m and 60m to red-folder event', () => {
    const fixedNow = new Date('2026-10-12T14:00:00Z').getTime();
    const events = generateLiveEconomicEvents(fixedNow);

    // Look for high-impact event scheduled in ~18m (e.g. US Core CPI)
    const cautionEvent = events.find((e) => e.impact === 'HIGH' && e.minutesUntil > 15 && e.minutesUntil <= 60);
    assert.ok(cautionEvent, 'Should identify an approaching volatility event');
    assert.strictEqual(cautionEvent.status, 'AMBER');
    assert.ok(cautionEvent.blackoutWarning?.includes('VOLATILITY'), 'Warning must caution about upcoming release');
  });

  it('includes realistic historical actual values for completed releases and pending for upcoming', () => {
    const fixedNow = new Date('2026-10-12T14:00:00Z').getTime();
    const events = generateLiveEconomicEvents(fixedNow);

    const pastEvents = events.filter((e) => e.minutesUntil < -15);
    pastEvents.forEach((evt) => {
      assert.ok(evt.actual, `Past event ${evt.title} must have actual released data`);
    });

    const upcomingEvents = events.filter((e) => e.minutesUntil > 60);
    upcomingEvents.forEach((evt) => {
      assert.strictEqual(evt.actual, undefined, `Future event ${evt.title} must not have actual release data yet`);
    });
  });
});
