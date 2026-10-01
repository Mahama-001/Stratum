'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Globe2, Zap, ArrowRight } from 'lucide-react';

interface SessionDef {
  name: string;
  tag: string;
  startHour: number; // 24-hr UTC
  endHour: number;   // 24-hr UTC
  crossesMidnight?: boolean;
  color: string;
  activeBg: string;
  activeBorder: string;
  description: string;
}

const SESSIONS: SessionDef[] = [
  {
    name: 'Asian Session',
    tag: 'ASIA',
    startHour: 23,
    endHour: 8,
    crossesMidnight: true,
    color: '#50D8E9',
    activeBg: 'bg-[#50D8E9]/10',
    activeBorder: 'border-[#50D8E9]/40',
    description: 'Range formation, low-volatility liquidity buildup (Tokyo / Sydney / Hong Kong)'
  },
  {
    name: 'London Session',
    tag: 'LONDON',
    startHour: 7,
    endHour: 16,
    color: '#5E6BFF',
    activeBg: 'bg-[#5E6BFF]/15',
    activeBorder: 'border-[#5E6BFF]/40',
    description: 'Judas swings, Asian range sweeps, major trend initiation'
  },
  {
    name: 'New York Session',
    tag: 'NEW YORK',
    startHour: 12,
    endHour: 21,
    color: '#10B981',
    activeBg: 'bg-[#10B981]/15',
    activeBorder: 'border-[#10B981]/40',
    description: 'High volume, macro data reactions, market reversals'
  },
  {
    name: 'London / NY Overlap',
    tag: 'OVERLAP',
    startHour: 12,
    endHour: 16,
    color: '#F59E0B',
    activeBg: 'bg-[#F59E0B]/20',
    activeBorder: 'border-[#F59E0B]/50',
    description: 'Peak institutional liquidity and maximum slippage vulnerability'
  }
];

