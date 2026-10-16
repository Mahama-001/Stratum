'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Target, 
  Zap, 
  Check 
} from 'lucide-react';
import AIInsightBadge from '@/components/AIInsightBadge';

export default function PreFlightChecklist() {
  const {
    selectedAsset,
    setTargetRiskPercent,
    riskResult,
    economicEvents,
    userPurchasedAccounts,
    activeAccountId,
    stampRiskParameters,
    lastStampedTicket,
    beginnerMode,
    setActiveTab,
    syncLiveNewsTick
  } = useStratumStore();

  const activeAccount = userPurchasedAccounts.find((a) => a.id === activeAccountId) || userPurchasedAccounts[0];

  // Manual checklist states that traders verify
  const [manualChecks, setManualChecks] = useState<{ [key: string]: boolean }>({
    liquidity_sweep: true,
    fvg_discount: true
  });

  const toggleManualCheck = (key: string) => {
    setManualChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Evaluate Live Automated Telemetry Checks
  const [currentUtcHour, setCurrentUtcHour] = useState<number>(14);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('14:00');

  React.useEffect(() => {
    const update = () => {
      const d = new Date();
      setCurrentUtcHour(d.getUTCHours());
      setCurrentTimeStr(d.toISOString().substring(11, 16));
      syncLiveNewsTick();
    };
    update();
    const timer = setInterval(update, 5000);
    return () => clearInterval(timer);
  }, [syncLiveNewsTick]);
  
  // 1. Session Timing: London (7-10 UTC) or NY (13-16 UTC)
  const isLondon = currentUtcHour >= 7 && currentUtcHour < 10;
  const isNewYork = currentUtcHour >= 13 && currentUtcHour < 16;
  const isOverlap = currentUtcHour >= 13 && currentUtcHour < 15;
  const isKillzoneActive = isLondon || isNewYork || isOverlap;

  // 2. News Hazard: Check if any RED or HIGH impact event within 30 min
  const upcomingHighImpact = economicEvents.find(
    (e) => e.impact === 'HIGH' && e.minutesUntil >= -15 && e.minutesUntil <= 30
  );
  const isNewsBlackout = !!upcomingHighImpact && upcomingHighImpact.minutesUntil <= 15 && upcomingHighImpact.minutesUntil >= -15;

  // 3. 25% Buffer Safety Guardrail Check
  const isGuardrailSafe = !riskResult.isBreachDanger && !riskResult.isHardBlocked;

  // 4. Risk to Reward Check (minimum 1:1.5)
  const isRrAdequate = riskResult.riskRewardRatio >= 1.5;

  // 5. Max Firm Risk Cap
  const isRiskCapCompliant = riskResult.riskPercentOfBalance <= (activeAccount.maxRiskPerTradePercent || 3.0);

  // Overall Gatekeeper Score
  const automatedChecks = [
    { id: 'SESSION', passed: isKillzoneActive, warning: !isKillzoneActive, critical: false },
    { id: 'NEWS', passed: !isNewsBlackout, warning: !!upcomingHighImpact && !isNewsBlackout, critical: isNewsBlackout },
    { id: 'GUARDRAIL', passed: isGuardrailSafe, warning: riskResult.isBreachDanger, critical: riskResult.isHardBlocked },
    { id: 'RR_RATIO', passed: isRrAdequate, warning: !isRrAdequate, critical: false },
    { id: 'RISK_CAP', passed: isRiskCapCompliant, warning: false, critical: !isRiskCapCompliant },
    { id: 'MANUAL_SWEEP', passed: manualChecks.liquidity_sweep, warning: !manualChecks.liquidity_sweep, critical: false },
    { id: 'MANUAL_FVG', passed: manualChecks.fvg_discount, warning: !manualChecks.fvg_discount, critical: false }
  ];

  const criticalFails = automatedChecks.filter((c) => c.critical).length;
  const warnings = automatedChecks.filter((c) => c.warning && !c.critical).length;
  const totalPassed = automatedChecks.filter((c) => c.passed).length;
  const totalChecks = automatedChecks.length;

  const isCautionRunway = criticalFails === 0 && warnings > 0;

  const positionSize = activeAccount.instrumentType === 'FUTURES' ? (riskResult.contracts || 1) : riskResult.lotSize;
  const positionUnit = activeAccount.instrumentType === 'FUTURES' ? 'Contracts' : 'Lots';

  return (
    <div className="space-y-6">
      
      {/* Top HUD Banner: Takeoff Clearance Status with Semantic Apple Colors */}
      <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${
        criticalFails > 0
          ? 'apple-card border-[#ff453a]/40 shadow-[0_0_40px_rgba(255,69,58,0.15)]'
          : isCautionRunway
          ? 'apple-card border-[#ff9f0a]/35 shadow-[0_0_35px_rgba(255,159,10,0.12)]'
          : 'apple-card border-[#30d158]/35 shadow-[0_0_40px_rgba(48,209,88,0.12)]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-md transition-all ${
              criticalFails > 0
                ? 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/40 shadow-[0_0_20px_rgba(255,69,58,0.25)]'
                : isCautionRunway
                ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/40 shadow-[0_0_20px_rgba(255,159,10,0.25)]'
                : 'bg-[#30d158]/15 text-[#30d158] border-[#30d158]/40 shadow-[0_0_20px_rgba(48,209,88,0.25)]'
            }`}>
              {criticalFails > 0 ? (
                <XCircle className="w-8 h-8" />
              ) : isCautionRunway ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-mono-data text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  criticalFails > 0
                    ? 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30'
                    : isCautionRunway
                    ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30'
                    : 'bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30'
                }`}>
                  {criticalFails > 0 ? 'TAKEOFF ABORTED / HARD BLOCK' : isCautionRunway ? 'CAUTION: RESTRICTED RUNWAY' : 'CLEAR RUNWAY: APPROVED FOR EXECUTION'}
                </span>
                <span className="text-xs font-mono-data text-[#86868b] font-medium">
                  {totalPassed}/{totalChecks} CHECKS VERIFIED
                </span>
                <AIInsightBadge type="preflight" label="Rule Verification" />
              </div>

              <h2 className="text-xl font-semibold text-[#1d1d1f] mt-1.5 font-h2">
                {criticalFails > 0
                  ? 'Hard Prop Firm Rule Breach Detected — Do Not Place Trade'
                  : isCautionRunway
                  ? `${warnings} Elevated Hazard Factor${warnings > 1 ? 's' : ''} Require Attention`
                  : 'All Confluences Aligned & Drawdown Guardrail Compliant'}
              </h2>

              <p className="text-xs text-[#6e6e73] mt-1 max-w-2xl leading-relaxed">
                {criticalFails > 0
                  ? 'Stratum Gatekeeper has locked trade execution to protect your account from permanent prop firm disqualification.'
                  : isCautionRunway
                  ? 'Trade is technically executable, but outside optimal institutional parameters. Consider reducing risk to 0.25%.'
                  : `Your position of ${positionSize} ${positionUnit} on ${selectedAsset.symbol} satisfies all risk, timing, and drawdown parameters.`}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => {
                if (criticalFails === 0) {
                  stampRiskParameters();
                  setActiveTab('RISK_ENGINE');
                }
              }}
              disabled={criticalFails > 0}
              className={`px-6 py-3 rounded-full font-mono-data text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                criticalFails > 0
                  ? 'bg-black/[0.05] text-[#86868b] cursor-not-allowed border border-black/[0.08]'
                  : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-[#0071e3]/20 ring-1 ring-[#0071e3]/50 active:scale-95'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lastStampedTicket ? 'Stamp Certified' : 'Certify & Stamp Trade'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Beginner Mode Educational Notice */}
      {beginnerMode && (
        <div className="apple-card p-4 flex items-start gap-3 text-xs text-[#6e6e73]">
          <div className="p-2 rounded-xl bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#0071e3]" />
          </div>
          <div>
            <div className="font-bold text-[#1d1d1f] mb-0.5">Why Prop Pilots Use the Pre-Flight Checklist:</div>
            <p className="leading-relaxed text-[#6e6e73]">
              Airline pilots never take off without checking instruments, regardless of experience. In prop trading, 90% of accounts are lost when traders enter outside killzones, during high-impact news spikes, or with inverted risk-to-reward ratios. Checking all items ensures you only take institutional-grade setups.
            </p>
          </div>
        </div>
      )}

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CHECK 1: Session Killzone */}
        <div className={`p-4 rounded-2xl border transition-all apple-card ${
          isKillzoneActive 
            ? 'border-[#30d158]/30 hover:border-[#30d158]/50' 
            : 'border-[#ff9f0a]/30 hover:border-[#ff9f0a]/50'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isKillzoneActive ? 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/25' : 'bg-[#ff9f0a]/12 text-[#ff9f0a] border-[#ff9f0a]/25'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1d1d1f]">01 / Session Killzone Runway</div>
                <div className="text-[10px] font-mono-data text-[#86868b]">Timing &amp; Liquidity Flow</div>
              </div>
            </div>
            <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full border ${
              isKillzoneActive 
                ? 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/25' 
                : 'bg-[#ff9f0a]/12 text-[#ff9f0a] border-[#ff9f0a]/25'
            }`}>
              {isKillzoneActive ? 'PASS (KILLZONE ACTIVE)' : 'CAUTION (OFF-PEAK)'}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] mt-2.5 leading-relaxed">
            {isKillzoneActive
              ? `Currently in active expansion window (${isLondon ? 'London Open' : isNewYork ? 'New York Session' : 'Overlap'}). Spreads are tight and volatility is institutional.`
              : `Current time (${currentTimeStr} UTC) is outside prime London (07:00-10:00 UTC) and NY (13:00-16:00 UTC) killzones. Beware chop.`}
          </p>
        </div>

        {/* CHECK 2: Macro News Hazard */}
        <div className={`p-4 rounded-2xl border transition-all apple-card ${
          isNewsBlackout
            ? 'border-[#ff453a]/50 shadow-[0_0_20px_rgba(255,69,58,0.12)]'
            : upcomingHighImpact
            ? 'border-[#ff9f0a]/35'
            : 'border-[#30d158]/25'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isNewsBlackout 
                  ? 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30' 
                  : upcomingHighImpact 
                  ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30' 
                  : 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/25'
              }`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1d1d1f]">02 / Macro News Hazard Shield</div>
                <div className="text-[10px] font-mono-data text-[#86868b]">15-Minute Blackout Rule</div>
              </div>
            </div>
            <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full border ${
              isNewsBlackout 
                ? 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30 animate-pulse' 
                : upcomingHighImpact 
                ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30' 
                : 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/25'
            }`}>
              {isNewsBlackout ? 'CRITICAL BLACKOUT' : upcomingHighImpact ? 'HIGH IMPACT SOON' : 'CLEAR (NO RED NEWS)'}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] mt-2.5 leading-relaxed">
            {isNewsBlackout
              ? `RED ALERT: ${upcomingHighImpact?.title} is within 15 minutes! Most prop firms prohibit trades during this window due to slippage.`
              : upcomingHighImpact
              ? `Warning: ${upcomingHighImpact.title} scheduled in ${upcomingHighImpact.minutesUntil} minutes. Plan to close or protect positions before release.`
              : 'No Tier-1 macro news (CPI, NFP, FOMC) within the next 45 minutes. Market conditions are stable.'}
          </p>
        </div>

        {/* CHECK 3: 25% Buffer Safety Guardrail */}
        <div className={`p-4 rounded-2xl border transition-all apple-card ${
          riskResult.isHardBlocked
            ? 'border-[#ff453a]/50 shadow-sm'
            : riskResult.isBreachDanger
            ? 'border-[#ff9f0a]/35'
            : 'border-[#30d158]/25'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                riskResult.isHardBlocked 
                  ? 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30' 
                  : riskResult.isBreachDanger 
                  ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30' 
                  : 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/25'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1d1d1f]">03 / Stratum 25% Buffer Guardrail</div>
                <div className="text-[10px] font-mono-data text-[#86868b]">Capital Preservation Shield</div>
              </div>
            </div>
            <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full border ${
              riskResult.isHardBlocked 
                ? 'bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30 animate-pulse' 
                : riskResult.isBreachDanger 
                ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30' 
                : 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/25'
            }`}>
              {riskResult.isHardBlocked ? 'HARD BLOCKED' : riskResult.isBreachDanger ? 'REDUCED BUFFER' : 'PASS (BUFFER SAFE)'}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] mt-2.5 leading-relaxed">
            This trade risks <strong className="text-[#1d1d1f]">${riskResult.dollarRisk}</strong>, which consumes <strong className={riskResult.isBreachDanger ? 'text-[#ff3b30]' : 'text-[#34c759]'}>{riskResult.percentageOfDailyBufferConsumedByLoss}%</strong> of your remaining daily buffer (${riskResult.remainingDailyBufferDollar.toLocaleString()}).
            {riskResult.isBreachDanger && ' Exceeds 25% guardrail limit!'}
          </p>
          {riskResult.isBreachDanger && (
            <button
              onClick={() => setTargetRiskPercent(0.25)}
              className="mt-2 text-[10px] font-mono-data text-[#ff9f0a] hover:underline flex items-center gap-1 font-bold"
            >
              <Zap className="w-3 h-3 text-[#ff9f0a]" /> Auto-Tune Risk to 0.25% to Clear Guardrail
            </button>
          )}
        </div>

        {/* CHECK 4: Risk to Reward Ratio */}
        <div className={`p-4 rounded-2xl border transition-all apple-card ${
          isRrAdequate ? 'border-[#30d158]/25' : 'border-[#ff9f0a]/35'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isRrAdequate ? 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/25' : 'bg-[#ff9f0a]/12 text-[#ff9f0a] border-[#ff9f0a]/25'
              }`}>
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1d1d1f]">04 / Risk-to-Reward Geometry</div>
                <div className="text-[10px] font-mono-data text-[#86868b]">Mathematical Expectancy</div>
              </div>
            </div>
            <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full border ${
              isRrAdequate 
                ? 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/25' 
                : 'bg-[#ff9f0a]/12 text-[#ff9f0a] border-[#ff9f0a]/25'
            }`}>
              1 : {riskResult.riskRewardRatio} {isRrAdequate ? '(ADEQUATE)' : '(SUB-OPTIMAL)'}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] mt-2.5 leading-relaxed">
            {isRrAdequate
              ? `Target gain of +$${riskResult.rewardDollar.toLocaleString()} vs risk of $${riskResult.dollarRisk}. At 1:${riskResult.riskRewardRatio}, you only need a 40% win rate to stay profitable.`
              : `Current R:R is 1:${riskResult.riskRewardRatio}. Prop traders require at least 1:1.5 to withstand drawdowns. Consider extending TP or tightening SL.`}
          </p>
        </div>

        {/* CHECK 5: Manual Liquidity Sweep Verification */}
        <div 
          onClick={() => toggleManualCheck('liquidity_sweep')}
          className="p-4 rounded-2xl border border-black/[0.08] apple-card hover:border-black/[0.18] cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
                manualChecks.liquidity_sweep 
                  ? 'bg-[#34c759] text-white border-[#34c759]/50 shadow-sm' 
                  : 'bg-black/[0.04] text-[#86868b] border-black/[0.08]'
              }`}>
                {manualChecks.liquidity_sweep ? <Check className="w-4 h-4 font-black" /> : <div className="w-2 h-2 rounded-full bg-[#86868b]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#1d1d1f]">05 / Liquidity Sweep Confirmed</div>
                <div className="text-[10px] font-mono-data text-[#86868b]">Asian High/Low or Prev Day Level</div>
              </div>
            </div>
            <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full border ${
              manualChecks.liquidity_sweep 
                ? 'bg-[#34c759]/12 text-[#34c759] border-[#34c759]/25' 
                : 'bg-black/[0.04] text-[#86868b] border-black/[0.08]'
            }`}>
              {manualChecks.liquidity_sweep ? 'CONFIRMED' : 'CLICK TO CONFIRM'}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] mt-2.5 leading-relaxed">
            Did price sweep an institutional liquidity pool (Asian High/Low, equal highs, or previous day high/low) before reversing?
          </p>
        </div>

        {/* CHECK 6: Fair Value Gap / Order Block Confluence */}
        <div 
          onClick={() => toggleManualCheck('fvg_discount')}
          className="p-4 rounded-2xl border border-black/[0.08] apple-card hover:border-black/[0.18] cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
                manualChecks.fvg_discount 
                  ? 'bg-[#34c759] text-white border-[#34c759]/50 shadow-sm' 
                  : 'bg-black/[0.04] text-[#86868b] border-black/[0.08]'
              }`}>
                {manualChecks.fvg_discount ? <Check className="w-4 h-4 font-black" /> : <div className="w-2 h-2 rounded-full bg-[#86868b]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#1d1d1f]">06 / FVG &amp; Discount Pricing</div>
                <div className="text-[10px] font-mono-data text-[#86868b]">Institutional Entry Area</div>
              </div>
            </div>
            <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full border ${
              manualChecks.fvg_discount 
                ? 'bg-[#34c759]/12 text-[#34c759] border-[#34c759]/25' 
                : 'bg-black/[0.04] text-[#86868b] border-black/[0.08]'
            }`}>
              {manualChecks.fvg_discount ? 'CONFIRMED' : 'CLICK TO CONFIRM'}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] mt-2.5 leading-relaxed">
            Is your entry located inside a displacement Fair Value Gap (FVG) or institutional order block at a discount (for longs) or premium (for shorts)?
          </p>
        </div>

      </div>

    </div>
  );
}
