'use client';

import React, { useState, useEffect } from 'react';
import { useStratumStore } from '@/lib/store';
import { 
  Calculator, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2
} from 'lucide-react';
import AIInsightBadge from '@/components/AIInsightBadge';

export default function PropDrawdownSimulator() {
  const {
    userPurchasedAccounts,
    activeAccountId,
    beginnerMode
  } = useStratumStore();

  const activeAccount = userPurchasedAccounts.find((a) => a.id === activeAccountId) || userPurchasedAccounts[0];

  // Interactive Simulator State
  const [simBalance, setSimBalance] = useState<number>(activeAccount.startingBalance || 50000);
  const [simRiskPercent, setSimRiskPercent] = useState<number>(0.5);
  const [simDailyLimitPercent, setSimDailyLimitPercent] = useState<number>(activeAccount.dailyLossLimitPercent || 5.0);
  const [simMaxDrawdownPercent, setSimMaxDrawdownPercent] = useState<number>(activeAccount.maxDrawdownPercent || 10.0);

  // Synchronize simulator settings when active account changes
  useEffect(() => {
    if (activeAccount) {
      setSimBalance(activeAccount.startingBalance || 50000);
      setSimDailyLimitPercent(activeAccount.dailyLossLimitPercent || 5.0);
      setSimMaxDrawdownPercent(activeAccount.maxDrawdownPercent || 10.0);
    }
  }, [activeAccountId, activeAccount?.startingBalance, activeAccount?.dailyLossLimitPercent, activeAccount?.maxDrawdownPercent]);

  // Calculations
  const dollarRiskPerTrade = simBalance * (simRiskPercent / 100);
  const dollarDailyLossLimit = simBalance * (simDailyLimitPercent / 100);
  const dollarMaxDrawdownLimit = simBalance * (simMaxDrawdownPercent / 100);

  const lossesToDailyBreach = dollarRiskPerTrade > 0 ? Math.floor(dollarDailyLossLimit / dollarRiskPerTrade) : 0;
  const lossesToOverallBreach = dollarRiskPerTrade > 0 ? Math.floor(dollarMaxDrawdownLimit / dollarRiskPerTrade) : 0;

  // Loss Sequence Array (Up to 10 consecutive losses)
  const lossSequence = Array.from({ length: 10 }, (_, i) => {
    const tradeNum = i + 1;
    const totalLost = tradeNum * dollarRiskPerTrade;
    const balanceAfter = simBalance - totalLost;
    const remainingDailyBuffer = Math.max(0, dollarDailyLossLimit - totalLost);
    const isDailyBreach = totalLost >= dollarDailyLossLimit;
    const bufferBase = remainingDailyBuffer + dollarRiskPerTrade;
    const isGuardrailBreach = bufferBase > 0 ? (dollarRiskPerTrade / bufferBase) > 0.25 : true;

    return {
      tradeNum,
      totalLost,
      balanceAfter,
      remainingDailyBuffer,
      isDailyBreach,
      isGuardrailBreach
    };
  });

  // Trailing Drawdown Interactive Demo State
  const [trailingProfitGain, setTrailingProfitGain] = useState<number>(2000);
  const currentEquityWithProfit = simBalance + trailingProfitGain;
  // In intraday trailing, floor trails peak equity up until it locks at starting balance
  const trailingDrawdownFloor = Math.min(simBalance, currentEquityWithProfit - dollarMaxDrawdownLimit);
  const allowedDropFromPeak = currentEquityWithProfit - trailingDrawdownFloor;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="apple-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono-data text-[10px] text-[#0071e3] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#0071e3]" />
                SURVIVAL STRESS-TESTER &amp; MATHEMATICAL RUNWAY
              </span>
              <span className="text-[9px] font-mono-data px-2 py-0.5 rounded-full bg-black/[0.04] text-[#6e6e73] border border-black/[0.08] font-bold">
                PRO PROP METRICS
              </span>
              <AIInsightBadge type="drawdown" label="Survival Analysis" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1d1d1f] font-h2">
              Drawdown Simulator: How Many Consecutive Losses Can You Survive?
            </h1>
            <p className="text-xs text-[#6e6e73] mt-1 max-w-2xl leading-relaxed">
              Prop firm challenges are not won by high win rates. They are passed by maintaining a deep enough loss buffer to absorb inevitable losing streaks.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 bg-black/[0.04] p-1 rounded-full border border-black/[0.08] flex-wrap">
            <span className="text-[10px] font-mono-data text-[#6e6e73] px-2.5 font-medium">Presets:</span>
            <button
              onClick={() => setSimRiskPercent(0.25)}
              className={`px-3 py-1 rounded-full text-xs font-mono-data transition-all cursor-pointer ${
                simRiskPercent === 0.25
                  ? 'bg-white text-[#34c759] font-bold shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              0.25% (Safe)
            </button>
            <button
              onClick={() => setSimRiskPercent(0.5)}
              className={`px-3 py-1 rounded-full text-xs font-mono-data transition-all cursor-pointer ${
                simRiskPercent === 0.5
                  ? 'bg-[#0071e3] text-white font-bold shadow-sm'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              0.5% (Standard)
            </button>
            <button
              onClick={() => setSimRiskPercent(1.0)}
              className={`px-3 py-1 rounded-full text-xs font-mono-data transition-all cursor-pointer ${
                simRiskPercent === 1.0
                  ? 'bg-white text-[#ff9500] font-bold shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              1.0% (Aggressive)
            </button>
            <button
              onClick={() => setSimRiskPercent(2.0)}
              className={`px-3 py-1 rounded-full text-xs font-mono-data transition-all cursor-pointer ${
                simRiskPercent === 2.0
                  ? 'bg-white text-[#ff3b30] font-bold shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              2.0% (Danger)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sliders & Survival Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-5 apple-card p-5 space-y-5">
          <div className="text-[10px] font-mono-data text-[#1d1d1f] font-bold uppercase tracking-wider pb-3 border-b border-black/[0.08]">
            ACCOUNT &amp; RISK PARAMETER CONTROLS
          </div>

          {/* Account Balance */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono-data mb-1.5">
              <span className="text-[#6e6e73]">Starting Account Balance</span>
              <span className="font-bold text-[#1d1d1f]">${simBalance.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={simBalance}
              onChange={(e) => setSimBalance(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#0071e3]"
            />
          </div>

          {/* Risk Per Trade % */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono-data mb-1.5">
              <span className="text-[#6e6e73]">Risk Per Trade</span>
              <span className="font-extrabold text-[#1d1d1f]">
                {simRiskPercent}% (${dollarRiskPerTrade.toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.05"
              value={simRiskPercent}
              onChange={(e) => setSimRiskPercent(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#0071e3]"
            />
          </div>

          {/* Daily Loss Limit % */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono-data mb-1.5">
              <span className="text-[#6e6e73]">Daily Loss Limit %</span>
              <span className="font-bold text-[#1d1d1f]">{simDailyLimitPercent}% (${dollarDailyLossLimit.toLocaleString()})</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="0.5"
              value={simDailyLimitPercent}
              onChange={(e) => setSimDailyLimitPercent(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#0071e3]"
            />
          </div>

          {/* Max Overall Drawdown % */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono-data mb-1.5">
              <span className="text-[#6e6e73]">Max Total Drawdown %</span>
              <span className="font-bold text-[#1d1d1f]">{simMaxDrawdownPercent}% (${dollarMaxDrawdownLimit.toLocaleString()})</span>
            </div>
            <input
              type="range"
              min="4"
              max="15"
              step="1"
              value={simMaxDrawdownPercent}
              onChange={(e) => setSimMaxDrawdownPercent(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#0071e3]"
            />
          </div>

          {/* Beginner Guidance Box */}
          {beginnerMode && (
            <div className="bg-black/[0.02] border border-black/[0.08] rounded-xl p-3.5 text-xs text-[#6e6e73] space-y-2">
              <div className="flex items-center gap-2 text-[#1d1d1f] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#0071e3]" />
                <span>The Golden 0.5% Rule:</span>
              </div>
              <p className="leading-relaxed text-[11px] text-[#6e6e73]">
                Notice that at <strong className="text-[#ff3b30]">2% risk</strong>, you can only survive <strong className="text-[#ff3b30]">2 losses</strong> before hitting your daily limit. At <strong className="text-[#34c759]">0.5% risk</strong>, you have a massive cushion of <strong className="text-[#34c759]">10 losses</strong>. Never let 1 bad morning blow your evaluation.
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Survival Metrics HUD */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Survival Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Daily Survival Buffer */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              lossesToDailyBreach >= 8
                ? 'apple-card border-[#30d158]/30 shadow-sm'
                : lossesToDailyBreach >= 4
                ? 'apple-card border-[#ff9f0a]/30 shadow-sm'
                : 'apple-card border-[#ff453a]/50 shadow-sm'
            }`}>
              <div>
                <div className="text-[10px] font-mono-data text-[#6e6e73] uppercase tracking-wider font-semibold">
                  CONSECUTIVE LOSSES TO DAILY BREACH
                </div>
                <div className={`text-3xl font-semibold font-h2 tracking-tight mt-1 ${
                  lossesToDailyBreach >= 8 ? 'text-[#34c759]' : lossesToDailyBreach >= 4 ? 'text-[#ff9500]' : 'text-[#ff3b30]'
                }`}>
                  {lossesToDailyBreach}{' '}
                  <span className="text-sm font-normal text-[#86868b]">Trades</span>
                </div>
              </div>
              <div className="text-xs font-mono-data mt-3 pt-3 border-t border-black/[0.08] text-[#6e6e73]">
                {lossesToDailyBreach >= 8 ? (
                  <span className="text-[#34c759] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" /> High Survival Probability
                  </span>
                ) : (
                  <span className="text-[#ff3b30] flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ff3b30]" /> High Risk of Same-Day Blowup
                  </span>
                )}
              </div>
            </div>

            {/* Total Account Drawdown Survival */}
            <div className="apple-card p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono-data text-[#6e6e73] uppercase tracking-wider font-semibold">
                  CONSECUTIVE LOSSES TO ACCOUNT TERMINATION
                </div>
                <div className="text-3xl font-semibold font-h2 tracking-tight text-[#0071e3] mt-1">
                  {lossesToOverallBreach}{' '}
                  <span className="text-sm font-normal text-[#86868b]">Trades</span>
                </div>
              </div>
              <div className="text-xs font-mono-data mt-3 pt-3 border-t border-black/[0.08] text-[#6e6e73]">
                Absorbs up to <strong className="text-[#34c759] font-bold">${dollarMaxDrawdownLimit.toLocaleString()}</strong> in total peak-to-trough drawdown.
              </div>
            </div>

          </div>

          {/* 10-Trade Consecutive Loss Sequence Visual Table */}
          <div className="apple-card p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/[0.08]">
              <div className="text-[10px] font-mono-data text-[#0071e3] font-bold uppercase tracking-wider">
                10-TRADE LOSING STREAK SIMULATION (WORST-CASE SCENARIO)
              </div>
              <span className="text-[9px] font-mono-data text-[#86868b] font-semibold">
                Risk: ${dollarRiskPerTrade.toLocaleString()} / Trade
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-data text-xs">
                <thead>
                  <tr className="text-[10px] text-[#86868b] border-b border-black/[0.08]">
                    <th className="pb-2">Loss #</th>
                    <th className="pb-2">Cum. Loss</th>
                    <th className="pb-2">Balance</th>
                    <th className="pb-2">Daily Buffer Left</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {lossSequence.slice(0, 7).map((row) => (
                    <tr key={row.tradeNum} className={row.isDailyBreach ? 'bg-[#ff3b30]/06' : ''}>
                      <td className="py-2.5 font-bold text-[#1d1d1f]">Trade {row.tradeNum}</td>
                      <td className="py-2.5 text-[#ff3b30] font-semibold">-${row.totalLost.toLocaleString()}</td>
                      <td className="py-2.5 text-[#1d1d1f] font-bold">${row.balanceAfter.toLocaleString()}</td>
                      <td className={`py-2.5 font-semibold ${row.isDailyBreach ? 'text-[#ff3b30]' : 'text-[#6e6e73]'}`}>
                        ${row.remainingDailyBuffer.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right">
                        {row.isDailyBreach ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30 text-[9px] font-bold uppercase">
                            ACCOUNT BREACH
                          </span>
                        ) : row.isGuardrailBreach ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ff9500]/15 text-[#ff9500] border border-[#ff9500]/30 text-[9px] font-bold uppercase">
                            GUARDRAIL WARNING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/30 text-[9px] font-bold uppercase">
                            SAFE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* INTERACTIVE PROP FIRM TRAPS & RULES COACH                 */}
      {/* ========================================================= */}
      <div className="apple-card p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-data text-[10px] text-[#0071e3] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#0071e3]" />
              PROP FIRM RULE COACH &amp; TRAP EXPLAINER
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1d1d1f] font-h2">
            The 4 Hidden Traps That Disqualify 90% of Beginners
          </h2>
          <p className="text-xs text-[#6e6e73] mt-1">
            Prop firms design specific mathematical rules to eliminate undisciplined traders. Understand how they operate to protect your capital.
          </p>
        </div>

        {/* Interactive Trailing Drawdown Slider Explainer */}
        <div className="bg-black/[0.02] border border-black/[0.08] rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-black/[0.08]">
            <div>
              <div className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                <span>TRAP 1: The Trailing High-Water Mark (Apex, Topstep, TradeDay)</span>
                <span className="text-[9px] font-mono-data px-2 py-0.5 rounded-full bg-black/[0.06] text-[#1d1d1f] font-bold uppercase">
                  #1 Account Killer
                </span>
              </div>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                Drag the slider to see how making profit permanently pulls your drawdown floor upward:
              </p>
            </div>
            <div className="text-right font-mono-data">
              <span className="text-[10px] text-[#86868b] block uppercase">Simulated Profit Made:</span>
              <span className="text-sm font-bold text-[#34c759]">+${trailingProfitGain.toLocaleString()}</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="6000"
            step="250"
            value={trailingProfitGain}
            onChange={(e) => setTrailingProfitGain(Number(e.target.value))}
            className="w-full accent-[#0071e3] cursor-pointer mb-4"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-data">
            <div className="bg-white p-3 rounded-xl border border-black/[0.08] shadow-sm">
              <span className="text-[10px] text-[#86868b] uppercase block">Starting Balance</span>
              <span className="text-sm font-bold text-[#1d1d1f]">${simBalance.toLocaleString()}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-black/[0.08] shadow-sm">
              <span className="text-[10px] text-[#86868b] uppercase block">Peak Equity Reached</span>
              <span className="text-sm font-bold text-[#1d1d1f]">${currentEquityWithProfit.toLocaleString()}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-black/[0.08] shadow-sm">
              <span className="text-[10px] text-[#ff9500] uppercase block font-bold">New Trailing Floor (Breach Level)</span>
              <span className="text-sm font-bold text-[#ff3b30]">${trailingDrawdownFloor.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-xs text-[#6e6e73]">
            <strong className="text-[#1d1d1f]">Why Beginners Fail This:</strong> Even if you are up +$2,000, if you give back ${allowedDropFromPeak.toLocaleString()} from your peak, your account is terminated—even though you are still above your starting balance! Stratum tracks this floor live so you never give back your cushion.
          </div>
        </div>

        {/* 3 Other Traps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-black/[0.02] border border-black/[0.06] p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="text-[#1d1d1f] font-bold text-sm mb-1">TRAP 2: 15-Minute News Spike</div>
              <p className="text-[#6e6e73] leading-relaxed">
                Entering trades within 15 minutes of CPI or NFP causes extreme slippage. Many firms (FundedNext, The5ers) cancel all profits made during this window.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono-data text-[#86868b]">
              Stratum Solution: Automatic news blackout shield timer.
            </div>
          </div>

          <div className="bg-black/[0.02] border border-black/[0.06] p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="text-[#1d1d1f] font-bold text-sm mb-1">TRAP 3: The Consistency Rule</div>
              <p className="text-[#6e6e73] leading-relaxed">
                Firms like FundingPips and Topstep require that no single trading day accounts for more than 30% to 50% of your total profit target.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono-data text-[#86868b]">
              Stratum Solution: Enforces standardized lot sizing per session.
            </div>
          </div>

          <div className="bg-black/[0.02] border border-black/[0.06] p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="text-[#1d1d1f] font-bold text-sm mb-1">TRAP 4: Weekend Rollover Gaps</div>
              <p className="text-[#6e6e73] leading-relaxed">
                Holding open positions over the weekend exposes you to Sunday market opening price gaps that bypass your stop loss and cause hard disqualification.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono-data text-[#86868b]">
              Stratum Solution: Friday session exit reminder.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
