'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { PROP_FIRM_PRESETS } from '@/lib/riskEngine';
import { 
  PropFirmKey, 
  InstrumentCategory, 
  DrawdownCalculationType,
  UserPurchasedAccount,
  STRATUM_THEMES
} from '@/lib/types';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Layers, 
  CheckCircle2, 
  Plus, 
  Settings2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function PropAccountModal() {
  const {
    accountModalOpen,
    setAccountModalOpen,
    userPurchasedAccounts,
    activeAccountId,
    selectPurchasedAccount,
    updateAccountTuning,
    applyPresetAsPurchasedAccount,
    showPercentageView,
    setShowPercentageView,
    instrumentFilter,
    setInstrumentFilter,
    currentTheme
  } = useStratumStore();

  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];

  const [activeTab, setActiveTab] = useState<'PURCHASED' | 'BROWSE_FIRMS'>('PURCHASED');
  const [selectedFirm, setSelectedFirm] = useState<string>('FundedNext');
  const [selectedPresetId, setSelectedPresetId] = useState<PropFirmKey>('FUNDEDNEXT_STELLAR_6K');
  const [isTuningOpen, setIsTuningOpen] = useState<boolean>(false);
  const [firstPayoutDays, setFirstPayoutDays] = useState<number>(21);

  // Active account being tuned or viewed
  const activeAccount = userPurchasedAccounts.find((a) => a.id === activeAccountId) || userPurchasedAccounts[0];

  // Local tuning state initialized from activeAccount
  const [tuneNickname, setTuneNickname] = useState(activeAccount?.accountNickname || '');
  const [tuneBalance, setTuneBalance] = useState(activeAccount?.startingBalance || 6000);
  const [tuneDailyLoss, setTuneDailyLoss] = useState(activeAccount?.dailyLossLimitPercent || 5.0);
  const [tuneMaxLoss, setTuneMaxLoss] = useState(activeAccount?.maxDrawdownPercent || 10.0);
  const [tuneDrawdownType, setTuneDrawdownType] = useState<DrawdownCalculationType>(activeAccount?.drawdownType || 'STATIC');
  const [tuneMaxRisk, setTuneMaxRisk] = useState(activeAccount?.maxRiskPerTradePercent || 3.0);
  const [tuneMaxUnits, setTuneMaxUnits] = useState(activeAccount?.maxContractsOrLots || 5);
  const [tuneNewsAllowed, setTuneNewsAllowed] = useState(activeAccount?.newsTradingAllowed ?? true);
  const [tuneGuardrail, setTuneGuardrail] = useState(activeAccount?.guardrailPercent || 25.0);

  // When activeAccount changes or modal opens, sync tuning state
  React.useEffect(() => {
    if (activeAccount) {
      setTuneNickname(activeAccount.accountNickname);
      setTuneBalance(activeAccount.startingBalance);
      setTuneDailyLoss(activeAccount.dailyLossLimitPercent);
      setTuneMaxLoss(activeAccount.maxDrawdownPercent);
      setTuneDrawdownType(activeAccount.drawdownType);
      setTuneMaxRisk(activeAccount.maxRiskPerTradePercent);
      setTuneMaxUnits(activeAccount.maxContractsOrLots);
      setTuneNewsAllowed(activeAccount.newsTradingAllowed);
      setTuneGuardrail(activeAccount.guardrailPercent);
    }
  }, [activeAccountId, activeAccount]);

  if (!accountModalOpen) return null;

  // Firm Presets Catalog Filtered by Instrument
  const allPresets = Object.values(PROP_FIRM_PRESETS).filter((p) => p.id !== 'CUSTOM');
  const availableFirms = Array.from(new Set(allPresets.map((p) => p.firm)));

  const filteredPresets = allPresets.filter((p) => {
    if (instrumentFilter === 'ALL') return true;
    return p.instrumentType === instrumentFilter;
  });

  const firmsForCategory = Array.from(new Set(filteredPresets.map((p) => p.firm)));

  // Selected preset object for browsing
  const currentBrowsingPreset = PROP_FIRM_PRESETS[selectedPresetId] || PROP_FIRM_PRESETS['FUNDEDNEXT_STELLAR_6K'];

  // Calculate rule values in % or $
  const balance = activeTab === 'PURCHASED' ? activeAccount.startingBalance : currentBrowsingPreset.startingBalance;
  
  const formatValue = (pct: number | undefined, customDollar?: number) => {
    if (pct === undefined && customDollar === undefined) return 'N/A';
    if (showPercentageView) {
      return pct !== undefined && pct > 0 ? `${pct}%` : pct === 0 ? 'None' : 'N/A';
    } else {
      if (customDollar !== undefined) return `$${customDollar.toLocaleString()}`;
      if (pct !== undefined) {
        const dollar = (balance * pct) / 100;
        return `$${Math.round(dollar).toLocaleString()}`;
      }
      return 'N/A';
    }
  };

  const handleSaveTuning = () => {
    if (!activeAccount) return;
    const newCurrentBalance = tuneBalance !== activeAccount.startingBalance
      ? tuneBalance
      : activeAccount.currentBalance;

    updateAccountTuning(activeAccount.id, {
      accountNickname: tuneNickname,
      startingBalance: tuneBalance,
      currentBalance: newCurrentBalance,
      dailyLossLimitPercent: tuneDailyLoss,
      maxDrawdownPercent: tuneMaxLoss,
      drawdownType: tuneDrawdownType,
      maxRiskPerTradePercent: tuneMaxRisk,
      maxContractsOrLots: tuneMaxUnits,
      newsTradingAllowed: tuneNewsAllowed,
      guardrailPercent: tuneGuardrail
    });
    setIsTuningOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/30 backdrop-blur-md overflow-hidden animate-fadeIn">
      {/* Modal Dialog Container */}
      <div 
        className="relative w-full max-w-[1140px] max-h-[92vh] flex flex-col rounded-2xl shadow-2xl bg-white text-[#1d1d1f] border border-black/[0.08] overflow-hidden transition-colors duration-300"
      >
        
        {/* Top Ambient Theme Accent Line */}
        <div 
          className="h-[2px] w-full shrink-0 bg-[#0071e3]"
        />

        {/* Modal Header */}
        <div 
          className="px-5 py-3 sm:px-6 sm:py-3.5 border-b border-black/[0.08] bg-white flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm bg-[#0071e3]"
            >
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1d1d1f] tracking-tight">Prop Account Manager &amp; Rules Tuner</h2>
                <span 
                  className="text-[9px] font-mono-data px-2 py-0.5 rounded-full font-bold uppercase border bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20"
                >
                  FUTURES &amp; CFDS
                </span>
              </div>
              <p className="text-[11px] text-[#6e6e73] mt-0.5">
                Switch active funded accounts, evaluate firm rules, and calibrate exact drawdown guardrails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Show Percentage Switch */}
            <div 
              className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-black/[0.08] bg-black/[0.03] text-xs"
            >
              <button
                onClick={() => setShowPercentageView(!showPercentageView)}
                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showPercentageView ? 'bg-[#0071e3]' : 'bg-black/20 dark:bg-white/25'
                }`}
                role="switch"
                aria-checked={showPercentageView}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showPercentageView ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-[11px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] select-none">
                Show Percentage
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setAccountModalOpen(false)}
              className="p-1.5 rounded-lg text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs: My Purchased Accounts vs Browse All Firm Presets */}
        <div 
          className="px-5 py-2 sm:px-6 border-b border-black/[0.08] bg-[#f5f5f7] flex flex-wrap items-center justify-between gap-2.5 shrink-0"
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setActiveTab('PURCHASED'); setIsTuningOpen(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'PURCHASED'
                  ? 'bg-white text-[#0071e3] shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>My Purchased Accounts ({userPurchasedAccounts.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('BROWSE_FIRMS'); setIsTuningOpen(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'BROWSE_FIRMS'
                  ? 'bg-white text-[#0071e3] shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Browse All Prop Firms</span>
            </button>
          </div>

          {/* Instrument Filter: ALL | CFD | FUTURES */}
          <div 
            className="flex items-center gap-1 p-0.5 rounded-lg border border-black/[0.08] bg-black/[0.04] text-xs font-mono-data"
          >
            {(['ALL', 'CFD', 'FUTURES'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setInstrumentFilter(filter)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  instrumentFilter === filter
                    ? 'bg-white text-[#1d1d1f] shadow-sm font-extrabold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {filter === 'ALL' ? 'All Instruments' : filter === 'CFD' ? 'CFD / Forex' : 'Futures (CME)'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Modal Body Container */}
        <div className="overflow-y-auto max-h-[calc(92vh-125px)] custom-scrollbar flex-1">
          {/* Tab 1: User's Purchased Accounts Carousel / Switcher */}
          {activeTab === 'PURCHASED' && (
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 bg-black/[0.02] border-b border-black/[0.08]">
              <div className="text-[10px] font-mono-data text-[#6e6e73] uppercase font-bold tracking-wider mb-2 flex items-center justify-between">
                <span>Select Active Account for Realtime Guardrails:</span>
                <button
                  onClick={() => setActiveTab('BROWSE_FIRMS')}
                  className="hover:underline flex items-center gap-1 font-sans text-[11px] capitalize font-semibold text-[#0071e3]"
                >
                  <Plus className="w-3 h-3" />
                  Add New Purchased Account
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {userPurchasedAccounts.map((acc) => {
                  const isSelected = acc.id === activeAccountId;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => selectPurchasedAccount(acc.id)}
                      className={`cursor-pointer rounded-xl p-3 border transition-all text-left relative ${
                        isSelected
                          ? 'bg-[#0071e3]/08 border-[#0071e3] shadow-sm ring-1 ring-[#0071e3]/30'
                          : 'bg-white border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-black/[0.04] text-[#6e6e73] font-bold uppercase">
                          {acc.instrumentType}
                        </span>
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#0071e3]">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="text-[9px] text-[#86868b]">Tap to Select</span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-[#1d1d1f] line-clamp-1">
                        {acc.accountNickname}
                      </div>
                      <div className="text-[11px] font-mono-data mt-0.5 text-[#0071e3]">
                        ${acc.startingBalance.toLocaleString()} {acc.firm}
                      </div>
                      <div className="text-[9px] font-mono-data text-[#6e6e73] mt-1 flex items-center justify-between pt-1 border-t border-black/[0.06]">
                        <span>{acc.dailyLossLimitPercent}% Daily</span>
                        <span>{acc.maxDrawdownPercent}% Max</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Prop Firm Selector Tabs (When Browsing Firms) */}
          {activeTab === 'BROWSE_FIRMS' && (
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 bg-black/[0.02] border-b border-black/[0.08] space-y-2.5">
              <div className="text-[10px] font-mono-data text-[#6e6e73] uppercase font-bold tracking-wider">
                1. Choose Prop Firm ({instrumentFilter}):
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {firmsForCategory.map((firm) => {
                  const isSelected = selectedFirm === firm;
                  return (
                    <button
                      key={firm}
                      onClick={() => {
                        setSelectedFirm(firm);
                        const firstPresetOfFirm = filteredPresets.find((p) => p.firm === firm);
                        if (firstPresetOfFirm) setSelectedPresetId(firstPresetOfFirm.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0071e3] text-white shadow-sm font-extrabold'
                          : 'bg-white text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.08]'
                      }`}
                    >
                      {firm}
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] font-mono-data text-[#6e6e73] uppercase font-bold tracking-wider pt-1">
                2. Select Account Size &amp; Model Tier:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {filteredPresets
                  .filter((p) => p.firm === selectedFirm)
                  .map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#0071e3]/08 border-[#0071e3] text-[#1d1d1f] shadow-sm ring-1 ring-[#0071e3]/30'
                            : 'bg-white border-black/[0.08] text-[#6e6e73] hover:border-black/[0.15] hover:text-[#1d1d1f]'
                        }`}
                      >
                        <div className="text-xs font-bold text-[#1d1d1f] line-clamp-1">{preset.tierName}</div>
                        <div className="text-[11px] font-mono-data font-extrabold mt-0.5 text-[#0071e3]">
                          ${preset.challengePrice?.toFixed(2) || '59.99'}
                        </div>
                        <div className="text-[9px] font-mono-data text-[#6e6e73] mt-0.5">
                          ${(preset.startingBalance / 1000).toFixed(0)}k &bull; {preset.drawdownType.replace('_', ' ')}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Main Rules Content View */}
          <div className="p-4 sm:p-5 lg:p-6 space-y-4">
            
            {/* Top Bar: Avg. Reward Badge & Tune Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold font-mono-data">
                <span 
                  className="p-1 rounded-full"
                  style={{
                    backgroundColor: `${activeTheme.primaryColor}20`,
                    color: activeTheme.primaryColor
                  }}
                >
                  <Info className="w-3.5 h-3.5" />
                </span>
                <span className="text-zinc-400">Avg. Reward :</span>
                <span className="font-extrabold text-sm" style={{ color: activeTheme.primaryColor }}>
                  ${activeTab === 'PURCHASED' 
                    ? (activeAccount.avgRewardDollar || 296.55).toFixed(2) 
                    : (currentBrowsingPreset.avgRewardDollar || 296.55).toFixed(2)}
                </span>
              </div>

              {/* Quick Action: Tune Setup Toggle */}
              <button
                onClick={() => setIsTuningOpen(!isTuningOpen)}
                className="text-xs font-bold hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  backgroundColor: `${activeTheme.primaryColor}12`,
                  borderColor: `${activeTheme.primaryColor}30`,
                  color: activeTheme.primaryColor
                }}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isTuningOpen ? 'Hide Custom Tuning' : 'Tune Setup For This Account'}</span>
              </button>
            </div>

            {/* TUNING ACCORDION */}
            {isTuningOpen && (
              <div className="p-4 rounded-xl bg-black/[0.02] border border-black/[0.08] animate-fadeIn">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/[0.06]">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span className="text-xs font-bold text-[#1d1d1f] uppercase font-mono-data tracking-wider">
                      Tune Setup Parameters ({activeAccount.accountNickname})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-data text-[#6e6e73]">
                    Synchronizes with Risk Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1">
                      Account Nickname
                    </label>
                    <input
                      type="text"
                      value={tuneNickname}
                      onChange={(e) => setTuneNickname(e.target.value)}
                      className="w-full bg-white border border-black/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono-data text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1">
                      Starting Balance ($)
                    </label>
                    <input
                      type="number"
                      value={tuneBalance}
                      onChange={(e) => setTuneBalance(Number(e.target.value))}
                      className="w-full bg-white border border-black/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono-data text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1">
                      Daily Loss Limit (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={tuneDailyLoss}
                      onChange={(e) => setTuneDailyLoss(Number(e.target.value))}
                      className="w-full bg-white border border-black/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono-data text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1">
                      Max Overall Drawdown (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={tuneMaxLoss}
                      onChange={(e) => setTuneMaxLoss(Number(e.target.value))}
                      className="w-full bg-white border border-black/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono-data text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1">
                      Drawdown Calculation Type
                    </label>
                    <select
                      value={tuneDrawdownType}
                      onChange={(e) => setTuneDrawdownType(e.target.value as DrawdownCalculationType)}
                      className="w-full bg-white border border-black/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono-data text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    >
                      <option value="STATIC">Static (Starting Balance)</option>
                      <option value="BALANCE_BASED">Balance-Based (Floating Profits Safe)</option>
                      <option value="EOD_TRAILING">EOD Trailing (Calculated at 5 PM EST)</option>
                      <option value="INTRADAY_TRAILING">Intraday Peak Trailing (Apex Style)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1">
                      Max Risk Per Trade (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={tuneMaxRisk}
                      onChange={(e) => setTuneMaxRisk(Number(e.target.value))}
                      className="w-full bg-white border border-black/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono-data text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1">
                      Max Units ({activeAccount.instrumentType === 'FUTURES' ? 'Contracts' : 'Lots'})
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={tuneMaxUnits}
                      onChange={(e) => setTuneMaxUnits(Number(e.target.value))}
                      className="w-full bg-white border border-black/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono-data text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-data text-[#6e6e73] block mb-1">
                      Stratum Guardrail Sensitivity (%)
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={tuneGuardrail}
                      onChange={(e) => setTuneGuardrail(Number(e.target.value))}
                      className="w-full bg-white border border-black/[0.12] rounded-lg px-2.5 py-1.5 text-xs font-mono-data text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-black/[0.06]">
                  <button
                    onClick={() => setIsTuningOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono-data text-[#6e6e73] hover:text-[#1d1d1f]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTuning}
                    className="px-4 py-1.5 rounded-lg text-white font-bold font-mono-data text-xs shadow-md transition-all bg-[#0071e3] hover:bg-[#0077ed]"
                  >
                    Save &amp; Apply Tuned Rules
                  </button>
                </div>
              </div>
            )}

            {/* Three-Column Grid: Challenge Rules | Funded & Reward Rules | Pricing & Action Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              
              {/* COLUMN 1: Challenge Rules */}
              <div className="lg:col-span-4 bg-black/[0.02] border border-black/[0.08] rounded-xl p-3.5 sm:p-4">
                <h3 className="text-xs font-bold text-[#1d1d1f] mb-3 pb-2 border-b border-black/[0.06] flex items-center justify-between">
                  <span>Challenge Rules</span>
                  <span 
                    className="text-[9px] font-mono-data px-1.5 py-0.2 rounded font-bold bg-[#0071e3]/10 text-[#0071e3]"
                  >
                    PHASE 1 &amp; 2
                  </span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Phase 1 Profit Target</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      {formatValue(
                        activeTab === 'PURCHASED' ? 8.0 : currentBrowsingPreset.phase1TargetPercent || 8.0
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Phase 2 Profit Target</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      {formatValue(
                        activeTab === 'PURCHASED' ? 5.0 : currentBrowsingPreset.phase2TargetPercent || 5.0
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Daily Loss Limit</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      {formatValue(
                        activeTab === 'PURCHASED' ? activeAccount.dailyLossLimitPercent : currentBrowsingPreset.dailyLossLimitPercent
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Maximum Loss Limit</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      {formatValue(
                        activeTab === 'PURCHASED' ? activeAccount.maxDrawdownPercent : currentBrowsingPreset.maxDrawdownPercent
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Drawdown Type</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data capitalize">
                      {activeTab === 'PURCHASED' 
                        ? activeAccount.drawdownType.toLowerCase().replace('_', ' ') 
                        : currentBrowsingPreset.drawdownType.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Minimum Trading Days</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      {activeTab === 'PURCHASED' ? '5 Days' : currentBrowsingPreset.minTradingDays ? `${currentBrowsingPreset.minTradingDays} Days` : '5 Days'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>News Trading</span>
                    </div>
                    <span className="font-bold font-mono-data text-[#34c759]">
                      {(activeTab === 'PURCHASED' ? activeAccount.newsTradingAllowed : currentBrowsingPreset.newsTradingAllowed) ? 'Allowed' : 'Blackout'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>15% Performance Reward</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      ${Math.round(balance * 0.0195)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Reset Applicable</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">Yes</span>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: Funded & Reward Rules */}
              <div className="lg:col-span-4 bg-black/[0.02] border border-black/[0.08] rounded-xl p-3.5 sm:p-4">
                <h3 className="text-xs font-bold text-[#1d1d1f] mb-3 pb-2 border-b border-black/[0.06] flex items-center justify-between">
                  <span>Funded &amp; Reward Rules</span>
                  <span 
                    className="text-[9px] font-mono-data px-1.5 py-0.2 rounded font-bold bg-[#0071e3]/10 text-[#0071e3]"
                  >
                    SIM-FUNDED
                  </span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Daily Loss Limit</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      {formatValue(
                        activeTab === 'PURCHASED' ? activeAccount.dailyLossLimitPercent : currentBrowsingPreset.dailyLossLimitPercent
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Maximum Loss Limit</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      {formatValue(
                        activeTab === 'PURCHASED' ? activeAccount.maxDrawdownPercent : currentBrowsingPreset.maxDrawdownPercent
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Reward Share</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">
                      {activeTab === 'PURCHASED' ? '80%' : currentBrowsingPreset.rewardSharePercent ? `${currentBrowsingPreset.rewardSharePercent}%` : '80%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>First Withdrawal</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/[0.04] px-2 py-0.5 rounded-full border border-black/[0.08]">
                      <button
                        onClick={() => setFirstPayoutDays(Math.max(7, firstPayoutDays - 7))}
                        className="p-0.5 hover:text-[#1d1d1f]"
                      >
                        <ChevronLeft className="w-3 h-3 text-[#0071e3]" />
                      </button>
                      <span className="text-[10px] font-bold text-[#1d1d1f] font-mono-data">
                        {firstPayoutDays} Days
                      </span>
                      <button
                        onClick={() => setFirstPayoutDays(Math.min(30, firstPayoutDays + 7))}
                        className="p-0.5 hover:text-[#1d1d1f]"
                      >
                        <ChevronRight className="w-3 h-3 text-[#0071e3]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Subsequent Withdrawal</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">14 Days</span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Refundable Fee</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">With 1st Reward</span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>News Trading Profit</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">40%</span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Max Risk</span>
                    </div>
                    <span className="font-bold font-mono-data text-[#0071e3]">
                      {activeTab === 'PURCHASED' ? `${activeAccount.maxRiskPerTradePercent}% At any time` : `${currentBrowsingPreset.maxRiskPerTradePercent || 3}% At any time`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Reward Condition</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">N/A</span>
                  </div>

                  <div className="flex items-center justify-between text-[#6e6e73] py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-[#86868b]" />
                      <span>Consistency</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] font-mono-data">N/A</span>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: Right Sidebar Pricing & Primary Action */}
              <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-4 pt-1 lg:pt-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-snug">
                    {activeTab === 'PURCHASED' 
                      ? activeAccount.accountNickname 
                      : currentBrowsingPreset.tierName}
                  </h1>
                  
                  {/* Neon Pricing Tag */}
                  <div 
                    className="text-3xl sm:text-4xl font-semibold mt-2 font-mono-data tracking-tight text-[#0071e3]"
                  >
                    ${(activeTab === 'PURCHASED' ? activeAccount.challengePrice || 59.99 : currentBrowsingPreset.challengePrice || 59.99).toFixed(2)}
                  </div>

                  <div className="text-[11px] text-[#6e6e73] mt-1 font-mono-data">
                    {activeTab === 'PURCHASED' ? (
                      <span className="font-semibold text-[#0071e3]">&bull; Active in Stratum Terminal</span>
                    ) : (
                      <span>Instant evaluation access with refundable fee</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Primary Action Button */}
                  {activeTab === 'PURCHASED' ? (
                    <button
                      onClick={() => {
                        selectPurchasedAccount(activeAccount.id);
                        setAccountModalOpen(false);
                      }}
                      className="w-full py-3 rounded-xl hover:brightness-105 font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 bg-[#0071e3] text-white"
                    >
                      <span>Apply &amp; Sync Workstation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        applyPresetAsPurchasedAccount(currentBrowsingPreset.id);
                      }}
                      className="w-full py-3 rounded-xl hover:brightness-105 font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 bg-[#0071e3] text-white"
                    >
                      <span>Add to My Purchased Accounts</span>
                      <Plus className="w-4 h-4" />
                    </button>
                  )}

                  {/* Secondary Action */}
                  <button
                    onClick={() => setIsTuningOpen(!isTuningOpen)}
                    className="w-full py-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-[#1d1d1f] font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>Custom Rule Calibration</span>
                  </button>

                  {/* Payment Logos row */}
                  <div className="pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap text-[9px] text-[#6e6e73] font-mono-data">
                      <span className="px-1.5 py-0.5 rounded bg-black/[0.04] border border-black/[0.08] text-[#1d1d1f] font-bold">MC</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/[0.04] border border-black/[0.08] text-[#1d1d1f] font-bold">VISA</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/[0.04] border border-black/[0.08] text-[#1d1d1f] font-bold">AMEX</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/[0.04] border border-black/[0.08] text-[#1d1d1f] font-bold">Pay</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/[0.04] border border-black/[0.08] text-[#1d1d1f] font-bold">GPay</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/[0.04] border border-black/[0.08] text-[#1d1d1f] font-bold">PayPal</span>
                      <span className="text-[#86868b] font-semibold">+13 more</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer Info Banner */}
        <div 
          className="px-5 py-2.5 sm:px-6 border-t border-black/[0.08] bg-[#f5f5f7] flex flex-wrap items-center justify-between text-[11px] font-mono-data text-[#6e6e73] gap-3 shrink-0"
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#1d1d1f]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3]" />
              Drawdown Shield Active
            </span>
            <span>Firm Model: <strong className="text-[#1d1d1f]">{activeAccount.firm} ({activeAccount.instrumentType})</strong></span>
          </div>
          <div>
            <span>Stratum 25% Guardrail: <strong className="text-[#0071e3]">{activeAccount.guardrailPercent}% Daily Loss Buffer</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
