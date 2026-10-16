'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { PROP_FIRM_PRESETS } from '@/lib/riskEngine';
import { PropFirmKey, STRATUM_THEMES } from '@/lib/types';
import FastOrderCopier from '@/components/FastOrderCopier';
import AIInsightBadge from '@/components/AIInsightBadge';
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
  ArrowRight,
  Copy,
  Check,
  FileText,
  ExternalLink,
  X,
  Zap
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
    riskResult,
    userPurchasedAccounts,
    activeAccountId,
    selectPurchasedAccount,
    setAccountModalOpen,
    setActiveTab,
    stampRiskParameters,
    lastStampedTicket,
    clearStampedTicket,
    currentTheme
  } = useStratumStore();

  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];
  const activeAccount = userPurchasedAccounts.find((a) => a.id === activeAccountId) || userPurchasedAccounts[0];

  const [customBalance, setCustomBalance] = useState<number>(accountBalance);
  const [customDailyPercent, setCustomDailyPercent] = useState<number>(currentPreset.dailyLossLimitPercent);
  const [customMaxPercent, setCustomMaxPercent] = useState<number>(currentPreset.maxDrawdownPercent);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(selectedPresetKey === 'CUSTOM');
  const [simulatedPnLInput, setSimulatedPnLInput] = useState<number>(todayRealizedPnL);
  const [showStampModal, setShowStampModal] = useState<boolean>(false);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);
  const [stampSuccessFeedback, setStampSuccessFeedback] = useState<boolean>(false);

  const handleStamp = () => {
    if (riskResult.isHardBlocked) return;
    const ticket = stampRiskParameters();
    if (ticket) {
      setShowStampModal(true);
      setStampSuccessFeedback(true);
      setTimeout(() => setStampSuccessFeedback(false), 3000);
    }
  };

  const handleCopyParameters = async () => {
    if (!lastStampedTicket) return;
    const size = lastStampedTicket.instrumentType === 'FUTURES'
      ? (lastStampedTicket.contracts ?? lastStampedTicket.lotSize)
      : lastStampedTicket.lotSize;
    const unit = lastStampedTicket.instrumentType === 'FUTURES' ? 'Contracts' : 'Lots';
    const commandText = `${lastStampedTicket.assetSymbol} ${lastStampedTicket.direction} ${size} ${unit} | Entry: ${lastStampedTicket.entryPrice} | SL: ${lastStampedTicket.stopLossPrice} (Risk: $${lastStampedTicket.dollarRisk}) | TP: ${lastStampedTicket.takeProfitPrice} (Target: +$${lastStampedTicket.rewardDollar}) [${lastStampedTicket.ticketId}]`;
    
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(commandText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = commandText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = commandText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2500);
    }
  };

  // Buffer bar percentage calculations
  const bufferTotal = riskResult.dailyMaxLossLimitDollar;
  const currentLossPercent = bufferTotal > 0 ? (riskResult.dailyLossSoFarDollar / bufferTotal) * 100 : 0;
  const newLossPercent = bufferTotal > 0 ? (riskResult.dollarRisk / bufferTotal) * 100 : 0;
  const remainingPercent = Math.max(0, 100 - currentLossPercent - newLossPercent);

  return (
    <div className="space-y-6">
      {/* Hard Safety Block Banner or 25% Buffer Guardrail Warning with Authentic Warning Colors */}
      {riskResult.isHardBlocked && (
        <div className="bg-[#ff3b30]/08 border border-[#ff3b30]/30 rounded-2xl p-5 shadow-sm flex items-start gap-4 animate-pulse">
          <div className="p-2.5 rounded-xl bg-[#ff3b30] text-white shrink-0 shadow-md">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-sm font-bold uppercase text-[#ff3b30] tracking-wider">
                EXECUTION PROHIBITED: HARD DRAWDOWN RULE BREACH
              </span>
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-full bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30 font-bold">
                HARD BLOCK
              </span>
            </div>
            <p className="text-sm text-[#ff3b30] mt-1.5 leading-relaxed font-medium">
              {riskResult.warningMessage}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono-data text-[#ff3b30]">
              <Lock className="w-4 h-4 text-[#ff3b30]" />
              <span>Stratum Engine has locked trade generation to protect your prop firm evaluation.</span>
            </div>
          </div>
        </div>
      )}

      {!riskResult.isHardBlocked && riskResult.isBreachDanger && (
        <div className="bg-[#ff9500]/08 border border-[#ff9500]/30 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="p-2.5 rounded-xl bg-[#ff9500] text-white shrink-0 shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs font-bold uppercase text-[#b25e00] tracking-wider">
                STRATUM 25% BUFFER SAFETY GUARDRAIL TRIGGERED
              </span>
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-full bg-[#ff9500]/15 text-[#b25e00] border border-[#ff9500]/30 font-bold">
                HIGH BREACH RISK
              </span>
            </div>
            <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">
              {riskResult.warningMessage}
            </p>
            <div className="mt-2 text-[11px] font-mono-data text-[#1d1d1f]">
              Recommended Action: Reduce target risk to <strong className="text-[#34c759]">0.25%</strong> or tighten stop loss to stay below 25% daily buffer threshold.
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration & Trade Level Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Prop Firm Account & Rule Tuner Card */}
          <div className="apple-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-black/[0.08]">
              <div className="flex items-center gap-2">
                <span 
                  className="font-mono-data text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                  style={{ color: activeTheme.primaryColor }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: activeTheme.primaryColor }} />
                  ACTIVE PURCHASED ACCOUNT
                </span>
                <span 
                  className="text-[10px] font-mono-data px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{ 
                    backgroundColor: `${activeTheme.primaryColor}15`,
                    color: activeTheme.primaryColor,
                    borderColor: `${activeTheme.primaryColor}30`,
                    borderWidth: '1px'
                  }}
                >
                  {activeAccount.instrumentType}
                </span>
                <span className="text-[10px] font-mono-data px-2 py-0.5 rounded-full bg-[#34c759]/12 text-[#34c759] border border-[#34c759]/25 font-bold uppercase">
                  {activeAccount.drawdownType.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => setAccountModalOpen(true)}
                className="text-xs font-mono-data flex items-center gap-1.5 bg-black/[0.04] px-3 py-1.5 rounded-full border border-black/[0.08] hover:bg-black/[0.08] transition-colors"
                style={{ color: activeTheme.primaryColor }}
              >
                <Sliders className="w-3.5 h-3.5" style={{ color: activeTheme.primaryColor }} />
                <span>Switch or Tune Account Setup</span>
              </button>
            </div>

            {/* Quick Switcher for Purchased Accounts */}
            <div className="mb-4">
              <div className="text-[10px] font-mono-data text-[#6e6e73] uppercase tracking-wider mb-2 font-bold">
                Quick Switch Purchased Accounts:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {userPurchasedAccounts.map((acc) => {
                  const isSelected = acc.id === activeAccountId;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => selectPurchasedAccount(acc.id)}
                      className={`text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-white shadow-sm border-[#0071e3]'
                          : 'bg-black/[0.02] border-black/[0.08] text-[#6e6e73] hover:border-black/[0.18] hover:text-[#1d1d1f]'
                      }`}
                      style={isSelected ? { 
                        borderColor: `${activeTheme.primaryColor}`,
                        boxShadow: `0 0 10px ${activeTheme.primaryColor}20`
                      } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className={`text-[9px] font-mono-data font-bold ${!isSelected ? 'text-[#1d1d1f] dark:text-[#f5f5f7]' : ''}`}
                          style={isSelected ? { color: activeTheme.primaryColor } : {}}
                        >
                          {acc.firm}
                        </span>
                        <span 
                          className={`text-[8px] font-mono-data px-1 rounded font-semibold ${!isSelected ? 'bg-black/[0.05] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#a1a1a6]' : ''}`}
                          style={isSelected ? {
                            backgroundColor: `${activeTheme.primaryColor}15`,
                            color: activeTheme.primaryColor
                          } : {}}
                        >
                          {acc.instrumentType}
                        </span>
                      </div>
                      <div className={`text-xs font-bold mt-1 line-clamp-1 ${isSelected ? 'text-[#1d1d1f] dark:text-white' : 'text-[#6e6e73] dark:text-[#a1a1a6]'}`}>
                        {acc.accountNickname}
                      </div>
                      <div className={`text-[10px] font-mono-data mt-1 text-[#86868b]`}>
                        ${(acc.startingBalance / 1000).toFixed(0)}k &bull; {acc.dailyLossLimitPercent}% Daily
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Account Rules Specification Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-black/[0.08] text-xs font-mono-data">
              <div className="bg-black/[0.02] p-2.5 rounded-xl border border-black/[0.06]">
                <div className="text-[9px] text-[#86868b] uppercase">Starting Balance</div>
                <div className="font-bold text-[#1d1d1f] mt-0.5">${activeAccount.startingBalance.toLocaleString()}</div>
              </div>
              <div className="bg-black/[0.02] p-2.5 rounded-xl border border-black/[0.06]">
                <div className="text-[9px] text-[#86868b] uppercase">Daily Loss Limit</div>
                <div className="font-bold text-[#ff3b30] mt-0.5">{activeAccount.dailyLossLimitPercent}% (${riskResult.dailyMaxLossLimitDollar.toLocaleString()})</div>
              </div>
              <div className="bg-black/[0.02] p-2.5 rounded-xl border border-black/[0.06]">
                <div className="text-[9px] text-[#86868b] uppercase">Max Trade Risk</div>
                <div className="font-bold text-[#6e6e73] mt-0.5">{activeAccount.maxRiskPerTradePercent}% Cap</div>
              </div>
              <div className="bg-black/[0.02] p-2.5 rounded-xl border border-black/[0.06]">
                <div className="text-[9px] text-[#86868b] uppercase">Drawdown Model</div>
                <div className="font-bold text-[#1d1d1f] mt-0.5 truncate">{activeAccount.drawdownType.replace('_', ' ')}</div>
              </div>
            </div>
          </div>

          {/* Trade Parameters & Risk Input Card */}
          <div className="apple-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span 
                  className="font-mono-data text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                  style={{ color: activeTheme.primaryColor }}
                >
                  <Calculator className="w-3.5 h-3.5" style={{ color: activeTheme.primaryColor }} />
                  DYNAMIC POSITION SIZING CALCULATOR
                </span>
              </div>
              <span 
                className="font-mono-data text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${activeTheme.primaryColor}15`,
                  color: activeTheme.primaryColor,
                  border: `1px solid ${activeTheme.primaryColor}30`
                }}
              >
                Asset: {selectedAsset.symbol}
              </span>
            </div>

            {/* Price Levels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1 font-semibold">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setTradeLevels(val, stopLossPrice, takeProfitPrice);
                    }
                  }}
                  className="w-full bg-white border border-black/[0.12] rounded-xl p-2.5 text-sm font-mono-data text-[#1d1d1f] font-bold focus:outline-none focus:border-[#0071e3] transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono-data text-[#ff3b30] block mb-1 font-semibold">
                  Stop Loss Price (Invalidation)
                </label>
                <input
                  type="number"
                  step="any"
                  value={stopLossPrice}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setTradeLevels(entryPrice, val, takeProfitPrice);
                    }
                  }}
                  className="w-full bg-[#ff3b30]/05 border border-[#ff3b30]/30 rounded-xl p-2.5 text-sm font-mono-data text-[#ff3b30] font-bold focus:border-[#ff3b30] focus:outline-none transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono-data text-[#34c759] block mb-1 font-semibold">
                  Take Profit Price (Target)
                </label>
                <input
                  type="number"
                  step="any"
                  value={takeProfitPrice}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setTradeLevels(entryPrice, stopLossPrice, val);
                    }
                  }}
                  className="w-full bg-[#34c759]/05 border border-[#34c759]/30 rounded-xl p-2.5 text-sm font-mono-data text-[#34c759] font-bold focus:border-[#34c759] focus:outline-none transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Risk Selection Sizing Slider */}
            <div className="space-y-3 pt-2 border-t border-black/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-data text-[#6e6e73]">Target Risk Percentage:</span>
                <span 
                  className="text-sm font-mono-data font-extrabold"
                  style={{ color: activeTheme.primaryColor }}
                >
                  {targetRiskPercent}% (${((accountBalance * targetRiskPercent) / 100).toFixed(0)})
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max={Math.min(3.0, activeAccount.maxRiskPerTradePercent || 3.0)}
                step="0.05"
                value={targetRiskPercent}
                onChange={(e) => setTargetRiskPercent(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#0071e3]"
              />
              <div className="flex justify-between text-[10px] font-mono-data text-[#86868b]">
                <span>0.1% (Scalp)</span>
                <span>0.5% (Prop Standard)</span>
                <span>1.0% (Swing)</span>
                <span className="text-[#ff3b30] font-bold">{activeAccount.maxRiskPerTradePercent}% Cap</span>
              </div>
            </div>

            {/* Simulated Intraday PnL Slider to test Drawdown Stress */}
            <div className="pt-3 border-t border-black/[0.08] mt-4">
              <div className="flex items-center justify-between text-xs font-mono-data text-[#6e6e73] mb-1.5">
                <span>Simulate Today's Realized PnL:</span>
                <span className={`font-bold ${
                  todayRealizedPnL > 0 ? 'text-[#34c759]' : todayRealizedPnL < 0 ? 'text-[#ff3b30]' : 'text-[#1d1d1f]'
                }`}>
                  {todayRealizedPnL >= 0 ? '+' : ''}${todayRealizedPnL.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => updatePnL(0)}
                  className="px-2.5 py-1 bg-black/[0.04] text-[10px] font-mono-data text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.08] rounded-lg border border-black/[0.08] transition-colors"
                >
                  Reset $0
                </button>
                <button
                  onClick={() => updatePnL(-1000)}
                  className="px-2.5 py-1 bg-black/[0.04] text-[10px] font-mono-data text-[#6e6e73] hover:bg-black/[0.08] rounded-lg border border-black/[0.08] transition-colors"
                >
                  Down -$1,000
                </button>
                <button
                  onClick={() => updatePnL(-3000)}
                  className="px-2.5 py-1 bg-[#ff3b30]/08 text-[10px] font-mono-data text-[#ff3b30] font-bold hover:bg-[#ff3b30]/15 rounded-lg border border-[#ff3b30]/25 transition-colors"
                >
                  Down -$3,000 (Stress Test)
                </button>
                <button
                  onClick={() => updatePnL(1500)}
                  className="px-2.5 py-1 bg-[#34c759]/08 text-[10px] font-mono-data text-[#34c759] hover:bg-[#34c759]/15 rounded-lg border border-[#34c759]/25 transition-colors"
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
          <div className="apple-card p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/[0.08]">
              <div 
                className="text-[10px] font-mono-data uppercase font-bold tracking-wider"
                style={{ color: activeTheme.primaryColor }}
              >
                CALCULATED POSITION SIZING
              </div>
              <div className="flex items-center gap-2">
                <AIInsightBadge type="risk" label="Risk Audit" />
                <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-black/[0.04] text-[#6e6e73] border border-black/[0.08]">
                  DISCRETIZED LOTS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-3.5">
                <div className="text-[10px] text-[#6e6e73] font-mono-data uppercase">
                  {activeAccount.instrumentType === 'FUTURES' ? 'Exact Contracts' : 'Exact Lot Size'}
                </div>
                <div 
                  className="text-2xl font-h3 font-semibold tracking-tight mt-1"
                  style={{ color: activeTheme.primaryColor }}
                >
                  {activeAccount.instrumentType === 'FUTURES' ? (riskResult.contracts ?? riskResult.lotSize) : riskResult.lotSize}{' '}
                  <span className="text-xs font-normal text-[#86868b]">
                    {activeAccount.instrumentType === 'FUTURES' ? 'Contracts' : selectedAsset.type === 'FOREX' ? 'Lots' : 'Units'}
                  </span>
                </div>
                <div className="text-[10px] font-mono-data text-[#86868b] mt-1">
                  Distance: {riskResult.slDistancePoints} pts
                </div>
              </div>

              <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-3.5">
                <div className="text-[10px] text-[#ff3b30] font-mono-data uppercase font-semibold">Dollar Risk at Stop</div>
                <div className="text-2xl font-h3 font-semibold tracking-tight text-[#ff3b30] mt-1">
                  -${riskResult.dollarRisk.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono-data text-[#86868b] mt-1">
                  {riskResult.riskPercentOfBalance}% of Balance
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono-data">
              <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-2.5">
                <div className="text-[9px] text-[#34c759] uppercase font-semibold">Target Reward ($)</div>
                <div className="text-sm font-bold text-[#34c759] mt-0.5">
                  +${riskResult.rewardDollar.toLocaleString()}
                </div>
              </div>
              <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-2.5">
                <div className="text-[9px] text-[#6e6e73] uppercase">Risk : Reward</div>
                <div className="text-sm font-bold text-[#1d1d1f] mt-0.5">
                  1 : {riskResult.riskRewardRatio}
                </div>
              </div>
            </div>

            {/* Drawdown Buffer Visual Meter with Semantic Colors */}
            <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-mono-data mb-2">
                <span className="text-[#1d1d1f] font-bold">Daily Drawdown Buffer</span>
                <span className={riskResult.isBreachDanger ? 'text-[#ff3b30] font-bold' : 'text-[#34c759] font-bold'}>
                  ${riskResult.remainingDailyBufferDollar.toLocaleString()} left
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-3 bg-black/[0.06] border border-black/[0.08] rounded-full overflow-hidden flex relative mb-2">
                {/* Consumed by previous losses today */}
                <div
                  className="h-full bg-black/20"
                  style={{ width: `${currentLossPercent}%` }}
                  title={`Today's previous loss: $${riskResult.dailyLossSoFarDollar}`}
                />
                {/* Consumed by this potential trade */}
                <div
                  className={`h-full transition-all ${
                    riskResult.isBreachDanger 
                      ? 'bg-[#ff3b30] animate-pulse' 
                      : 'bg-[#34c759]'
                  }`}
                  style={{ width: `${newLossPercent}%` }}
                  title={`This trade risk: $${riskResult.dollarRisk}`}
                />
              </div>

              {/* Legend & 25% Guardrail Indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono-data text-[#6e6e73]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    riskResult.isBreachDanger ? 'bg-[#ff3b30]' : 'bg-[#34c759]'
                  }`} />
                  <span>This Trade ({riskResult.percentageOfDailyBufferConsumedByLoss}% of Buffer)</span>
                </div>
                <div className="text-[10px] font-bold text-[#1d1d1f]">
                  After Trade: ${riskResult.bufferAfterLossDollar.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Execution Protection Button */}
            <div className="mt-4">
              <button
                onClick={handleStamp}
                disabled={riskResult.isHardBlocked}
                className={`w-full py-3.5 rounded-xl font-mono-data text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  riskResult.isHardBlocked
                    ? 'bg-black/[0.05] text-[#86868b] cursor-not-allowed border border-black/[0.08]'
                    : lastStampedTicket
                    ? 'bg-[#34c759] hover:bg-[#30d158] text-white'
                    : riskResult.isBreachDanger
                    ? 'bg-[#ff9500] hover:bg-[#ff9500]/90 text-white'
                    : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                }`}
              >
                {riskResult.isHardBlocked ? (
                  <>
                    <Lock className="w-4 h-4 text-[#86868b]" />
                    <span>EXECUTION BLOCKED BY RISK GATEKEEPER</span>
                  </>
                ) : lastStampedTicket ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>STAMPED #{lastStampedTicket.ticketId} &bull; VIEW CERTIFICATE</span>
                  </>
                ) : riskResult.isBreachDanger ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <span>CAUTION: CONFIRM &amp; STAMP REDUCED BUFFER</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>CONFIRM &amp; STAMP RISK PARAMETERS</span>
                  </>
                )}
              </button>

              {/* Quick helper note */}
              {lastStampedTicket && (
                <div className="mt-2 text-center text-[10px] font-mono-data text-[#34c759] flex items-center justify-center font-bold">
                  Trade parameters locked &amp; certified under {lastStampedTicket.firm} rules
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 1-Click Platform Order Exporter & Copier */}
      <FastOrderCopier />

      {/* ========================================================= */}
      {/* STAMPED RISK EXECUTION COMPLIANCE CERTIFICATE MODAL       */}
      {/* ========================================================= */}
      {showStampModal && lastStampedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-black/[0.08] rounded-2xl shadow-2xl text-[#1d1d1f] overflow-hidden">
            
            {/* Top Apple Blue Accent Header Strip */}
            <div className="bg-[#0071e3] h-[3px] w-full" />

            <div className="p-6">
              {/* Header with stamp badge */}
              <div className="flex items-start justify-between pb-4 border-b border-black/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#34c759] text-white flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-[10px] px-2 py-0.5 rounded-full bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/35 font-extrabold uppercase">
                        CERTIFIED STAMP
                      </span>
                      <span className="font-mono-data text-xs text-[#6e6e73] font-bold">
                        #{lastStampedTicket.ticketId}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#1d1d1f] mt-1">
                      Risk Gatekeeper Compliance Stamp
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setShowStampModal(false)}
                  className="p-1 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.05] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Watermark Details Grid */}
              <div className="py-4 space-y-3 font-mono-data text-xs">
                
                {/* Account details */}
                <div className="bg-black/[0.02] p-3 rounded-xl border border-black/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#86868b] uppercase font-semibold">Target Account</div>
                    <div className="font-bold text-[#1d1d1f] text-sm mt-0.5">{lastStampedTicket.accountNickname}</div>
                  </div>
                  <div className="text-right">
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        backgroundColor: `${activeTheme.primaryColor}15`,
                        color: activeTheme.primaryColor,
                        border: `1px solid ${activeTheme.primaryColor}30`
                      }}
                    >
                      {lastStampedTicket.instrumentType} &bull; {lastStampedTicket.drawdownType.replace('_', ' ')}
                    </span>
                    <div className="text-[10px] text-[#86868b] mt-1">{lastStampedTicket.timestamp}</div>
                  </div>
                </div>

                {/* Sized Trade Specs */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-black/[0.02] p-3 rounded-xl border border-black/[0.06]">
                    <div className="text-[10px] text-[#86868b] uppercase font-semibold">Asset &amp; Direction</div>
                    <div className="font-bold text-[#1d1d1f] text-sm mt-0.5 flex items-center gap-1.5">
                      <span>{lastStampedTicket.assetSymbol}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        lastStampedTicket.direction === 'LONG'
                          ? 'bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/35'
                          : 'bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30'
                      }`}>
                        {lastStampedTicket.direction}
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/[0.02] p-3 rounded-xl border border-black/[0.06]">
                    <div className="text-[10px] text-[#86868b] uppercase font-semibold">Calculated Position</div>
                    <div 
                      className="font-extrabold text-sm mt-0.5"
                      style={{ color: activeTheme.primaryColor }}
                    >
                      {lastStampedTicket.instrumentType === 'FUTURES' ? (lastStampedTicket.contracts ?? lastStampedTicket.lotSize) : lastStampedTicket.lotSize}{' '}
                      <span className="text-xs text-[#86868b]">{lastStampedTicket.instrumentType === 'FUTURES' ? 'Contracts' : 'Lots'}</span>
                    </div>
                  </div>
                </div>

                {/* Price levels */}
                <div className="grid grid-cols-3 gap-2 bg-black/[0.02] p-3 rounded-xl border border-black/[0.06] text-center">
                  <div>
                    <div className="text-[9px] text-[#86868b] uppercase">Entry</div>
                    <div className="font-bold text-[#1d1d1f] text-xs mt-0.5">{lastStampedTicket.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#ff3b30] uppercase font-bold">Stop Loss</div>
                    <div className="font-bold text-[#ff3b30] text-xs mt-0.5">{lastStampedTicket.stopLossPrice}</div>
                    <div className="text-[9px] text-[#ff3b30] mt-0.5">-${lastStampedTicket.dollarRisk} ({lastStampedTicket.riskPercentOfBalance}%)</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#34c759] uppercase font-bold">Take Profit</div>
                    <div className="font-bold text-[#34c759] text-xs mt-0.5">{lastStampedTicket.takeProfitPrice}</div>
                    <div className="text-[9px] text-[#34c759] mt-0.5">+${lastStampedTicket.rewardDollar} (1:{lastStampedTicket.riskRewardRatio})</div>
                  </div>
                </div>

                {/* Runway Status */}
                <div className="bg-[#34c759]/10 border border-[#34c759]/30 p-2.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#34c759] font-bold">Daily Runway After Trade:</span>
                  </div>
                  <span className="font-extrabold text-[#34c759] text-xs">
                    ${lastStampedTicket.remainingDailyBufferAfterTrade.toLocaleString()} Buffer Safe
                  </span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCopyParameters}
                  className="w-full py-2.5 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-[#1d1d1f] font-mono-data text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {copiedTicket ? (
                    <>
                      <Check className="w-4 h-4 text-[#34c759]" />
                      <span className="text-[#34c759]">Order Command Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#1d1d1f]" />
                      <span>Copy Order Execution Command</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowStampModal(false);
                      setActiveTab('TERMINAL');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-mono-data text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0071e3]/20"
                  >
                    <span>Send to Workstation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowStampModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] font-mono-data text-xs transition-colors border border-black/[0.08]"
                  >
                    Done
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

