'use client';

import { useState, useCallback, useRef } from 'react';
import { useStratumStore } from './store';
import { answerGeneralQuestion } from './copilotKnowledge';

// ─── Types ───
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type AnalysisType = 'risk' | 'setup' | 'session' | 'drawdown' | 'preflight';

export interface AIRecommendation {
  id: string;
  category: 'RISK' | 'SESSION' | 'NEWS' | 'SETUP' | 'DRAWDOWN';
  severity: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'INFO';
  title: string;
  description: string;
  actionQuery?: string;
  actionLabel?: string;
}

// ─── Current Killzone Calculator ───
export function getCurrentKillzone(now = new Date()): { name: string; isKillzone: boolean; description: string; hoursWindow: string } {
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const time = utcHour + utcMin / 60;

  if (time >= 7 && time < 10) {
    return { 
      name: 'London Open Killzone', 
      isKillzone: true, 
      hoursWindow: '07:00–10:00 UTC',
      description: 'Peak institutional EUR & GBP volume. Key Asian liquidity sweeps and Judas swings take shape.' 
    };
  } else if (time >= 13 && time < 16) {
    return { 
      name: 'New York Open Killzone', 
      isKillzone: true, 
      hoursWindow: '13:00–16:00 UTC',
      description: 'Highest volume macro window for US Indices (US30, NAS100) and major USD crosses.' 
    };
  } else if (time >= 15 && time < 17) {
    return { 
      name: 'London Close Killzone', 
      isKillzone: true, 
      hoursWindow: '15:00–17:00 UTC',
      description: 'European session square-off. Watch for algorithmic reversals or aggressive trend expansions.' 
    };
  } else if (time >= 0 && time < 6) {
    return { 
      name: 'Asian Range Accumulation', 
      isKillzone: false, 
      hoursWindow: '00:00–06:00 UTC',
      description: 'Consolidation phase establishing high/low liquidity pools for London open to target.' 
    };
  } else {
    return { 
      name: 'Inter-Session Dead Zone', 
      isKillzone: false, 
      hoursWindow: 'Off-Peak Hours',
      description: 'Thin institutional participation, wider spreads, and choppy order flow. Higher false-breakout risk.' 
    };
  }
}

