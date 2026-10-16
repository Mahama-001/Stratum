'use client';

import React, { useEffect, useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { MarketAsset } from '@/lib/types';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  decimals: number;
  type: 'FOREX' | 'INDEX' | 'COMMODITY' | 'CRYPTO';
}

const DEFAULT_TICKERS: TickerItem[] = [
  { symbol: 'NAS100', price: 20120.50, change: -76.80, changePercent: -0.38, decimals: 2, type: 'INDEX' },
  { symbol: 'US500', price: 5824.50, change: 18.60, changePercent: 0.32, decimals: 2, type: 'INDEX' },
  { symbol: 'US30', price: 42180.00, change: 176.00, changePercent: 0.42, decimals: 2, type: 'INDEX' },
  { symbol: 'GER40', price: 19485.00, change: 54.00, changePercent: 0.28, decimals: 2, type: 'INDEX' },
  { symbol: 'UK100', price: 8245.00, change: 12.30, changePercent: 0.15, decimals: 2, type: 'INDEX' },
  { symbol: 'JP225', price: 38940.00, change: 320.00, changePercent: 0.85, decimals: 1, type: 'INDEX' },
  { symbol: 'EU50', price: 4945.00, change: 10.80, changePercent: 0.22, decimals: 2, type: 'INDEX' },
  { symbol: 'EUR/USD', price: 1.0848, change: 0.0019, changePercent: 0.18, decimals: 4, type: 'FOREX' },
  { symbol: 'GBP/USD', price: 1.2982, change: -0.0031, changePercent: -0.24, decimals: 4, type: 'FOREX' },
  { symbol: 'USD/JPY', price: 153.85, change: 0.69, changePercent: 0.45, decimals: 2, type: 'FOREX' },
  { symbol: 'AUD/USD', price: 0.6580, change: 0.0022, changePercent: 0.34, decimals: 4, type: 'FOREX' },
  { symbol: 'USD/CAD', price: 1.3890, change: -0.0015, changePercent: -0.11, decimals: 4, type: 'FOREX' },
  { symbol: 'DXY', price: 104.25, change: 0.25, changePercent: 0.24, decimals: 2, type: 'FOREX' },
  { symbol: 'XAU/USD', price: 2735.40, change: 24.80, changePercent: 0.92, decimals: 2, type: 'COMMODITY' },
  { symbol: 'XAG/USD', price: 33.75, change: 0.48, changePercent: 1.45, decimals: 2, type: 'COMMODITY' },
  { symbol: 'USOIL', price: 71.45, change: -0.47, changePercent: -0.65, decimals: 2, type: 'COMMODITY' },
  { symbol: 'UKOIL', price: 75.80, change: -0.42, changePercent: -0.55, decimals: 2, type: 'COMMODITY' },
  { symbol: 'BTC/USD', price: 68450.00, change: 1440.00, changePercent: 2.15, decimals: 1, type: 'CRYPTO' },
  { symbol: 'ETH/USD', price: 2520.00, change: 45.00, changePercent: 1.82, decimals: 1, type: 'CRYPTO' },
  { symbol: 'SOL/USD', price: 178.50, change: 7.90, changePercent: 4.65, decimals: 2, type: 'CRYPTO' },
  { symbol: 'SUI/USD', price: 2.12, change: 0.16, changePercent: 8.45, decimals: 3, type: 'CRYPTO' }
];

export default function MarketTickerBar() {
  const { assets, selectedAsset, setSelectedAsset } = useStratumStore();
  const [tickers, setTickers] = useState<TickerItem[]>(DEFAULT_TICKERS);
  const [flashingSymbol, setFlashingSymbol] = useState<{ symbol: string; dir: 'up' | 'down' } | null>(null);

  // Live market price simulation (every 2.8s, slight realistic tick)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const item = prev[randomIndex];
        const isUp = Math.random() > 0.48;
        const tickStep = item.type === 'FOREX' ? 0.0002 : item.type === 'COMMODITY' ? 0.4 : 1.5;
        const newPrice = Number((isUp ? item.price + tickStep : Math.max(1, item.price - tickStep)).toFixed(item.decimals));
        const newChange = Number((isUp ? item.change + (tickStep * 0.5) : item.change - (tickStep * 0.5)).toFixed(item.decimals));
        const newPercent = Number(((newChange / newPrice) * 100).toFixed(2));

        setFlashingSymbol({ symbol: item.symbol, dir: isUp ? 'up' : 'down' });
        setTimeout(() => setFlashingSymbol(null), 600);

        return prev.map((t, idx) => (idx === randomIndex ? { ...t, price: newPrice, change: newChange, changePercent: newPercent } : t));
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const handleSelect = (symbol: string) => {
    const matched = assets.find((a) => a.symbol === symbol || a.symbol.replace('/', '') === symbol.replace('/', ''));
    if (matched) {
      setSelectedAsset(matched);
    }
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-black/[0.08] py-2 px-3 sm:px-6 overflow-x-auto no-scrollbar transition-colors duration-300 text-[#1d1d1f]">
      <div className="max-w-[1728px] mx-auto flex items-center justify-between gap-4 min-w-[760px] text-xs">
        
        {/* Market Status Radar Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-black/[0.04] text-[#1d1d1f] border border-black/[0.08]">
            Market Feed
          </span>
        </div>

        {/* Streaming Ticker Badges */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-1 justify-around">
          {tickers.map((t) => {
            const isSelected = selectedAsset?.symbol === t.symbol || selectedAsset?.symbol.replace('/', '') === t.symbol.replace('/', '');
            const isPositive = t.change >= 0;
            const isFlashing = flashingSymbol?.symbol === t.symbol;

            return (
              <button
                key={t.symbol}
                onClick={() => handleSelect(t.symbol)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[12px] transition-all duration-200 cursor-pointer active:scale-95 group ${
                  isSelected
                    ? 'bg-[#0071e3] text-white border border-[#0071e3] shadow-sm'
                    : 'bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.06] text-[#6e6e73] hover:text-[#1d1d1f]'
                } ${
                  isFlashing
                    ? flashingSymbol.dir === 'up'
                      ? 'ring-1 ring-[#30d158]/50 bg-[#30d158]/10'
                      : 'ring-1 ring-[#ff453a]/50 bg-[#ff453a]/10'
                    : ''
                }`}
                title={`Click to analyze ${t.symbol}`}
              >
                <span className={`font-semibold transition-colors ${isSelected ? 'text-white' : 'text-[#1d1d1f] group-hover:text-[#0071e3]'}`}>
                  {t.symbol}
                </span>

                <span className={`font-medium ${isSelected ? 'text-white' : 'text-[#1d1d1f]'}`}>
                  {t.price.toLocaleString(undefined, { minimumFractionDigits: t.decimals, maximumFractionDigits: t.decimals })}
                </span>

                <span
                  className={`flex items-center text-[11px] font-medium ${
                    isSelected ? 'text-white/90' : isPositive ? 'text-[#30d158]' : 'text-[#ff453a]'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                  {isPositive ? '+' : ''}{t.changePercent}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Fast Action Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#6e6e73] shrink-0 font-medium">
          <Activity className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>Interactive Pairs</span>
        </div>

      </div>
    </div>
  );
}
