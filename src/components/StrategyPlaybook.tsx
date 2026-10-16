'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { StrategySetup } from '@/lib/types';
import { 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Target,
  ArrowRight,
  ShieldCheck
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
      <div className="apple-card p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-[10px] text-[#0071e3] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0071e3]" />
                HIGH-CONSISTENCY PLAYBOOK
              </span>
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 font-bold">
                RIGOROUS BACKTESTED MODELS
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mt-1.5 font-h2">
              Institutional Trade Playbooks
            </h1>
            <p className="text-xs text-[#6e6e73] max-w-2xl mt-1 leading-relaxed">
              Prop firm longevity requires eliminating discretionary whim. Every playbook below follows strict session timing, liquidity absorption triggers, and predetermined 1:1.5 to 1:2 R:R boundaries.
            </p>
          </div>

          {/* Strategy Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-black/[0.04] p-1 rounded-full border border-black/[0.08]">
            <button
              onClick={() => setFilterStrategy('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono-data transition-all cursor-pointer ${
                filterStrategy === 'ALL'
                  ? 'bg-white text-[#1d1d1f] font-medium shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              All Setups ({setups.length})
            </button>
            <button
              onClick={() => setFilterStrategy('STRAT_A')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono-data transition-all cursor-pointer ${
                filterStrategy === 'STRAT_A'
                  ? 'bg-white text-[#1d1d1f] font-medium shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              Strategy A (Sweep)
            </button>
            <button
              onClick={() => setFilterStrategy('STRAT_B')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono-data transition-all cursor-pointer ${
                filterStrategy === 'STRAT_B'
                  ? 'bg-white text-[#1d1d1f] font-medium shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              Strategy B (VWAP)
            </button>
            <button
              onClick={() => setFilterStrategy('STRAT_C')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono-data transition-all cursor-pointer ${
                filterStrategy === 'STRAT_C'
                  ? 'bg-white text-[#1d1d1f] font-medium shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              Strategy C (Discount)
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
              className={`apple-card interactive-card p-5 relative flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-[#0071e3] shadow-[0_4px_20px_rgba(0,113,227,0.12)] ring-1 ring-[#0071e3]/30'
                  : 'border-black/[0.08] hover:border-black/[0.16]'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-xs font-bold text-[#1d1d1f] px-2 py-0.5 rounded bg-black/[0.04] border border-black/[0.08]">
                      {setup.asset}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isLong
                          ? 'bg-[#34c759]/12 text-[#248a3d] border border-[#34c759]/25'
                          : 'bg-[#ff3b30]/12 text-[#ff3b30] border border-[#ff3b30]/25'
                      }`}
                    >
                      {isLong ? <ArrowUpRight className="w-3.5 h-3.5 text-[#34c759]" /> : <ArrowDownRight className="w-3.5 h-3.5 text-[#ff3b30]" />}
                      {setup.bias}
                    </span>
                    <span className="text-[10px] font-mono-data text-[#6e6e73] px-1.5 py-0.5 rounded bg-black/[0.02] border border-black/[0.06]">
                      {setup.timeframe}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono-data text-[#0071e3] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20">
                    {setup.sessionTag}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="text-[11px] font-mono-data text-[#6e6e73] uppercase font-bold tracking-wider">
                    {setup.strategyName}
                  </div>
                  <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight mt-0.5">
                    {setup.tag}
                  </h3>
                </div>

                {/* Thesis: The "Why" */}
                <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-3 mb-4">
                  <div className="text-[9px] text-[#0071e3] font-mono-data uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3 text-[#0071e3]" />
                    Setup Thesis (The &quot;Why&quot;)
                  </div>
                  <p className="text-xs text-[#1d1d1f] leading-relaxed">
                    {setup.thesis}
                  </p>
                </div>

                {/* Precise Price Levels (Entry, SL, TP, R:R) */}
                <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-xl bg-black/[0.02] border border-black/[0.06] mb-4 font-mono-data text-center">
                  <div>
                    <div className="text-[9px] text-[#6e6e73] uppercase font-semibold">Entry</div>
                    <div className="text-xs font-bold text-[#1d1d1f] mt-0.5">
                      {setup.entryPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#ff3b30] uppercase font-semibold">Stop Loss</div>
                    <div className="text-xs font-bold text-[#ff3b30] mt-0.5">
                      {setup.stopLossPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#34c759] uppercase font-semibold">Take Profit</div>
                    <div className="text-xs font-bold text-[#34c759] mt-0.5">
                      {setup.takeProfitPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#0071e3] uppercase font-semibold">R : R</div>
                    <div className="text-xs font-extrabold text-[#0071e3] mt-0.5">
                      1 : {setup.riskRewardRatio}
                    </div>
                  </div>
                </div>

                {/* Consistency Metric */}
                <div className="flex items-center justify-between text-xs font-mono-data text-[#6e6e73] pb-4 border-b border-black/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#34c759]" />
                    <span>
                      <strong className="text-[#34c759] font-bold">{setup.winRatePercent}%</strong> Win Rate
                    </span>
                  </div>
                  <div className="text-[10px]">
                    across <strong className="text-[#1d1d1f]">{setup.backtestSampleSize}</strong> verified trades
                  </div>
                </div>
              </div>

              {/* Action Button: Send to Risk Engine */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <span className="text-[10px] text-[#6e6e73] font-mono-data">
                  {setup.historicalContext}
                </span>

                <button
                  onClick={() => selectSetupForRiskEngine(setup)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono-data font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#34c759] text-white shadow-sm'
                      : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm'
                  }`}
                >
                  <span>{isSelected ? 'Loaded in Engine' : 'Load in Risk Engine'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