// ─── Build comprehensive context string from entire user session ───
export function buildDashboardContext(): string {
  const state = useStratumStore.getState();
  const account = state.userPurchasedAccounts.find(a => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
  const r = state.riskResult;
  const asset = state.selectedAsset;
  const killzone = getCurrentKillzone();
  const otherAccounts = state.userPurchasedAccounts.filter(a => a.id !== account.id);

  // Economic events within next 2 hours or recent blackout
  const relevantNews = state.economicEvents.slice(0, 3).map(e => 
    `• [${e.impact}] ${e.title} (${e.currency}) - ${e.minutesUntil > 0 ? `in ${e.minutesUntil}m` : `${Math.abs(e.minutesUntil)}m ago`} [Status: ${e.status}]`
  ).join('\n');

  // Strategy setups available
  const availableSetups = state.setups.slice(0, 3).map(s =>
    `• ${s.strategyName} (${s.asset} ${s.bias}) - 1:${s.riskRewardRatio} R:R, ${s.winRatePercent}% winrate`
  ).join('\n');

  // Other accounts summary
  const otherAccountsSummary = otherAccounts.map(a =>
    `• ${a.accountNickname} (${a.firm} ${a.instrumentType}): Balance $${a.currentBalance.toLocaleString()}, ${a.drawdownType.replace('_', ' ')} DD, ${a.dailyLossLimitPercent}% Daily`
  ).join('\n');

  return [
    `=== LIVE TRADER SESSION TELEMETRY ===`,
    `Current Screen / Active Tab: ${state.activeTab}`,
    `Beginner Flight Coach: ${state.beginnerMode ? 'ENABLED (Educational / Beginner-friendly explanation mode)' : 'DISABLED'}`,
    `Display Units: ${state.showPercentageView ? 'Percentage & Dollar' : 'Dollar Only'}`,
    `UTC Time: ${new Date().toISOString().substring(11, 19)} UTC`,
    `Active Market Session: ${killzone.name} (${killzone.hoursWindow}) - ${killzone.isKillzone ? 'HIGH LIQUIDITY WINDOW' : 'LOW LIQUIDITY / CAUTION'}`,
    ``,
    `=== ACTIVE PROP FIRM ACCOUNT ===`,
    `Account Nickname: ${account.accountNickname}`,
    `Firm: ${account.firm} (${account.modelName || 'Evaluation'})`,
    `Instrument Type: ${account.instrumentType}`,
    `Current Balance: $${account.currentBalance.toLocaleString()} | Equity: $${account.currentEquity.toLocaleString()}`,
    `Today Starting Balance: $${account.todayStartingBalance.toLocaleString()} | Today Realized PnL: $${account.todayRealizedPnL.toLocaleString()}`,
    `Daily Loss Limit: ${account.dailyLossLimitPercent}% ($${r.dailyMaxLossLimitDollar.toLocaleString()})`,
    `Max Overall Drawdown: ${account.maxDrawdownPercent}% (${account.drawdownType.replace('_', ' ')})`,
    `Account Phase: ${account.phase}`,
    `News Trading Allowed: ${account.newsTradingAllowed ? `YES (with ${account.newsBlackoutMinutes}m blackout window)` : 'NO'}`,
    `Stratum Guardrail Sensitivity: ${account.guardrailPercent}% (Caps each trade to 25% of remaining daily cushion)`,
    ``,
    `=== OTHER USER PURCHASED ACCOUNTS IN PORTFOLIO ===`,
    otherAccountsSummary || 'No other accounts registered.',
    ``,
    `=== SELECTED ASSET & MARKET STRUCTURE ===`,
    `Symbol: ${asset.symbol} (${asset.name}) - Class: ${asset.type}`,
    `Current Live Price: ${asset.price} (${asset.direction} bias, 24h Change: ${asset.change24h > 0 ? '+' : ''}${asset.change24h}%)`,
    `Asian Range: High ${asset.asianRangeHigh} | Low ${asset.asianRangeLow}`,
    `Session VWAP: ${asset.sessionVwap}`,
    `HTF Market Structure: ${asset.htfMarketStructure} | Liquidity Sweep: ${asset.liquiditySweep}`,
    `Order Block Bias: ${asset.htfOrderBlock?.bias} (${asset.htfOrderBlock?.low} - ${asset.htfOrderBlock?.high})`,
    `DXY Correlation: ${asset.dxyCorrelation}`,
    ``,
    `=== CURRENT TRADE PLAN & POSITION SIZING ===`,
    `Planned Entry: ${state.entryPrice}`,
    `Planned Stop Loss: ${state.stopLossPrice} (Distance: ${r.slDistancePoints} pts/pips)`,
    `Planned Take Profit: ${state.takeProfitPrice}`,
    `Target Risk: ${state.targetRiskPercent}% ($${r.dollarRisk.toLocaleString()})`,
    `Calculated Sizing: ${account.instrumentType === 'FUTURES' ? (r.contracts ?? r.lotSize) : r.lotSize} ${account.instrumentType === 'FUTURES' ? 'Contracts' : 'Lots'}`,
    `Projected Reward: +$${r.rewardDollar.toLocaleString()}`,
    `Risk to Reward Ratio: 1 : ${r.riskRewardRatio}`,
    `Remaining Daily Buffer Before Violation: $${r.remainingDailyBufferDollar.toLocaleString()}`,
    `Remaining Daily Buffer After This Trade: $${Math.max(0, r.remainingDailyBufferDollar - r.dollarRisk).toLocaleString()}`,
    `Today Previous Losses: $${r.dailyLossSoFarDollar.toLocaleString()}`,
    `Breach Danger Warning: ${r.isBreachDanger ? 'TRUE (Exceeds 25% daily cushion guardrail)' : 'FALSE (Safe)'}`,
    `Gatekeeper Hard Block: ${r.isHardBlocked ? 'TRUE (Execution blocked by rule gatekeeper)' : 'FALSE (Clear)'}`,
    r.warningMessage ? `Gatekeeper Alert: ${r.warningMessage}` : '',
    ``,
    `=== COMPLIANCE CERTIFICATION STAMP ===`,
    state.lastStampedTicket ? `Last Certified Ticket: #${state.lastStampedTicket.ticketId} at ${state.lastStampedTicket.timestamp} for ${state.lastStampedTicket.instrumentType === 'FUTURES' ? (state.lastStampedTicket.contracts ?? state.lastStampedTicket.lotSize) : state.lastStampedTicket.lotSize} ${state.lastStampedTicket.instrumentType === 'FUTURES' ? 'Contracts' : 'Lots'}` : 'No ticket stamped yet this session.',
    ``,
    `=== UPCOMING ECONOMIC NEWS & MACRO BLACKOUTS ===`,
    relevantNews || 'No immediate high impact news.',
    ``,
    `=== AVAILABLE PLAYBOOK SETUPS ===`,
    availableSetups,
    `=== END TELEMETRY ===`
  ].filter(Boolean).join('\n');
}

// ─── Proactive Session Recommendations Engine ───
export function generateLiveSessionInsights(): AIRecommendation[] {
  const state = useStratumStore.getState();
  const account = state.userPurchasedAccounts.find(a => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
  const r = state.riskResult;
  const asset = state.selectedAsset;
  const killzone = getCurrentKillzone();
  const insights: AIRecommendation[] = [];

  // 1. Buffer & Hard Block Rule Recommendation
  if (r.isHardBlocked) {
    insights.push({
      id: 'rec-hard-block',
      category: 'RISK',
      severity: 'CRITICAL',
      title: 'Execution Blocked by Gatekeeper',
      description: `This trade risks $${r.dollarRisk}, which exceeds your remaining daily loss cushion of $${r.remainingDailyBufferDollar}. Reduce risk to 0.25% or cancel this setup.`,
      actionQuery: 'Why is my trade hard blocked by the Stratum gatekeeper and what exact lot size is safe?',
      actionLabel: 'Audit Safe Lot Size'
    });
  } else if (r.isBreachDanger) {
    insights.push({
      id: 'rec-buffer-guardrail',
      category: 'RISK',
      severity: 'WARNING',
      title: '25% Buffer Guardrail Alert',
      description: `Target risk ($${r.dollarRisk}) consumes more than 25% of your remaining $${r.remainingDailyBufferDollar} buffer. One loss leaves you vulnerable to account breach.`,
      actionQuery: 'How can I adjust my stop loss or risk percentage to satisfy the 25% guardrail?',
      actionLabel: 'Fix Guardrail Violation'
    });
  } else {
    insights.push({
      id: 'rec-risk-safe',
      category: 'RISK',
      severity: 'OPPORTUNITY',
      title: 'Risk Profile Verified Safe',
      description: `Risk of $${r.dollarRisk} (${r.riskPercentOfBalance}%) is well within the 25% cushion. You can absorb multiple stops before approaching ${account.firm}'s daily limit.`,
      actionQuery: 'Review my risk parameters and tell me how many consecutive losses I can survive on this account.',
      actionLabel: 'Verify Survival Runway'
    });
  }

  // 2. Trailing vs Static Drawdown Telemetry
  if (account.drawdownType === 'EOD_TRAILING' || account.drawdownType === 'INTRADAY_TRAILING') {
    insights.push({
      id: 'rec-trailing-drawdown',
      category: 'DRAWDOWN',
      severity: 'INFO',
      title: `${account.drawdownType.replace('_', ' ')} Drawdown Warning`,
      description: `${account.firm} uses a trailing drawdown floor that locks in at peak high-water marks. Even if in profit today, never risk more than 0.5% to avoid trapping your floor.`,
      actionQuery: `Explain how ${account.firm}'s ${account.drawdownType} drawdown works and what traps funded traders fall into.`,
      actionLabel: 'Explain Trailing Trap'
    });
  }

  // 3. Session Timing & Killzone Recommendation
  if (killzone.isKillzone) {
    insights.push({
      id: 'rec-session-active',
      category: 'SESSION',
      severity: 'OPPORTUNITY',
      title: `${killzone.name} Active`,
      description: `Institutional liquidity is elevated on ${asset.symbol}. Order flow algorithms are executing sweeps and displacements. Optimal entry window.`,
      actionQuery: `What is the optimal entry timing during the ${killzone.name} for ${asset.symbol}?`,
      actionLabel: 'View Killzone Strategy'
    });
  } else {
    insights.push({
      id: 'rec-session-offpeak',
      category: 'SESSION',
      severity: 'WARNING',
      title: 'Trading Outside Prime Killzone',
      description: `Current market is in ${killzone.name}. Volume is lower, spreads may widen, and ICT setups have higher false-breakout failure rates.`,
      actionQuery: `Should I wait for London or New York Open before entering ${asset.symbol}?`,
      actionLabel: 'Session Timing Advice'
    });
  }

  // 4. News & Macro Impact Check
  const upcomingHighImpact = state.economicEvents.find(e => e.impact === 'HIGH' && e.minutesUntil > 0 && e.minutesUntil <= 60);
  const activeBlackout = state.economicEvents.find(e => e.status === 'RED' && e.minutesUntil <= 0 && e.minutesUntil >= -15);

  if (activeBlackout) {
    insights.push({
      id: 'rec-news-blackout',
      category: 'NEWS',
      severity: 'CRITICAL',
      title: `ACTIVE NEWS BLACKOUT: ${activeBlackout.title}`,
      description: `A high-impact event occurred ${Math.abs(activeBlackout.minutesUntil)}m ago. Prop firm rules prohibit opening new orders during slippage blackout windows.`,
      actionQuery: 'What happens if I place an order during a high-impact news blackout?',
      actionLabel: 'Check News Rules'
    });
  } else if (upcomingHighImpact) {
    insights.push({
      id: 'rec-news-warning',
      category: 'NEWS',
      severity: 'WARNING',
      title: `Upcoming High-Impact News: ${upcomingHighImpact.title}`,
      description: `Releases in ${upcomingHighImpact.minutesUntil} minutes. Expect aggressive spread widening. Avoid holding through release without firm permission.`,
      actionQuery: `How will the upcoming ${upcomingHighImpact.title} impact my ${asset.symbol} trade?`,
      actionLabel: 'Check Event Impact'
    });
  }

  // 5. Setup Confluence & R:R
  if (r.riskRewardRatio < 1.5) {
    insights.push({
      id: 'rec-rr-low',
      category: 'SETUP',
      severity: 'WARNING',
      title: `Sub-Optimal R:R (1:${r.riskRewardRatio})`,
      description: `Your reward ($${r.rewardDollar}) is less than 1.5x your risk ($${r.dollarRisk}). Prop challenges require at least 1:2 R:R for consistent long-term positive expectancy.`,
      actionQuery: 'How can I adjust my target or entry to improve my Risk-to-Reward ratio to at least 1:2?',
      actionLabel: 'Optimize R:R'
    });
  } else {
    insights.push({
      id: 'rec-rr-healthy',
      category: 'SETUP',
      severity: 'OPPORTUNITY',
      title: `A+ Mathematical Expectancy (1:${r.riskRewardRatio})`,
      description: `Targeting +$${r.rewardDollar} against $${r.dollarRisk} risk. You only need a 35% win rate to break even at this ratio.`,
      actionQuery: `Analyze the confluences for my current ${asset.symbol} trade setup.`,
      actionLabel: 'Audit Confluences'
    });
  }

  return insights;
}

// ─── Chat Hook ───
export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isStreaming) return;

    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage.trim(),
      timestamp: Date.now()
    };

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Build message history for API
    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content
    }));

    const context = buildDashboardContext();
    let fullText = '';

    try {
      abortRef.current = new AbortController();

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, context }),
        signal: abortRef.current.signal
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'delta' && parsed.text) {
              fullText += parsed.text;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsg.id ? { ...m, content: fullText } : m
                )
              );
            } else if (parsed.type === 'error') {
              throw new Error(parsed.error);
            }
          } catch (parseErr) {
            // Skip unparseable lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.warn('AI chat error, using direct answer engine:', err);
      // If we got partial text, keep it; otherwise provide direct answer
      if (!fullText) {
        const directAnswer = answerGeneralQuestion(userMessage.trim(), context);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id
              ? { ...m, content: directAnswer }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, isStreaming]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isStreaming, error, sendMessage, stopStreaming, clearChat };
}

// ─── One-Shot Analysis Hook ───
export function useAIAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (type: AnalysisType, contextOverride?: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const context = contextOverride || buildDashboardContext();

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      return data.analysis;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analysis, isLoading, error, analyze };
}
