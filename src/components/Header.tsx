'use client';

import React, { useEffect, useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { PROP_FIRM_PRESETS } from '@/lib/riskEngine';
import { PropFirmKey } from '@/lib/types';
import { 
  ChevronDown, 
  CheckCircle2, 
  Terminal, 
  BookOpen, 
  Calculator, 
  Activity, 
  ShieldAlert, 
  Clock 
} from 'lucide-react';

export default function Header() {
  const { 
    activeTab, 
    setActiveTab, 
    selectedPresetKey, 
    setPropFirmPreset, 
    currentPreset, 
    accountBalance,
    riskResult
  } = useStratumStore();

  const [utcTime, setUtcTime] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().substring(11, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string, tab?: 'TERMINAL' | 'PLAYBOOK' | 'RISK_ENGINE') => {
    if (tab) setActiveTab(tab);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-[#070708] w-full top-0 h-[80px] border-b border-[#232426] z-50 fixed backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-6 max-w-[1728px] mx-auto h-full">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#9A9DA3] flex items-center justify-center text-white font-h3 font-bold text-sm">
            S
          </div>
          <div className="flex items-center gap-2">
            <span className="font-h3 text-xl font-bold tracking-tight text-[#e5e2e3]">Stratum</span>
            <span className="font-mono-data text-[9px] px-1.5 py-0.5 rounded bg-[#5E6BFF]/15 text-[#5E6BFF] border border-[#5E6BFF]/30 font-bold uppercase tracking-wider">
              PROP_v2.4
            </span>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex gap-7 h-full items-center text-sm">
          <button
            onClick={() => scrollToSection('hero-terminal', 'TERMINAL')}
            className={`font-medium transition-colors h-full flex items-center border-b-2 pt-1 ${
              activeTab === 'TERMINAL'
                ? 'text-[#50d8e9] border-[#50d8e9]'
                : 'text-[#9A9DA3] border-transparent hover:text-white'
            }`}
          >
            Live Terminal
          </button>

          <button
            onClick={() => scrollToSection('section-session-radar', 'TERMINAL')}
            className="text-[#9A9DA3] hover:text-white transition-colors h-full flex items-center font-medium"
          >
            Session Radar
          </button>

          <button
            onClick={() => scrollToSection('section-news-hazard', 'TERMINAL')}
            className="text-[#9A9DA3] hover:text-white transition-colors h-full flex items-center font-medium"
          >
            News Shield
          </button>

          <button
            onClick={() => scrollToSection('section-playbooks', 'PLAYBOOK')}
            className={`font-medium transition-colors h-full flex items-center border-b-2 pt-1 ${
              activeTab === 'PLAYBOOK'
                ? 'text-[#5E6BFF] border-[#5E6BFF]'
                : 'text-[#9A9DA3] border-transparent hover:text-white'
            }`}
          >
            Playbooks
          </button>

          <button
            onClick={() => scrollToSection('section-risk-engine', 'RISK_ENGINE')}
            className={`font-medium transition-colors h-full flex items-center border-b-2 pt-1 ${
              activeTab === 'RISK_ENGINE'
                ? 'text-[#10B981] border-[#10B981]'
                : 'text-[#9A9DA3] border-transparent hover:text-white'
            }`}
          >
            Risk Engine
            {riskResult.isBreachDanger && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
            )}
          </button>
        </nav>

        {/* Right CTA & Account Capsule */}
        <div className="flex items-center gap-3">
          
          {/* Quick Prop Firm Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#101112] hover:bg-[#161719] border border-[#232426] transition-colors"
            >
              <div className="text-left font-mono-data">
                <div className="text-[9px] text-[#9A9DA3] uppercase tracking-wider font-semibold">
                  {currentPreset.firm}
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  ${(accountBalance / 1000).toFixed(0)}k Tier
                  <ChevronDown className="w-3 h-3 text-[#9A9DA3]" />
                </div>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#101112] border border-[#232426] rounded-xl shadow-2xl p-2 z-50 inner-glow">
                <div className="text-[10px] text-[#9A9DA3] px-2 py-1 font-mono-data uppercase font-bold tracking-wider border-b border-[#232426]">
                  Select Prop Firm Tier
                </div>
                <div className="space-y-1 mt-1 max-h-72 overflow-y-auto">
                  {(Object.keys(PROP_FIRM_PRESETS) as PropFirmKey[]).map((key) => {
                    const preset = PROP_FIRM_PRESETS[key];
                    const isSelected = selectedPresetKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setPropFirmPreset(key);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#5E6BFF]/15 text-white border border-[#5E6BFF]/30'
                            : 'text-[#9A9DA3] hover:text-white hover:bg-[#1B1C1E]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">{preset.tierName}</div>
                          <div className="text-[10px] text-[#9A9DA3] font-mono-data">
                            {preset.dailyLossLimitPercent}% Daily / {preset.maxDrawdownPercent}% Max
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#50d8e9]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => scrollToSection('hero-terminal')}
            className="text-xs bg-white text-black px-4 py-2 rounded hover:bg-opacity-90 transition-colors font-bold shadow-sm"
          >
            Launch Terminal
          </button>
        </div>

      </div>
    </header>
  );
}
