'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { StrategySetup, StrategySetupId } from '@/lib/types';
import { 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownRight, 
  Send, 
  Percent, 
  History, 
  CheckCircle2, 
  Filter, 
  Zap, 
  ShieldCheck,
  Target,
  Clock
} from 'lucide-react';

export default function StrategyPlaybook() {
  const { setups, selectSetupForRiskEngine, selectedSetup } = useStratumStore();
  const [filterStrategy, setFilterStrategy] = useState<string>('ALL');

  const filteredSetups = setups.filter((s) => {
    if (filterStrategy === 'ALL') return true;
    return s.strategyType === filterStrategy;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Thesis Context */}
      <div className="bg-[#101112] border border-[#232426] rounded-xl p-6 inner-glow relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#5E6BFF]/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-[10px] text-[#5E6BFF] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                HIGH-CONSISTENCY PLAYBOOK
              </span>
              <span className="text-[10px] font-mono-data px-1.5 py-0.2 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                RIGOROUS BACKTESTED MODELS
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Institutional Trade Playbooks
            </h1>
            <p className="text-xs text-[#9A9DA3] max-w-2xl mt-1 leading-relaxed">
              Prop firm longevity requires eliminating discretionary whim. Every playbook below follows strict session timing, liquidity absorption triggers, and predetermined 1:1.5 to 1:2 R:R boundaries.
            </p>
          </div>

          {/* Strategy Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#070708] p-1.5 rounded-xl border border-[#232426]">
            <button
              onClick={() => setFilterStrategy('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-data transition-all ${
                filterStrategy === 'ALL'
                  ? 'bg-[#1B1C1E] text-white font-bold border border-[#232426]'
                  : 'text-[#9A9DA3] hover:text-white'
              }`}
            >
              All Setups ({setups.length})
            </button>
            <button
              onClick={() => setFilterStrategy('STRAT_A')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-data transition-all ${
                filterStrategy === 'STRAT_A'
                  ? 'bg-[#50D8E9]/20 text-[#50D8E9] font-bold border border-[#50D8E9]/40'
                  : 'text-[#9A9DA3] hover:text-white'
              }`}
            >
              Strategy A (Sweep & Displacement)
            </button>
            <button
              onClick={() => setFilterStrategy('STRAT_B')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-data transition-all ${
                filterStrategy === 'STRAT_B'
                  ? 'bg-[#5E6BFF]/20 text-[#5E6BFF] font-bold border border-[#5E6BFF]/40'
                  : 'text-[#9A9DA3] hover:text-white'
              }`}
            >
              Strategy B (VWAP Reversion)
            </button>
            <button
              onClick={() => setFilterStrategy('STRAT_C')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-data transition-all ${
                filterStrategy === 'STRAT_C'
                  ? 'bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/40'
                  : 'text-[#9A9DA3] hover:text-white'
              }`}
            >
              Strategy C (Discount Pullback)
            </button>
          </div>
        </div>
      </div>

      {/* Setups Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSetups.map((setup) => {
          const isSelected = selectedSetup?.id === setup.id;
          const isLong = setup.bias === 'LONG';

          return (
            <div
              key={setup.id}
              className={`bg-[#101112] border rounded-xl p-5 inner-glow relative flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-[#50D8E9] shadow-[0_0_20px_rgba(80,216,233,0.15)] ring-1 ring-[#50D8E9]/30'
                  : 'border-[#232426] hover:border-[#3a3b40]'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-xs font-bold text-white px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
                      {setup.asset}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isLong
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                      }`}
                    >
                      {isLong ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {setup.bias}
                    </span>
                    <span className="text-[10px] font-mono-data text-[#9A9DA3] px-1.5 py-0.5 rounded bg-[#070708] border border-[#232426]">
                      {setup.timeframe}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono-data text-[#50D8E9] font-bold px-2 py-0.5 rounded bg-[#50D8E9]/10 border border-[#50D8E9]/30">
                    {setup.sessionTag}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="text-[11px] font-mono-data text-[#5E6BFF] uppercase font-bold tracking-wider">
                    {setup.strategyName}
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                    {setup.tag}
                  </h3>
                </div>

                {/* Thesis: The "Why" */}
                <div className="bg-[#070708]/80 border border-[#232426] rounded-lg p-3 mb-4">
                  <div className="text-[9px] text-[#9A9DA3] font-mono-data uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3 text-[#50D8E9]" />
                    Setup Thesis (The "Why")
                  </div>
                  <p className="text-xs text-[#e5e2e3] leading-relaxed">
                    {setup.thesis}
                  </p>
                </div>

                {/* Precise Price Levels (Entry, SL, TP, R:R) */}
                <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-lg bg-[#070708] border border-[#232426] mb-4 font-mono-data text-center">
                  <div>
                    <div className="text-[9px] text-[#9A9DA3] uppercase font-semibold">Entry</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {setup.entryPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#EF4444] uppercase font-semibold">Stop Loss</div>
                    <div className="text-xs font-bold text-[#EF4444] mt-0.5">
                      {setup.stopLossPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#10B981] uppercase font-semibold">Take Profit</div>
                    <div className="text-xs font-bold text-[#10B981] mt-0.5">
                      {setup.takeProfitPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#50D8E9] uppercase font-semibold">R : R</div>
                    <div className="text-xs font-extrabold text-[#50D8E9] mt-0.5">
                      1 : {setup.riskRewardRatio}
                    </div>
                  </div>
                </div>

                {/* Consistency Metric */}
                <div className="flex items-center justify-between text-xs font-mono-data text-[#9A9DA3] pb-4 border-b border-[#232426]">
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>
                      <strong className="text-[#10B981] font-bold">{setup.winRatePercent}%</strong> Win Rate
                    </span>
                  </div>
                  <div className="text-[10px]">
                    across <strong className="text-white">{setup.backtestSampleSize}</strong> verified trades
                  </div>
                </div>
              </div>

              {/* Action Button: Send to Risk Engine */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <span className="text-[10px] text-[#9A9DA3] font-mono-data">
                  {setup.historicalContext}
                </span>

                <button
                  onClick={() => selectSetupForRiskEngine(setup)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5E6BFF] hover:bg-[#6c78ff] text-white text-xs font-bold font-mono-data tracking-wider uppercase transition-all shadow-md shrink-0 shadow-[#5E6BFF]/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Risk Engine</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
