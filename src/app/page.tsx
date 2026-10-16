'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroTerminalMockup from '@/components/HeroTerminalMockup';
import SessionRadar from '@/components/SessionRadar';
import NewsHazardIndex from '@/components/NewsHazardIndex';
import AssetBiasMatrix from '@/components/AssetBiasMatrix';
import StrategyPlaybook from '@/components/StrategyPlaybook';
import PropRiskEngine from '@/components/PropRiskEngine';
import TradingViewChart from '@/components/TradingViewChart';
import PropAccountModal from '@/components/PropAccountModal';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES } from '@/lib/types';
import FastOrderCopier from '@/components/FastOrderCopier';
import PreFlightChecklist from '@/components/PreFlightChecklist';
import PropDrawdownSimulator from '@/components/PropDrawdownSimulator';
import BeginnerGuidanceAssistant from '@/components/BeginnerGuidanceAssistant';
import StratumLogo from '@/components/StratumLogo';
import ScrollReveal from '@/components/ScrollReveal';
import MarketTickerBar from '@/components/MarketTickerBar';
import InteractiveTutorial from '@/components/InteractiveTutorial';
import AuthModal from '@/components/AuthModal';
import ThemeSelector from '@/components/ThemeSelector';
import TradeJournal from '@/components/TradeJournal';
import UserProfileModal from '@/components/UserProfileModal';
import { 
  ArrowRight, 
  Terminal, 
  Bot,
  BookOpen, 
  Calculator, 
  ArrowLeft,
  X,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Compass,
  Activity,
  Layers,
  Lock,
  CheckSquare,
  Sliders,
  Target,
  User,
  LogOut,
  FileText,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function StratumPage() {
  const { 
    activeTab, 
    setActiveTab, 
    beginnerMode, 
    copilotVisible,
    toggleCopilotVisible,
    copilotOpen,
    toggleCopilotOpen,
    userPurchasedAccounts,
    activeAccountId,
    setAccountModalOpen,
    currentTheme,
    startTutorial,
    tutorialOpen,
    tutorialStep,
    nextTutorialStep,
    currentUser,
    setAuthModalOpen,
    setProfileModalOpen,
    logoutUser,
    fetchSession,
    soundEnabled,
    toggleSound
  } = useStratumStore();

  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];
  const activeAccount = userPurchasedAccounts.find((a) => a.id === activeAccountId) || userPurchasedAccounts[0];

  const [utcTime, setUtcTime] = useState<string>('');
  const [activeSession, setActiveSession] = useState<string>('NY SESSION');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().substring(11, 19) + ' UTC'
      );

      const h = now.getUTCHours();
      if (h >= 12 && h < 16) {
        setActiveSession('LON/NY OVERLAP');
      } else if (h >= 12 && h < 21) {
        setActiveSession('NEW YORK OPEN');
      } else if (h >= 7 && h < 16) {
        setActiveSession('LONDON OPEN');
      } else {
        setActiveSession('ASIAN RANGE');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    fetchSession();
    return () => clearInterval(interval);
  }, [fetchSession]);

  // WORKSTATION / FULL TERMINAL VIEW (When user clicks "Open live terminal" or any screen)
  const isWorkstation = activeTab === 'TERMINAL' || activeTab === 'PLAYBOOK' || activeTab === 'RISK_ENGINE' || activeTab === 'CHECKLIST' || activeTab === 'SIMULATOR' || activeTab === 'JOURNAL';

  return (
    <>
      {isWorkstation ? (
        <div
          className="min-h-screen text-[#1d1d1f] font-sans flex flex-col selection:bg-[#0071e3] selection:text-white transition-colors duration-300 bg-[#fbfbfd]"
        >
        {/* Terminal Header */}
        <header
          className="border-b sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300 relative overflow-visible bg-white/80 dark:bg-[#0a0b0e]/85 border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7]"
        >
          {/* Ambient Top Theme Accent Line */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none opacity-40"
            style={{
              background: `linear-gradient(90deg, transparent, ${activeTheme.primaryColor}, transparent)`
            }}
          />
          <div className="w-full max-w-[1728px] mx-auto px-2 sm:px-3 lg:px-4 h-12 flex items-center justify-between gap-1 sm:gap-2 overflow-visible">
            
            {/* Left: Close Terminal Button & Stratum Brand */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
              <button
                onClick={() => setActiveTab('LANDING')}
                className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#ff3b30] dark:hover:text-[#ff453a] px-2 sm:px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#ff3b30]/10 border border-black/[0.08] dark:border-white/[0.1] hover:border-[#ff3b30]/20 transition-all shrink-0 cursor-pointer shadow-sm group"
                title="Close Terminal and return to landing page"
                aria-label="Close Terminal"
              >
                <X className="w-3.5 h-3.5 text-[#6e6e73] dark:text-[#86868b] group-hover:text-[#ff3b30] dark:group-hover:text-[#ff453a] transition-colors shrink-0" />
                <span className="whitespace-nowrap hidden 2xl:inline">Close Terminal</span>
                <span className="whitespace-nowrap 2xl:hidden">Close</span>
              </button>
              <button
                onClick={() => setActiveTab('LANDING')}
                className="hover:opacity-90 transition-opacity text-left shrink-0"
                title="Stratum Institutional Platform"
              >
                <StratumLogo
                  size="xs"
                  showBadge={true}
                  badgeText="PRO"
                  subtitle="WORKSTATION"
                  hideTextOnMobile={true}
                />
              </button>
            </div>

            {/* Screen Tabs (6 Screens) - Apple Segmented Pill Control */}
            <div className="flex items-center gap-0.5 bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] shadow-inner shrink-0 whitespace-nowrap">
              <button
                onClick={() => setActiveTab('TERMINAL')}
                className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-[11.5px] font-medium transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'TERMINAL'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.08] dark:border-white/[0.15]'
                    : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="Terminal (Market Telemetry & Order Book)"
              >
                <Activity className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'TERMINAL' ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'}`} />
                <span className="whitespace-nowrap">Terminal</span>
              </button>
              <button
                onClick={() => setActiveTab('PLAYBOOK')}
                className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-[11.5px] font-medium transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'PLAYBOOK'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.08] dark:border-white/[0.15]'
                    : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="Strategy Playbooks (Turtle Soup, Judas Swing, Silver Bullet)"
              >
                <BookOpen className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'PLAYBOOK' ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'}`} />
                <span className="whitespace-nowrap">Playbook</span>
              </button>
              <button
                onClick={() => setActiveTab('RISK_ENGINE')}
                className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-[11.5px] font-medium transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'RISK_ENGINE'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.08] dark:border-white/[0.15]'
                    : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="Prop Risk Engine & Rules"
              >
                <Calculator className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'RISK_ENGINE' ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'}`} />
                <span className="whitespace-nowrap hidden lg:inline">Risk Engine</span>
                <span className="whitespace-nowrap lg:hidden">Risk</span>
              </button>
              <button
                onClick={() => setActiveTab('CHECKLIST')}
                className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-[11.5px] font-medium transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'CHECKLIST'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.08] dark:border-white/[0.15]'
                    : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="Pre-Flight Gatekeeper"
              >
                <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'CHECKLIST' ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'}`} />
                <span className="whitespace-nowrap">Gatekeeper</span>
              </button>
              <button
                onClick={() => setActiveTab('SIMULATOR')}
                className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-[11.5px] font-medium transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'SIMULATOR'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.08] dark:border-white/[0.15]'
                    : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="Drawdown Simulator"
              >
                <Sliders className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'SIMULATOR' ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'}`} />
                <span className="whitespace-nowrap">Simulator</span>
              </button>
              <button
                onClick={() => setActiveTab('JOURNAL')}
                className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1 rounded-full text-[11px] xl:text-[11.5px] font-medium transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'JOURNAL'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.08] dark:border-white/[0.15]'
                    : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title="Institutional Trade Journal & Performance Analytics"
              >
                <FileText className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'JOURNAL' ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'}`} />
                <span className="whitespace-nowrap">Journal</span>
              </button>
            </div>

            {/* Right Header: Tour, Sound, Theme, Copilot, Account, User */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap">
              {/* Real-time UTC & Session (Only on ultra-wide screens) */}
              <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[11px] text-[#6e6e73] dark:text-[#86868b]">
                <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {activeSession}
                </span>
                <span className="text-black/20 dark:text-white/20">|</span>
                <span className="font-mono-data">{utcTime || '14:32:00 UTC'}</span>
              </div>

              {/* Interactive Tour Button */}
              <button
                onClick={startTutorial}
                className="w-7 h-7 2xl:w-auto 2xl:px-2.5 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-all shrink-0 cursor-pointer font-medium flex items-center justify-center gap-1"
                title="Take interactive tour of Stratum features"
              >
                <Compass className="w-3.5 h-3.5 text-[#0071e3] shrink-0" />
                <span className="hidden 2xl:inline font-medium">Tour</span>
              </button>

              {/* Sound Audio Telemetry Toggle */}
              <button
                onClick={toggleSound}
                className={`w-7 h-7 rounded-full border transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                  soundEnabled
                    ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-[#2997ff] shadow-sm'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] border-black/[0.08] dark:border-white/[0.1] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title={soundEnabled ? "Audio Telemetry Enabled (Click to Mute)" : "Audio Telemetry Muted (Click to Unmute)"}
                aria-label="Toggle Sound Effects"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff] shrink-0" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 opacity-70 shrink-0" />
                )}
              </button>

              {/* Dark / Light Mode Toggle (Compact Apple Icon Toggle) */}
              <div id="tutorial-theme-selector" className="flex items-center shrink-0">
                <ThemeSelector compact={true} />
              </div>

              {/* Desk Copilot HUD Toggle — Toggles the moving copilot button on/off */}
              <button
                id="tutorial-coach-toggle"
                onClick={toggleCopilotVisible}
                className={`w-7 h-7 2xl:w-auto 2xl:px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                  copilotVisible
                    ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-[#2997ff] shadow-sm'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] border-black/[0.08] dark:border-white/[0.1] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title={copilotVisible ? "Hide Moving Copilot Button" : "Show Moving Copilot Button"}
                aria-label="Toggle Moving Desk Copilot Button"
              >
                <Bot className={`w-3.5 h-3.5 shrink-0 ${copilotVisible ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-80'}`} />
                <span className="hidden 2xl:inline text-[11px]">Copilot</span>
              </button>

              {/* Account Capsule */}
              <button
                id="tutorial-account-capsule"
                onClick={() => setAccountModalOpen(true)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.1] text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-all shadow-sm shrink-0 cursor-pointer font-medium"
                title="Switch active prop account or adjust parameters"
              >
                <span className="text-[#1d1d1f] dark:text-white max-w-[65px] lg:max-w-[85px] 2xl:max-w-[120px] truncate">
                  {activeAccount?.accountNickname || 'Prop Account'}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#86868b] font-medium hidden 2xl:inline-block shrink-0">
                  {activeAccount?.instrumentType || 'CFD'}
                </span>
              </button>

              {/* User Authentication in Workstation Header */}
              <div className="flex items-center gap-1 pl-1 border-l border-black/[0.08] dark:border-white/[0.1] shrink-0">
                {currentUser ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setProfileModalOpen(true)}
                      className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[11px] text-[#1d1d1f] dark:text-[#f5f5f7] cursor-pointer transition-all"
                      title={`Profile & Security (${currentUser.email})`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#0071e3] flex items-center justify-center text-[9px] font-bold text-white relative shrink-0">
                        {(currentUser.name || currentUser.email)[0].toUpperCase()}
                        {currentUser.twoFactorEnabled === 1 && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#30d158] ring-1 ring-white dark:ring-black" title="2FA Active" />
                        )}
                      </div>
                      <span className="max-w-[50px] lg:max-w-[70px] 2xl:max-w-[90px] truncate text-[11px] font-medium text-[#6e6e73] dark:text-[#a1a1a6] hidden sm:inline">
                        {currentUser.name || currentUser.email.split('@')[0]}
                      </span>
                    </button>
                    <button
                      onClick={() => logoutUser()}
                      className="p-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#ff3b30] dark:hover:text-[#ff453a] hover:bg-[#ff3b30]/10 transition-all cursor-pointer shrink-0"
                      title="Log Out of Stratum"
                      aria-label="Log Out"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAuthModalOpen(true, 'LOGIN')}
                      className="px-2 py-1 rounded-full text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-all cursor-pointer font-medium"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => setAuthModalOpen(true, 'SIGNUP')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all cursor-pointer shadow-sm"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* Live Market Telemetry Ticker Bar */}
        <MarketTickerBar />

        {/* Full Terminal View Content */}
        <div className="max-w-[1728px] mx-auto w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 space-y-6 flex-1">
          {activeTab === 'TERMINAL' && (
            <div className="space-y-6">
              <div id="tutorial-session-radar">
                <SessionRadar />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div id="tutorial-tradingview">
                    <TradingViewChart />
                  </div>
                  <div id="tutorial-asset-bias">
                    <AssetBiasMatrix />
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <div id="tutorial-news-hazard">
                    <NewsHazardIndex />
                  </div>
                  <div id="tutorial-order-copier">
                    <FastOrderCopier />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PLAYBOOK' && (
            <div id="tutorial-playbook">
              <StrategyPlaybook />
            </div>
          )}

          {activeTab === 'RISK_ENGINE' && (
            <div id="tutorial-risk-engine">
              <PropRiskEngine />
            </div>
          )}

          {activeTab === 'CHECKLIST' && (
            <div id="tutorial-checklist">
              <PreFlightChecklist />
            </div>
          )}

          {activeTab === 'SIMULATOR' && (
            <div id="tutorial-simulator">
              <PropDrawdownSimulator />
            </div>
          )}

          {activeTab === 'JOURNAL' && (
            <div id="tutorial-journal">
              <TradeJournal />
            </div>
          )}
        </div>
      </div>
    ) : (
      <div
        className="min-h-screen bg-[#ffffff] text-[#1d1d1f] font-sans flex flex-col selection:bg-[#0071e3] selection:text-white transition-colors duration-300"
      >
        {/* 1. Header (Fixed 48px) */}
        <Header />

        <main className="max-w-[1728px] mx-auto w-full mt-12 bg-[#ffffff]">

        {/* ========================================================= */}
        {/* CHAPTER 1: HERO DISPLAY (FIRST VIEWPORT FOLD)             */}
        {/* ========================================================= */}
        <section
          id="overview"
          className="scroll-mt-12 px-4 sm:px-6 md:px-12 min-h-[calc(100vh-3rem)] flex flex-col justify-center items-center relative overflow-hidden py-12 sm:py-16 bg-[#ffffff]"
        >
          {/* Subtle Ambient Apple Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,113,227,0.06),transparent_75%)] pointer-events-none" />

          <div className="max-w-[1516px] w-full mx-auto relative z-10 flex flex-col items-center justify-center">
            
            {/* Monumental Centered Apple Hero Header */}
            <ScrollReveal direction="up" delay={60}>
              <div className="text-center max-w-4xl mx-auto">
                
                {/* Eyebrow Text */}
                <div id="tutorial-hero-badge" className="inline-block mb-4 sm:mb-5 cursor-default">
                  <span className="text-[11px] sm:text-xs text-[#6e6e73] dark:text-[#a1a1a6] tracking-wider uppercase font-semibold">
                    Layered Intelligence for Funded Traders
                  </span>
                </div>

                {/* Monumental Display Headline */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08] mb-4 sm:mb-5">
                  The command dashboard <br className="hidden sm:inline" />
                  for focused traders.
                </h1>

                {/* Soft Apple Secondary Subtitle */}
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#6e6e73] mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
                  Stratum turns scattered session factors, macro hazard news, and strict firm drawdown rules into one calm dashboard for prop traders.
                </p>

                {/* Apple Signature Pill CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                  <button
                    id="tutorial-launch-terminal-btn"
                    onClick={() => {
                      setActiveTab('TERMINAL');
                      if (tutorialOpen && tutorialStep === 2) {
                        nextTutorialStep();
                      }
                    }}
                    className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium shadow-[0_4px_18px_rgba(0,113,227,0.32)] hover:shadow-[0_6px_24px_rgba(0,113,227,0.45)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Open Workstation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('preview');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] border border-black/[0.08] hover:border-black/[0.16] px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    Preview terminal
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('principles');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] border border-black/[0.08] hover:border-black/[0.16] px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    Explore layers
                  </button>

                  <button
                    onClick={startTutorial}
                    className="rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] border border-black/[0.08] hover:border-black/[0.16] px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 flex items-center gap-2 shadow-sm"
                    title="Take guided interactive tour"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>Take Tour</span>
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Apple Editorial Photographic Showcase Card */}
            <ScrollReveal direction="up" delay={100} className="w-full max-w-4xl mx-auto mt-8 sm:mt-10 px-2 sm:px-0">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-black/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.07)] bg-white group">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img 
                    src="/images/trading-desk.jpg" 
                    alt="Apple Minimalist Institutional Trading Desk"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    loading="eager"
                  />
                  {/* Apple Subtle Top Rim Light */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
                  
                  {/* Floating Telemetry Label */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-[11px] sm:text-xs font-medium text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] tracking-wide">
                    <span>Studio Display &bull; Multi-Screen Terminal</span>
                  </div>

                  <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/40 shadow-sm text-[11px] font-medium text-[#1d1d1f]">
                    <span className="text-[#0071e3] font-semibold">24h UTC Sync</span>
                    <span className="text-[#6e6e73]">&bull;</span>
                    <span>Zero Discretionary Tilt</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Scroll Prompt to Telemetry Preview */}
            <ScrollReveal direction="up" delay={140}>
              <button
                onClick={() => {
                  const el = document.getElementById('preview');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group mt-10 sm:mt-12 inline-flex flex-col items-center gap-2 text-[11px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer"
                title="Scroll down to inspect live workstation preview"
              >
                <span className="tracking-widest uppercase text-[10px] font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                  Explore Telemetry
                </span>
                <div className="w-7 h-7 rounded-full border border-black/[0.1] flex items-center justify-center bg-black/[0.03] group-hover:bg-black/[0.07] transition-all group-hover:border-black/[0.2] shadow-sm animate-bounce">
                  <ArrowRight className="w-3.5 h-3.5 text-[#0071e3] rotate-90" />
                </div>
              </button>
            </ScrollReveal>

          </div>
        </section>

        {/* ========================================================= */}
        {/* CHAPTER 1.5: WORKSTATION TELEMETRY SIMULATION             */}
        {/* ========================================================= */}
        <section
          id="preview"
          className="scroll-mt-12 px-4 sm:px-6 md:px-12 border-t border-black/[0.06] py-14 sm:py-20 md:py-24 bg-[#fbfbfd] min-h-[calc(100vh-3rem)] flex flex-col justify-center relative overflow-hidden"
        >
          <div className="max-w-[1516px] w-full mx-auto">
            
            <ScrollReveal direction="up">
              <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                <div className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1.5">
                  Interactive Telemetry
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] leading-tight mb-2">
                  Institutional telemetry in real-time.
                </h2>
                <p className="text-xs sm:text-sm text-[#6e6e73] max-w-xl mx-auto leading-relaxed font-normal">
                  Session radar tracking, macro hazard blackout zones, and codified prop firm risk guardrails unified in one view.
                </p>
              </div>
            </ScrollReveal>

            {/* Apple macOS Display Frame with Silver Bezel */}
            <ScrollReveal direction="up" delay={120}>
              <div className="relative mx-auto max-w-[1516px]">
                {/* Subtle Apple display ambient backlight */}
                <div className="absolute -inset-1 bg-gradient-to-b from-[#0071e3]/10 via-black/[0.02] to-transparent rounded-[32px] sm:rounded-[38px] blur-xl pointer-events-none opacity-60" />
                
                {/* Display enclosure */}
                <div className="relative rounded-[28px] sm:rounded-[34px] border border-black/[0.1] bg-[#f5f5f7] backdrop-blur-3xl p-2 sm:p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_30px_90px_rgba(0,0,0,0.08)]">
                  {/* macOS titlebar */}
                  <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-black/[0.06] mb-1.5 text-[11px] text-[#6e6e73]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] inline-block" />
                      </div>
                      <span className="hidden sm:inline font-mono-data text-[10px] text-[#86868b] ml-2">stratum-workstation.app</span>
                    </div>
                    <div className="font-medium text-[#1d1d1f] text-[11px] tracking-tight">
                      Stratum Workstation &mdash; Telemetry
                    </div>
                    <div className="hidden sm:block w-36" />
                  </div>

                  {/* Interactive Terminal Mockup */}
                  <HeroTerminalMockup />
                </div>
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* ========================================================= */}
        {/* CHAPTER 2: ARCHITECTURE OF DISCIPLINE (3 Bento Cards)     */}
        {/* ========================================================= */}
        <section id="principles" className="scroll-mt-12 px-4 sm:px-6 md:px-12 border-t border-black/[0.06] py-14 sm:py-20 md:py-24 bg-[#ffffff] min-h-[calc(100vh-3rem)] flex flex-col justify-center">
          <div className="max-w-[1516px] w-full mx-auto">
            
            <ScrollReveal direction="up">
              <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7">
                <div className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1.5">
                  Foundations of Longevity
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] leading-tight mb-2">
                  Operating rhythm, simplified.<br className="hidden sm:inline" />
                  The architecture of a disciplined trader.
                </h2>
                <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed max-w-xl mx-auto font-normal">
                  Prop accounts are lost to discretionary tilt, not market conditions. Stratum imposes structured mathematical boundaries.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              
              {/* Illustration 1: Unified View */}
              <ScrollReveal direction="up" delay={100} className="h-full">
                <div
                  onClick={() => setActiveTab('TERMINAL')}
                  className="interactive-card border border-black/[0.08] hover:border-black/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white hover:bg-[#fafafc] flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] group cursor-pointer h-full relative overflow-hidden transition-all duration-300"
                  title="Click to launch Consolidated Workstation HUD"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.6), transparent)'
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-[#0071e3]" />
                      <span className="text-[11px] font-semibold tracking-wider text-[#6e6e73] uppercase">Unified View</span>
                    </div>

                    {/* Diagram */}
                    <div className="border border-black/[0.06] rounded-xl bg-[#090a0f] p-2 relative h-[145px] sm:h-[155px] flex items-center justify-center overflow-hidden mb-3.5 group-hover:border-black/[0.14] transition-all">
                      <div className="w-full h-full dot-pattern flex items-center justify-center relative">
                        <svg viewBox="0 0 320 180" className="w-full h-full" fill="none">
                          <rect x="4" y="4" width="312" height="172" rx="4" stroke="#27272a" strokeWidth="0.75" fill="#090a0f" />
                          <rect x="10" y="10" width="300" height="22" rx="3" stroke="#27272a" strokeWidth="0.5" fill="#11131a" />
                          <circle cx="18" cy="21" r="2.5" fill="#30d158" />
                          <text x="25" y="24" fill="#e4e4e7" fontSize="7" fontFamily="monospace" fontWeight="bold">SESSION RADAR (UTC)</text>
                          <text x="135" y="24" fill="#71717a" fontSize="6" fontFamily="monospace">ASIA [DONE]</text>
                          <text x="190" y="24" fill="#71717a" fontSize="6" fontFamily="monospace">LDN [SWEEP]</text>
                          <rect x="240" y="13" width="62" height="15" rx="2" fill="#30d158" fillOpacity="0.15" stroke="#30d158" strokeWidth="0.5" />
                          <text x="248" y="24" fill="#30d158" fontSize="6" fontFamily="monospace" fontWeight="bold">NY EXPANSION</text>

                          <rect x="10" y="38" width="185" height="130" rx="3" stroke="#27272a" strokeWidth="0.5" fill="#0d0e14" />
                          <text x="16" y="49" fill="#a1a1aa" fontSize="6.5" fontFamily="monospace" fontWeight="bold">EUR/USD 15M &bull; DISCOUNT FVG</text>
                          <line x1="32" y1="56" x2="32" y2="86" stroke="#ff453a" strokeWidth="1" />
                          <rect x="28" y="62" width="8" height="18" fill="#ff453a" />
                          <line x1="52" y1="72" x2="52" y2="118" stroke="#ff453a" strokeWidth="1" />
                          <rect x="48" y="78" width="8" height="26" fill="#ff453a" />
                          <rect x="60" y="84" width="125" height="22" fill="#0071e3" fillOpacity="0.10" stroke="#0071e3" strokeWidth="0.75" strokeDasharray="3 2" />
                          <text x="66" y="97" fill="#2997ff" fontSize="6" fontFamily="monospace" fontWeight="bold">DISCOUNT FVG (1.0840)</text>
                          <line x1="72" y1="80" x2="72" y2="110" stroke="#30d158" strokeWidth="1" />
                          <rect x="68" y="82" width="8" height="22" fill="#30d158" />
                          <line x1="92" y1="70" x2="92" y2="98" stroke="#30d158" strokeWidth="1" />
                          <rect x="88" y="74" width="8" height="18" fill="#30d158" />
                          <line x1="16" y1="94" x2="190" y2="94" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 2" />
                          <text x="135" y="91" fill="#ffffff" fontSize="5.5" fontFamily="monospace">ENTRY: 1.0842</text>
                          <line x1="16" y1="64" x2="190" y2="64" stroke="#30d158" strokeWidth="0.75" strokeDasharray="2 2" />
                          <text x="130" y="61" fill="#30d158" fontSize="5.5" fontFamily="monospace">TP 1:2: 1.0890</text>
                          <line x1="16" y1="122" x2="190" y2="122" stroke="#ff453a" strokeWidth="0.75" strokeDasharray="2 2" />
                          <text x="135" y="129" fill="#ff453a" fontSize="5.5" fontFamily="monospace">SL: 1.0818</text>

                          <rect x="202" y="38" width="108" height="60" rx="3" stroke="#27272a" strokeWidth="0.5" fill="#0d0e14" />
                          <text x="210" y="52" fill="#ff453a" fontSize="6" fontFamily="monospace" fontWeight="bold">NEWS HAZARD SHIELD</text>
                          <rect x="208" y="58" width="96" height="18" rx="2" fill="#ff453a" fillOpacity="0.12" stroke="#ff453a" strokeWidth="0.5" />
                          <text x="213" y="70" fill="#ff8080" fontSize="6" fontFamily="monospace" fontWeight="bold">FOMC: -14m FREEZE</text>
                          <text x="208" y="90" fill="#71717a" fontSize="5" fontFamily="monospace">SLIPPAGE SPREAD PROTECT</text>

                          <rect x="202" y="104" width="108" height="64" rx="3" stroke="#27272a" strokeWidth="0.5" fill="#0d0e14" />
                          <text x="208" y="116" fill="#a1a1aa" fontSize="6.5" fontFamily="monospace" fontWeight="bold">25% BUFFER GUARDRAIL</text>
                          <text x="208" y="128" fill="#e4e4e7" fontSize="7.5" fontFamily="monospace" fontWeight="bold">RUNWAY: $2,200</text>
                          <rect x="208" y="133" width="96" height="4" rx="2" fill="#27272a" />
                          <rect x="208" y="133" width="60" height="4" rx="2" fill="#30d158" />
                          <rect x="208" y="143" width="96" height="18" rx="2" fill="#0071e3" fillOpacity="0.12" stroke="#0071e3" strokeWidth="0.5" />
                          <text x="214" y="155" fill="#2997ff" fontSize="6.5" fontFamily="monospace" fontWeight="bold">LOT SIZE: 2.14 LOTS</text>
                        </svg>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f] tracking-tight mb-1">
                      Consolidated Workstation HUD
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#6e6e73] leading-relaxed">
                      Sessions, macro hazard indices, and firm buffers merged into a single calm operational canvas.
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-black/[0.06] mt-3 flex items-center justify-between text-xs">
                    <span className="font-mono-data text-[9px] text-[#86868b] uppercase">WORKSTATION HUD</span>
                    <span className="text-[#0071e3] font-medium flex items-center gap-1 group-hover:underline text-xs">
                      Open Workstation <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Illustration 2: Disciplined Focus & Decision Graph */}
              <ScrollReveal direction="up" delay={200} className="h-full">
                <div
                  onClick={() => setActiveTab('PLAYBOOK')}
                  className="interactive-card border border-black/[0.08] hover:border-black/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white hover:bg-[#fafafc] flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] group cursor-pointer h-full relative overflow-hidden transition-all duration-300"
                  title="Click to explore Codified Strategy Playbooks"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.6), transparent)'
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-[#0071e3]" />
                      <span className="text-[11px] font-semibold tracking-wider text-[#6e6e73] uppercase">Disciplined Focus</span>
                    </div>

                    {/* High Quality Editorial Photo Header */}
                    <div className="rounded-xl overflow-hidden border border-black/[0.06] relative h-[145px] sm:h-[155px] mb-3.5 group-hover:border-black/[0.14] transition-all bg-[#f5f5f7]">
                      <img 
                        src="/images/trader-focus.jpg" 
                        alt="Disciplined Trader with MacBook Pro and Risk Playbook"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono-data text-white">
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/20">RULE ENGINE</span>
                        <span className="text-[#30d158] font-bold">✓ ZERO DISCRETION</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f] tracking-tight mb-1">
                      Rule Validation Trees
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#6e6e73] leading-relaxed">
                      Automated validation evaluating DXY inverse correlations, order block discount bias, and spread allowances.
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-black/[0.06] mt-3 flex items-center justify-between text-xs">
                    <span className="font-mono-data text-[9px] text-[#86868b] uppercase">PLAYBOOKS</span>
                    <span className="text-[#0071e3] font-medium flex items-center gap-1 group-hover:underline text-xs">
                      Explore playbooks <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Illustration 3: Automated 24h Session Rhythm */}
              <ScrollReveal direction="up" delay={300} className="h-full">
                <div
                  onClick={() => setActiveTab('TERMINAL')}
                  className="interactive-card border border-black/[0.08] hover:border-black/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white hover:bg-[#fafafc] flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] group cursor-pointer h-full relative overflow-hidden transition-all duration-300"
                  title="Click to inspect Session Radar & Killzones"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.6), transparent)'
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-[#0071e3]" />
                      <span className="text-[11px] font-semibold tracking-wider text-[#6e6e73] uppercase">Automated Rhythm</span>
                    </div>

                    {/* High Quality Editorial Photo Header */}
                    <div className="rounded-xl overflow-hidden border border-black/[0.06] relative h-[145px] sm:h-[155px] mb-3.5 group-hover:border-black/[0.14] transition-all bg-[#f5f5f7]">
                      <img 
                        src="/images/session-radar.jpg" 
                        alt="Global Financial Session Centers London and New York"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono-data text-white">
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/20">LONDON / NY OVERLAP</span>
                        <span className="text-[#2997ff] font-bold">12:00-16:00 UTC</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f] tracking-tight mb-1">
                      Automated 24-Hour Rhythm
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#6e6e73] leading-relaxed">
                      24-hour UTC synchronization aligning execution exclusively with institutional liquidity expansion windows.
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-black/[0.06] mt-3 flex items-center justify-between text-xs">
                    <span className="font-mono-data text-[9px] text-[#86868b] uppercase">SESSION RADAR</span>
                    <span className="text-[#0071e3] font-medium flex items-center gap-1 group-hover:underline text-xs">
                      Open session radar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CHAPTER 3: EXECUTION CADENCE & TRADER VALIDATION         */}
        {/* ========================================================= */}
        <section id="cadence" className="scroll-mt-12 px-4 sm:px-6 md:px-12 border-t border-black/[0.06] py-14 sm:py-20 md:py-24 bg-[#fbfbfd] min-h-[calc(100vh-3rem)] flex flex-col justify-center relative overflow-hidden">
          <div className="max-w-[1516px] w-full mx-auto">
            
            <ScrollReveal direction="up">
              <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
                <div className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1.5">
                  Execution Cadence
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] mb-2">
                  From pre-session preparation to clean risk exits
                </h2>
                <p className="text-xs sm:text-sm text-[#6e6e73] max-w-md mx-auto">
                  Click any stage to enter the dedicated tool inside the workstation.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              
              {/* Node 1 */}
              <ScrollReveal direction="up" delay={50} className="h-full">
                <div
                  onClick={() => setActiveTab('TERMINAL')}
                  className="interactive-card border border-black/[0.08] hover:border-black/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white hover:bg-[#fafafc] flex flex-col items-center text-center shadow-[0_6px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.07)] group cursor-pointer h-full relative overflow-hidden transition-all duration-300"
                  title="Click to launch Session Radar in Workstation"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.6), transparent)'
                    }}
                  />
                  <div className="w-8 h-8 rounded-full bg-black/[0.04] border border-black/[0.08] mb-2.5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#1d1d1f]" />
                  </div>
                  <div className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-0.5">01 &bull; Session Sync</div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] tracking-tight mb-1">Killzone Timing</h3>
                  <p className="text-xs text-[#6e6e73] leading-relaxed flex-1">Scan Tokyo range accumulation and London open displacement.</p>
                  <div className="mt-3 text-xs text-[#0071e3] font-medium flex items-center gap-1 group-hover:underline">
                    Open in Workstation <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </ScrollReveal>

              {/* Node 2 - Macro Shield with Photo Feature */}
              <ScrollReveal direction="up" delay={150} className="h-full">
                <div
                  onClick={() => setActiveTab('TERMINAL')}
                  className="interactive-card border border-black/[0.08] hover:border-black/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white hover:bg-[#fafafc] flex flex-col items-center text-center shadow-[0_6px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.07)] group cursor-pointer h-full relative overflow-hidden transition-all duration-300"
                  title="Click to launch Macro Hazard Shield in Workstation"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255, 69, 58, 0.6), transparent)'
                    }}
                  />
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-[#ff453a]/30 mb-2 flex items-center justify-center shadow-sm relative group-hover:scale-110 transition-transform">
                    <img 
                      src="/images/macro-shield.jpg" 
                      alt="Macro News Shield"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#ff453a]/15" />
                  </div>
                  <div className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-0.5">02 &bull; Hazard Filter</div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] tracking-tight mb-1">Macro Blackout</h3>
                  <p className="text-xs text-[#6e6e73] leading-relaxed flex-1">Lock execution 15m before high-slippage CPI &amp; NFP releases.</p>
                  <div className="mt-3 text-xs text-[#0071e3] font-medium flex items-center gap-1 group-hover:underline">
                    Open in Workstation <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </ScrollReveal>

              {/* Node 3 */}
              <ScrollReveal direction="up" delay={250} className="h-full">
                <div
                  onClick={() => setActiveTab('PLAYBOOK')}
                  className="interactive-card border border-black/[0.08] hover:border-black/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white hover:bg-[#fafafc] flex flex-col items-center text-center shadow-[0_6px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.07)] group cursor-pointer h-full relative overflow-hidden transition-all duration-300"
                  title="Click to launch Strategy Playbooks in Workstation"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.6), transparent)'
                    }}
                  />
                  <div className="w-8 h-8 rounded-full bg-black/[0.04] border border-black/[0.08] mb-2.5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#0071e3]" />
                  </div>
                  <div className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-0.5">03 &bull; Setup Match</div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] tracking-tight mb-1">Codified Playbook</h3>
                  <p className="text-xs text-[#6e6e73] leading-relaxed flex-1">Verify Asian Sweep, FVG, or VWAP criteria with fixed 1:2 R:R.</p>
                  <div className="mt-3 text-xs text-[#0071e3] font-medium flex items-center gap-1 group-hover:underline">
                    Open in Workstation <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </ScrollReveal>

              {/* Node 4 */}
              <ScrollReveal direction="up" delay={350} className="h-full">
                <div
                  onClick={() => setActiveTab('RISK_ENGINE')}
                  className="interactive-card border border-black/[0.08] hover:border-black/[0.18] rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white hover:bg-[#fafafc] flex flex-col items-center text-center shadow-[0_6px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.07)] group cursor-pointer h-full relative overflow-hidden transition-all duration-300"
                  title="Click to launch Prop Risk Engine in Workstation"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(48, 209, 88, 0.6), transparent)'
                    }}
                  />
                  <div className="w-8 h-8 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 mb-2.5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#30d158]" />
                  </div>
                  <div className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-0.5">04 &bull; Risk Shield</div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] tracking-tight mb-1">Guardrail Stamp</h3>
                  <p className="text-xs text-[#6e6e73] leading-relaxed flex-1">Calculate exact lot size with hard 25% buffer guardrail active.</p>
                  <div className="mt-3 text-xs text-[#0071e3] font-medium flex items-center gap-1 group-hover:underline">
                    Open in Workstation <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* Customer Quotes (Apple Clean White Cards) */}
        <section id="reviews" className="scroll-mt-12 px-4 sm:px-6 md:px-12 border-t border-black/[0.06] py-14 sm:py-20 md:py-24 bg-[#ffffff] min-h-[calc(100vh-3rem)] flex flex-col justify-center">
          <div className="max-w-[1516px] w-full mx-auto">
            <ScrollReveal direction="up">
              <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
                <div className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-1.5">
                  Institutional Conviction
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[#1d1d1f] mb-2">
                  Validated by funded traders
                </h2>
                <p className="text-xs sm:text-sm text-[#6e6e73] max-w-md mx-auto">
                  Over $12M+ in funded allocations protected with mathematical discipline.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={80}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
                
                {/* Left Quote */}
                <div className="lg:col-span-3 interactive-card relative overflow-hidden bg-white hover:bg-[#fafafc] text-[#1d1d1f] rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between min-h-[200px] border border-black/[0.08] hover:border-black/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.04)] group transition-all duration-300">
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(48, 209, 88, 0.6), transparent)'
                    }}
                  />
                  <p className="text-base sm:text-lg md:text-xl text-[#1d1d1f] leading-relaxed font-normal tracking-tight mb-4 sm:mb-5 max-w-2xl">
                    &ldquo;Stratum gave our prop team a unified lens. The drawdown buffer cushion and 25% guardrail completely eliminated revenge trading tilt.&rdquo;
                  </p>
                  <div className="pt-3.5 border-t border-black/[0.06] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#1d1d1f] text-sm">Mara Chen</div>
                      <div className="text-[#6e6e73] text-xs">Funded Trader &bull; $200,000 FTMO Account</div>
                    </div>
                    <span className="text-[10px] font-mono-data text-[#30d158] font-semibold px-2 py-0.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/20">
                      VERIFIED PASS
                    </span>
                  </div>
                </div>

                {/* Right Quote */}
                <div className="lg:col-span-2 interactive-card relative overflow-hidden bg-white hover:bg-[#fafafc] border border-black/[0.08] hover:border-black/[0.18] text-[#1d1d1f] rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between min-h-[200px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] group transition-all duration-300">
                  <div
                    className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.6), transparent)'
                    }}
                  />
                  <p className="text-base sm:text-lg md:text-xl text-[#1d1d1f] leading-relaxed font-normal tracking-tight mb-4 sm:mb-5">
                    &ldquo;It replaced three separate spreadsheets and manual lot calculators with instant, calm mathematical certainty.&rdquo;
                  </p>
                  <div className="pt-3.5 border-t border-black/[0.06] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#1d1d1f] text-sm">Ivo Patel</div>
                      <div className="text-[#6e6e73] text-xs">Managing Trader &bull; Meridian Prop Group</div>
                    </div>
                    <span className="text-[10px] font-mono-data text-[#0071e3] font-semibold px-2 py-0.5 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20">
                      INSTITUTIONAL
                    </span>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CHAPTER 5: FINAL CTA & COMPREHENSIVE FOOTER               */}
        {/* ========================================================= */}
        <section className="px-4 sm:px-6 md:px-12 border-t border-black/[0.06] py-16 sm:py-24 bg-[#fbfbfd] text-center min-h-[calc(100vh-3rem)] flex flex-col justify-center items-center relative overflow-hidden">
          {/* Apple Keynote Radial Spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,113,227,0.08),transparent_70%)] pointer-events-none" />

          <ScrollReveal direction="up" className="max-w-2xl mx-auto relative z-10">
            <div className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-widest mb-2">
              Zero Discretionary Bias
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08] mb-3">
              Built for clarity.<br />Ready today.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#6e6e73] mb-6 max-w-md mx-auto leading-relaxed font-normal">
              Eliminate catastrophic rule breaches. Join disciplined funded traders executing with mathematical conviction.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setActiveTab('TERMINAL')}
                className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-medium shadow-[0_4px_18px_rgba(0,113,227,0.32)] hover:shadow-[0_6px_24px_rgba(0,113,227,0.45)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Open Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('RISK_ENGINE')}
                className="rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] border border-black/[0.08] hover:border-black/[0.16] px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                Test risk rules
              </button>
            </div>
          </ScrollReveal>
        </section>

        {/* Apple Directory Footer */}
        <footer className="bg-[#ffffff] border-t border-black/[0.08] px-4 sm:px-6 md:px-12 pt-10 pb-10 text-[#6e6e73]">
          <div className="max-w-[1728px] w-full mx-auto grid grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8">
            
            <div className="col-span-2">
              <div className="mb-3">
                <StratumLogo size="sm" showBadge={false} variant="light" />
              </div>
              <p className="text-xs text-[#6e6e73] max-w-xs leading-relaxed font-normal">
                Layered intelligence for funded traders. Hard-coded firm drawdown parameters, session factor radar, economic shields, and institutional playbooks.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="font-semibold text-[#1d1d1f] tracking-tight mb-0.5">Platform</div>
              <button onClick={() => setActiveTab('TERMINAL')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">Workstation</button>
              <button onClick={() => setActiveTab('TERMINAL')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">Session Radar</button>
              <button onClick={() => setActiveTab('TERMINAL')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">News Shield</button>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="font-semibold text-[#1d1d1f] tracking-tight mb-0.5">Playbooks</div>
              <button onClick={() => setActiveTab('PLAYBOOK')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">Turtle Soup</button>
              <button onClick={() => setActiveTab('PLAYBOOK')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">Judas Swing</button>
              <button onClick={() => setActiveTab('PLAYBOOK')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">Silver Bullet</button>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="font-semibold text-[#1d1d1f] tracking-tight mb-0.5">Risk Rules</div>
              <button onClick={() => setActiveTab('RISK_ENGINE')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">FTMO Evaluation</button>
              <button onClick={() => setActiveTab('RISK_ENGINE')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">Topstep Sizing</button>
              <button onClick={() => setActiveTab('RISK_ENGINE')} className="text-left text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer">25% Buffer Guardrail</button>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="font-semibold text-[#1d1d1f] tracking-tight mb-0.5">Resources</div>
              <button 
                onClick={startTutorial} 
                className="text-left text-[#0071e3] hover:underline font-medium transition-colors cursor-pointer flex items-center gap-1"
                title="Start the interactive walkthrough tour"
              >
                <span>Interactive Tour</span>
                <Compass className="w-3 h-3 text-[#0071e3]" />
              </button>
              <a href="#" className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">Documentation</a>
              <a href="#" className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">API Endpoints</a>
              <a href="#" className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">Rule Specs</a>
            </div>

          </div>

          <div className="max-w-[1728px] w-full mx-auto mt-8 pt-4 border-t border-black/[0.08] flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#86868b] gap-2">
            <div>Copyright &copy; 2026 Stratum Terminal Inc. All rights reserved.</div>
          </div>
        </footer>

      </main>

    </div>
  )}

  {/* Shared Global Assistants & Modals - Persistent across all tabs so tutorial and assistants never unmount */}
  <BeginnerGuidanceAssistant />
  <PropAccountModal />
  <InteractiveTutorial />
  <AuthModal />
  <UserProfileModal />
</>
  );
}
