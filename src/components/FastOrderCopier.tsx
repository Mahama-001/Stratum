'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES } from '@/lib/types';
import { 
  Copy, 
  Check, 
  ArrowUpRight, 
  Info 
} from 'lucide-react';

export default function FastOrderCopier() {
  const {
    selectedAsset,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    riskResult,
    userPurchasedAccounts,
    activeAccountId,
    beginnerMode,
    currentTheme,
    addToast
  } = useStratumStore();

  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];
  const activeAccount = userPurchasedAccounts.find((a) => a.id === activeAccountId) || userPurchasedAccounts[0];
  const [platform, setPlatform] = useState<'MT4_MT5' | 'CTRADER' | 'TRADOVATE' | 'TRADINGVIEW'>('MT4_MT5');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const isShort = stopLossPrice > entryPrice;
  const direction = isShort ? 'SELL' : 'BUY';
  const isFutures = activeAccount.instrumentType === 'FUTURES';
  const positionSizeDisplay = isFutures ? (riskResult.contracts || 1) : riskResult.lotSize;

  // Format strings
  const getOrderString = (type: typeof platform) => {
    switch (type) {
      case 'MT4_MT5':
        return `${direction} ${riskResult.lotSize} ${selectedAsset.symbol} @ ${entryPrice.toFixed(selectedAsset.type === 'FOREX' ? 5 : 2)} | SL: ${stopLossPrice.toFixed(selectedAsset.type === 'FOREX' ? 5 : 2)} | TP: ${takeProfitPrice.toFixed(selectedAsset.type === 'FOREX' ? 5 : 2)} [Risk: $${riskResult.dollarRisk} (1:${riskResult.riskRewardRatio})]`;
      case 'CTRADER':
        return `cTrader Order: ${selectedAsset.symbol} ${direction} ${riskResult.lotSize} Lots, Entry: ${entryPrice}, SL: ${stopLossPrice}, TP: ${takeProfitPrice}`;
      case 'TRADOVATE':
        return `TRADOVATE FUTURES: ${selectedAsset.symbol} ${direction} ${riskResult.contracts || 1} Ctr @ ${entryPrice} [Stop: ${stopLossPrice} (-$${riskResult.dollarRisk}) | Target: ${takeProfitPrice} (+$${riskResult.rewardDollar})]`;
      case 'TRADINGVIEW':
        return JSON.stringify({
          action: direction.toLowerCase(),
          ticker: selectedAsset.symbol,
          quantity: isFutures ? (riskResult.contracts || 1) : riskResult.lotSize,
          price: entryPrice,
          stop_loss: stopLossPrice,
          take_profit: takeProfitPrice,
          risk_usd: riskResult.dollarRisk,
          account: activeAccount.accountNickname
        }, null, 2);
    }
  };

  const handleCopy = async (type: typeof platform) => {
    const text = getOrderString(type);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedFormat(type);
      addToast({
        type: 'success',
        title: 'Order Copied',
        message: `Parameters copied to clipboard for ${type.replace('_', '/')}`
      });
      setTimeout(() => setCopiedFormat(null), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedFormat(type);
      addToast({
        type: 'success',
        title: 'Order Copied',
        message: `Parameters copied to clipboard for ${type.replace('_', '/')}`
      });
      setTimeout(() => setCopiedFormat(null), 2500);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-2xl border border-black/[0.08] rounded-[24px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.06)] relative transition-colors duration-300 text-[#1d1d1f]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#0071e3]" />
              Order Exporter
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#34c759]/15 text-[#248a3d] border border-[#34c759]/25">
              Ready to Paste
            </span>
          </div>
          <p className="text-[12px] text-[#6e6e73] mt-0.5">
            Instantly format sized trade parameters for MetaTrader, cTrader, Tradovate, or TradingView.
          </p>
        </div>

        {/* Apple Segmented Platform Pill Selector */}
        <div className="flex items-center gap-1 bg-black/[0.04] p-1 rounded-full border border-black/[0.08]">
          {(['MT4_MT5', 'CTRADER', 'TRADOVATE', 'TRADINGVIEW'] as const).map((plt) => (
            <button
              key={plt}
              onClick={() => setPlatform(plt)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                platform === plt
                  ? 'bg-white text-[#1d1d1f] shadow-sm border border-black/[0.08]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              {plt === 'MT4_MT5' ? 'MT4 / MT5' : plt === 'CTRADER' ? 'cTrader' : plt === 'TRADOVATE' ? 'Tradovate' : 'TradingView'}
            </button>
          ))}
        </div>
      </div>

      {beginnerMode && (
        <div className="mb-4 rounded-[16px] p-3 flex items-start gap-2.5 text-[12px] text-[#1d1d1f] bg-black/[0.03] border border-black/[0.08]">
          <Info className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#1d1d1f]">Desk Tip:</strong> Stratum pre-calculated your position size (<span className="text-[#1d1d1f] font-medium">{positionSizeDisplay} {isFutures ? 'contracts' : 'lots'}</span>) to guarantee your risk stays strictly locked at <span className="text-[#248a3d] font-medium">{riskResult.riskPercentOfBalance}%</span>.
          </div>
        </div>
      )}

      {/* Code / Command Preview Box */}
      <div className="relative bg-black/[0.03] border border-black/[0.08] rounded-[18px] p-4 text-[12px] text-[#1d1d1f]">
        <pre className="overflow-x-auto whitespace-pre-wrap select-all text-[#1d1d1f] pr-24 font-mono">
          {getOrderString(platform)}
        </pre>

        <button
          onClick={() => handleCopy(platform)}
          className={`absolute top-3 right-3 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
            copiedFormat === platform
              ? 'bg-[#34c759] text-white'
              : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
          }`}
        >
          {copiedFormat === platform ? (
            <>
              <Check className="w-3.5 h-3.5 font-bold" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Micro-Specs with Apple Inset Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
        <div className="bg-black/[0.02] p-3 rounded-[16px] border border-black/[0.06]">
          <span className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-wider block">Position</span>
          <span className="text-[14px] font-semibold text-[#1d1d1f] mt-0.5 block">{positionSizeDisplay} {isFutures ? 'Ctr' : 'Lots'}</span>
        </div>
        <div className="bg-black/[0.02] p-3 rounded-[16px] border border-black/[0.06]">
          <span className="text-[10px] font-semibold text-[#ff3b30]/80 uppercase tracking-wider block">Stop Loss Risk</span>
          <span className="text-[14px] font-semibold text-[#ff3b30] mt-0.5 block">-${riskResult.dollarRisk}</span>
        </div>
        <div className="bg-black/[0.02] p-3 rounded-[16px] border border-black/[0.06]">
          <span className="text-[10px] font-semibold text-[#248a3d]/80 uppercase tracking-wider block">Take Profit Gain</span>
          <span className="text-[14px] font-semibold text-[#248a3d] mt-0.5 block">+${riskResult.rewardDollar}</span>
        </div>
        <div className="bg-black/[0.02] p-3 rounded-[16px] border border-black/[0.06]">
          <span className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-wider block">Reward-To-Risk</span>
          <span className="text-[14px] font-semibold text-[#1d1d1f] mt-0.5 block">1 : {riskResult.riskRewardRatio}</span>
        </div>
      </div>
    </div>
  );
}
