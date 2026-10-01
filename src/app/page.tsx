'use client';

import React from 'react';
import Header from '@/components/Header';
import HeroTerminalMockup from '@/components/HeroTerminalMockup';
import SessionRadar from '@/components/SessionRadar';
import NewsHazardIndex from '@/components/NewsHazardIndex';
import AssetBiasMatrix from '@/components/AssetBiasMatrix';
import StrategyPlaybook from '@/components/StrategyPlaybook';
import PropRiskEngine from '@/components/PropRiskEngine';
import TradingViewChart from '@/components/TradingViewChart';
import { useStratumStore } from '@/lib/store';
import { ArrowRight, ChevronRight, Terminal, ShieldCheck, BookOpen, Calculator, ArrowLeft } from 'lucide-react';

export default function StratumPage() {
  const { activeTab, setActiveTab } = useStratumStore();

  // If user selected Full Terminal mode (Screen 1, 2, or 3)
  if (activeTab === 'TERMINAL' || activeTab === 'PLAYBOOK' || activeTab === 'RISK_ENGINE') {
    return (
      <div className="min-h-screen bg-[#070708] text-[#e5e2e3] font-sans flex flex-col">
        {/* Terminal Header */}
        <header className="bg-[#070708] border-b border-[#232426] px-6 h-16 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('LANDING')}
              className="flex items-center gap-2 text-xs font-mono-data text-[#9A9DA3] hover:text-white px-2.5 py-1.5 rounded bg-[#101112] border border-[#232426] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#50d8e9]" />
              <span>Back to Overview</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-h3 font-bold text-white text-sm">Stratum Terminal</span>
              <span className="font-mono-data text-[10px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded border border-[#10B981]/30">
                LIVE_RUNWAY
              </span>
            </div>
          </div>

          {/* Screen Tabs */}
          <div className="flex items-center gap-1 bg-[#101112] p-1 rounded-lg border border-[#232426]">
            <button
              onClick={() => setActiveTab('TERMINAL')}
              className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono-data font-bold transition-all ${
                activeTab === 'TERMINAL'
                  ? 'bg-[#1B1C1E] text-white border border-[#232426]'
                  : 'text-[#9A9DA3] hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-[#50d8e9]" />
              <span>Screen 1: Terminal</span>
            </button>
            <button
              onClick={() => setActiveTab('PLAYBOOK')}
              className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono-data font-bold transition-all ${
                activeTab === 'PLAYBOOK'
                  ? 'bg-[#1B1C1E] text-white border border-[#232426]'
                  : 'text-[#9A9DA3] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#5E6BFF]" />
              <span>Screen 2: Playbook</span>
            </button>
            <button
              onClick={() => setActiveTab('RISK_ENGINE')}
              className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono-data font-bold transition-all ${
                activeTab === 'RISK_ENGINE'
                  ? 'bg-[#1B1C1E] text-white border border-[#232426]'
                  : 'text-[#9A9DA3] hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Screen 3: Risk Engine</span>
            </button>
          </div>
        </header>

        {/* Full Terminal View Content */}
        <div className="max-w-[1728px] mx-auto w-full p-6 space-y-6 flex-1">
          {activeTab === 'TERMINAL' && (
            <div className="space-y-6">
              <SessionRadar />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <TradingViewChart />
                  <AssetBiasMatrix />
                </div>
                <div className="lg:col-span-4">
                  <NewsHazardIndex />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PLAYBOOK' && <StrategyPlaybook />}

          {activeTab === 'RISK_ENGINE' && <PropRiskEngine />}
        </div>
      </div>
    );
  }

  // Otherwise, render the Clean, Calm, Professional Website (identical to the attached Romer theme)
  return (
    <div className="min-h-screen bg-[#070708] text-[#e5e2e3] font-sans flex flex-col selection:bg-[#5E6BFF] selection:text-white">
      
      {/* 1. Fixed Header (80px) */}
      <Header />

      <main className="max-w-[1728px] mx-auto w-full mt-[80px]">
        
        {/* 2. Hero & 3. Hero Dashboard Mockup */}
        <section className="px-6 md:px-12 relative pt-28 pb-16">
          <div className="max-w-[1516px] mx-auto">
            
            <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-12 gap-6">
              <div>
                <h1 className="font-h3 text-hero-headline text-[#e5e2e3] mb-4 max-w-[1000px]">
                  The command dashboard<br />for focused traders
                </h1>
                <p className="font-body-lg text-lg text-[#9A9DA3] mb-8 max-w-2xl leading-relaxed">
                  Stratum turns scattered session factors, news hazard alerts, and strict firm drawdown rules into one calm dashboard for funded traders.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('TERMINAL')}
                    className="bg-white text-black px-6 py-3 rounded font-bold text-sm hover:bg-opacity-90 transition-colors shadow-lg"
                  >
                    Open live terminal
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('principles');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#1a1b1d] border border-[#232426] text-[#e5e2e3] px-6 py-3 rounded font-bold text-sm hover:bg-[#101112] transition-colors"
                  >
                    How it works
                  </button>
                </div>
              </div>

              <div className="hidden lg:block text-right pb-2">
                <button
                  onClick={() => setActiveTab('TERMINAL')}
                  className="text-[#9A9DA3] font-mono-data text-xs hover:text-[#50d8e9] flex items-center gap-1.5 transition-colors"
                >
                  Live operating layer stratum.app/overview <ArrowRight className="w-4 h-4 text-[#50d8e9]" />
                </button>
              </div>
            </div>

            {/* Hero Dashboard Mockup */}
            <HeroTerminalMockup />

          </div>
        </section>

        {/* 4. Product Principle */}
        <section id="principles" className="px-6 md:px-12 border-t border-[#232426] flex flex-col justify-center items-center relative overflow-hidden py-24">
          <div className="max-w-[1516px] w-full mx-auto">
            <h2 className="font-h2 text-3xl md:text-5xl text-center text-[#e5e2e3] mb-20 max-w-4xl mx-auto font-semibold tracking-tight">
              Operating rhythm, simplified. The architecture of a disciplined trader.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1 */}
              <div className="border border-[#232426] rounded-xl p-6 bg-[#070708] relative h-[400px] flex flex-col inner-glow">
                <div className="font-mono-data text-[#9A9DA3] mb-4 text-xs">FIG 0.1 / UNIFIED VIEW</div>
                <div className="flex-1 border border-[#232426] rounded-lg bg-[#0a0a0b] flex items-center justify-center p-4">
                  <div className="w-full h-full dot-pattern flex items-center justify-center relative">
                    <svg fill="none" height="80%" viewBox="0 0 200 200" width="80%">
                      <rect height="160" rx="2" stroke="#232426" strokeWidth="0.5" width="160" x="20" y="20" />
                      <line stroke="#232426" strokeWidth="0.5" x1="60" x2="60" y1="20" y2="180" />
                      <rect height="40" rx="1" stroke="#5E6BFF" strokeWidth="0.75" width="100" x="70" y="30" />
                      <rect height="90" rx="1" stroke="#232426" strokeWidth="0.5" width="100" x="70" y="80" />
                      <text fill="#454655" fontFamily="monospace" fontSize="6" x="75" y="45">SEC_ALPHA</text>
                      <text fill="#454655" fontFamily="monospace" fontSize="6" x="75" y="95">SEC_BETA</text>
                      <text fill="#454655" fontFamily="monospace" fontSize="5" x="25" y="30">LAYER_0</text>
                    </svg>
                    <div className="absolute bottom-2 right-2 font-mono-data text-[8px] text-[#9A9DA3] opacity-40">
                      COORD: 34.22 // 11.08
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="border border-[#232426] rounded-xl p-6 bg-[#070708] relative h-[400px] flex flex-col inner-glow">
                <div className="font-mono-data text-[#9A9DA3] mb-4 text-xs">FIG 0.2 / DECISION GRAPH</div>
                <div className="flex-1 border border-[#232426] rounded-lg bg-[#0a0a0b] flex items-center justify-center p-4">
                  <div className="w-full h-full dot-pattern flex items-center justify-center relative">
                    <svg fill="none" height="80%" viewBox="0 0 200 200" width="80%">
                      <circle cx="100" cy="100" r="40" stroke="#50d8e9" strokeWidth="0.5" />
                      <circle cx="40" cy="40" r="8" stroke="#232426" strokeWidth="0.5" />
                      <circle cx="160" cy="40" r="8" stroke="#232426" strokeWidth="0.5" />
                      <circle cx="160" cy="160" r="8" stroke="#232426" strokeWidth="0.5" />
                      <circle cx="40" cy="160" r="8" stroke="#232426" strokeWidth="0.5" />
                      <line stroke="#454655" strokeDasharray="2 2" strokeWidth="0.5" x1="47" x2="71" y1="47" y2="71" />
                      <line stroke="#454655" strokeDasharray="2 2" strokeWidth="0.5" x1="153" x2="129" y1="47" y2="71" />
                      <line stroke="#454655" strokeDasharray="2 2" strokeWidth="0.5" x1="153" x2="129" y1="153" y2="129" />
                      <line stroke="#454655" strokeDasharray="2 2" strokeWidth="0.5" x1="47" x2="71" y1="153" y2="129" />
                      <rect fill="#50d8e9" height="2" width="2" x="70" y="70" />
                      <rect fill="#50d8e9" height="2" width="2" x="128" y="70" />
                      <rect fill="#50d8e9" height="2" width="2" x="128" y="128" />
                      <rect fill="#50d8e9" height="2" width="2" x="70" y="128" />
                      <text fill="#454655" fontFamily="monospace" fontSize="6" x="90" y="103">ROOT_V1</text>
                      <text fill="#454655" fontFamily="monospace" fontSize="5" x="40" y="30">ND_01</text>
                      <text fill="#454655" fontFamily="monospace" fontSize="5" x="155" y="30">ND_02</text>
                    </svg>
                    <div className="absolute top-2 left-2 font-mono-data text-[8px] text-[#9A9DA3] opacity-40">
                      REL_MAP: SYNC
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="border border-[#232426] rounded-xl p-6 bg-[#070708] relative h-[400px] flex flex-col inner-glow">
                <div className="font-mono-data text-[#9A9DA3] mb-4 text-xs">FIG 0.3 / AUTOMATED RHYTHM</div>
                <div className="flex-1 border border-[#232426] rounded-lg bg-[#0a0a0b] flex items-center justify-center p-4">
                  <div className="w-full h-full dot-pattern flex items-center justify-center relative">
                    <svg fill="none" height="80%" viewBox="0 0 200 200" width="80%">
                      <path d="M20,100 Q60,20 100,100 T180,100" fill="none" stroke="#E5FD17" strokeWidth="0.75" />
                      <line stroke="#454655" strokeDasharray="2 2" strokeWidth="0.5" x1="100" x2="100" y1="20" y2="180" />
                      <circle cx="100" cy="100" fill="#E5FD17" r="3" />
                      <text fill="#454655" fontFamily="monospace" fontSize="8" x="185" y="105">t</text>
                      <text fill="#454655" fontFamily="monospace" fontSize="8" x="105" y="25">v</text>
                      <text fill="#E5FD17" fontFamily="monospace" fontSize="6" x="108" y="98">[100, 100]</text>
                      <text fill="#454655" fontFamily="monospace" fontSize="5" x="108" y="106">SYNC_EVENT</text>
                    </svg>
                    <div className="absolute bottom-2 right-2 font-mono-data text-[8px] text-[#9A9DA3] opacity-40">
                      FREQ: 440HZ // AMPL: 1.0
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Signal Intelligence (Turn signals into focus) */}
        <section className="px-6 md:px-12 border-t border-[#232426] flex items-center relative py-24">
          <div className="max-w-[1516px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div>
              <h2 className="font-h2 text-3xl md:text-5xl text-[#e5e2e3] font-semibold mb-6 tracking-tight">
                Turn signals into focus
              </h2>
              <p className="font-body-lg text-lg text-[#9A9DA3] leading-relaxed">
                Aggregate noise from across session clocks, liquidity pools, and news releases into a single, structured signal stream. Stratum identifies anomalies and surfaces what matters.
              </p>
            </div>

            <div className="relative h-[480px] w-full">
              <div className="w-full h-full border border-white/[0.08] relative overflow-hidden bg-[#070708] rounded-xl inner-glow">
                <div className="absolute inset-0 dot-pattern opacity-20" />
                
                {/* Header Telemetry */}
                <div className="absolute top-6 left-8 flex gap-8">
                  <div className="flex flex-col">
                    <span className="font-mono-data text-[9px] text-[#9A9DA3] uppercase tracking-[0.2em]">System Hash</span>
                    <span className="font-mono-data text-[11px] text-white">0x8F22A_PROP</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono-data text-[9px] text-[#9A9DA3] uppercase tracking-[0.2em]">Signal Density</span>
                    <span className="font-mono-data text-[11px] text-[#50d8e9]">0.842 RMS</span>
                  </div>
                </div>

                {/* Analytical SVG */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <svg className="w-full h-[60%]" preserveAspectRatio="none" viewBox="0 0 1000 400">
                    <defs>
                      <linearGradient id="line-grad-2" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" stopColor="#50d8e9" stopOpacity="0" />
                        <stop offset="50%" stopColor="#50d8e9" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#50d8e9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line opacity="0.2" stroke="#454655" strokeDasharray="4 4" strokeWidth="0.5" x1="0" x2="1000" y1="100" y2="100" />
                    <line opacity="0.1" stroke="#454655" strokeWidth="0.5" x1="0" x2="1000" y1="200" y2="200" />
                    <line opacity="0.2" stroke="#454655" strokeDasharray="4 4" strokeWidth="0.5" x1="0" x2="1000" y1="300" y2="300" />
                    <path d="M0,200 L100,195 L200,210 L300,180 L400,220 L500,150 L600,230 L700,200 L800,210 L900,190 L1000,200" fill="none" stroke="url(#line-grad-2)" strokeWidth="1.5" />
                    <circle cx="300" cy="180" fill="#50d8e9" r="3" />
                    <circle cx="500" cy="150" fill="#50d8e9" r="3" />
                    <circle cx="600" cy="230" fill="#ffb689" r="3" />
                    <text fill="#50d8e9" fontFamily="Inter" fontSize="11" fontWeight="500" x="510" y="140">P_SYNC_OK</text>
                    <text fill="#ffb689" fontFamily="Inter" fontSize="11" fontWeight="500" x="610" y="245">Δ_LATENCY_WARN</text>
                  </svg>
                </div>

                {/* Bottom Metadata */}
                <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end font-mono-data">
                  <div className="text-[9px] text-[#9A9DA3]/60 leading-relaxed">
                    SCAN_READY // PROP_FIRM_COMPLIANT<br />
                    LATENCY: 14ms // REVISE_RATE: 100%
                  </div>
                  <div className="flex gap-4 text-[10px] text-white uppercase tracking-widest">
                    <span className="text-[#5E6BFF]">Live Feed</span>
                    <span className="opacity-40">Historical</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Decision Command Center (Guide every decision forward) */}
        <section className="px-6 md:px-12 border-t border-[#232426] flex items-center relative py-24">
          <div className="max-w-[1516px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            
            {/* Visual Dashboard Card (Left) */}
            <div className="relative h-[480px] w-full order-2 md:order-1">
              <div className="absolute inset-0 bg-[#0a0a0b] border border-[#232426] rounded-xl overflow-hidden flex flex-col inner-glow">
                
                {/* Timeline */}
                <div className="p-6 border-b border-white/[0.05] relative h-1/2 bg-white/[0.01]">
                  <div className="flex justify-between text-mono-data text-[10px] text-[#9A9DA3] mb-6 border-b border-white/[0.05] pb-2 uppercase tracking-widest">
                    <span className="text-white">Asian Open</span>
                    <span>London Open</span>
                    <span>NY Overlap</span>
                    <span>NY Close</span>
                  </div>
                  <div className="relative h-full space-y-3">
                    <div className="w-[45%] h-7 bg-white/[0.03] rounded border border-white/[0.05] flex items-center px-3 text-xs text-white/80 ml-[5%]">
                      Asian Range // LIQUIDITY_ACCUM
                    </div>
                    <div className="w-[50%] h-7 bg-white/[0.03] rounded border border-white/[0.05] flex items-center px-3 text-xs text-white/80 ml-[30%]">
                      Judas Swing // ASIAN_LOW_SWEPT
                    </div>
                    <div className="w-[40%] h-7 bg-[#5E6BFF]/15 border border-[#5E6BFF]/30 rounded flex items-center px-3 text-xs text-[#5E6BFF] ml-[45%] font-medium">
                      Displacement FVG // EXECUTION_ARMED
                    </div>
                  </div>
                </div>

                {/* Bottom Hub */}
                <div className="flex-1 grid grid-cols-2 gap-px bg-white/[0.05]">
                  <div className="bg-[#0a0a0b] p-6 flex flex-col justify-between">
                    <div className="text-[10px] text-[#9A9DA3] uppercase font-bold tracking-widest font-mono-data">
                      Operational Risk Hub
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] text-[#9A9DA3]">Velocity Index</div>
                        <div className="text-lg font-bold text-white">14.2<span className="text-xs text-[#50d8e9] ml-1">+5%</span></div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#9A9DA3]">Buffer Runway</div>
                        <div className="text-lg font-bold text-white">90%<span className="text-xs text-[#10B981] ml-1">Safe</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0b] p-6 flex flex-col justify-center">
                    <div className="text-[10px] text-[#9A9DA3] uppercase font-bold tracking-widest font-mono-data mb-3">
                      Rule Validation Tree
                    </div>
                    <div className="space-y-1.5 text-[10px] font-mono-data">
                      <div className="text-[#10B981]">&bull; FTMO DAILY LOSS: PASS</div>
                      <div className="text-[#10B981]">&bull; 25% BUFFER CHECK: PASS</div>
                      <div className="text-[#50d8e9]">&bull; NEWS BLACKOUT: CLEAR</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Copy (Right) */}
            <div className="order-1 md:order-2">
              <h2 className="font-h2 text-3xl md:text-5xl text-[#e5e2e3] font-semibold mb-6 tracking-tight">
                Guide every decision forward
              </h2>
              <p className="font-body-lg text-lg text-[#9A9DA3] leading-relaxed">
                Map strategic decisions against operational timelines. Keep execution unblocked with hard firm rules, structured playbooks, and automated sizing context.
              </p>
            </div>

          </div>
        </section>

        {/* 7. Insights Timeline (4 Nodes) */}
        <section className="px-6 md:px-12 border-t border-[#232426] flex flex-col justify-center relative overflow-hidden py-24">
          <div className="max-w-[1516px] w-full mx-auto relative pt-16">
            <div className="absolute top-1/2 left-0 w-full h-px bg-[#232426] -z-10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-4 h-4 rounded-full bg-[#5E6BFF] mb-6 relative z-10 shadow-[0_0_15px_#5E6BFF]" />
                <h3 className="font-h3 text-base font-semibold text-white mb-2">Approval cycles</h3>
                <p className="text-sm text-[#9A9DA3]">Reduce bottlenecks in critical sign-offs.</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-3 h-3 rounded-full bg-[#232426] border border-[#9A9DA3] mb-6 mt-0.5 relative z-10" />
                <h3 className="font-h3 text-base font-semibold text-white mb-2">Capacity forecast</h3>
                <p className="text-sm text-[#9A9DA3]">Predict drawdown runway ahead of time.</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-3 h-3 rounded-full bg-[#232426] border border-[#9A9DA3] mb-6 mt-0.5 relative z-10" />
                <h3 className="font-h3 text-base font-semibold text-white mb-2">Risk movement</h3>
                <p className="text-sm text-[#9A9DA3]">Track shifting risk profiles continuously.</p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="w-3 h-3 rounded-full bg-[#232426] border border-[#9A9DA3] mb-6 mt-0.5 relative z-10" />
                <h3 className="font-h3 text-base font-semibold text-white mb-2">Operating rhythm</h3>
                <p className="text-sm text-[#9A9DA3]">Establish a steady heartbeat for execution.</p>
              </div>

            </div>
          </div>
        </section>

        {/* 8. Customer Quotes (2 Cards: Pale Cyan #D1EBEB & Electric Lime #C4FF44) */}
        <section className="px-6 md:px-12 border-t border-[#232426] flex items-center bg-[#050505] py-24">
          <div className="max-w-[1516px] w-full mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Quote */}
            <div className="lg:col-span-3 bg-[#D1EBEB] rounded-2xl p-8 md:p-12 flex flex-col justify-between min-h-[440px]">
              <p className="font-h2 text-2xl md:text-3xl text-black leading-tight max-w-2xl font-semibold">
                "Stratum finally gave our leadership team a unified lens. The signal-to-noise ratio is exactly what we needed to operate faster."
              </p>
              <div>
                <div className="font-bold text-black text-base">Mara Chen</div>
                <div className="text-black/70 text-sm">COO, Northline</div>
              </div>
            </div>

            {/* Right Quote */}
            <div className="lg:col-span-2 bg-[#C4FF44] rounded-2xl p-8 md:p-12 flex flex-col justify-between min-h-[440px]">
              <p className="font-h3 text-xl md:text-2xl text-black leading-tight font-semibold">
                "It replaced three separate dashboards and endless status meetings."
              </p>
              <div>
                <div className="font-bold text-black text-base">Ivo Patel</div>
                <div className="text-black/70 text-sm">VP Operations, Meridian</div>
              </div>
            </div>

          </div>
        </section>

        {/* 9. Final CTA */}
        <section className="px-6 md:px-12 border-t border-[#232426] flex flex-col justify-center items-center text-center py-28">
          <div className="max-w-2xl">
            <h2 className="font-h1 text-hero-headline text-[#e5e2e3] mb-6">
              Built for clarity.<br />Ready today.
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setActiveTab('TERMINAL')}
                className="bg-white text-black px-8 py-3.5 rounded font-bold text-sm hover:bg-opacity-90 transition-colors shadow-lg"
              >
                Open live terminal
              </button>
              <button
                onClick={() => setActiveTab('RISK_ENGINE')}
                className="bg-transparent border border-[#232426] text-[#e5e2e3] px-8 py-3.5 rounded font-bold text-sm hover:bg-[#1a1b1d] transition-colors"
              >
                Test risk rules
              </button>
            </div>
          </div>
        </section>

        {/* 10. Footer */}
        <footer className="bg-[#0d0e0f] border-t border-[#232426] flex flex-col justify-between px-6 md:px-12 pt-24 pb-12">
          <div className="max-w-[1728px] w-full mx-auto grid grid-cols-2 md:grid-cols-6 gap-10">
            
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full border border-[#9A9DA3] flex items-center justify-center text-white font-bold text-xs">
                  S
                </div>
                <span className="font-h3 text-lg font-bold text-white">Stratum</span>
              </div>
              <p className="text-xs text-[#9A9DA3] max-w-xs leading-relaxed">
                The operating layer for focused teams.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="font-mono-data text-[#9A9DA3] mb-2 font-bold">PRODUCT</div>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">Overview</a>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">Features</a>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">Security</a>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="font-mono-data text-[#9A9DA3] mb-2 font-bold">PLATFORM</div>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">Integrations</a>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">API</a>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">Status</a>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="font-mono-data text-[#9A9DA3] mb-2 font-bold">COMPANY</div>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">About</a>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">Careers</a>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">Blog</a>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="font-mono-data text-[#9A9DA3] mb-2 font-bold">RESOURCES</div>
              <a href="#" className="text-[#e5e2e3] hover:text-[#5E6BFF] transition-colors">Documentation</a>
            </div>

          </div>
        </footer>

      </main>

    </div>
  );
}
