'use client';

import React from 'react';
import { useStratumStore } from '@/lib/store';
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Lock, CheckCircle2 } from 'lucide-react';

export default function DrawdownTracker() {
  const { currentPreset, accountBalance, todayRealizedPnL, riskResult } = useStratumStore();

  const dailyLimit = riskResult.dailyMaxLossLimitDollar;
  const dailyLoss = riskResult.dailyLossSoFarDollar;
  const remainingDaily = riskResult.remainingDailyBufferDollar;
  const dailyHealthPercent = Math.max(0, Math.min(100, (remainingDaily / dailyLimit) * 100));

  const maxOverall = riskResult.maxOverallLossLimitDollar;
  const overallLoss = riskResult.totalLossSoFarDollar;
  const remainingOverall = riskResult.remainingOverallBufferDollar;
  const overallHealthPercent = Math.max(0, Math.min(100, (remainingOverall / maxOverall) * 100));

  return (
    <div className="bg-[#101112] border border-[#232426] rounded-xl p-5 inner-glow relative flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-[#232426] pb-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="font-mono-data text-xs font-bold text-white uppercase tracking-wider">
              DRAWDOWN GATEKEEPER
            </span>
          </div>
          <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-white/[0.04] text-[#50D8E9] font-bold">
            {currentPreset.firm} RULES
          </span>
        </div>

        {/* Daily Drawdown Health */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono-data mb-1.5">
            <span className="text-[#9A9DA3]">Daily Drawdown Runway</span>
            <span className={`font-bold ${remainingDaily < 1000 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
              ${remainingDaily.toLocaleString()} / ${dailyLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full bg-[#070708] rounded-full overflow-hidden border border-[#232426]">
            <div
              className={`h-full transition-all duration-500 ${
                dailyHealthPercent < 25
                  ? 'bg-[#EF4444]'
                  : dailyHealthPercent < 50
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#10B981]'
              }`}
              style={{ width: `${dailyHealthPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono-data text-[#9A9DA3] mt-1">
            <span>{dailyHealthPercent.toFixed(0)}% runway remaining</span>
            <span>Max daily: {currentPreset.dailyLossLimitPercent}%</span>
          </div>
        </div>

        {/* Overall Max Drawdown Health */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono-data mb-1.5">
            <span className="text-[#9A9DA3]">Max Account Drawdown</span>
            <span className={`font-bold ${remainingOverall < 2000 ? 'text-[#EF4444]' : 'text-[#50D8E9]'}`}>
              ${remainingOverall.toLocaleString()} / ${maxOverall.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full bg-[#070708] rounded-full overflow-hidden border border-[#232426]">
            <div
              className={`h-full transition-all duration-500 ${
                overallHealthPercent < 25
                  ? 'bg-[#EF4444]'
                  : overallHealthPercent < 50
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#50D8E9]'
              }`}
              style={{ width: `${overallHealthPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono-data text-[#9A9DA3] mt-1">
            <span>{overallHealthPercent.toFixed(0)}% max buffer remaining</span>
            <span>Total limit: {currentPreset.maxDrawdownPercent}%</span>
          </div>
        </div>
      </div>

      {/* Stratum Rule Protection Tag */}
      <div className="pt-3 border-t border-[#232426] flex items-center justify-between text-[11px] font-mono-data">
        <div className="flex items-center gap-1.5 text-[#10B981]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Evaluation Status: ACTIVE</span>
        </div>
        <div className="text-[#9A9DA3]">
          PnL Today: <span className={todayRealizedPnL >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
            {todayRealizedPnL >= 0 ? '+' : ''}${todayRealizedPnL.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
