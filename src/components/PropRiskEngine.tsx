'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { PROP_FIRM_PRESETS } from '@/lib/riskEngine';
import { PropFirmKey } from '@/lib/types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  Calculator, 
  Lock, 
  Unlock, 
  Sliders, 
  CheckCircle2, 
  RefreshCw, 
  DollarSign, 
  Layers, 
  HelpCircle,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export default function PropRiskEngine() {
  const {
    currentPreset,
    selectedPresetKey,
    setPropFirmPreset,
    updateCustomAccount,
    accountBalance,
    todayRealizedPnL,
    updatePnL,
    selectedAsset,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    targetRiskPercent,
    setTradeLevels,
    setTargetRiskPercent,
    riskResult
  } = useStratumStore();

  const [customBalance, setCustomBalance] = useState<number>(accountBalance);
  const [customDailyPercent, setCustomDailyPercent] = useState<number>(currentPreset.dailyLossLimitPercent);
  const [customMaxPercent, setCustomMaxPercent] = useState<number>(currentPreset.maxDrawdownPercent);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(selectedPresetKey === 'CUSTOM');
  const [simulatedPnLInput, setSimulatedPnLInput] = useState<number>(todayRealizedPnL);

  // Buffer bar percentage calculations
  const bufferTotal = riskResult.dailyMaxLossLimitDollar;
  const currentLossPercent = bufferTotal > 0 ? (riskResult.dailyLossSoFarDollar / bufferTotal) * 100 : 0;
  const newLossPercent = bufferTotal > 0 ? (riskResult.dollarRisk / bufferTotal) * 100 : 0;
  const remainingPercent = Math.max(0, 100 - currentLossPercent - newLossPercent);

  return (
    <div className="space-y-6">
      {/* Hard Safety Block Banner or 25% Buffer Guardrail Warning */}
      {riskResult.isHardBlocked && (
        <div className="bg-[#EF4444]/20 border-2 border-[#EF4444] rounded-xl p-5 shadow-[0_0_35px_rgba(239,68,68,0.35)] animate-pulse flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-[#EF4444] text-black shrink-0">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-sm font-black uppercase text-[#EF4444] tracking-wider">
                EXECUTION PROHIBITED: HARD DRAWDOWN RULE BREACH
              </span>
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#EF4444] text-black font-extrabold">
                HARD BLOCK
              </span>
            </div>
            <p className="text-sm text-white mt-1.5 leading-relaxed font-semibold">
              {riskResult.warningMessage}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono-data text-[#EF4444]">
              <Lock className="w-4 h-4" />
              <span>Stratum Engine has locked trade generation to protect your prop firm evaluation.</span>
            </div>
          </div>
        </div>
      )}

      {!riskResult.isHardBlocked && riskResult.isBreachDanger && (
        <div className="bg-[#EF4444]/15 border-2 border-[#EF4444] rounded-xl p-5 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444] shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs font-black uppercase text-[#EF4444] tracking-wider">
                STRATUM 25% BUFFER SAFETY GUARDRAIL TRIGGERED
              </span>
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#EF4444] text-black font-bold">
                HIGH BREACH RISK
              </span>
            </div>
            <p className="text-xs text-white mt-1 leading-relaxed">
              {riskResult.warningMessage}
            </p>
            <div className="mt-2 text-[11px] font-mono-data text-[#9A9DA3]">
              Recommended Action: Reduce target risk to <strong className="text-[#10B981]">0.25%</strong> or tighten stop loss to stay below 25% daily buffer threshold.
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration & Trade Level Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Prop Firm Account Selector Card */}
          <div className="bg-[#101112] border border-[#232426] rounded-xl p-5 inner-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono-data text-[10px] text-[#50D8E9] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PROP FIRM RULE PRESETS
                </span>
              </div>
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-xs font-mono-data text-[#50D8E9] hover:underline flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                {isCustomMode ? 'Use Presets' : 'Custom Config'}
              </button>
            </div>

            {/* Presets Grid */}
            {!isCustomMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(PROP_FIRM_PRESETS) as PropFirmKey[])
                  .filter((k) => k !== 'CUSTOM')
                  .map((key) => {
                    const preset = PROP_FIRM_PRESETS[key];
                    const isSelected = selectedPresetKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setPropFirmPreset(key)}
                        className={`text-left p-2.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#50D8E9]/15 border-[#50D8E9] text-white shadow-sm ring-1 ring-[#50D8E9]/30'
                            : 'bg-[#070708] border-[#232426] text-[#9A9DA3] hover:border-[#3a3b40] hover:text-white'
                        }`}
                      >
                        <div className="text-[10px] font-mono-data text-[#50D8E9] font-bold">
                          {preset.firm}
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5 line-clamp-1">
                          ${(preset.startingBalance / 1000).toFixed(0)}k Tier
                        </div>
                        <div className="text-[10px] text-[#9A9DA3] font-mono-data mt-1">
                          {preset.dailyLossLimitPercent}% Daily / {preset.maxDrawdownPercent}% Max
                        </div>
                      </button>
                    );
                  })}
              </div>
            ) : (
              /* Custom Account Config */
              <div className="bg-[#070708] border border-[#232426] rounded-lg p-4 space-y-3">
                <div className="text-xs font-bold text-white mb-2">Custom Prop Account Rules</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono-data text-[#9A9DA3] block mb-1">
                      Account Balance ($)
                    </label>
                    <input
                      type="number"
                      value={customBalance}
                      onChange={(e) => setCustomBalance(Number(e.target.value))}
                      className="w-full bg-[#101112] border border-[#232426] rounded px-2.5 py-1.5 text-xs font-mono-data text-white focus:outline-none focus:border-[#50D8E9]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono-data text-[#9A9DA3] block mb-1">
                      Daily Max Loss (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={customDailyPercent}
                      onChange={(e) => setCustomDailyPercent(Number(e.target.value))}
                      className="w-full bg-[#101112] border border-[#232426] rounded px-2.5 py-1.5 text-xs font-mono-data text-white focus:outline-none focus:border-[#50D8E9]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono-data text-[#9A9DA3] block mb-1">
                      Total Max Loss (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={customMaxPercent}
                      onChange={(e) => setCustomMaxPercent(Number(e.target.value))}
                      className="w-full bg-[#101112] border border-[#232426] rounded px-2.5 py-1.5 text-xs font-mono-data text-white focus:outline-none focus:border-[#50D8E9]"
                    />
                  </div>
                </div>
                <button
                  onClick={() => updateCustomAccount(customBalance, customDailyPercent, customMaxPercent)}
                  className="w-full bg-[#50D8E9] text-black font-bold font-mono-data text-xs py-2 rounded mt-2 hover:brightness-110 transition-all"
                >
                  Apply Custom Rules
                </button>
              </div>
            )}

            {/* Description note */}
            <div className="mt-3 pt-3 border-t border-[#232426] flex items-center justify-between text-[11px] font-mono-data text-[#9A9DA3]">
              <span>Active Firm: <strong className="text-white">{currentPreset.tierName}</strong></span>
              <span>Daily Limit: <strong className="text-[#10B981]">${riskResult.dailyMaxLossLimitDollar.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Trade Parameters & Risk Input Card */}
          <div className="bg-[#101112] border border-[#232426] rounded-xl p-5 inner-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono-data text-[10px] text-[#5E6BFF] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  DYNAMIC POSITION SIZING CALCULATOR
                </span>
              </div>
              <span className="font-mono-data text-xs font-bold text-white px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
                Asset: {selectedAsset.symbol}
              </span>
            </div>

            {/* Price Levels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-mono-data text-[#9A9DA3] block mb-1">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setTradeLevels(Number(e.target.value), stopLossPrice, takeProfitPrice)}
                  className="w-full bg-[#070708] border border-[#232426] rounded-lg px-3 py-2 text-xs font-mono-data text-white focus:outline-none focus:border-[#50D8E9]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono-data text-[#EF4444] block mb-1 font-semibold">
                  Stop Loss (Invalidation)
                </label>
                <input
                  type="number"
                  step="any"
                  value={stopLossPrice}
                  onChange={(e) => setTradeLevels(entryPrice, Number(e.target.value), takeProfitPrice)}
                  className="w-full bg-[#070708] border border-[#EF4444]/40 rounded-lg px-3 py-2 text-xs font-mono-data text-white focus:outline-none focus:border-[#EF4444]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono-data text-[#10B981] block mb-1 font-semibold">
                  Take Profit (Target)
                </label>
                <input
                  type="number"
                  step="any"
                  value={takeProfitPrice}
                  onChange={(e) => setTradeLevels(entryPrice, stopLossPrice, Number(e.target.value))}
                  className="w-full bg-[#070708] border border-[#10B981]/40 rounded-lg px-3 py-2 text-xs font-mono-data text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            {/* Target Risk Percentage Selector */}
            <div className="bg-[#070708] border border-[#232426] rounded-lg p-3.5 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-data font-bold text-white">
                  Target Risk Per Trade (% of Balance)
                </span>
                <span className="text-xs font-mono-data font-extrabold text-[#50D8E9]">
                  {targetRiskPercent}% = ${(accountBalance * (targetRiskPercent / 100)).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTargetRiskPercent(pct)}
                    className={`py-1.5 rounded text-xs font-mono-data font-bold transition-all ${
                      targetRiskPercent === pct
                        ? 'bg-[#50D8E9] text-black shadow-sm'
                        : 'bg-[#101112] text-[#9A9DA3] hover:text-white border border-[#232426]'
                    }`}
                  >
                    {pct}% Risk
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Intraday PnL Slider to test Drawdown Stress */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-mono-data text-[#9A9DA3] mb-1.5">
                <span>Simulate Today's Realized PnL:</span>
                <span className={`font-bold ${todayRealizedPnL < 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                  ${todayRealizedPnL.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updatePnL(0)}
                  className="px-2 py-1 bg-[#070708] text-[10px] font-mono-data text-[#9A9DA3] hover:text-white rounded border border-[#232426]"
                >
                  Reset $0
                </button>
                <button
                  onClick={() => updatePnL(-1000)}
                  className="px-2 py-1 bg-[#EF4444]/10 text-[10px] font-mono-data text-[#EF4444] rounded border border-[#EF4444]/30"
                >
                  Down -$1,000
                </button>
                <button
                  onClick={() => updatePnL(-3000)}
                  className="px-2 py-1 bg-[#EF4444]/15 text-[10px] font-mono-data text-[#EF4444] rounded border border-[#EF4444]/40 font-bold"
                >
                  Down -$3,000 (Stress Test)
                </button>
                <button
                  onClick={() => updatePnL(1500)}
                  className="px-2 py-1 bg-[#10B981]/10 text-[10px] font-mono-data text-[#10B981] rounded border border-[#10B981]/30"
                >
                  Up +$1,500
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Position Size & Drawdown Buffer Meter */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Exact Position Sizing Output Card */}
          <div className="bg-[#101112] border border-[#232426] rounded-xl p-5 inner-glow">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#232426]">
              <div className="text-[10px] font-mono-data text-[#10B981] uppercase font-bold tracking-wider">
                CALCULATED POSITION SIZING
              </div>
              <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-white/[0.04] text-[#9A9DA3]">
                DISCRETIZED LOTS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#070708] border border-[#232426] rounded-xl p-3.5">
                <div className="text-[10px] text-[#9A9DA3] font-mono-data uppercase">Exact Lot Size</div>
                <div className="text-2xl font-h3 font-extrabold text-[#50D8E9] mt-1">
                  {riskResult.lotSize}{' '}
                  <span className="text-xs font-normal text-[#9A9DA3]">
                    {selectedAsset.type === 'FOREX' ? 'Lots' : 'Contracts'}
                  </span>
                </div>
                <div className="text-[10px] font-mono-data text-[#9A9DA3] mt-1">
                  Distance: {riskResult.slDistancePoints} pts
                </div>
              </div>

              <div className="bg-[#070708] border border-[#232426] rounded-xl p-3.5">
                <div className="text-[10px] text-[#9A9DA3] font-mono-data uppercase">Dollar Risk at Stop</div>
                <div className="text-2xl font-h3 font-extrabold text-[#EF4444] mt-1">
                  ${riskResult.dollarRisk.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono-data text-[#9A9DA3] mt-1">
                  {riskResult.riskPercentOfBalance}% of Balance
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono-data">
              <div className="bg-[#070708] border border-[#232426] rounded-lg p-2.5">
                <div className="text-[9px] text-[#9A9DA3] uppercase">Target Reward ($)</div>
                <div className="text-sm font-bold text-[#10B981] mt-0.5">
                  +${riskResult.rewardDollar.toLocaleString()}
                </div>
              </div>
              <div className="bg-[#070708] border border-[#232426] rounded-lg p-2.5">
                <div className="text-[9px] text-[#9A9DA3] uppercase">Risk : Reward</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  1 : {riskResult.riskRewardRatio}
                </div>
              </div>
            </div>

            {/* Drawdown Buffer Visual Meter */}
            <div className="bg-[#070708] border border-[#232426] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-mono-data mb-2">
                <span className="text-white font-bold">Daily Drawdown Buffer</span>
                <span className="text-[#9A9DA3]">
                  ${riskResult.remainingDailyBufferDollar.toLocaleString()} left
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-3 bg-[#1B1C1E] rounded-full overflow-hidden flex relative mb-2">
                {/* Consumed by previous losses today */}
                <div
                  className="h-full bg-[#EF4444]/60"
                  style={{ width: `${currentLossPercent}%` }}
                  title={`Today's previous loss: $${riskResult.dailyLossSoFarDollar}`}
                />
                {/* Consumed by this potential trade */}
                <div
                  className={`h-full ${
                    riskResult.isBreachDanger ? 'bg-[#EF4444] animate-pulse' : 'bg-[#50D8E9]'
                  }`}
                  style={{ width: `${newLossPercent}%` }}
                  title={`This trade risk: $${riskResult.dollarRisk}`}
                />
              </div>

              {/* Legend & 25% Guardrail Indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono-data text-[#9A9DA3]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#50D8E9]" />
                  <span>This Trade ({riskResult.percentageOfDailyBufferConsumedByLoss}% of Buffer)</span>
                </div>
                <div className="text-[10px] font-bold text-white">
                  After Trade: ${riskResult.bufferAfterLossDollar.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Execution Protection Button */}
            <div className="mt-4">
              <button
                disabled={riskResult.isHardBlocked}
                className={`w-full py-3 rounded-lg font-mono-data text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  riskResult.isHardBlocked
                    ? 'bg-[#232426] text-[#9A9DA3] cursor-not-allowed border border-[#EF4444]/40'
                    : riskResult.isBreachDanger
                    ? 'bg-[#EF4444] hover:bg-[#ff5555] text-white shadow-lg shadow-[#EF4444]/25'
                    : 'bg-[#10B981] hover:bg-[#12cc8f] text-black shadow-lg shadow-[#10B981]/25'
                }`}
              >
                {riskResult.isHardBlocked ? (
                  <>
                    <Lock className="w-4 h-4 text-[#EF4444]" />
                    <span>EXECUTION BLOCKED BY RISK GATEKEEPER</span>
                  </>
                ) : riskResult.isBreachDanger ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>CAUTION: EXECUTE WITH REDUCED BUFFER</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>CONFIRM & STAMP RISK PARAMETERS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
