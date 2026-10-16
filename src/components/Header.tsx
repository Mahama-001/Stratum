'use client';

import React, { useEffect, useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES } from '@/lib/types';
import StratumLogo from '@/components/StratumLogo';
import ThemeSelector from '@/components/ThemeSelector';
import { Zap, LogOut, Menu, X, ArrowRight, Compass, Bot, Volume2, VolumeX } from 'lucide-react';

export default function Header() {
  const { 
    setActiveTab, 
    currentTheme,
    currentUser,
    setAuthModalOpen,
    setProfileModalOpen,
    logoutUser,
    fetchSession,
    startTutorial,
    copilotVisible,
    toggleCopilotVisible,
    soundEnabled,
    toggleSound
  } = useStratumStore();

  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];
  const [utcTime, setUtcTime] = useState<string>('');
  const [activeSession, setActiveSession] = useState<string>('NY SESSION');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navigateToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (useStratumStore.getState().activeTab !== 'LANDING') {
      setActiveTab('LANDING');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');

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

  const isLanding = useStratumStore.getState().activeTab === 'LANDING';

  return (
    <header
      className="w-full top-0 h-12 z-50 fixed backdrop-blur-xl transition-colors duration-300 bg-white/80 dark:bg-[#0a0b0e]/85 border-b border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7]"
    >
      <div className="flex justify-between items-center w-full px-3 sm:px-5 lg:px-6 max-w-[1600px] mx-auto h-full gap-2 sm:gap-3 lg:gap-4">
        
        {/* Left: Brand & Live Market Telemetry */}
        <div className="flex items-center gap-3.5 shrink-0 whitespace-nowrap">
          <button
            onClick={() => {
              setActiveTab('LANDING');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group hover:opacity-85 transition-opacity text-left shrink-0 whitespace-nowrap cursor-pointer"
            title="Stratum Institutional Platform"
          >
            <StratumLogo size="sm" showBadge={false} />
          </button>

          {/* Real-time Market Pulse & Clock */}
          <div className="hidden 2xl:flex items-center gap-2 pl-3 text-xs shrink-0 whitespace-nowrap border-l border-black/10 dark:border-white/10">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1]">
              <span className="text-[11px] font-mono-data whitespace-nowrap text-[#6e6e73] dark:text-[#a1a1a6]">
                {utcTime || '--:--:-- UTC'}
              </span>
              <span className="text-black/30 dark:text-white/30">&bull;</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap text-[#1d1d1f] dark:text-[#f5f5f7]">
                {activeSession}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Apple-style Clean Navigation Links */}
        <nav className="hidden lg:flex gap-3 xl:gap-5 2xl:gap-6 h-full items-center text-[12px] font-normal tracking-tight shrink-0 whitespace-nowrap text-[#1d1d1f]/75 dark:text-[#f5f5f7]/80">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('overview');
            }}
            className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer"
          >
            Overview
          </a>
          <a
            href="#preview"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('preview');
            }}
            className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer"
          >
            Preview
          </a>
          <a
            href="#principles"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('principles');
            }}
            className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer"
          >
            Architecture
          </a>
          <a
            href="#cadence"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('cadence');
            }}
            className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer"
          >
            Cadence
          </a>
          <a
            href="#reviews"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('reviews');
            }}
            className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer"
          >
            Traders
          </a>
        </nav>

        {/* Right: User Auth and Launch Terminal Pill CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0 whitespace-nowrap">

          {/* User Auth Section */}
          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs shrink-0 bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer text-[#1d1d1f] dark:text-[#f5f5f7]"
                title={`Profile & Security Settings: ${currentUser.email}`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold bg-[#1d1d1f] dark:bg-[#0071e3] text-white"
                >
                  {(currentUser.name || currentUser.email)[0].toUpperCase()}
                </div>
                <span className="max-w-[70px] sm:max-w-[100px] truncate text-[11px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {currentUser.name || currentUser.email.split('@')[0]}
                </span>
              </button>
              <button
                onClick={() => logoutUser()}
                className="p-1 sm:px-2 sm:py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 text-[11px] border border-black/10 dark:border-white/10 text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                title="Log Out of Stratum"
                aria-label="Log Out"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setAuthModalOpen(true, 'LOGIN')}
                className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-[12px] transition-colors cursor-pointer shrink-0 font-normal text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white"
              >
                Log In
              </button>
              <button
                onClick={() => setAuthModalOpen(true, 'SIGNUP')}
                className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-medium transition-all cursor-pointer shrink-0 text-[#1d1d1f] dark:text-white border border-black/15 dark:border-white/20 hover:border-black/30 dark:hover:border-white/35 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Interactive Tour Button */}
          <button
            onClick={startTutorial}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full transition-all shrink-0 cursor-pointer font-medium text-[11px] sm:text-[12px] border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7]"
            title="Start Interactive Tour"
          >
            <Compass className="w-3.5 h-3.5 text-[#0071e3] shrink-0" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          {/* Desk Copilot HUD Toggle — Toggles the moving copilot button */}
          <button
            onClick={toggleCopilotVisible}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-[11px] sm:text-[12px] font-medium transition-all shrink-0 cursor-pointer ${
              copilotVisible
                ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-[#2997ff] shadow-sm'
                : 'bg-black/[0.04] dark:bg-white/[0.06] border-black/[0.08] dark:border-white/[0.1] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
            title={copilotVisible ? "Hide Moving Copilot Button" : "Show Moving Copilot Button"}
            aria-label="Toggle Moving Desk Copilot Button"
          >
            <Bot className={`w-3.5 h-3.5 shrink-0 ${copilotVisible ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-80'}`} />
            <span className="hidden sm:inline text-[11px]">Copilot</span>
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

          {/* Dark / White Mode Toggle */}
          <div className="flex items-center shrink-0">
            <ThemeSelector compact={true} />
          </div>

          {/* Primary Launch Terminal Button (Apple Blue Pill) */}
          <button
            onClick={() => setActiveTab('TERMINAL')}
            className="text-[11px] sm:text-[12px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-medium transition-all shadow-sm flex items-center gap-1 sm:gap-1.5 active:scale-95 shrink-0 whitespace-nowrap cursor-pointer bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-[0_2px_10px_rgba(0,113,227,0.25)]"
          >
            <span className="hidden sm:inline">Launch Workstation</span>
            <span className="sm:hidden">Workstation</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden p-1.5 rounded-full border transition-colors focus-visible:ring-1 border-black/10 text-[#1d1d1f] hover:bg-black/5 focus-visible:ring-black"
          >
            {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation (When open) */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b backdrop-blur-2xl transition-all duration-200 animate-in slide-in-from-top-2 bg-white/95 border-black/[0.08] text-[#1d1d1f]"
        >
          <div className="px-4 py-4 space-y-3 font-mono-data text-xs">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  startTutorial();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer text-[#0071e3] hover:bg-black/5"
              >
                <Compass className="w-4 h-4 text-[#0071e3]" />
                <span>Interactive Tour</span>
              </button>
              <a
                href="#overview"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToSection('overview');
                }}
                className="px-3 py-2 rounded-lg transition-colors cursor-pointer text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/5"
              >
                Overview
              </a>
              <a
                href="#preview"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToSection('preview');
                }}
                className="px-3 py-2 rounded-lg transition-colors cursor-pointer text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/5"
              >
                Preview
              </a>
              <a
                href="#principles"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToSection('principles');
                }}
                className="px-3 py-2 rounded-lg transition-colors cursor-pointer text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/5"
              >
                Architecture
              </a>
              <a
                href="#cadence"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToSection('cadence');
                }}
                className="px-3 py-2 rounded-lg transition-colors cursor-pointer text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/5"
              >
                Cadence
              </a>
              <a
                href="#reviews"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToSection('reviews');
                }}
                className="px-3 py-2 rounded-lg transition-colors cursor-pointer text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-black/5"
              >
                Traders
              </a>
            </div>

            {/* Market Session Telemetry */}
            <div className="pt-2 border-t flex items-center justify-between text-[11px] px-3 border-black/[0.08] text-[#6e6e73]">
              <span className="font-medium text-[#1d1d1f]">
                {activeSession}
              </span>
              <span className="font-bold text-[#1d1d1f]">{utcTime}</span>
            </div>

            {/* Auth Actions in Drawer */}
            <div className="pt-2 border-t flex flex-col gap-2 border-black/[0.08]">
              {currentUser ? (
                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={() => {
                      setProfileModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="font-semibold truncate text-[#1d1d1f] hover:text-[#0071e3] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                    title="Open Profile & Security Settings"
                  >
                    <span>{currentUser.name || currentUser.email}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] font-normal">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      logoutUser();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff453a]/30 text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setAuthModalOpen(true, 'LOGIN');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-center rounded-lg border font-semibold border-black/10 text-[#1d1d1f] hover:bg-black/5"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalOpen(true, 'SIGNUP');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-center rounded-lg font-bold bg-[#0071e3] text-white hover:bg-[#0077ed]"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle in Mobile Drawer */}
            <div className="pt-2 border-t flex items-center justify-between px-2 border-black/[0.08]">
              <span className="text-[11px] text-[#6e6e73] font-medium">Appearance</span>
              <ThemeSelector />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
