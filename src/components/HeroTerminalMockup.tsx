'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { PROP_FIRM_PRESETS } from '@/lib/riskEngine';
import { PropFirmKey } from '@/lib/types';
import { 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  Calculator, 
  ArrowRight,
  Clock,
  Activity
} from 'lucide-react';
import AIInsightBadge from '@/components/AIInsightBadge';

export default function HeroTerminalMockup() {
  const { 
    activeAccountId, 
    userPurchasedAccounts, 
    riskResult, 
    selectedAsset,
    setActiveTab,
    targetRiskPercent,
    setTargetRiskPercent,
    setAccountModalOpen
  } = useStratumStore();

  const [mockTab, setMockTab] = useState<'OVERVIEW' | 'RADAR' | 'PLAYBOOKS' | 'RISK'>('OVERVIEW');

  const activeAccount = userPurchasedAccounts.find((a) => a.id === activeAccountId) || userPurchasedAccounts[0];
  const currentPreset = PROP_FIRM_PRESETS[activeAccount.presetId as PropFirmKey] || PROP_FIRM_PRESETS.FTMO;

  const navBtn = (tab: 'OVERVIEW' | 'RADAR' | 'PLAYBOOKS' | 'RISK', icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setMockTab(tab)}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all duration-200 text-left text-sm cursor-pointer ${
        mockTab === tab
          ? 'bg-[#0071e3]/10 border border-[#0071e3]/30 text-[#0071e3] dark:text-[#2997ff] font-semibold shadow-xs'
          : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      <span className={mockTab === tab ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'}>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div id="hero-terminal" className="w-full bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[600px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-2xl relative transition-colors duration-300">
      
      {/* 1. Sidebar */}
      <div className="w-full lg:w-48 xl:w-52 bg-[#fbfbfd] dark:bg-[#161617] border-b lg:border-b-0 lg:border-r border-black/[0.06] dark:border-white/[0.06] p-3.5 lg:p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-[0.2em] font-bold font-mono-data">
              Navigation
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {navBtn('OVERVIEW', <Activity className="w-4 h-4" />, 'Overview')}
            {navBtn('RADAR',    <Clock    className="w-4 h-4" />, 'Session Radar')}
            {navBtn('PLAYBOOKS',<BookOpen className="w-4 h-4" />, 'Playbooks')}
            {navBtn('RISK',     <Calculator className="w-4 h-4" />, 'Risk Engine')}
          </div>
        </div>

        {/* Quick Prop Account Selector */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-semibold font-mono-data">
              ACTIVE ACCOUNT
            </span>
            <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded font-bold border bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] border-[#0071e3]/20">
              {activeAccount.instrumentType}
            </span>
          </div>
          
          <button
            onClick={() => setAccountModalOpen(true)}
            className="w-full text-left p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-[#0071e3]/30 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1d1d1f] dark:text-white truncate">{activeAccount.accountNickname}</span>
              <span className="text-[10px] font-mono-data font-bold text-[#0071e3] dark:text-[#2997ff] ml-1 shrink-0">Tune</span>
            </div>
            <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono-data mt-0.5 flex items-center justify-between">
              <span>{activeAccount.drawdownType.replace('_', ' ')}</span>
              <span>{activeAccount.dailyLossLimitPercent}% Daily</span>
            </div>
          </button>

          <div className="text-[10px] mt-2 font-mono-data flex items-center justify-between text-[#6e6e73] dark:text-[#86868b]">
            <span>Buffer Cushion:</span>
            <span className="font-bold text-[#1d1d1f] dark:text-white">${riskResult.remainingDailyBufferDollar.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 2. Center Area */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col gap-3.5 bg-white dark:bg-[#161617] relative overflow-y-auto min-w-0">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.06] min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-mono-data text-xs uppercase tracking-wider font-bold shrink-0 text-[#0071e3] dark:text-[#2997ff]">
              System &bull; {mockTab}
            </span>
            <AIInsightBadge 
              type={mockTab === 'RADAR' ? 'session' : mockTab === 'PLAYBOOKS' ? 'setup' : 'risk'} 
              label="Desk Telemetry" 
            />
          </div>
          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            <div className="font-mono-data text-[10px] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider hidden sm:block">
              PAIR: <span className="text-[#1d1d1f] dark:text-white font-bold">{selectedAsset.symbol}</span>
            </div>
            <button
              onClick={() => setActiveTab('TERMINAL')}
              className="text-[11px] font-mono-data text-[#0071e3] dark:text-[#2997ff] hover:text-[#0077ed] flex items-center gap-1 transition-all font-semibold px-2.5 py-1 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20 hover:bg-[#0071e3]/15 cursor-pointer"
            >
              <span>Workstation</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {mockTab === 'OVERVIEW' && (
          <>
            {/* 3 Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 min-w-0">
              {/* Card 1: Runway */}
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-w-0 shadow-xs">
                <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono-data font-bold uppercase tracking-wider mb-1.5 truncate">
                  DAILY RUNWAY BUFFER
                </div>
                <div className="font-h3 text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white truncate">
                  ${riskResult.remainingDailyBufferDollar.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#30d158] font-mono-data font-bold mt-2 pt-1.5 border-t border-black/[0.06] dark:border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-1 truncate">
                    <span>{((riskResult.remainingDailyBufferDollar / riskResult.dailyMaxLossLimitDollar) * 100).toFixed(0)}% Intact</span>
                  </div>
                  <div className="flex gap-0.5 shrink-0 ml-1">
                    <div className="w-0.5 h-2 bg-[#30d158] opacity-30" />
                    <div className="w-0.5 h-3 bg-[#30d158] opacity-60" />
                    <div className="w-0.5 h-2 bg-[#30d158] opacity-80" />
                    <div className="w-0.5 h-3.5 bg-[#30d158]" />
                  </div>
                </div>
              </div>

              {/* Card 2: Setups */}
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-w-0 shadow-xs">
                <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono-data font-bold uppercase tracking-wider mb-1.5 truncate">
                  ACTIVE SETUPS
                </div>
                <div className="font-h3 text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white truncate">
                  3 Active
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#6e6e73] dark:text-[#86868b] font-medium mt-2 pt-1.5 border-t border-black/[0.06] dark:border-white/[0.04] flex items-center gap-1.5 truncate">
                  <span className="truncate">1 ready to stamp</span>
                </div>
              </div>

              {/* Card 3: Guardrail */}
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between min-w-0 shadow-xs">
                <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono-data font-bold uppercase tracking-wider mb-1.5 truncate">
                  GUARDRAIL STATUS
                </div>
                <div className="font-h3 text-lg sm:text-xl font-bold uppercase tracking-tight text-[#30d158] truncate">
                  Compliant
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#0071e3] dark:text-[#2997ff] font-medium mt-2 pt-1.5 border-t border-black/[0.06] dark:border-white/[0.04] flex items-center gap-1.5 truncate">
                  <span className="truncate">25% Buffer Armed</span>
                </div>
              </div>
            </div>

            {/* Signal Flow Chart */}
            <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 flex flex-col h-[180px] min-w-0 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 px-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-mono-data text-[10px] font-bold text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider">
                    Signal Flow Telemetry
                  </div>
                  <div className="font-mono-data text-[9px] text-[#0071e3] dark:text-[#2997ff] uppercase px-1.5 py-0.5 rounded-md bg-[#0071e3]/10 font-bold border border-[#0071e3]/20">
                    12ms
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#6e6e73] dark:text-[#86868b] font-bold uppercase tracking-wider font-mono-data">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full bg-[#0071e3] shrink-0" />
                    Displacement
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full bg-black/25 dark:bg-white/30 shrink-0" />
                    Target 1:2 R:R
                  </span>
                </div>
              </div>

              <div className="flex-1 rounded-xl bg-white dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.04] relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-10">
                  <div className="border-t border-black dark:border-white w-full" />
                  <div className="border-t border-black dark:border-white w-full" />
                  <div className="border-t border-black dark:border-white w-full" />
                  <div className="border-t border-black dark:border-white w-full" />
                </div>

                <svg className="absolute bottom-0 w-full h-[85%]" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="hero-flow-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%"   stopColor="#0071e3" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0071e3" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 C15,75 25,85 40,65 C55,45 65,55 80,30 C90,15 95,20 100,10 L100,100 L0,100 Z" fill="url(#hero-flow-grad)" />
                  <path d="M0,60 C20,55 35,65 50,45 C65,25 80,35 100,15" fill="none" stroke="rgba(0,113,227,0.3)" strokeDasharray="2,2" strokeWidth="0.75" />
                  <path d="M0,80 C15,75 25,85 40,65 C55,45 65,55 80,30 C90,15 95,20 100,10" fill="none" stroke="#0071e3" strokeLinecap="round" strokeWidth="2" />
                  <circle cx="15" cy="76" fill="#0071e3" r="1.5" />
                  <circle cx="40" cy="65" fill="white" r="2.5" stroke="#0071e3" strokeWidth="1" />
                  <circle cx="65" cy="48" fill="#0071e3" r="1.5" />
                  <circle cx="80" cy="30" fill="white" r="2.5" stroke="#0071e3" strokeWidth="1" />
                  <circle cx="95" cy="13" fill="#0071e3" r="1.5" />
                </svg>

                <div className="absolute bottom-1 right-2 font-mono-data text-[8px] text-[#6e6e73] dark:text-[#86868b] uppercase">t: 127.4s</div>
                <div className="absolute top-2 left-2 font-mono-data text-[8px] text-[#6e6e73] dark:text-[#86868b] uppercase font-bold">ASSET: {selectedAsset.symbol}</div>
              </div>
            </div>

            {/* Bottom 2 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              {/* Focus Queue */}
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 min-w-0 shadow-xs">
                <div className="font-mono-data text-[11px] font-bold text-[#6e6e73] dark:text-[#86868b] border-b border-black/[0.06] dark:border-white/[0.05] pb-1.5 mb-2.5 uppercase tracking-wider">
                  Focus Queue
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#1d1d1f] dark:text-white font-medium truncate mr-2">EUR/USD Asian Sweep</span>
                    <span className="text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono-data shrink-0 border border-[#0071e3]/20">EXECUTE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#1d1d1f]/80 dark:text-white/80 truncate mr-2">XAU/USD VWAP Reversion</span>
                    <span className="text-[#6e6e73] dark:text-[#86868b] text-[10px] font-mono-data shrink-0">MONITOR</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#1d1d1f]/80 dark:text-white/80 truncate mr-2">US30 4H Order Block</span>
                    <span className="text-[#1d1d1f] dark:text-white bg-black/[0.05] dark:bg-white/[0.06] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono-data shrink-0 border border-black/[0.08] dark:border-white/[0.1]">ARMED</span>
                  </div>
                </div>
              </div>

              {/* Drawdown Buffer Pipeline */}
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3 sm:p-3.5 min-w-0 shadow-xs">
                <div className="font-mono-data text-[11px] font-bold text-[#6e6e73] dark:text-[#86868b] border-b border-black/[0.06] dark:border-white/[0.05] pb-1.5 mb-2.5 uppercase tracking-wider">
                  Drawdown Buffer Pipeline
                </div>
                <div className="space-y-2.5 pt-0.5">
                  <div>
                    <div className="h-1.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full w-full overflow-hidden mb-1">
                      <div className="h-full bg-[#0071e3] rounded-full w-4/5" />
                    </div>
                    <div className="font-mono-data text-[10px] text-[#6e6e73] dark:text-[#86868b] flex justify-between">
                      <span>Daily Buffer</span>
                      <span className="text-[#0071e3] dark:text-[#2997ff] font-bold">${riskResult.remainingDailyBufferDollar.toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="h-1.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full w-full overflow-hidden mb-1">
                      <div className="h-full bg-black/30 dark:bg-white/30 rounded-full w-11/12" />
                    </div>
                    <div className="font-mono-data text-[10px] text-[#6e6e73] dark:text-[#86868b] flex justify-between">
                      <span>Max Cushion</span>
                      <span className="text-[#1d1d1f] dark:text-white font-bold">${riskResult.remainingOverallBufferDollar.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: SESSION RADAR */}
        {mockTab === 'RADAR' && (
          <div className="space-y-4">
            <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0071e3]" />
                  <span className="text-sm font-bold text-[#1d1d1f] dark:text-white font-mono-data">Global Session Timing (24H UTC)</span>
                </div>
                <span className="text-xs text-[#30d158] font-mono-data bg-[#30d158]/10 px-2 py-0.5 rounded-full border border-[#30d158]/25 font-bold">
                  NY OVERLAP ACTIVE
                </span>
              </div>

              <div className="space-y-3">
                <div className="h-7 bg-white dark:bg-black/40 rounded-lg border border-black/[0.08] dark:border-white/[0.07] relative overflow-hidden flex items-center shadow-inner">
                  <div className="absolute left-0 w-[33%] h-full bg-black/[0.02] dark:bg-white/[0.04] border-r border-black/[0.08] dark:border-white/[0.10] flex items-center px-2 text-[10px] font-mono-data text-[#6e6e73] dark:text-[#86868b]">
                    ASIAN (23:00-08:00)
                  </div>
                  <div className="absolute left-[29%] w-[38%] h-full bg-black/[0.02] dark:bg-white/[0.04] border-r border-black/[0.08] dark:border-white/[0.10] flex items-center px-2 text-[10px] font-mono-data text-[#6e6e73] dark:text-[#86868b]">
                    LONDON (07:00-16:00)
                  </div>
                  <div className="absolute left-[50%] w-[38%] h-full bg-[#0071e3]/10 flex items-center px-2 text-[10px] font-mono-data text-[#0071e3] dark:text-[#2997ff] font-bold">
                    NEW YORK (12:00-21:00)
                  </div>
                  {/* Current Time Pin */}
                  <div className="absolute left-[56%] top-0 bottom-0 w-0.5 bg-[#0071e3] shadow-[0_0_6px_rgba(0,113,227,0.5)] z-20" />
                </div>
                <div className="flex justify-between text-[9px] text-[#6e6e73] dark:text-[#86868b] font-mono-data">
                  <span>00:00 UTC</span>
                  <span>06:00 UTC</span>
                  <span>12:00 UTC</span>
                  <span>18:00 UTC</span>
                  <span>24:00 UTC</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3.5 shadow-xs">
                <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono-data uppercase font-bold mb-1">London Open Killzone</div>
                <div className="text-xs text-[#1d1d1f] dark:text-white font-bold">07:00 - 09:00 UTC</div>
                <p className="text-[11px] text-[#6e6e73] dark:text-[#86868b] mt-1">Asian Range liquidity sweeps &amp; Judas swing discovery.</p>
              </div>
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3.5 shadow-xs">
                <div className="text-[10px] text-[#0071e3] dark:text-[#2997ff] font-mono-data uppercase font-bold mb-1">New York Open Killzone</div>
                <div className="text-xs text-[#1d1d1f] dark:text-white font-bold">12:30 - 15:00 UTC</div>
                <p className="text-[11px] text-[#6e6e73] dark:text-[#86868b] mt-1">Peak institutional order flow &amp; displacement confirmation.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLAYBOOKS */}
        {mockTab === 'PLAYBOOKS' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] rounded-2xl p-3.5 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] font-bold border border-black/[0.06] dark:border-white/[0.08]">
                    STRATEGY A
                  </span>
                  <span className="text-[10px] text-[#30d158] font-mono-data font-bold">68% Win Rate</span>
                </div>
                <div className="text-sm font-bold text-[#1d1d1f] dark:text-white mt-1.5">Asian Sweep &amp; Displacement</div>
                <div className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-1">EUR/USD &bull; Target 1:2 R:R</div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono-data text-[#0071e3] dark:text-[#2997ff]">
                  <span>Trigger: Low Swept</span>
                  <span className="font-bold">ARMED</span>
                </div>
              </div>

              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] rounded-2xl p-3.5 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] font-bold border border-black/[0.06] dark:border-white/[0.08]">
                    STRATEGY B
                  </span>
                  <span className="text-[10px] text-[#30d158] font-mono-data font-bold">62% Win Rate</span>
                </div>
                <div className="text-sm font-bold text-[#1d1d1f] dark:text-white mt-1.5">Session VWAP Reversion</div>
                <div className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-1">XAU/USD &bull; Target 1:1.8 R:R</div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono-data text-[#6e6e73] dark:text-[#86868b]">
                  <span>Deviation: 2.1 Std</span>
                  <span className="font-bold text-[#1d1d1f] dark:text-white">MONITOR</span>
                </div>
              </div>
            </div>

            <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.05] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold text-[#1d1d1f] dark:text-white">Need to execute one of these playbooks?</div>
                <div className="text-[11px] text-[#6e6e73] dark:text-[#86868b]">Send directly to the Prop Risk Engine with one click.</div>
              </div>
              <button
                onClick={() => setActiveTab('PLAYBOOK')}
                className="px-3.5 py-1.5 bg-[#0071e3] text-white rounded-full text-xs font-bold hover:bg-[#0077ed] transition-colors font-mono-data ml-3 shrink-0 cursor-pointer shadow-sm"
              >
                View All
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: RISK ENGINE */}
        {mockTab === 'RISK' && (
          <div className="space-y-4">
            <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold font-mono-data text-[#1d1d1f] dark:text-white">Target Risk Selection</span>
                <span className="text-xs font-bold text-[#0071e3] dark:text-[#2997ff] font-mono-data">
                  {targetRiskPercent}% of Balance (${riskResult.dollarRisk.toFixed(0)})
                </span>
              </div>
              <div className="flex gap-2">
                {[0.25, 0.5, 1.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTargetRiskPercent(pct)}
                    className={`flex-1 py-1.5 rounded-full text-xs font-mono-data font-bold transition-all duration-200 cursor-pointer ${
                      targetRiskPercent === pct
                        ? 'bg-[#0071e3] text-white shadow-xs'
                        : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.06]'
                    }`}
                  >
                    {pct}% Risk
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3.5 shadow-xs">
                <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono-data uppercase">Calculated Lot Size</div>
                <div className="text-xl font-bold text-[#1d1d1f] dark:text-white mt-1 font-mono-data">{riskResult.lotSize} Lots</div>
                <div className="text-[10px] text-[#30d158] mt-0.5 font-mono-data font-semibold">Within max broker limits</div>
              </div>
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3.5 shadow-xs">
                <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono-data uppercase">Buffer Impact</div>
                <div className="text-xl font-bold text-[#0071e3] dark:text-[#2997ff] mt-1 font-mono-data">
                  {((riskResult.dollarRisk / riskResult.remainingDailyBufferDollar) * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] mt-0.5 font-mono-data">of daily runway consumed</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Panel */}
      <div className="w-full lg:w-[280px] xl:w-[295px] bg-[#fbfbfd] dark:bg-[#161617] border-t lg:border-t-0 lg:border-l border-black/[0.06] dark:border-white/[0.06] p-3.5 sm:p-4 flex flex-col justify-between shrink-0 min-w-0">
        <div>
          <div className="font-bold text-[#1d1d1f] dark:text-white border-b border-black/[0.06] dark:border-white/[0.06] pb-3 mb-3.5 flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#0071e3]" />
              <span className="font-mono-data text-xs uppercase tracking-wide text-[#1d1d1f] dark:text-white font-semibold">Stratum Intelligence</span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 px-0.5">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#6e6e73] dark:text-[#86868b] uppercase tracking-widest font-mono-data">
                Recommended Action
              </div>
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-2.5 sm:p-3 text-xs text-[#1d1d1f] dark:text-[#d1d1d6] leading-relaxed shadow-xs">
                Stamp risk for <span className="text-[#0071e3] dark:text-[#2997ff] font-bold">EUR/USD Strategy A</span>. Risk is locked at ${riskResult.dollarRisk.toFixed(0)} ({targetRiskPercent}% of balance).
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#6e6e73] dark:text-[#86868b] uppercase tracking-widest font-mono-data">
                Signal Summary
              </div>
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-2.5 sm:p-3 text-xs text-[#1d1d1f] dark:text-[#d1d1d6] leading-relaxed shadow-xs">
                Asian session liquidity swept below 1.0828. London/NY overlap active with <span className="text-[#0071e3] font-bold">positive volume</span>.
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#6e6e73] dark:text-[#86868b] uppercase tracking-widest font-mono-data">
                Decision Log
              </div>
              <div className="space-y-1.5 overflow-y-auto pr-0.5">
                <div className="p-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.02] rounded-lg transition-colors text-xs">
                  <div className="min-w-0">
                    <div className="text-[#1d1d1f] dark:text-white font-medium truncate">Risk Budget Stamped</div>
                    <div className="font-mono-data text-[10px] text-[#6e6e73] dark:text-[#86868b] mt-0.5 truncate">2h ago &bull; {currentPreset.tierName}</div>
                  </div>
                </div>
                <div className="p-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.02] rounded-lg transition-colors text-xs">
                  <div className="min-w-0">
                    <div className="text-[#6e6e73] dark:text-white/70 font-medium truncate">Asian Liquidity Swept</div>
                    <div className="font-mono-data text-[10px] text-[#6e6e73] dark:text-[#86868b] mt-0.5 truncate">5h ago &bull; London Open</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liquid Glass CTA Card */}
        <div className="mt-3.5 bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl p-3.5 z-20 shadow-lg">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#0071e3]/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              </div>
              <span className="text-[11px] font-bold text-[#1d1d1f] dark:text-white tracking-tight font-mono-data uppercase truncate">
                Drawdown Guardrail
              </span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider font-mono-data px-1.5 py-0.5 rounded-full border shrink-0 text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 border-[#0071e3]/20">
              Enforced
            </span>
          </div>
          <div className="text-[11px] text-[#6e6e73] dark:text-[#aeaeb2] mb-2.5 leading-relaxed">
            Stratum 25% daily buffer guardrail is armed. Reckless execution is mathematically prevented.
          </div>
          <button
            onClick={() => setActiveTab('TERMINAL')}
            className="w-full py-2.5 rounded-xl text-[11px] font-bold transition-all font-mono-data uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-[0_4px_14px_rgba(0,113,227,0.30)]"
          >
            <span>Launch Workstation</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
