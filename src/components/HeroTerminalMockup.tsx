'use client';

import React from 'react';
import { useStratumStore } from '@/lib/store';
import { 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Calculator, 
  Terminal, 
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass
} from 'lucide-react';

export default function HeroTerminalMockup() {
  const { 
    accountBalance, 
    currentPreset, 
    riskResult, 
    setActiveTab
  } = useStratumStore();

  return (
    <div className="w-full bg-[#101112] rounded-xl border border-white/[0.05] overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[620px] inner-glow shadow-2xl relative">
      
      {/* 1. Sidebar (w-64) */}
      <div className="w-full lg:w-64 bg-[#0d0e0f] border-b lg:border-b-0 lg:border-r border-[#232426] p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="text-[10px] text-[#9A9DA3] uppercase tracking-[0.2em] mb-6 px-4 opacity-40 font-bold font-mono-data">
            Navigation
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('TERMINAL')}
              className="flex items-center gap-3 px-4 py-2 bg-white/[0.04] rounded-lg text-[#e5e2e3] font-medium transition-colors border border-white/[0.05] text-left"
            >
              <Terminal className="w-[18px] h-[18px] text-[#50d8e9]" />
              <span className="text-sm">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('TERMINAL')}
              className="flex items-center gap-3 px-4 py-2 text-[#9A9DA3] hover:text-[#e5e2e3] hover:bg-white/[0.04] rounded-lg transition-colors group text-left"
            >
              <Clock className="w-[18px] h-[18px] opacity-40 group-hover:opacity-100 text-[#50d8e9]" />
              <span className="text-sm">Session Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('PLAYBOOK')}
              className="flex items-center gap-3 px-4 py-2 text-[#9A9DA3] hover:text-[#e5e2e3] hover:bg-white/[0.04] rounded-lg transition-colors group text-left"
            >
              <BookOpen className="w-[18px] h-[18px] opacity-40 group-hover:opacity-100 text-[#5E6BFF]" />
              <span className="text-sm">Playbooks</span>
            </button>

            <button
              onClick={() => setActiveTab('TERMINAL')}
              className="flex items-center gap-3 px-4 py-2 text-[#9A9DA3] hover:text-[#e5e2e3] hover:bg-white/[0.04] rounded-lg transition-colors group text-left"
            >
              <Compass className="w-[18px] h-[18px] opacity-40 group-hover:opacity-100 text-[#10B981]" />
              <span className="text-sm">Asset Bias</span>
            </button>

            <button
              onClick={() => setActiveTab('RISK_ENGINE')}
              className="flex items-center gap-3 px-4 py-2 text-[#9A9DA3] hover:text-[#e5e2e3] hover:bg-white/[0.04] rounded-lg transition-colors group text-left"
            >
              <Calculator className="w-[18px] h-[18px] opacity-40 group-hover:opacity-100 text-[#10B981]" />
              <span className="text-sm">Risk Engine</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#232426] text-[11px] font-mono-data text-[#9A9DA3]">
          <div className="flex items-center justify-between">
            <span>FIRM PRESET</span>
            <span className="text-white font-bold">{currentPreset.firm}</span>
          </div>
          <div className="text-[10px] mt-0.5 text-[#50d8e9]">
            ${(accountBalance / 1000).toFixed(0)}k Account Evaluation
          </div>
        </div>
      </div>

      {/* 2. Center Area (flex-1) */}
      <div className="flex-1 p-6 flex flex-col gap-5 bg-[#0a0a0b] relative overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#50d8e9] animate-pulse" />
            <span className="font-mono-data text-xs text-[#50d8e9] uppercase tracking-widest font-bold">
              System Live
            </span>
          </div>
          <div className="font-mono-data text-[10px] text-[#9A9DA3] uppercase tracking-widest">
            LAST UPDATED: <span className="text-[#e5e2e3]">Just now</span>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Runway */}
          <div className="bg-[#101112] border border-white/[0.05] rounded-xl p-4 inner-glow">
            <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] text-[#9A9DA3] font-mono-data font-bold uppercase tracking-widest opacity-60">
                DAILY RUNWAY BUFFER
              </div>
            </div>
            <div className="font-h3 text-2xl font-bold tracking-tight text-[#e5e2e3]">
              ${riskResult.remainingDailyBufferDollar.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-[11px] text-[#50d8e9] font-medium flex items-center gap-1 opacity-90">
                <TrendingUp className="w-3.5 h-3.5" />
                {((riskResult.remainingDailyBufferDollar / riskResult.dailyMaxLossLimitDollar) * 100).toFixed(0)}% Intact
              </div>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-2 bg-[#50d8e9] opacity-20" />
                <div className="w-0.5 h-3 bg-[#50d8e9] opacity-40" />
                <div className="w-0.5 h-2 bg-[#50d8e9] opacity-60" />
                <div className="w-0.5 h-4 bg-[#50d8e9]" />
              </div>
            </div>
          </div>

          {/* Card 2: Setups */}
          <div className="bg-[#101112] border border-white/[0.05] rounded-xl p-4 inner-glow">
            <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] text-[#9A9DA3] font-mono-data font-bold uppercase tracking-widest opacity-60">
                ACTIVE SETUPS
              </div>
            </div>
            <div className="font-h3 text-2xl font-bold tracking-tight text-[#e5e2e3]">
              3
            </div>
            <div className="text-[11px] text-[#ffb689] font-medium mt-2 opacity-90">
              1 ready for risk stamp
            </div>
          </div>

          {/* Card 3: Risk Index */}
          <div className="bg-[#101112] border border-white/[0.05] rounded-xl p-4 inner-glow">
            <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] text-[#9A9DA3] font-mono-data font-bold uppercase tracking-widest opacity-60">
                RISK INDEX
              </div>
            </div>
            <div className="font-h3 text-2xl font-bold uppercase tracking-tight text-[#e5e2e3]">
              Low
            </div>
            <div className="text-[11px] text-[#E5FD17] font-medium mt-2 opacity-90 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5FD17] animate-pulse" />
              All parameters compliant
            </div>
          </div>

        </div>

        {/* Signal Flow Curve (exact SVG design from Romer template) */}
        <div className="bg-[#101112] border border-[#232426] rounded-xl p-4 inner-glow flex flex-col h-[190px]">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-4">
              <div className="font-mono-data text-[10px] font-bold text-[#e5e2e3] uppercase tracking-widest opacity-60">
                Signal Flow
              </div>
              <div className="font-mono-data text-[9px] text-[#5E6BFF]/60 uppercase tracking-tighter">
                [LATENCY: 12ms]
              </div>
            </div>
            <div className="flex gap-4 text-[10px] text-[#9A9DA3] font-bold uppercase tracking-wider font-mono-data">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5E6BFF]" />
                Displacement
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                Target 1:2
              </span>
            </div>
          </div>

          <div className="flex-1 rounded-lg bg-[#070708]/50 border border-white/[0.02] relative overflow-hidden">
            {/* Grid */}
            <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-15">
              <div className="border-t border-white/[0.1] w-full" />
              <div className="border-t border-white/[0.1] w-full" />
              <div className="border-t border-white/[0.1] w-full" />
              <div className="border-t border-white/[0.1] w-full" />
            </div>

            <svg className="absolute bottom-0 w-full h-[85%]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradient-flow-v3" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#5E6BFF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#5E6BFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,80 C15,75 25,85 40,65 C55,45 65,55 80,30 C90,15 95,20 100,10 L100,100 L0,100 Z" fill="url(#gradient-flow-v3)" />
              <path d="M0,60 C20,55 35,65 50,45 C65,25 80,35 100,15" fill="none" stroke="rgba(255,255,255,0.4)" strokeDasharray="2,2" strokeWidth="0.5" />
              <path d="M0,80 C15,75 25,85 40,65 C55,45 65,55 80,30 C90,15 95,20 100,10" fill="none" stroke="#5E6BFF" strokeLinecap="round" strokeWidth="1.5" />
              <circle cx="15" cy="76" fill="#5E6BFF" r="1.5" />
              <circle cx="40" cy="65" fill="white" r="2" stroke="#5E6BFF" strokeWidth="0.5" />
              <circle cx="65" cy="48" fill="#5E6BFF" r="1.5" />
              <circle cx="80" cy="30" fill="white" r="2" stroke="#5E6BFF" strokeWidth="0.5" />
              <circle cx="95" cy="13" fill="#5E6BFF" r="1.5" />
            </svg>

            <div className="absolute bottom-1 right-2 font-mono-data text-[8px] text-[#9A9DA3]/40 uppercase">
              t: 127.4s
            </div>
            <div className="absolute top-2 left-2 font-mono-data text-[8px] text-[#9A9DA3]/40 uppercase">
              y: EUR/USD
            </div>
          </div>
        </div>

        {/* Bottom 2 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Focus Queue */}
          <div className="bg-[#101112] border border-[#232426] rounded-xl p-4 inner-glow">
            <div className="font-mono-data text-xs font-bold text-[#e5e2e3] border-b border-white/[0.05] pb-2 mb-3 uppercase tracking-wider">
              Focus queue
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#e5e2e3]">EUR/USD Asian Low Sweep</span>
                <span className="text-[#ffb689] bg-[#ffb689]/10 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono-data">EXECUTE</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#e5e2e3]">XAU/USD VWAP Reversion</span>
                <span className="text-[#9A9DA3] text-[10px] font-mono-data">MONITOR</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#e5e2e3]">US30 4H Order Block</span>
                <span className="text-[#50d8e9] bg-[#50d8e9]/10 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono-data">ARMED</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#e5e2e3]">FOMC News Blackout Shield</span>
                <span className="text-[#9A9DA3] text-[10px] font-mono-data">CLEAR</span>
              </div>
            </div>
          </div>

          {/* Approval Pipeline / Drawdown Runway */}
          <div className="bg-[#101112] border border-[#232426] rounded-xl p-4 inner-glow">
            <div className="font-mono-data text-xs font-bold text-[#e5e2e3] border-b border-white/[0.05] pb-2 mb-3 uppercase tracking-wider">
              Drawdown buffer pipeline
            </div>
            <div className="space-y-3 pt-1">
              <div>
                <div className="h-1.5 bg-white/[0.05] rounded-full w-full overflow-hidden mb-1.5">
                  <div className="h-full bg-[#5E6BFF] rounded-full w-4/5" />
                </div>
                <div className="font-mono-data text-[10px] text-[#9A9DA3] flex justify-between">
                  <span>Daily Buffer Remaining</span>
                  <span className="text-[#5E6BFF] font-bold">${riskResult.remainingDailyBufferDollar.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div className="h-1.5 bg-white/[0.05] rounded-full w-full overflow-hidden mb-1.5">
                  <div className="h-full bg-[#50d8e9] rounded-full w-11/12" />
                </div>
                <div className="font-mono-data text-[10px] text-[#9A9DA3] flex justify-between">
                  <span>Max Drawdown Cushion</span>
                  <span className="text-[#50d8e9] font-bold">${riskResult.remainingOverallBufferDollar.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Right Panel (w-[340px]) */}
      <div className="w-full lg:w-[340px] bg-[#111214] border-t lg:border-t-0 lg:border-l border-[#232426] p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="font-bold text-[#e5e2e3] border-b border-white/[0.05] pb-4 mb-4 flex justify-between items-center px-1">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#50d8e9]" />
              <span className="font-mono-data text-xs uppercase tracking-wide">Stratum Intelligence</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[#50d8e9] animate-pulse" />
          </div>

          <div className="flex flex-col gap-6 px-1">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-[#9A9DA3] uppercase tracking-widest opacity-50 font-mono-data">
                Recommended Action
              </div>
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5 text-xs text-[#e5e2e3] leading-relaxed shadow-sm">
                Stamp risk for <span className="text-[#5E6BFF] font-bold">EUR/USD Strategy A</span> at 1.0845. Risk is locked at $500 (10% of daily buffer).
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold text-[#9A9DA3] uppercase tracking-widest opacity-50 font-mono-data">
                Signal summary
              </div>
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5 text-xs text-[#e5e2e3] leading-relaxed shadow-sm">
                Asian session liquidity swept below 1.0828. London/NY overlap active with <span className="text-[#50d8e9] font-medium">positive institutional volume</span>.
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold text-[#9A9DA3] uppercase tracking-widest opacity-50 font-mono-data">
                Decision log
              </div>
              <div className="space-y-2 overflow-y-auto pr-1">
                <div className="flex items-start gap-3 p-2 hover:bg-white/[0.02] rounded-lg transition-colors text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#5E6BFF] mt-1.5 shrink-0" />
                  <div>
                    <div className="text-[#e5e2e3] font-medium">Risk Budget Stamped</div>
                    <div className="font-mono-data text-[10px] text-[#9A9DA3] mt-0.5 opacity-70">2h ago &bull; FTMO Tier</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 hover:bg-white/[0.02] rounded-lg transition-colors text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-[#e5e2e3] opacity-80 font-medium">Asian Liquidity Swept</div>
                    <div className="font-mono-data text-[10px] text-[#9A9DA3] mt-0.5 opacity-70">5h ago &bull; London Open</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Blocking Approval Card (exact Romer style) */}
        <div className="mt-6 glass-panel border border-white/[0.1] rounded-xl p-4 shadow-2xl z-20 inner-glow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ffb689]/10 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ffb689] font-bold" />
              </div>
              <span className="text-xs font-bold text-[#e5e2e3] tracking-tight font-mono-data uppercase">
                Drawdown Guardrail
              </span>
            </div>
            <span className="text-[9px] text-[#9A9DA3] uppercase font-bold tracking-wider font-mono-data">
              Enforced
            </span>
          </div>
          <div className="text-xs text-[#e5e2e3] mb-4 leading-relaxed font-medium">
            Stratum 25% daily buffer guardrail is armed. Reckless execution is mathematically prevented.
          </div>
          <button
            onClick={() => setActiveTab('TERMINAL')}
            className="w-full bg-[#5E6BFF] text-white py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-[#5E6BFF]/20 hover:brightness-110 transition-all font-mono-data uppercase tracking-wider"
          >
            Launch Full Terminal
          </button>
        </div>

      </div>

    </div>
  );
}
