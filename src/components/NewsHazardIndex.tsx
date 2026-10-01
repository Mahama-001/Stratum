'use client';

import React, { useState } from 'react';
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
  AlertOctagon
} from 'lucide-react';

export default function NewsHazardIndex() {
  const { economicEvents } = useStratumStore();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HIGH_IMPACT'>('ALL');

  // Check if any event is currently in RED or AMBER zone
  const redZoneEvent = economicEvents.find((e) => e.status === 'RED');
  const amberZoneEvent = economicEvents.find((e) => e.status === 'AMBER');

  const filteredEvents = economicEvents.filter((evt) => {
    if (selectedFilter === 'HIGH_IMPACT') return evt.impact === 'HIGH';
    return true;
  });

  return (
    <div className="bg-[#101112] border border-[#232426] rounded-xl p-5 inner-glow flex flex-col h-full relative">
      {/* Blackout Rule Banner if Active */}
      {redZoneEvent && (
        <div className="mb-5 bg-[#EF4444]/15 border-2 border-[#EF4444] rounded-xl p-3.5 flex items-start gap-3 shadow-[0_0_25px_rgba(239,68,68,0.25)] animate-pulse">
          <AlertOctagon className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs font-black uppercase text-[#EF4444] tracking-wider">
                PROP FIRM RULE ALERT: NEWS TRADING BLACKOUT
              </span>
              <span className="text-[10px] font-mono-data px-1.5 py-0.2 rounded bg-[#EF4444] text-black font-bold">
                HIGH DANGER
              </span>
            </div>
            <p className="text-xs text-white mt-1 leading-relaxed font-medium">
              {redZoneEvent.title} release window active ({Math.abs(redZoneEvent.minutesUntil)}m {redZoneEvent.minutesUntil < 0 ? 'ago' : 'remaining'}). Most prop firms (FTMO, Topstep, FundedNext) strictly prohibit opening or closing positions ±15m around high-impact releases due to uncontrollable broker slippage.
            </p>
          </div>
        </div>
      )}

      {/* Amber Warning Banner if no Red */}
      {!redZoneEvent && amberZoneEvent && (
        <div className="mb-5 bg-[#F59E0B]/15 border border-[#F59E0B]/50 rounded-xl p-3.5 flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-mono-data text-xs font-bold uppercase text-[#F59E0B] tracking-wider">
              VOLATILITY SPIKE WARNING ({amberZoneEvent.minutesUntil}m to release)
            </span>
            <p className="text-xs text-[#e5e2e3] mt-1 leading-relaxed">
              Upcoming: <span className="font-semibold text-white">{amberZoneEvent.title}</span>. Stratum risk policy recommends reducing position sizing by 50% or moving stops to breakeven before spread widens.
            </p>
          </div>
        </div>
      )}

      {/* Header and Traffic Light Status Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-[10px] text-[#5E6BFF] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              ECONOMIC SHIELD
            </span>
            <span className="font-mono-data text-[9px] text-[#9A9DA3]">[PROP_FIRMS_SAFEGUARD]</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">News Hazard Index</h2>
        </div>

        {/* Global Condition Indicator */}
        <div className="flex items-center gap-3 bg-[#070708] border border-[#232426] px-3 py-1.5 rounded-lg">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                redZoneEvent
                  ? 'bg-[#EF4444] shadow-[0_0_10px_#EF4444] animate-ping'
                  : amberZoneEvent
                  ? 'bg-[#F59E0B] shadow-[0_0_10px_#F59E0B]'
                  : 'bg-[#10B981] shadow-[0_0_10px_#10B981]'
              }`}
            />
            <span className="font-mono-data text-xs font-bold text-white">
              {redZoneEvent ? 'BLACKOUT ZONE' : amberZoneEvent ? 'AMBER ALERT' : 'CLEAR CONDITIONS'}
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Filter Controls */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#232426] text-xs">
        <div className="flex items-center gap-4 text-[10px] font-mono-data text-[#9A9DA3]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> &gt;60m Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> 15-60m Caution
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> &lt;15m Blackout
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#070708] p-0.5 rounded border border-[#232426]">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-2 py-0.5 text-[10px] font-mono-data rounded ${
              selectedFilter === 'ALL' ? 'bg-[#1B1C1E] text-white font-bold' : 'text-[#9A9DA3]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('HIGH_IMPACT')}
            className={`px-2 py-0.5 text-[10px] font-mono-data rounded ${
              selectedFilter === 'HIGH_IMPACT' ? 'bg-[#1B1C1E] text-white font-bold' : 'text-[#9A9DA3]'
            }`}
          >
            Red Folder
          </button>
        </div>
      </div>

      {/* Event Timeline Cards */}
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[360px]">
        {filteredEvents.map((evt) => {
          const isRed = evt.status === 'RED';
          const isAmber = evt.status === 'AMBER';
          const isGreen = evt.status === 'GREEN';

          let timeLabel = '';
          if (evt.minutesUntil < 0) {
            timeLabel = `${Math.abs(evt.minutesUntil)}m ago`;
          } else if (evt.minutesUntil === 0) {
            timeLabel = 'RELEASING NOW';
          } else if (evt.minutesUntil < 60) {
            timeLabel = `in ${evt.minutesUntil}m`;
          } else {
            const hrs = Math.floor(evt.minutesUntil / 60);
            const mins = evt.minutesUntil % 60;
            timeLabel = `in ${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
          }

          return (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border transition-all ${
                isRed
                  ? 'bg-[#EF4444]/10 border-[#EF4444]/40 shadow-md'
                  : isAmber
                  ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30'
                  : 'bg-[#070708]/50 border-[#232426] hover:border-[#35363a]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRed ? 'bg-[#EF4444] animate-ping' : isAmber ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                    }`}
                  />
                  <span className="font-mono-data text-xs font-bold text-white px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
                    {evt.currency}
                  </span>
                  <span className="font-medium text-xs text-white line-clamp-1">{evt.title}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-mono-data text-[10px] font-bold px-2 py-0.5 rounded ${
                      isRed
                        ? 'bg-[#EF4444] text-black'
                        : isAmber
                        ? 'bg-[#F59E0B] text-black'
                        : 'bg-[#1B1C1E] text-[#9A9DA3]'
                    }`}
                  >
                    {timeLabel}
                  </span>
                </div>
              </div>

              {/* Forecast vs Previous */}
              <div className="flex items-center justify-between text-[11px] font-mono-data text-[#9A9DA3] pt-1 border-t border-white/[0.03]">
                <div className="flex items-center gap-3">
                  <span>Forecast: <strong className="text-white">{evt.forecast || '—'}</strong></span>
                  <span>Prev: <strong className="text-[#e5e2e3]">{evt.previous || '—'}</strong></span>
                  {evt.actual && (
                    <span>Actual: <strong className="text-[#50D8E9]">{evt.actual}</strong></span>
                  )}
                </div>

                <span className="text-[9px] text-[#9A9DA3]/70 uppercase">
                  {evt.impact} IMPACT
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
