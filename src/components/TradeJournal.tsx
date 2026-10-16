'use client';

import React, { useState, useEffect } from 'react';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES } from '@/lib/types';
import type { TradeJournalEntry } from '@/lib/db';
import { exportJournalToCsv, openPrintableAuditReport } from '@/lib/exportReport';
import { soundEngine } from '@/lib/soundEngine';
import {
  Plus,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Trash2,
  X,
  Loader2,
  Calendar,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';

const STRATEGY_PRESETS = [
  'Liquidity Sweep',
  'Fair Value Gap',
  'Break of Structure',
  'Order Block',
  'Trend Continuation',
  'Supply & Demand',
  'Asian Range Breakout',
];

const EMOTIONAL_STATES = [
  'Disciplined',
  'Patient',
  'Confident',
  'FOMO',
  'Anxious',
  'Revenge Trade',
];

export default function TradeJournal() {
  const { currentTheme, currentUser, currentPreset, addToast } = useStratumStore();
  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];

  const [entries, setEntries] = useState<TradeJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New trade form state
  const [asset, setAsset] = useState('EURUSD');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('1.08500');
  const [stopLoss, setStopLoss] = useState('1.08200');
  const [takeProfit, setTakeProfit] = useState('1.09200');
  const [exitPrice, setExitPrice] = useState('1.09200');
  const [lotSize, setLotSize] = useState('2.5');
  const [pnl, setPnl] = useState('175.00');
  const [strategyTag, setStrategyTag] = useState(STRATEGY_PRESETS[0]);
  const [emotionalState, setEmotionalState] = useState(EMOTIONAL_STATES[0]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'CLOSED' | 'OPEN'>('CLOSED');

  // Load entries from API
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/journal');
      const data = await res.json();
      if (res.ok && data.entries) {
        setEntries(data.entries);
      }
    } catch {
      // Ignore network error in fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Compute live analytics
  const closed = entries.filter((e) => e.status === 'CLOSED');
  const wins = closed.filter((e) => e.pnl > 0).length;
  const winRate = closed.length > 0 ? Number(((wins / closed.length) * 100).toFixed(1)) : 0;
  const netPnl = closed.reduce((acc, curr) => acc + curr.pnl, 0);
  const grossProfit = closed.filter((e) => e.pnl > 0).reduce((acc, c) => acc + c.pnl, 0);
  const grossLoss = closed.filter((e) => e.pnl < 0).reduce((acc, c) => acc + Math.abs(c.pnl), 0);
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.9 : 0;
  const avgRR =
    closed.length > 0
      ? Number((closed.reduce((acc, c) => acc + (c.riskReward || 0), 0) / closed.length).toFixed(2))
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset,
          direction,
          entryPrice: parseFloat(entryPrice) || 0,
          stopLoss: parseFloat(stopLoss) || 0,
          takeProfit: parseFloat(takeProfit) || 0,
          exitPrice: exitPrice ? parseFloat(exitPrice) : null,
          lotSize: parseFloat(lotSize) || 1.0,
          pnl: parseFloat(pnl) || 0,
          strategyTag,
          emotionalState,
          notes,
          status,
        }),
      });

      if (res.ok) {
        soundEngine.playSuccessChime();
        addToast({
          type: 'success',
          title: 'Trade Logged',
          message: `${direction} ${asset} recorded to institutional journal.`,
        });
        setModalOpen(false);
        setNotes('');
        await fetchEntries();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not log trade entry.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      if (res.ok) {
        soundEngine.playTickSound();
        setEntries((prev) => prev.filter((e) => e.id !== id));
        addToast({
          type: 'info',
          title: 'Trade Removed',
          message: 'Trade entry deleted from journal.',
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleExportCsv = () => {
    soundEngine.playTickSound();
    exportJournalToCsv(entries, currentUser?.name || 'Trader');
  };

  const handleExportPdf = () => {
    soundEngine.playTickSound();
    openPrintableAuditReport({
      user: currentUser,
      accountPreset: currentPreset,
      entries,
      analytics: {
        totalTrades: entries.length,
        closedTrades: closed.length,
        wins,
        losses: closed.length - wins,
        winRate,
        netPnl,
        profitFactor,
        averageRR: avgRR,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white/90 dark:bg-[#14151a]/95 border border-black/[0.1] dark:border-white/[0.14] shadow-sm backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-[#1d1d1f] dark:text-white">
              Institutional Trade Journal
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20">
              TELEMETRY LOG
            </span>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#d1d1d6] mt-1 font-medium">
            Systematic performance analytics, R:R auditing, and psychology tracking for prop evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border border-black/[0.08] dark:border-white/[0.12] transition-colors cursor-pointer"
            title="Download CSV for Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border border-black/[0.08] dark:border-white/[0.12] transition-colors cursor-pointer"
            title="Generate executive PDF report"
          >
            <FileText className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
            <span>Audit PDF</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTickSound();
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#14151a]/95 border border-black/[0.08] dark:border-white/[0.14] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6e6e73] dark:text-[#a1a1a6] font-semibold uppercase tracking-wider">
            <span>Win Rate</span>
            <Target className="w-4 h-4 text-[#34c759]" />
          </div>
          <div className="text-2xl font-bold font-mono-data text-[#1d1d1f] dark:text-white mt-1">
            {winRate}%
          </div>
          <div className="text-[11px] text-[#515154] dark:text-[#a1a1a6] mt-1 font-medium">
            {wins} Wins &bull; {closed.length - wins} Losses
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#14151a]/95 border border-black/[0.08] dark:border-white/[0.14] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6e6e73] dark:text-[#a1a1a6] font-semibold uppercase tracking-wider">
            <span>Net PnL</span>
            {netPnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#34c759]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#ff3b30]" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono-data mt-1 ${
              netPnl >= 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'
            }`}
          >
            {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#515154] dark:text-[#a1a1a6] mt-1 font-medium">
            From {closed.length} closed trades
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#14151a]/95 border border-black/[0.08] dark:border-white/[0.14] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6e6e73] dark:text-[#a1a1a6] font-semibold uppercase tracking-wider">
            <span>Profit Factor</span>
            <BarChart2 className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
          </div>
          <div className="text-2xl font-bold font-mono-data text-[#1d1d1f] dark:text-white mt-1">
            {profitFactor}
          </div>
          <div className="text-[11px] text-[#515154] dark:text-[#a1a1a6] mt-1 font-medium">
            Gross Gain: ${grossProfit.toFixed(0)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#14151a]/95 border border-black/[0.08] dark:border-white/[0.14] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#6e6e73] dark:text-[#a1a1a6] font-semibold uppercase tracking-wider">
            <span>Avg Risk:Reward</span>
            <Brain className="w-4 h-4 text-[#af52de]" />
          </div>
          <div className="text-2xl font-bold font-mono-data text-[#1d1d1f] dark:text-white mt-1">
            1:{avgRR}
          </div>
          <div className="text-[11px] text-[#515154] dark:text-[#a1a1a6] mt-1 font-medium">
            Systematic asymmetry
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.14] bg-white/90 dark:bg-[#14151a]/95 backdrop-blur-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-white">
            Execution History ({entries.length})
          </h3>
          <span className="text-xs text-[#515154] dark:text-[#a1a1a6] font-mono-data">
            Latest Records
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-xs text-[#6e6e73] dark:text-[#a1a1a6] gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0071e3]" />
            <span>Loading trade telemetry...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-8 h-8 text-[#6e6e73] dark:text-[#a1a1a6] mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-white">No trades logged yet</h4>
            <p className="text-xs text-[#515154] dark:text-[#a1a1a6] max-w-sm mx-auto mt-1 mb-4 font-medium">
              Start building your audited track record by logging your first execution with strategy tags.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm cursor-pointer"
            >
              + Log First Trade
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] dark:bg-white/[0.04] text-[#515154] dark:text-[#d1d1d6] font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Lots</th>
                  <th className="py-3 px-4">Entry / Exit</th>
                  <th className="py-3 px-4">Net PnL</th>
                  <th className="py-3 px-4">R:R</th>
                  <th className="py-3 px-4">Strategy</th>
                  <th className="py-3 px-4">Emotion</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {entries.map((trade) => (
                  <tr key={trade.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-[#515154] dark:text-[#d1d1d6] font-mono-data">
                      {new Date(trade.openedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1d1d1f] dark:text-white font-mono-data">
                      {trade.asset}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          trade.direction === 'BUY'
                            ? 'bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/25'
                            : 'bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/25'
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-data text-[#1d1d1f] dark:text-white">
                      {trade.lotSize.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono-data text-[#515154] dark:text-[#d1d1d6]">
                      {trade.entryPrice.toFixed(4)} &rarr; {trade.exitPrice?.toFixed(4) || 'Open'}
                    </td>
                    <td className="py-3 px-4 font-mono-data font-bold">
                      <span className={trade.pnl >= 0 ? 'text-[#34c759]' : 'text-[#ff453a]'}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-data text-[#1d1d1f] dark:text-white">
                      {trade.riskReward > 0 ? `1:${trade.riskReward}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white border border-black/[0.06] dark:border-white/[0.1]">
                        {trade.strategyTag || 'Discretionary'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-medium text-[#515154] dark:text-[#a1a1a6]">
                        {trade.emotionalState || 'Calm'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(trade.id)}
                        className="p-1.5 rounded-lg text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors cursor-pointer"
                        title="Delete trade entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Trade Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-black/[0.12] dark:border-white/[0.18] bg-white dark:bg-[#15161b] p-6 shadow-2xl text-[#1d1d1f] dark:text-white relative overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 border-b border-black/[0.08] dark:border-white/[0.1] pb-3">
              <h3 className="text-base font-bold tracking-tight">Log Execution to Journal</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                    Asset Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={asset}
                    onChange={(e) => setAsset(e.target.value.toUpperCase())}
                    placeholder="EURUSD, US30, XAUUSD"
                    className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] rounded-xl px-3 py-2 text-xs font-bold font-mono-data focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                    Direction
                  </label>
                  <div className="grid grid-cols-2 p-0.5 bg-black/[0.05] dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.1]">
                    <button
                      type="button"
                      onClick={() => setDirection('BUY')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        direction === 'BUY'
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : 'text-[#6e6e73] dark:text-[#a1a1a6]'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('SELL')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        direction === 'SELL'
                          ? 'bg-[#ff453a] text-white shadow-sm'
                          : 'text-[#6e6e73] dark:text-[#a1a1a6]'
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] rounded-xl px-3 py-2 text-xs font-mono-data focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                    Stop Loss
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] rounded-xl px-3 py-2 text-xs font-mono-data focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                    Take Profit
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] rounded-xl px-3 py-2 text-xs font-mono-data focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                    Lot Size / Contracts
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] rounded-xl px-3 py-2 text-xs font-mono-data focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                    Realized Net PnL ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={pnl}
                    onChange={(e) => setPnl(e.target.value)}
                    placeholder="+250 or -120"
                    className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] rounded-xl px-3 py-2 text-xs font-mono-data font-bold focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                  Strategy Setup Tag
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STRATEGY_PRESETS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setStrategyTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        strategyTag === tag
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#515154] dark:text-[#d1d1d6] hover:bg-black/[0.08]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                  Emotional & Psychological State
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOTIONAL_STATES.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => setEmotionalState(state)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        emotionalState === state
                          ? 'bg-[#af52de] text-white shadow-sm'
                          : 'bg-black/[0.04] dark:bg-white/[0.08] text-[#515154] dark:text-[#d1d1d6] hover:bg-black/[0.08]'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#515154] dark:text-[#d1d1d6]">
                  Trade Reflections & Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Entered at 15m liquidity sweep; exited at opposing 4h FVG..."
                  className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.14] dark:border-white/[0.18] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] dark:text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Entry...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save to Journal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
