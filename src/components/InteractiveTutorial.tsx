'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES, StratumTab } from '@/lib/types';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Clock,
  ShieldAlert,
  BarChart3,
  Copy,
  BookOpen,
  Calculator,
  Compass,
  Trophy,
  MousePointerClick
} from 'lucide-react';

interface TutorialStep {
  id: string;
  stepNumber: number;
  title: string;
  category: string;
  targetId: string;
  requiredTab?: StratumTab;
  description: string;
  actionPrompt: string;
  primaryActionLabel: string;
  icon: React.ReactNode;
}

export default function InteractiveTutorial() {
  const {
    tutorialOpen,
    tutorialStep,
    startTutorial,
    closeTutorial,
    setTutorialStep,
    nextTutorialStep,
    prevTutorialStep,
    activeTab,
    setActiveTab,
    currentTheme,
    addToast
  } = useStratumStore();

  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isCompletedState, setIsCompletedState] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1920, height: 1080 });

  // Track viewport dimensions for pixel-accurate panel clipping
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Check first-time visitor on initial client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const completed = localStorage.getItem('stratum_tutorial_completed');
        if (completed !== 'true') {
          const state = useStratumStore.getState();
          // ONLY auto-start on fresh initial visit if tutorial is not already open and step is 0
          if (!state.tutorialOpen && state.tutorialStep === 0) {
            const timer = setTimeout(() => {
              const currentState = useStratumStore.getState();
              if (!currentState.tutorialOpen && currentState.tutorialStep === 0) {
                startTutorial();
              }
            }, 600);
            return () => clearTimeout(timer);
          }
        }
      } catch (e) {
        // ignore local storage error
      }
    }
  }, []); // Run strictly once on initial client mount

  const steps: TutorialStep[] = useMemo(() => [
    {
      id: 'welcome',
      stepNumber: 1,
      title: 'Welcome to Stratum Terminal',
      category: 'PHILOSOPHY',
      targetId: 'tutorial-hero-badge',
      requiredTab: 'LANDING',
      description: 'Stratum is built specifically for prop firm challenge & funded traders. We replace emotional guessing and spreadsheets with hard-coded mathematical boundaries, institutional killzones, and macro hazard shields.',
      actionPrompt: 'Click "Next Step" to inspect the command dashboard preview.',
      primaryActionLabel: 'Next Step',
      icon: <Compass className="w-4 h-4 text-[#30d158]" />
    },
    {
      id: 'dashboard-preview',
      stepNumber: 2,
      title: 'Command Dashboard & Telemetry',
      category: 'PREVIEW',
      targetId: 'hero-terminal',
      requiredTab: 'LANDING',
      description: 'Stratum brings all your mission-critical components—drawdown limits, session killzones, and macro shields—into one unified operational dashboard.',
      actionPrompt: 'Click "Next Step" to view the terminal launcher.',
      primaryActionLabel: 'Next Step',
      icon: <BarChart3 className="w-4 h-4 text-[#2997ff]" />
    },
    {
      id: 'launch-terminal',
      stepNumber: 3,
      title: 'Stepping into the Workstation',
      category: 'WORKSTATION',
      targetId: 'tutorial-launch-terminal-btn',
      requiredTab: 'LANDING',
      description: 'All heavy real-time engines live inside the dedicated Stratum Workstation suite. Stepping inside unlocks real-time telemetry, killzones, order copier, and risk engine.',
      actionPrompt: 'Click "Enter Workstation" to launch the workstation suite!',
      primaryActionLabel: 'Enter Workstation',
      icon: <Zap className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'account-capsule',
      stepNumber: 4,
      title: 'Prop Firm Rules & Active Account',
      category: 'FIRM RULES',
      targetId: 'tutorial-account-capsule',
      requiredTab: 'TERMINAL',
      description: 'Stratum locks in your firm limits (FTMO, Topstep, FundedNext, Apex) directly in the workstation header. It tracks daily loss limits and drawdown type in real-time.',
      actionPrompt: 'Inspect the active account capsule in the top header.',
      primaryActionLabel: 'Next: Session Radar',
      icon: <ShieldCheck className="w-4 h-4 text-[#2997ff]" />
    },
    {
      id: 'session-radar',
      stepNumber: 5,
      title: 'Institutional Session Factor Radar',
      category: 'SESSION TIMING',
      targetId: 'tutorial-session-radar',
      requiredTab: 'TERMINAL',
      description: 'Funded accounts fail during midday consolidation chop. The Session Radar tracks Tokyo range accumulation, London Open sweeps, and New York overlap killzones with real-time UTC clock sync.',
      actionPrompt: 'Inspect the active Killzone badge and expansion volume peak.',
      primaryActionLabel: 'Next: Macro Shield',
      icon: <Clock className="w-4 h-4 text-[#30d158]" />
    },
    {
      id: 'news-hazard',
      stepNumber: 6,
      title: 'Macro Hazard Shield & News Blackout',
      category: 'SLIPPAGE SHIELD',
      targetId: 'tutorial-news-hazard',
      requiredTab: 'TERMINAL',
      description: 'CPI, NFP, and FOMC releases cause catastrophic slippage and rule breaches. Stratum calculates live countdowns and enforces an automated 15-minute freeze window before high-impact events.',
      actionPrompt: 'Check the FOMC Rate Decision countdown and freeze timer.',
      primaryActionLabel: 'Next: Asset Matrix',
      icon: <ShieldAlert className="w-4 h-4 text-[#ff453a]" />
    },
    {
      id: 'asset-bias',
      stepNumber: 7,
      title: 'Institutional Order Flow & DXY Matrix',
      category: 'ORDER FLOW',
      targetId: 'tutorial-asset-bias',
      requiredTab: 'TERMINAL',
      description: 'Monitors US Dollar Index (DXY) inverse correlations, institutional bias (Bullish/Bearish), Asian high/low sweeps, and fair value gaps across FX, Indices, and Gold.',
      actionPrompt: 'Click any asset row in the matrix to align institutional bias.',
      primaryActionLabel: 'Next: Order Copier',
      icon: <BarChart3 className="w-4 h-4 text-[#2997ff]" />
    },
    {
      id: 'order-copier',
      stepNumber: 8,
      title: 'Fast One-Click Order Copier',
      category: 'TRADE COPIER',
      targetId: 'tutorial-order-copier',
      requiredTab: 'TERMINAL',
      description: 'Once your lot size is stamped with 25% guardrail compliance, the Order Copier broadcasts your calculated parameters directly to MT4, MT5, or cTrader with zero lag.',
      actionPrompt: 'Verify target platform bridge connectivity and lot copying.',
      primaryActionLabel: 'Next: Playbooks',
      icon: <Copy className="w-4 h-4 text-[#2997ff]" />
    },
    {
      id: 'strategy-playbook',
      stepNumber: 9,
      title: 'Codified Institutional Playbooks',
      category: 'MECHANICAL SETUPS',
      targetId: 'tutorial-playbook',
      requiredTab: 'PLAYBOOK',
      description: 'Discipline requires fixed rules. Stratum provides codified step-by-step checklists for Turtle Soup liquidity sweeps, Judas Swing fakeouts, and Silver Bullet expansions with mandatory 1:2+ R:R.',
      actionPrompt: 'Inspect the rule checklist and 1:2 minimum Risk-to-Reward requirement.',
      primaryActionLabel: 'Next: Risk Engine',
      icon: <BookOpen className="w-4 h-4 text-[#ff9f0a]" />
    },
    {
      id: 'risk-engine',
      stepNumber: 10,
      title: 'Capital Preservation & 25% Buffer Guardrail',
      category: 'CAPITAL SHIELD',
      targetId: 'tutorial-risk-engine',
      requiredTab: 'RISK_ENGINE',
      description: 'Stratum’s core safeguard. Trade lots are sized against your remaining daily loss limit. If any proposed position risks >25% of your remaining daily buffer, the order is blocked.',
      actionPrompt: 'Notice the 25% buffer guardrail indicator and safe lot recommendation.',
      primaryActionLabel: 'Next: Gatekeeper & Copilot',
      icon: <Calculator className="w-4 h-4 text-[#30d158]" />
    },
    {
      id: 'preflight-and-copilot',
      stepNumber: 11,
      title: 'Gatekeeper & Desk Copilot',
      category: 'FINAL CHECK',
      targetId: 'tutorial-checklist',
      requiredTab: 'CHECKLIST',
      description: 'You are now equipped with institutional tools: use the Pre-Flight Gatekeeper before placing orders, simulate drawdown survival, and query the Desk Copilot within a unified Minimalist Apple Pro workstation.',
      actionPrompt: 'Click "Complete Tour" to begin trading with mathematical conviction!',
      primaryActionLabel: 'Complete Tour',
      icon: <Trophy className="w-4 h-4 text-amber-400" />
    }
  ], []);

  const currentStep = steps[tutorialStep] || steps[0];
  const totalSteps = steps.length;
  const progressPercent = Math.round(((tutorialStep + 1) / totalSteps) * 100);

  // Measure bounding rectangle of active target
  const updateTargetRect = useCallback(() => {
    if (!tutorialOpen || isCompletedState) return;
    const step = steps[tutorialStep] || steps[0];
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
        return;
      }
    }
    setTargetRect(null);
  }, [tutorialOpen, tutorialStep, isCompletedState, steps]);

  // Handle step and tab changes with smooth scrolling and multiple measurement checkpoints
  useEffect(() => {
    if (!tutorialOpen) return;

    const step = steps[tutorialStep] || steps[0];

    // If required tab does not match, align it
    if (step.requiredTab && step.requiredTab !== activeTab) {
      setActiveTab(step.requiredTab);
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    updateTargetRect();
    const timers = [
      setTimeout(updateTargetRect, 60),
      setTimeout(updateTargetRect, 180),
      setTimeout(updateTargetRect, 350),
      setTimeout(updateTargetRect, 550),
      setTimeout(updateTargetRect, 800)
    ];

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [tutorialOpen, tutorialStep, activeTab, setActiveTab, steps, updateTargetRect]);

  const handleSkip = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeTutorial();
    setIsCompletedState(false);
    showToast('Tutorial skipped. Click "Tour" in the top bar anytime to restart.');
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextIdx = tutorialStep + 1;
    if (nextIdx >= totalSteps) {
      setIsCompletedState(true);
      return;
    }

    const nextStepConfig = steps[nextIdx];
    if (nextStepConfig?.requiredTab && nextStepConfig.requiredTab !== activeTab) {
      setActiveTab(nextStepConfig.requiredTab);
    }

    nextTutorialStep();
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const prevIdx = Math.max(0, tutorialStep - 1);
    const prevStepConfig = steps[prevIdx];
    if (prevStepConfig?.requiredTab && prevStepConfig.requiredTab !== activeTab) {
      setActiveTab(prevStepConfig.requiredTab);
    }
    prevTutorialStep();
  };

  const handleFinish = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeTutorial();
    setIsCompletedState(false);
    setActiveTab('TERMINAL');
    addToast({
      type: 'success',
      title: 'Tutorial Complete',
      message: 'You are ready to trade with institutional discipline!'
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  if (!tutorialOpen && !toastMessage) {
    return null;
  }

  const padding = 10;
  const hasValidTarget = Boolean(targetRect && targetRect.width > 0 && targetRect.height > 0);
  const tTop = hasValidTarget && targetRect ? Math.max(0, targetRect.top - padding) : 0;
  const tBottom = hasValidTarget && targetRect ? Math.min(viewportSize.height, targetRect.bottom + padding) : 0;
  const tLeft = hasValidTarget && targetRect ? Math.max(0, targetRect.left - padding) : 0;
  const tRight = hasValidTarget && targetRect ? Math.min(viewportSize.width, targetRect.right + padding) : 0;
  const tWidth = hasValidTarget && targetRect ? Math.max(0, tRight - tLeft) : 0;
  const tHeight = hasValidTarget && targetRect ? Math.max(0, tBottom - tTop) : 0;

  // Position detection: if target is located in the bottom half of the screen,
  // position the tutorial dialog at the top so it never blocks the target element or its buttons!
  const isTargetInBottomHalf = Boolean(hasValidTarget && targetRect && targetRect.bottom > (viewportSize.height * 0.52));

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full bg-white/95 border border-black/[0.1] text-[#1d1d1f] text-xs shadow-2xl flex items-center gap-2.5 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto">
          <Compass className="w-4 h-4 text-[#0071e3] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="ml-2 text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {tutorialOpen && (
        <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden">
          
          {/* ============================================================== */}
          {/* 4-PANEL HOLLOW CUTOUT: The target element sits in pure empty    */}
          {/* air with ZERO blur, ZERO tint, and 100% crystal-clear clarity.  */}
          {/* All surrounding areas outside the active target are blurred.   */}
          {/* ============================================================== */}
          {hasValidTarget && !isCompletedState ? (
            <>
              {/* Top Blur Panel */}
              <div
                className="fixed left-0 right-0 top-0 bg-black/75 backdrop-blur-[4px] pointer-events-auto transition-all duration-150"
                style={{ height: `${tTop}px` }}
              />
              {/* Bottom Blur Panel */}
              <div
                className="fixed left-0 right-0 bottom-0 bg-black/75 backdrop-blur-[4px] pointer-events-auto transition-all duration-150"
                style={{ top: `${tBottom}px` }}
              />
              {/* Left Blur Panel */}
              <div
                className="fixed left-0 bg-black/75 backdrop-blur-[4px] pointer-events-auto transition-all duration-150"
                style={{
                  top: `${tTop}px`,
                  height: `${tHeight}px`,
                  width: `${tLeft}px`
                }}
              />
              {/* Right Blur Panel */}
              <div
                className="fixed right-0 bg-black/75 backdrop-blur-[4px] pointer-events-auto transition-all duration-150"
                style={{
                  top: `${tTop}px`,
                  height: `${tHeight}px`,
                  left: `${tRight}px`
                }}
              />
            </>
          ) : (
            /* Solid full-screen backdrop when target is not yet found or tutorial is completed */
            <div className={`fixed inset-0 bg-black/75 backdrop-blur-[4px] transition-all duration-300 ${isCompletedState ? 'pointer-events-auto' : 'pointer-events-none'}`} />
          )}

          {/* Dynamic Pinpoint Halo & Radar Target Highlight over the cutout */}
          {hasValidTarget && !isCompletedState && (
            <div
              className="fixed pointer-events-none transition-all duration-150 ease-out z-[92]"
              style={{
                top: `${tTop}px`,
                left: `${tLeft}px`,
                width: `${tWidth}px`,
                height: `${tHeight}px`
              }}
            >
              {/* Outer Pulsing Radar Ring */}
              <div
                className="absolute inset-0 rounded-2xl animate-ping opacity-25"
                style={{
                  border: '2px solid #0071e3',
                  animationDuration: '2.5s'
                }}
              />

              {/* Main Glowing Target Border (Apple Liquid Blue glow) */}
              <div
                className="absolute inset-0 rounded-2xl border-2 border-[#2997ff] transition-all duration-150"
                style={{
                  boxShadow: '0 0 24px rgba(0, 113, 227, 0.4), inset 0 0 12px rgba(0, 113, 227, 0.15)'
                }}
              />

              {/* Top-Right Action Beacon Tag */}
              <div className="absolute -top-3.5 -right-3 px-2.5 py-0.5 rounded-full text-[9px] font-mono-data font-bold uppercase flex items-center gap-1 shadow-lg bg-[#0071e3] text-white border border-[#2997ff]/40">
                <MousePointerClick className="w-3 h-3 text-white" />
                <span>ACTIVE FOCUS</span>
              </div>
            </div>
          )}

          {/* Celebration Modal when reaching completion */}
          {isCompletedState ? (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[95] pointer-events-auto">
              <div className="bg-white/95 border border-black/[0.1] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-[0_32px_80px_rgba(0,0,0,0.18)] text-[#1d1d1f] relative backdrop-blur-3xl animate-in zoom-in-95 duration-300">
                {/* Accent Top Laser Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.6), transparent)'
                  }}
                />

                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#0071e3]/10 border border-[#0071e3]/20 shadow-xl relative">
                  <Trophy className="w-8 h-8 text-[#0071e3]" />
                </div>

                <div className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#6e6e73] mb-1">
                  ORIENTATION COMPLETED
                </div>
                <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2 tracking-tight">
                  You Are Primed for Conviction
                </h3>
                <p className="text-xs text-[#6e6e73] leading-relaxed mb-6 max-w-md mx-auto">
                  Stratum is configured with your firm limits, session killzones, macro blackout shields, and the hard 25% buffer guardrail.
                </p>

                {/* 3 Golden Directives */}
                <div className="bg-black/[0.03] rounded-2xl p-4 border border-black/[0.08] text-left text-xs space-y-2.5 mb-6 text-[#1d1d1f]">
                  <div className="flex items-center gap-2.5 text-[#1d1d1f]">
                    <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Never risk &gt; 25% of your remaining daily buffer.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#1d1d1f]">
                    <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Lock execution &plusmn;15 min from Red Folder news releases.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#1d1d1f]">
                    <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
                    <span>Trade institutional London &amp; NY killzones exclusively.</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs tracking-wide shadow-[0_4px_20px_rgba(0,113,227,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Enter Workstation</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Floating Interactive Tutorial Card */
            <div
              className={`fixed ${
                isTargetInBottomHalf
                  ? 'top-4 sm:top-20'
                  : 'bottom-4 sm:bottom-8'
              } right-4 sm:right-8 left-4 sm:left-auto sm:max-w-[460px] z-[95] animate-in ${
                isTargetInBottomHalf ? 'slide-in-from-top-4' : 'slide-in-from-bottom-4'
              } duration-300 pointer-events-auto`}
            >
              <div className="bg-white/95 border border-black/[0.1] rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.15)] text-[#1d1d1f] relative backdrop-blur-3xl overflow-hidden">
                
                {/* Ambient Top Glow Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.5), transparent)'
                  }}
                />

                {/* Card Header: Step & Skip button */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20">
                      STEP {currentStep.stepNumber} OF {totalSteps}
                    </span>
                    <span className="text-[10px] font-medium text-[#6e6e73] uppercase tracking-wider">
                      {currentStep.category}
                    </span>
                  </div>

                  {/* Skip Tutorial Button */}
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-[12px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] flex items-center gap-1 transition-colors px-2.5 py-1 rounded-full hover:bg-black/[0.04] cursor-pointer"
                    title="Skip tutorial and enter workstation"
                  >
                    <span>Skip Tour</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step Title & Icon */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center shrink-0">
                    {currentStep.icon}
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-[#1d1d1f] tracking-tight">
                    {currentStep.title}
                  </h4>
                </div>

                {/* Step Description */}
                <p className="text-xs text-[#6e6e73] leading-relaxed mb-4">
                  {currentStep.description}
                </p>

                {/* EXACT ACTION CALLOUT BOX */}
                <div className="p-3.5 rounded-2xl bg-black/[0.03] border border-black/[0.08] text-xs mb-4 flex items-start gap-3 relative overflow-hidden backdrop-blur-md">
                  <div className="w-1 bg-[#0071e3] rounded-full self-stretch shrink-0" />
                  <Zap className="w-4 h-4 shrink-0 mt-0.5 text-[#0071e3]" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-semibold tracking-wider block mb-0.5 text-[#0071e3]">
                      EXACT ACTION TO PERFORM:
                    </span>
                    <div className="text-[12px] text-[#1d1d1f] font-medium">
                      {currentStep.actionPrompt}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black/[0.08] h-1.5 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Interactive Controls & Navigation */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-black/[0.08]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={tutorialStep === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-xs font-medium text-[#1d1d1f] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer active:scale-95 shadow-sm"
                      title="Previous Step"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#6e6e73]" />
                      <span>Back</span>
                    </button>
                    <span className="text-[10px] font-mono-data text-[#6e6e73]">
                      {progressPercent}%
                    </span>
                  </div>

                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {steps.map((s, idx) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          if (s.requiredTab && s.requiredTab !== activeTab) {
                            setActiveTab(s.requiredTab);
                          }
                          setTutorialStep(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === tutorialStep
                            ? 'w-5 bg-[#0071e3]'
                            : 'w-1.5 bg-black/20 hover:bg-black/40'
                        }`}
                        title={`Jump to step ${idx + 1}: ${s.title}`}
                      />
                    ))}
                  </div>

                  {/* Primary Next Action */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-[0_4px_16px_rgba(0,113,227,0.35)] transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    <span>{currentStep.primaryActionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}
