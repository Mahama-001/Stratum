'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStratumStore } from '@/lib/store';
import { EconomicEvent, TrafficLightStatus } from '@/lib/types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Flame, 
  Info, 
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Radio,
  CheckCircle2,
  Timer
} from 'lucide-react';

type FilterType = 'ALL' | 'HIGH_IMPACT' | 'UPCOMING' | 'RELEASED';

function formatUtcTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes} UTC`;
  } catch {
    return '';
  }
}

function formatLocalTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function NewsHazardIndex() {
  const { 
    economicEvents, 
    syncLiveNewsTick, 
    refreshEconomicEvents, 
    setEconomicEvents 
  } = useStratumStore();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [currentUtcClock, setCurrentUtcClock] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live real-time seconds ticking UTC clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentUtcClock(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Continuous live synchronization of event timers & countdowns
  useEffect(() => {
    syncLiveNewsTick();
    const timer = setInterval(() => {
      syncLiveNewsTick();
    }, 5000);
    return () => clearInterval(timer);
  }, [syncLiveNewsTick]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    refreshEconomicEvents();
    try {
      const res = await fetch('/api/economic-events');
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          setEconomicEvents(data.events);
        }
      }
    } catch {
      // Fallback already performed by refreshEconomicEvents
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Check if any event is currently in RED or AMBER zone
  const redZoneEvent = economicEvents.find((e) => e.status === 'RED');
  const amberZoneEvent = economicEvents.find((e) => e.status === 'AMBER');

  const filteredEvents = useMemo(() => {
    return economicEvents.filter((evt) => {
      if (selectedFilter === 'HIGH_IMPACT') return evt.impact === 'HIGH';
      if (selectedFilter === 'UPCOMING') return evt.minutesUntil >= 0;
      if (selectedFilter === 'RELEASED') return evt.minutesUntil < 0;
      return true;
    });
  }, [economicEvents, selectedFilter]);

  return (
    <div className="bg-white/90 backdrop-blur-2xl border border-black/[0.08] rounded-[24px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.06)] flex flex-col h-full relative transition-colors duration-300 text-[#1d1d1f]">
      {/* Blackout Rule Banner if Active */}
      {redZoneEvent && (
        <div className="mb-4 bg-[#ff3b30]/10 border border-[#ff3b30]/25 rounded-[18px] p-3.5 sm:p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
          <AlertOctagon className="w-5 h-5 text-[#ff3b30] shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase text-[#ff3b30] tracking-wider">
                Prop Firm Rule Alert: News Blackout Active
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/25 font-medium">
                {redZoneEvent.minutesUntil <= 0
                  ? `Lifts in ${Math.max(1, 15 - Math.abs(redZoneEvent.minutesUntil))}m`
                  : `Release in ${redZoneEvent.minutesUntil}m`}
              </span>
            </div>
            <p className="text-[12px] text-[#1d1d1f] mt-1 leading-relaxed">
              <span className="font-semibold text-[#1d1d1f]">{redZoneEvent.title}</span> ({redZoneEvent.currency}) release window is active.
              {redZoneEvent.minutesUntil <= 0 ? (
                <> Released {Math.abs(redZoneEvent.minutesUntil)}m ago. Post-news volatility blackout lifts in <strong>{Math.max(1, 15 - Math.abs(redZoneEvent.minutesUntil))}m</strong>.</>
              ) : (
                <> Releasing in <strong>{redZoneEvent.minutesUntil}m</strong>. Pre-news blackout underway.</>
              )} Most prop firms (FTMO, FundedNext, Topstep) strictly prohibit trading &plusmn;15m around red-folder releases due to severe slippage.
            </p>
          </div>
        </div>
      )}

      {/* Amber Warning Banner if no Red */}
      {!redZoneEvent && amberZoneEvent && (
        <div className="mb-4 bg-[#ff9500]/10 border border-[#ff9500]/25 rounded-[18px] p-3.5 sm:p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-[#ff9500] shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase text-[#b25000] tracking-wider">
                Volatility Spike Warning ({amberZoneEvent.minutesUntil}m to release)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff9500]/15 text-[#b25000] border border-[#ff9500]/25 font-medium">
                Blackout starts in {Math.max(1, amberZoneEvent.minutesUntil - 15)}m
              </span>
            </div>
            <p className="text-[12px] text-[#1d1d1f] mt-1 leading-relaxed">
              Upcoming: <span className="font-semibold text-[#1d1d1f]">{amberZoneEvent.title}</span> ({amberZoneEvent.currency}). Consider reducing position sizing by 50% or trailing stop-losses to protect funded account equity before spreads widen.
            </p>
          </div>
        </div>
      )}

      {/* Header with Live Telemetry Clock & Condition Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#0071e3]" />
              Economic Shield
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/[0.03] border border-black/[0.08] text-[10px] font-mono-data text-[#6e6e73]">
              <span className="text-[#1d1d1f] font-medium">{currentUtcClock || 'UTC'}</span>
            </div>
          </div>
          <h2 className="text-[19px] font-semibold text-[#1d1d1f] tracking-tight mt-0.5">News Hazard Index</h2>
        </div>

        {/* Global Condition Indicator and Manual Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.08] text-[11px] text-[#6e6e73] hover:text-[#1d1d1f] transition-all cursor-pointer font-medium"
            title="Force refresh news telemetry"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#0071e3]' : ''}`} />
            <span className="hidden xs:inline">Sync</span>
          </button>

          <div className="flex items-center bg-black/[0.03] border border-black/[0.08] px-3.5 py-1.5 rounded-full">
            <span className={`text-[12px] font-medium ${
              redZoneEvent ? 'text-[#ff3b30]' : amberZoneEvent ? 'text-[#b25000]' : 'text-[#34c759]'
            }`}>
              {redZoneEvent ? 'Blackout Zone' : amberZoneEvent ? 'Amber Alert' : 'Clear Conditions'}
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Filter Segmented Pill Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-black/[0.06] text-xs">
        <div className="flex items-center gap-3 text-[11px] text-[#6e6e73]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34c759]" /> Normal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff9500]" /> Caution
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff3b30]" /> Blackout
          </span>
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1 bg-black/[0.04] p-1 rounded-full border border-black/[0.08] overflow-x-auto">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'ALL'
                ? 'bg-white text-[#1d1d1f] shadow-sm border border-black/[0.08]'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('HIGH_IMPACT')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'HIGH_IMPACT'
                ? 'bg-[#ff3b30]/15 text-[#ff3b30] shadow-sm border border-[#ff3b30]/25'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Red Folder
          </button>
          <button
            onClick={() => setSelectedFilter('UPCOMING')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'UPCOMING'
                ? 'bg-[#0071e3]/15 text-[#0071e3] shadow-sm border border-[#0071e3]/25'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setSelectedFilter('RELEASED')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'RELEASED'
                ? 'bg-[#34c759]/15 text-[#248a3d] shadow-sm border border-[#34c759]/25'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Released
          </button>
        </div>
      </div>

      {/* Live Event Timeline Cards */}
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[380px] custom-scrollbar">
        {filteredEvents.map((evt) => {
          const isRed = evt.status === 'RED';
          const isAmber = evt.status === 'AMBER';
          const isPast = evt.minutesUntil < 0;

          let timeLabel = '';
          if (evt.minutesUntil < 0) {
            const abs = Math.abs(evt.minutesUntil);
            if (abs < 60) {
              timeLabel = `${abs}m ago`;
            } else {
              const hrs = Math.floor(abs / 60);
              const mins = abs % 60;
              timeLabel = `${hrs}h ${mins > 0 ? `${mins}m` : ''} ago`;
            }
          } else if (evt.minutesUntil === 0) {
            timeLabel = 'Releasing now';
          } else if (evt.minutesUntil < 60) {
            timeLabel = `in ${evt.minutesUntil}m`;
          } else {
            const hrs = Math.floor(evt.minutesUntil / 60);
            const mins = evt.minutesUntil % 60;
            timeLabel = `in ${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
          }

          const formattedUtc = formatUtcTime(evt.scheduledTimeUtc);
          const formattedLocal = formatLocalTime(evt.scheduledTimeUtc);

          return (
            <div
              key={evt.id}
              className={`p-3.5 rounded-[16px] border transition-all ${
                isRed
                  ? 'bg-[#ff3b30]/08 border-[#ff3b30]/25 shadow-sm'
                  : isAmber
                  ? 'bg-[#ff9500]/08 border-[#ff9500]/25'
                  : 'bg-black/[0.02] border-black/[0.06] hover:bg-black/[0.04] hover:border-black/[0.1]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isRed 
                        ? 'bg-[#ff3b30] shadow-[0_0_8px_#ff3b30] animate-pulse' 
                        : isAmber 
                        ? 'bg-[#ff9500]' 
                        : 'bg-[#34c759]'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-[#1d1d1f] px-2 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.08] shrink-0">
                    {evt.currency}
                  </span>
                  <span className="font-medium text-[13px] text-[#1d1d1f] truncate" title={evt.title}>
                    {evt.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {/* Scheduled UTC Clock Time */}
                  <span className="text-[10px] text-[#6e6e73] font-mono-data hidden md:inline">
                    {formattedUtc}
                  </span>

                  {/* Relative Live Countdown Badge */}
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap font-mono-data ${
                      isRed
                        ? 'bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/25'
                        : isAmber
                        ? 'bg-[#ff9500]/15 text-[#b25000] border border-[#ff9500]/25'
                        : isPast
                        ? 'bg-black/[0.04] text-[#6e6e73] border border-black/[0.08]'
                        : 'bg-black/[0.04] text-[#1d1d1f] border border-black/[0.08]'
                    }`}
                  >
                    {isRed ? (
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3 animate-spin" />
                        {timeLabel}
                      </span>
                    ) : (
                      timeLabel
                    )}
                  </span>
                </div>
              </div>

              {/* Forecast vs Previous vs Actual & Impact Level */}
              <div className="flex items-center justify-between text-[11px] text-[#6e6e73] pt-1.5 border-t border-black/[0.06] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span>Forecast: <strong className="text-[#1d1d1f] font-medium">{evt.forecast || '—'}</strong></span>
                  <span>Prev: <strong className="text-[#6e6e73] font-medium">{evt.previous || '—'}</strong></span>
                  {evt.actual ? (
                    <span className="flex items-center gap-1">
                      Actual: <strong className="text-[#248a3d] font-semibold bg-[#34c759]/10 px-1.5 py-0.2 rounded border border-[#34c759]/20">{evt.actual}</strong>
                    </span>
                  ) : (
                    <span className="text-[#86868b] italic">Actual: Pending</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#86868b] font-mono-data md:hidden">
                    {formattedUtc}
                  </span>
                  <span className={`text-[10px] uppercase font-semibold tracking-wider ${
                    evt.impact === 'HIGH' ? 'text-[#ff3b30]' : evt.impact === 'MEDIUM' ? 'text-[#b25000]' : 'text-[#6e6e73]'
                  }`}>
                    {evt.impact} Impact
                  </span>
                </div>
              </div>

              {/* Blackout Guidance Note if in Danger Zone */}
              {(isRed || isAmber) && evt.blackoutWarning && (
                <div className="mt-2 text-[10px] text-[#1d1d1f] bg-black/[0.03] px-2.5 py-1.5 rounded-lg border border-black/[0.06] flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-[#0071e3] shrink-0 mt-0.5" />
                  <span className="leading-snug">{evt.blackoutWarning}</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-[#86868b] text-xs">
            No economic events matching current filter.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-2 border-t border-black/[0.06] flex items-center justify-between text-[10px] font-mono-data text-[#6e6e73]">
        <span>Prop Rule: &plusmn;15m Blackout Restriction</span>
        <span>Auto-sync: 5s tick</span>
      </div>
    </div>
  );
}