export default function SessionRadar() {
  const [currentUtc, setCurrentUtc] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    timeString: string;
    decimalHour: number;
  }>({
    hours: 13,
    minutes: 30,
    seconds: 0,
    timeString: '13:30:00 UTC',
    decimalHour: 13.5
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getUTCHours();
      const m = now.getUTCMinutes();
      const s = now.getUTCSeconds();
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} UTC`;
      setCurrentUtc({
        hours: h,
        minutes: m,
        seconds: s,
        timeString: timeStr,
        decimalHour: h + m / 60 + s / 3600
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSessionActive = (s: SessionDef) => {
    const dec = currentUtc.decimalHour;
    if (s.crossesMidnight) {
      return dec >= s.startHour || dec < s.endHour;
    }
    return dec >= s.startHour && dec < s.endHour;
  };

  // Determine Primary Active Tag
  let primarySessionName = 'INTER-SESSION';
  if (isSessionActive(SESSIONS[3])) {
    primarySessionName = 'LONDON / NY OVERLAP (PEAK LIQUIDITY)';
  } else if (isSessionActive(SESSIONS[1])) {
    primarySessionName = 'LONDON OPEN EXPANSION';
  } else if (isSessionActive(SESSIONS[2])) {
    primarySessionName = 'NEW YORK CONTINUATION';
  } else if (isSessionActive(SESSIONS[0])) {
    primarySessionName = 'ASIAN ACCUMULATION';
  }

  // Calculate percentage along 24h bar
  const currentPercent = (currentUtc.decimalHour / 24) * 100;

  return (
    <div className="bg-[#101112] border border-[#232426] rounded-xl p-5 inner-glow relative overflow-hidden">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

      {/* Header with Title and Live Pulsing Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-[10px] text-[#50D8E9] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              GLOBAL SESSION RADAR
            </span>
            <span className="text-[10px] font-mono-data px-1.5 py-0.2 rounded bg-white/[0.04] text-[#9A9DA3] border border-white/[0.05]">
              UTC TIMELINE
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Active Market Windows</h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#50D8E9]/10 border border-[#50D8E9]/30 text-[#50D8E9] text-[11px] font-mono-data font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#50D8E9] animate-pulse" />
              {primarySessionName}
            </div>
          </div>
        </div>

        {/* Live Clock Card */}
        <div className="flex items-center gap-3 bg-[#070708] border border-[#232426] px-3.5 py-2 rounded-lg font-mono-data shadow-inner">
          <Clock className="w-4 h-4 text-[#5E6BFF] animate-pulse" />
          <div>
            <div className="text-[9px] text-[#9A9DA3] uppercase tracking-wider">PULSE TIME (UTC)</div>
            <div className="text-sm font-bold text-white tracking-wider">{currentUtc.timeString}</div>
          </div>
        </div>
      </div>

      {/* 24-Hour Visual Time-Bar Mapping */}
      <div className="relative mb-6 z-10">
        {/* Hour markers 00:00 to 24:00 */}
        <div className="flex justify-between text-[9px] text-[#9A9DA3] font-mono-data mb-1.5 px-0.5 opacity-70">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>24:00</span>
        </div>

        {/* Multi-layered timeline track */}
        <div className="h-9 w-full bg-[#070708] border border-[#232426] rounded-lg relative overflow-hidden flex items-center">
          
          {/* Subtle 4-hour divider lines */}
          <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-20">
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
          </div>

          {/* Asian Session Band: 23:00 - 08:00 UTC (Part 1: 00:00 - 08:00) */}
          <div
            className="absolute top-1 bottom-1 bg-[#50D8E9]/20 border-y border-[#50D8E9]/40 rounded-sm"
            style={{ left: '0%', width: `${(8 / 24) * 100}%` }}
            title="Asian Session (00:00 - 08:00 UTC)"
          >
            <span className="absolute left-1.5 top-0.5 text-[8px] font-mono-data text-[#50D8E9] font-bold">
              ASIA
            </span>
          </div>

          {/* Asian Session Band (Part 2: 23:00 - 24:00) */}
          <div
            className="absolute top-1 bottom-1 bg-[#50D8E9]/20 border-y border-[#50D8E9]/40 rounded-sm"
            style={{ left: `${(23 / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}
            title="Asian Session Open (23:00 - 24:00 UTC)"
          />

          {/* London Session Band: 07:00 - 16:00 UTC */}
          <div
            className="absolute top-1 bottom-1 bg-[#5E6BFF]/25 border-y border-[#5E6BFF]/50 rounded-sm"
            style={{ left: `${(7 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
            title="London Session (07:00 - 16:00 UTC)"
          >
            <span className="absolute left-1.5 top-0.5 text-[8px] font-mono-data text-[#5E6BFF] font-bold">
              LDN
            </span>
          </div>

          {/* New York Session Band: 12:00 - 21:00 UTC */}
          <div
            className="absolute top-1 bottom-1 bg-[#10B981]/25 border-y border-[#10B981]/50 rounded-sm"
            style={{ left: `${(12 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
            title="New York Session (12:00 - 21:00 UTC)"
          >
            <span className="absolute right-1.5 top-0.5 text-[8px] font-mono-data text-[#10B981] font-bold">
              NY
            </span>
          </div>

          {/* London / NY Overlap Highlight Band: 12:00 - 16:00 UTC */}
          <div
            className="absolute top-0 bottom-0 bg-[#F59E0B]/35 border border-[#F59E0B] rounded z-10 shadow-[0_0_12px_rgba(245,158,11,0.25)] flex items-center justify-center"
            style={{ left: `${(12 / 24) * 100}%`, width: `${(4 / 24) * 100}%` }}
            title="London / NY Overlap (12:00 - 16:00 UTC)"
          >
            <span className="text-[8px] font-mono-data text-white font-extrabold tracking-tighter px-1 rounded bg-[#F59E0B]/40">
              OVERLAP
            </span>
          </div>

          {/* Live UTC Pointer Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-20 shadow-[0_0_10px_#FFFFFF] transition-all duration-300"
            style={{ left: `${currentPercent}%` }}
          >
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-white border border-[#070708] shadow-[0_0_8px_#50D8E9]" />
          </div>
        </div>
      </div>

      {/* Interactive Session Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {SESSIONS.map((session, idx) => {
          const active = isSessionActive(session);
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                active
                  ? `${session.activeBg} ${session.activeBorder} shadow-lg`
                  : 'bg-[#070708]/60 border-[#232426] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono-data text-xs font-bold text-white flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: session.color }}
                  />
                  {session.name}
                </span>
                <span
                  className={`text-[9px] font-mono-data px-1.5 py-0.2 rounded font-bold uppercase ${
                    active
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-[#9A9DA3]'
                  }`}
                >
                  {active ? 'LIVE NOW' : 'OFFLINE'}
                </span>
              </div>

              <div className="font-mono-data text-[11px] text-[#9A9DA3] mb-2 flex items-center justify-between">
                <span>
                  {session.startHour < 10 ? `0${session.startHour}` : session.startHour}:00 -{' '}
                  {session.endHour < 10 ? `0${session.endHour}` : session.endHour}:00 UTC
                </span>
                {active && (
                  <span className="text-[10px] text-[#10B981] font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#10B981]" /> Active
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#9A9DA3] leading-relaxed line-clamp-2">
                {session.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
