'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Globe2, Zap } from 'lucide-react';

interface SessionDef {
  name: string;
  tag: 'ASIA' | 'LONDON' | 'NEW YORK' | 'OVERLAP';
  startHour: number;
  endHour: number;
  crossesMidnight?: boolean;
  city: string;
  description: string;
}

const SESSIONS: SessionDef[] = [
  {
    name: 'Asian Session',
    tag: 'ASIA',
    startHour: 23,
    endHour: 8,
    crossesMidnight: true,
    city: 'Tokyo / Sydney',
    description: 'Range formation, liquidity buildup & consolidation before European open'
  },
  {
    name: 'London Session',
    tag: 'LONDON',
    startHour: 7,
    endHour: 16,
    city: 'London / Frankfurt',
    description: 'Judas swings, Asian range sweeps & major trend initiation'
  },
  {
    name: 'New York Session',
    tag: 'NEW YORK',
    startHour: 12,
    endHour: 21,
    city: 'New York / CME',
    description: 'Macro data reactions, high contract volume & institutional expansions'
  },
  {
    name: 'London / NY Overlap',
    tag: 'OVERLAP',
    startHour: 12,
    endHour: 16,
    city: 'Global Confluence',
    description: 'Peak institutional liquidity, deepest order book depth & maximum volatility'
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
    hours: 13, minutes: 30, seconds: 0,
    timeString: '13:30:00 UTC',
    decimalHour: 13.5
  });

  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getUTCHours();
      const m = now.getUTCMinutes();
      const s = now.getUTCSeconds();
      setCurrentUtc({
        hours: h, minutes: m, seconds: s,
        timeString: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} UTC`,
        decimalHour: h + m / 60 + s / 3600
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSessionActive = (session: SessionDef): boolean => {
    const h = currentUtc.decimalHour;
    if (session.crossesMidnight) {
      return h >= session.startHour || h < session.endHour;
    }
    return h >= session.startHour && h < session.endHour;
  };

  const currentPercent = (currentUtc.decimalHour / 24) * 100;
  const activeSessions = SESSIONS.filter(isSessionActive);
  const primarySessionName = activeSessions.length > 0
    ? activeSessions.map(s => s.name).join(' & ')
    : 'Weekend / Off-Hours';

  const getSessionStyle = (tag: SessionDef['tag']) => {
    switch (tag) {
      case 'ASIA':
        return {
          accent: '#5856d6',
          activeBg: 'bg-[#5856d6]/08 border-[#5856d6]/30 shadow-[0_4px_16px_rgba(88,86,214,0.12)]',
          badge: 'bg-[#5856d6]/12 text-[#5856d6] dark:text-[#a5b4fc] border-[#5856d6]/25',
          text: 'text-[#5856d6] dark:text-[#a5b4fc]',
          gradient: 'from-[#5856d6]/20 via-[#5856d6]/26 to-[#5856d6]/16'
        };
      case 'LONDON':
        return {
          accent: '#0071e3',
          activeBg: 'bg-[#0071e3]/08 border-[#0071e3]/30 shadow-[0_4px_16px_rgba(0,113,227,0.12)]',
          badge: 'bg-[#0071e3]/12 text-[#0071e3] dark:text-[#60a5fa] border-[#0071e3]/25',
          text: 'text-[#0071e3] dark:text-[#60a5fa]',
          gradient: 'from-[#0071e3]/20 via-[#0071e3]/28 to-[#0071e3]/16'
        };
      case 'NEW YORK':
        return {
          accent: '#ff9500',
          activeBg: 'bg-[#ff9500]/08 border-[#ff9500]/30 shadow-[0_4px_16px_rgba(255,149,0,0.12)]',
          badge: 'bg-[#ff9500]/12 text-[#c76a00] dark:text-[#fbbf24] border-[#ff9500]/25',
          text: 'text-[#c76a00] dark:text-[#fbbf24]',
          gradient: 'from-[#ff9500]/20 via-[#ff9500]/28 to-[#ff9500]/16'
        };
      case 'OVERLAP':
      default:
        return {
          accent: '#0071e3',
          activeBg: 'bg-gradient-to-r from-[#0071e3]/10 via-[#5856d6]/10 to-[#ff9500]/10 border-[#0071e3]/35 shadow-[0_6px_22px_rgba(0,113,227,0.16)]',
          badge: 'bg-[#0071e3]/15 text-[#0071e3] dark:text-[#93c5fd] border-[#0071e3]/30 font-bold',
          text: 'text-[#0071e3] dark:text-[#2997ff]',
          gradient: 'from-[#0071e3]/30 via-[#5856d6]/32 to-[#ff9500]/30'
        };
    }
  };

  return (
    <div className="bg-white/90 dark:bg-[#121318]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] rounded-[24px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300 text-[#1d1d1f] dark:text-[#f5f5f7]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              Global Session Radar
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1a6] border border-black/[0.08] dark:border-white/[0.1]">
              24-Hour Spectrum
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
            <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Active Market Windows</h2>
            <div className="flex items-center px-3 py-1 rounded-full bg-[#34c759]/10 border border-[#34c759]/20 text-[#34c759] text-xs font-medium">
              {primarySessionName}
            </div>
          </div>
        </div>

        {/* Live Clock Pill */}
        <div className="flex items-center gap-3 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] px-4 py-2 rounded-full">
          <Clock className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
          <div>
            <div className="text-[9px] text-[#6e6e73] dark:text-[#a1a1a6] uppercase tracking-wider font-medium">Pulse Time (UTC)</div>
            <div className="text-xs font-semibold text-[#1d1d1f] dark:text-white font-mono-data tracking-wider">{currentUtc.timeString}</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LIQUID GLASS 24-HOUR VISUAL SPECTRUM                    */}
      {/* ======================================================== */}
      <div className="relative mb-6 z-10">
        
        {/* Top 24-Hour Scale Markers */}
        <div className="flex justify-between text-[10px] text-[#6e6e73] dark:text-[#8e8e93] font-mono-data mb-2 px-1 select-none">
          <span>00:00</span>
          <span className="hidden sm:inline">02:00</span>
          <span>04:00</span>
          <span className="hidden sm:inline">06:00</span>
          <span>08:00</span>
          <span className="hidden sm:inline">10:00</span>
          <span>12:00</span>
          <span className="hidden sm:inline">14:00</span>
          <span>16:00</span>
          <span className="hidden sm:inline">18:00</span>
          <span>20:00</span>
          <span className="hidden sm:inline">22:00</span>
          <span>24:00</span>
        </div>

        {/* Master Liquid Glass Container */}
        <div className="relative rounded-[22px] border border-black/[0.08] dark:border-white/[0.12] bg-gradient-to-b from-white/95 via-white/80 to-white/90 dark:from-[#15161c] dark:via-[#111216] dark:to-[#0d0e12] backdrop-blur-2xl p-2.5 sm:p-3 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_12px_32px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_12px_32px_rgba(0,0,0,0.5)] space-y-2">
          
          {/* Subtle Top Glass Reflection Specular Line */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent pointer-events-none" />

          {/* ────────────────────────────────────────────────────────── */}
          {/* LANE 1: Regional Market Windows (Asia, London, New York)   */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="relative h-10 w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] overflow-hidden flex items-center">
            
            {/* 2-Hour Grid Guidelines */}
            <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-r border-black/30 dark:border-white/30 h-full" />
              ))}
            </div>

            {/* Asian Session Segment 1 (00:00 - 08:00 UTC) */}
            <div
              className={`absolute top-1 bottom-1 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center px-2 sm:px-2.5 cursor-pointer ${
                hoveredSession === 'ASIA' ? 'ring-2 ring-[#5856d6]/60 z-10 scale-[1.01]' : ''
              } bg-gradient-to-r from-[#5856d6]/18 via-[#5856d6]/25 to-[#5856d6]/15 border border-[#5856d6]/35 shadow-[0_2px_8px_rgba(88,86,214,0.14)]`}
              style={{ left: '0%', width: `${(8 / 24) * 100}%` }}
              onMouseEnter={() => setHoveredSession('ASIA')}
              onMouseLeave={() => setHoveredSession(null)}
              title="Asian Session (00:00–08:00 UTC) • Tokyo, Sydney, Hong Kong"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5856d6]" />
                <span className="text-[10px] font-mono-data font-semibold text-[#5856d6] dark:text-[#a5b4fc] tracking-tight">
                  ASIA <span className="hidden sm:inline font-normal opacity-85">(00:00–08:00)</span>
                </span>
              </div>
            </div>

            {/* Asian Session Segment 2 Wrap (23:00 - 24:00 UTC) */}
            <div
              className={`absolute top-1 bottom-1 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer ${
                hoveredSession === 'ASIA' ? 'ring-2 ring-[#5856d6]/60 z-10' : ''
              } bg-gradient-to-r from-[#5856d6]/18 to-[#5856d6]/24 border border-[#5856d6]/35 shadow-[0_2px_8px_rgba(88,86,214,0.14)]`}
              style={{ left: `${(23 / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}
              onMouseEnter={() => setHoveredSession('ASIA')}
              onMouseLeave={() => setHoveredSession(null)}
              title="Asian Session Wrap (23:00–24:00 UTC)"
            >
              <span className="text-[8px] font-mono-data font-bold text-[#5856d6] dark:text-[#a5b4fc] hidden xl:inline">23h</span>
            </div>

            {/* London Session (07:00 - 16:00 UTC) */}
            <div
              className={`absolute top-1 bottom-1 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center px-2 sm:px-2.5 cursor-pointer ${
                hoveredSession === 'LONDON' ? 'ring-2 ring-[#0071e3]/60 z-10 scale-[1.01]' : ''
              } bg-gradient-to-r from-[#0071e3]/18 via-[#0071e3]/26 to-[#0071e3]/16 border border-[#0071e3]/40 shadow-[0_2px_10px_rgba(0,113,227,0.16)]`}
              style={{ left: `${(7 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
              onMouseEnter={() => setHoveredSession('LONDON')}
              onMouseLeave={() => setHoveredSession(null)}
              title="London Session (07:00–16:00 UTC) • Judas Swings, Asian Range Sweeps"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
                <span className="text-[10px] font-mono-data font-semibold text-[#0071e3] dark:text-[#60a5fa] tracking-tight">
                  LONDON <span className="hidden md:inline font-normal opacity-85">(07:00–16:00)</span>
                </span>
              </div>
            </div>

            {/* New York Session (12:00 - 21:00 UTC) */}
            <div
              className={`absolute top-1 bottom-1 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center justify-end px-2 sm:px-2.5 cursor-pointer ${
                hoveredSession === 'NEW YORK' ? 'ring-2 ring-[#ff9500]/60 z-10 scale-[1.01]' : ''
              } bg-gradient-to-r from-[#ff9500]/18 via-[#ff9500]/26 to-[#ff9500]/16 border border-[#ff9500]/40 shadow-[0_2px_10px_rgba(255,149,0,0.16)]`}
              style={{ left: `${(12 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
              onMouseEnter={() => setHoveredSession('NEW YORK')}
              onMouseLeave={() => setHoveredSession(null)}
              title="New York Session (12:00–21:00 UTC) • High Volume, Macro Data Releases"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500]" />
                <span className="text-[10px] font-mono-data font-semibold text-[#c76a00] dark:text-[#fbbf24] tracking-tight">
                  NEW YORK <span className="hidden md:inline font-normal opacity-85">(12:00–21:00)</span>
                </span>
              </div>
            </div>

            {/* Current Real-Time UTC Needle (Upper Lane) */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[#0071e3] z-30 pointer-events-none transition-all duration-300"
              style={{ left: `${currentPercent}%`, boxShadow: '0 0 10px rgba(0,113,227,0.7)' }}
            />
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* LANE 2: Confluences, Sweeps & Overlap Highway              */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="relative h-9 sm:h-10 w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] overflow-hidden flex items-center">
            
            {/* 2-Hour Grid Guidelines */}
            <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-r border-black/30 dark:border-white/30 h-full" />
              ))}
            </div>

            {/* Asia / London Sweep Zone (07:00 - 08:00 UTC) */}
            <div
              className="absolute top-1 bottom-1 rounded-lg backdrop-blur-md bg-gradient-to-r from-[#5856d6]/25 to-[#0071e3]/25 border border-[#5856d6]/40 flex items-center justify-center px-1"
              style={{ left: `${(7 / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}
              title="Asia/London Transition (07:00–08:00 UTC) • Asian High/Low Liquidity Sweep"
            >
              <span className="text-[8px] font-mono-data font-bold text-[#5856d6] dark:text-[#c7d2fe] hidden xl:inline">
                SWEEP
              </span>
            </div>

            {/* London & New York Overlap (12:00 - 16:00 UTC) — Liquid Glass Hero */}
            <div
              className={`absolute top-0.5 bottom-0.5 rounded-xl backdrop-blur-xl transition-all duration-300 z-10 flex items-center justify-center px-2 sm:px-3 cursor-pointer ${
                hoveredSession === 'OVERLAP' ? 'ring-2 ring-[#0071e3] scale-[1.01]' : ''
              } bg-gradient-to-r from-[#0071e3]/30 via-[#5856d6]/30 to-[#ff9500]/30 border-2 border-[#0071e3]/60 dark:border-[#2997ff]/60 shadow-[0_4px_18px_rgba(0,113,227,0.22)]`}
              style={{ left: `${(12 / 24) * 100}%`, width: `${(4 / 24) * 100}%` }}
              onMouseEnter={() => setHoveredSession('OVERLAP')}
              onMouseLeave={() => setHoveredSession(null)}
              title="London / New York Overlap (12:00–16:00 UTC) • Peak Institutional Liquidity & Volatility"
            >
              {/* Internal Glass Highlight */}
              <div className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
              
              <div className="flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff] shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-mono-data font-extrabold text-[#0071e3] dark:text-white uppercase tracking-tight truncate">
                  LDN / NY OVERLAP <span className="hidden sm:inline font-bold opacity-90">(12:00–16:00)</span>
                </span>
              </div>
            </div>

            {/* Current Real-Time UTC Needle (Lower Lane with Indicator) */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[#0071e3] z-30 pointer-events-none transition-all duration-300"
              style={{ left: `${currentPercent}%`, boxShadow: '0 0 10px rgba(0,113,227,0.7)' }}
            >
              <div className="absolute -bottom-1 -left-[4px] w-2.5 h-2.5 rounded-full bg-[#0071e3] border border-white shadow-sm" />
            </div>
          </div>
        </div>

        {/* Liquid Glass Interactive Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3 pt-2 text-[11px] font-mono-data text-[#6e6e73] dark:text-[#a1a1a6]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span
              onMouseEnter={() => setHoveredSession('ASIA')}
              onMouseLeave={() => setHoveredSession(null)}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                hoveredSession === 'ASIA' ? 'text-[#5856d6] dark:text-[#a5b4fc] font-semibold' : 'hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <span className="w-3 h-2 rounded-sm bg-[#5856d6]/30 border border-[#5856d6]/60 inline-block" />
              <span>Asia: 00:00–08:00</span>
            </span>

            <span
              onMouseEnter={() => setHoveredSession('LONDON')}
              onMouseLeave={() => setHoveredSession(null)}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                hoveredSession === 'LONDON' ? 'text-[#0071e3] dark:text-[#60a5fa] font-semibold' : 'hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <span className="w-3 h-2 rounded-sm bg-[#0071e3]/30 border border-[#0071e3]/60 inline-block" />
              <span>London: 07:00–16:00</span>
            </span>

            <span
              onMouseEnter={() => setHoveredSession('NEW YORK')}
              onMouseLeave={() => setHoveredSession(null)}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                hoveredSession === 'NEW YORK' ? 'text-[#c76a00] dark:text-[#fbbf24] font-semibold' : 'hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <span className="w-3 h-2 rounded-sm bg-[#ff9500]/30 border border-[#ff9500]/60 inline-block" />
              <span>New York: 12:00–21:00</span>
            </span>

            <span
              onMouseEnter={() => setHoveredSession('OVERLAP')}
              onMouseLeave={() => setHoveredSession(null)}
              className={`flex items-center gap-1.5 cursor-pointer font-bold transition-colors ${
                hoveredSession === 'OVERLAP' ? 'text-[#0071e3] dark:text-[#2997ff] underline' : 'text-[#0071e3] dark:text-[#2997ff]'
              }`}
            >
              <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-[#0071e3]/50 to-[#ff9500]/50 border border-[#0071e3] inline-block shadow-xs" />
              <span>Overlap: 12:00–16:00 (Peak Liquidity)</span>
            </span>
          </div>

          <div className="text-[10px] text-[#86868b] dark:text-[#a1a1a6]">
            Laser Needle: <strong className="text-[#0071e3] dark:text-[#2997ff] font-mono-data">{currentUtc.timeString}</strong>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* HARMONIZED LIQUID GLASS SESSION CARDS                   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
        {SESSIONS.map((session, idx) => {
          const active = isSessionActive(session);
          const theme = getSessionStyle(session.tag);
          const isHovered = hoveredSession === session.tag;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredSession(session.tag)}
              onMouseLeave={() => setHoveredSession(null)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isHovered ? 'scale-[1.015] z-10' : ''
              } ${
                active
                  ? `${theme.activeBg} ${isHovered ? 'ring-2 ring-black/10 dark:ring-white/20' : ''}`
                  : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08] opacity-80 hover:opacity-100 hover:border-black/[0.12] dark:hover:border-white/[0.16]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${active ? theme.text : 'text-[#1d1d1f] dark:text-[#e5e5ea]'}`}>
                  {session.name}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase border ${
                  active ? theme.badge : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#6e6e73] dark:text-[#a1a1a6] border-black/[0.06] dark:border-white/[0.08]'
                }`}>
                  {active ? 'Active' : 'Closed'}
                </span>
              </div>

              <div className="font-mono-data text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] mb-2 flex items-center justify-between">
                <span>
                  {session.startHour < 10 ? `0${session.startHour}` : session.startHour}:00 –{' '}
                  {session.endHour < 10 ? `0${session.endHour}` : session.endHour}:00 UTC
                </span>
                {active && (
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${theme.text}`}>
                    <Zap className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed line-clamp-2 font-normal">
                {session.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
