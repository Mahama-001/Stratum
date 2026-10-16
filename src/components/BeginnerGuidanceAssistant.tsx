'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStratumStore } from '@/lib/store';
import { useAIChat, generateLiveSessionInsights, getCurrentKillzone } from '@/lib/ai';
import { STRATUM_THEMES } from '@/lib/types';
import {
  Bot,
  Terminal,
  X,
  Send,
  Square,
  Trash2,
  User,
  Compass,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Lightbulb,
  GripVertical
} from 'lucide-react';

import FormattedAIMessage from './FormattedAIMessage';

export default function BeginnerGuidanceAssistant() {
  const {
    beginnerMode,
    toggleBeginnerMode,
    copilotVisible,
    copilotOpen,
    setCopilotOpen,
    riskResult,
    userPurchasedAccounts,
    activeAccountId,
    selectedAsset,
    activeTab,
    currentTheme,
    startTutorial
  } = useStratumStore();

  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];
  const activeAccount = userPurchasedAccounts.find((a) => a.id === activeAccountId) || userPurchasedAccounts[0];

  const [activeView, setActiveView] = useState<'chat' | 'advice'>('chat');
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    moved: false,
  });
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
      moved: false,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (Math.hypot(dx, dy) > 5) {
        dragRef.current.moved = true;
      }
      // Clamping bounds: prevent button or console from exiting viewport
      const maxX = 30;
      const minX = -window.innerWidth + (copilotOpen ? 390 : 70);
      const maxY = Math.max(60, window.innerHeight / 2 - 60);
      const minY = -Math.max(60, window.innerHeight / 2 - 60);

      const newX = Math.min(maxX, Math.max(minX, dragRef.current.initX + dx));
      const newY = Math.min(maxY, Math.max(minY, dragRef.current.initY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = (ev: PointerEvent) => {
      setIsDragging(false);
      const totalDist = Math.hypot(ev.clientX - dragRef.current.startX, ev.clientY - dragRef.current.startY);
      if (totalDist <= 5) {
        dragRef.current.moved = false;
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useAIChat();

  const killzone = getCurrentKillzone();
  const recommendations = generateLiveSessionInsights();

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Focus input when panel opens
  useEffect(() => {
    if (copilotOpen && activeView === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [copilotOpen, activeView]);

  // Keyboard shortcut listener: Ctrl+K / Cmd+K to toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCopilotOpen(!copilotOpen);
      } else if (e.key === 'Escape' && copilotOpen) {
        setCopilotOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copilotOpen, setCopilotOpen]);

  // Hide if copilot is toggled off via the nav bar, or on marketing landing page
  if (!copilotVisible || activeTab === 'LANDING') return null;

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleQuickQuestion = (question: string) => {
    setActiveView('chat');
    sendMessage(question);
  };

  // Clean, focused suggestions based on active screen
  const getDynamicPrompts = (): string[] => {
    switch (activeTab) {
      case 'CHECKLIST':
        return [
          `Audit my pre-flight checklist for ${selectedAsset?.symbol || 'active pair'}`,
          `What is the difference between static and trailing drawdown?`,
          `Why does the 25% buffer guardrail protect my account?`
        ];
      case 'RISK_ENGINE':
        return [
          `Is my position size compliant with ${activeAccount?.firm || 'my prop firm'}?`,
          `How do I calculate exact position sizing for Forex or Futures?`,
          `How do I avoid trailing drawdown high-water mark traps?`
        ];
      case 'SIMULATOR':
        return [
          `What is the mathematical survival probability of my risk?`,
          `What is the formula for 1:2 Risk to Reward expectancy?`,
          `Explain the 2-strike daily shutdown rule`
        ];
      case 'PLAYBOOK':
        return [
          `What is a Fair Value Gap (FVG) and how do I trade it?`,
          `What is the difference between a BOS and a CHoCH?`,
          `How does DXY inverse correlation confirm my bias?`
        ];
      default:
        return [
          `What is a Fair Value Gap (FVG) and how do I trade it?`,
          `How does trailing drawdown work on funded accounts?`,
          `How does CPI or NFP news affect Gold and US Indices?`
        ];
    }
  };

  // ===========================
  // COLLAPSED: Small Sleek Docked Console Button
  // ===========================
  if (!copilotOpen) {
    return (
      <div
        ref={containerRef}
        className="fixed right-4 sm:right-5 z-[60]"
        style={{
          top: '50%',
          transform: `translate(${position.x}px, calc(-50% + ${position.y}px))`,
          touchAction: 'none',
        }}
      >
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onClick={(e) => {
            e.stopPropagation();
            if (!dragRef.current.moved) {
              setCopilotOpen(true);
            }
          }}
          className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-full cursor-pointer active:cursor-grabbing
                     bg-white/95 border border-black/[0.12] hover:border-black/[0.22]
                     hover:bg-white active:scale-95
                     transition-all duration-200 ease-out
                     flex items-center justify-center select-none shadow-[0_10px_25px_rgba(0,0,0,0.12)] backdrop-blur-3xl text-[#1d1d1f]"
          title="Stratum Desk Copilot — Click to open (Ctrl+K)"
          aria-label="Open Desk Copilot Console"
        >
          <Bot className="w-4 h-4 text-[#0071e3] group-hover:scale-105 transition-transform" />

          {/* Clean Floating Tooltip to the Left */}
          <div className="absolute right-full mr-2.5 px-2.5 py-1 rounded-md bg-white text-[#1d1d1f] text-[11px] font-medium tracking-tight whitespace-nowrap shadow-xl border border-black/[0.1] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 flex items-center gap-1.5">
            <span>Desk Copilot</span>
            <span className="text-[9px] font-mono-data text-[#6e6e73] bg-black/[0.05] px-1 py-0.5 rounded">Ctrl+K</span>
          </div>
        </button>
      </div>
    );
  }

  // ===========================
  // EXPANDED: Clean Institutional Desk Copilot
  // ===========================
  return (
    <div
      ref={containerRef}
      className="fixed right-4 z-[60] flex flex-col"
      style={{
        top: '50%',
        transform: `translate(${position.x}px, calc(-50% + ${position.y}px))`,
        maxHeight: 'min(620px, 85vh)',
      }}
    >
      <div
        className="w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] flex flex-col rounded-3xl overflow-hidden bg-white/95 dark:bg-[#161617]/95 backdrop-blur-3xl border border-black/[0.1] dark:border-white/[0.12] relative shadow-[0_25px_60px_rgba(0,0,0,0.14)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] text-[#1d1d1f] dark:text-[#f5f5f7] animate-fadeIn"
        style={{
          maxHeight: 'min(620px, 85vh)',
        }}
      >
        {/* Subtle Top Ambient Reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px] z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0, 113, 227, 0.5), transparent)'
          }}
        />

        {/* ─── Clean Header with Drag Handle ─── */}
        <div
          onPointerDown={handlePointerDown}
          className="flex items-center justify-between px-4 py-3 border-b border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] shrink-0 cursor-grab active:cursor-grabbing select-none"
          title="Drag to reposition console"
        >
          <div className="flex items-center gap-2 min-w-0">
            <GripVertical className="w-4 h-4 text-[#6e6e73]/60 dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white shrink-0" />
            <div className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-[#0071e3]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                Stratum Desk Copilot
              </div>
              <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono-data truncate">
                {selectedAsset?.symbol || 'EUR/USD'} &bull; ${riskResult.remainingDailyBufferDollar} Buffer
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
                title="Clear console log"
                aria-label="Clear chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setCopilotOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.08] hover:bg-[#ff3b30]/15 text-[#6e6e73] dark:text-[#86868b] hover:text-[#ff3b30] border border-black/[0.08] dark:border-white/[0.1] hover:border-[#ff3b30]/30 transition-all cursor-pointer shadow-sm group"
              title="Close Copilot (Esc)"
              aria-label="Close assistant"
            >
              <X className="w-3.5 h-3.5 transition-colors" />
            </button>
          </div>
        </div>

        {/* ─── Apple Segmented 2-Tab Switcher with Inline Close ─── */}
        <div className="px-3 pt-2.5 pb-2 shrink-0 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
          <div className="flex-1 flex items-center p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08]">
            <button
              onClick={() => setActiveView('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-mono-data font-medium transition-all cursor-pointer ${
                activeView === 'chat'
                  ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm border border-black/[0.08] dark:border-white/[0.1]'
                  : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#0071e3]" />
              Console
            </button>

            <button
              onClick={() => setActiveView('advice')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-mono-data font-medium transition-all cursor-pointer ${
                activeView === 'advice'
                  ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm border border-black/[0.08] dark:border-white/[0.1]'
                  : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Session Checks
              {recommendations.length > 0 && (
                <span className="w-4 h-4 rounded-full text-[9px] font-semibold flex items-center justify-center ml-0.5 bg-black/[0.08] dark:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {recommendations.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Close Button right next to the tab pills */}
          <button
            onClick={() => setCopilotOpen(false)}
            className="p-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#ff3b30]/15 text-[#6e6e73] dark:text-[#86868b] hover:text-[#ff3b30] border border-black/[0.08] dark:border-white/[0.08] transition-all cursor-pointer shrink-0"
            title="Close Copilot"
            aria-label="Close Copilot"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ─── Main Content Area ─── */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar min-h-[240px]">
          {/* TAB 1: Chat View */}
          {activeView === 'chat' && (
            <div className="flex flex-col h-full px-3 py-2 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <div className="w-8 h-8 rounded-lg bg-black/[0.04] border border-black/[0.08] flex items-center justify-center mb-2">
                    <Bot className="w-4 h-4 text-[#0071e3]" />
                  </div>
                  <p className="text-xs text-[#1d1d1f] font-bold mb-1">Query trading rules, buffer limits, or setups</p>
                  <p className="text-[10px] text-[#6e6e73] mb-3 max-w-[260px] leading-relaxed">
                    Direct quantitative lookup for prop firm rules, ICT concepts, session timing, and risk calculations.
                  </p>

                  <div className="space-y-1.5 w-full">
                    {getDynamicPrompts().map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickQuestion(prompt)}
                        className="w-full text-left px-2.5 py-1.5 rounded-md bg-black/[0.03] border border-black/[0.08] text-[11px] text-[#1d1d1f] hover:bg-black/[0.06] transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="leading-snug pr-2 truncate">{prompt}</span>
                        <ArrowRight className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-100 transition-all text-[#6e6e73]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded bg-black/[0.04] border border-black/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-[#0071e3]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg text-[11px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'font-medium bg-[#0071e3] text-white border-transparent'
                        : 'bg-black/[0.04] text-[#1d1d1f] border border-black/[0.06]'
                    }`}
                  >
                    {msg.content ? (
                      msg.role === 'assistant' ? (
                        <FormattedAIMessage content={msg.content} themeColor="#0071e3" />
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#6e6e73] py-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6e6e73] animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6e6e73] animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6e6e73] animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded bg-[#0071e3] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* TAB 2: Live Insights View */}
          {activeView === 'advice' && (
            <div className="p-3 space-y-2">
              <div className="text-[10px] font-mono-data text-[#6e6e73] mb-1 flex items-center justify-between">
                <span>Active Session Checks</span>
                <span className="text-[#1d1d1f] font-bold">{recommendations.length} Active</span>
              </div>

              {recommendations.map((rec) => {
                const borderClass =
                  rec.severity === 'CRITICAL' ? 'border-[#ff453a]/30 bg-[#ff453a]/05' :
                  rec.severity === 'WARNING' ? 'border-[#ff9f0a]/30 bg-[#ff9f0a]/05' :
                  'border-black/[0.08] bg-black/[0.02]';

                return (
                  <div key={rec.id} className={`p-2.5 rounded-xl border ${borderClass} space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#1d1d1f]">{rec.title}</h4>
                      <span className="text-[9px] font-mono-data font-bold uppercase text-[#6e6e73]">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3c3c43] leading-relaxed">
                      {rec.description}
                    </p>
                    {rec.actionQuery && (
                      <button
                        onClick={() => handleQuickQuestion(rec.actionQuery!)}
                        className="text-[10px] font-mono-data font-bold hover:underline flex items-center gap-1 cursor-pointer pt-0.5 text-[#0071e3]"
                      >
                        <span>Ask Co-Pilot about this</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Bottom Input Bar ─── */}
        <div className="px-3 py-2.5 border-t border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161617] shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="flex-1 flex items-center bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3 py-1.5 transition-colors focus-within:border-[#0071e3] dark:focus-within:border-[#2997ff] focus-within:bg-white dark:focus-within:bg-[#1e1f25]"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Query market rules, buffer limits, or setups..."
                className="flex-1 bg-transparent text-[11px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] dark:placeholder-[#8e8e93] outline-none font-sans"
                disabled={isStreaming}
              />
            </div>
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="w-8 h-8 rounded-md bg-black/[0.06] border border-black/[0.1] flex items-center justify-center text-[#1d1d1f] hover:bg-black/[0.1] transition-all cursor-pointer"
                title="Stop response"
              >
                <Square className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-all bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-30 disabled:bg-black/[0.04] disabled:text-[#86868b] cursor-pointer"
                title="Send query"
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Simple Footer */}
          <div className="flex items-center justify-between mt-1.5 px-0.5">
            <span className="text-[9px] font-mono-data text-[#6e6e73]">
              Stratum Desk &bull; Enter to query
            </span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={startTutorial}
                className="text-[9px] font-mono-data text-[#0071e3] hover:underline transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Compass className="w-2.5 h-2.5" /> Tour
              </button>
              <button
                onClick={() => setCopilotOpen(false)}
                className="text-[9px] font-mono-data text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer"
                title="Close Copilot console"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
