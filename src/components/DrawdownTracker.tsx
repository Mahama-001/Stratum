'use client';

import React from 'react';
import { useStratumStore } from '@/lib/store';
import { Shield, CheckCircle2 } from 'lucide-react';

export default function DrawdownTracker() {
  const { currentPreset, todayRealizedPnL, riskResult } = useStratumStore();

  const dailyLimit = riskResult.dailyMaxLossLimitDollar;
  const remainingDaily = riskResult.remainingDailyBufferDollar;
  const dailyHealthPercent = dailyLimit > 0 ? Math.max(0, Math.min(100, (remainingDaily / dailyLimit) * 100)) : 100;

  const maxOverall = riskResult.maxOverallLossLimitDollar;
  const remainingOverall = riskResult.remainingOverallBufferDollar;
  const overallHealthPercent = maxOverall > 0 ? Math.max(0, Math.min(100, (remainingOverall / maxOverall) * 100)) : 100;

  return (
    <div className="apple-card p-5 relative flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-black/[0.08] pb-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#34c759]" />
            <span className="font-mono-data text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
              DRAWDOWN GATEKEEPER
            </span>
          </div>
          <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 font-bold">
            {currentPreset.firm} RULES
          </span>
        </div>

        {/* Daily Drawdown Health */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono-data mb-1.5">
            <span className="text-[#6e6e73]">Daily Drawdown Runway</span>
            <span className={`font-bold ${remainingDaily < 1000 ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
              ${remainingDaily.toLocaleString()} / ${dailyLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full bg-black/[0.06] rounded-full overflow-hidden border border-black/[0.08]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                dailyHealthPercent < 25
                  ? 'bg-[#ff3b30]'
                  : dailyHealthPercent < 50
                  ? 'bg-[#ff9500]'
                  : 'bg-[#34c759]'
              }`}
              style={{ width: `${dailyHealthPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono-data text-[#6e6e73] mt-1">
            <span>{dailyHealthPercent.toFixed(0)}% runway remaining</span>
            <span>Max daily: {currentPreset.dailyLossLimitPercent}%</span>
          </div>
        </div>

        {/* Overall Max Drawdown Health */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono-data mb-1.5">
            <span className="text-[#6e6e73]">Max Account Drawdown</span>
            <span className={`font-bold ${remainingOverall < 2000 ? 'text-[#ff3b30]' : 'text-[#0071e3]'}`}>
              ${remainingOverall.toLocaleString()} / ${maxOverall.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full bg-black/[0.06] rounded-full overflow-hidden border border-black/[0.08]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                overallHealthPercent < 25
                  ? 'bg-[#ff3b30]'
                  : overallHealthPercent < 50
                  ? 'bg-[#ff9500]'
                  : 'bg-[#0071e3]'
              }`}
              style={{ width: `${overallHealthPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono-data text-[#6e6e73] mt-1">
            <span>{overallHealthPercent.toFixed(0)}% max buffer remaining</span>
            <span>Total limit: {currentPreset.maxDrawdownPercent}%</span>
          </div>
        </div>
      </div>

      {/* Stratum Rule Protection Tag */}
      <div className="pt-3 border-t border-black/[0.08] flex items-center justify-between text-[11px] font-mono-data">
        <div className="flex items-center gap-1.5 text-[#34c759]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Evaluation Status: ACTIVE</span>
        </div>
        <div className="text-[#6e6e73]">
          PnL Today:{' '}
          <span className={todayRealizedPnL >= 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'}>
            {todayRealizedPnL >= 0 ? '+' : ''}${todayRealizedPnL.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
