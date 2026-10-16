'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { 
  BarChart2, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Layers, 
  TrendingUp, 
  Target, 
  Clock 
} from 'lucide-react';

import { STRATUM_THEMES } from '@/lib/types';

interface CandleData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function TradingViewChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { 
    selectedAsset, 
    entryPrice, 
    stopLossPrice, 
    takeProfitPrice,
    currentTheme,
    colorMode
  } = useStratumStore();

  const isDark = colorMode === 'dark';
  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];

  const [timeframe, setTimeframe] = useState<'M5' | 'M15' | 'H1' | 'H4'>('M15');
  const [showAsianBands, setShowAsianBands] = useState(true);
  const [showVwap, setShowVwap] = useState(true);
  const [showImbalanceBox, setShowImbalanceBox] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let isMounted = true;
    let chart: any = null;
    let handleResize: (() => void) | null = null;

    const chartBg = isDark ? '#121316' : '#ffffff';
    const textColor = isDark ? '#a1a1a6' : '#6e6e73';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
    const scaleBorder = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)';
    const crosshairColor = isDark ? '#2997ff' : '#0071e3';

    // Dynamically import lightweight-charts
    import('lightweight-charts').then(({ createChart, ColorType, LineStyle }) => {
      if (!isMounted || !chartContainerRef.current) return;
      chartContainerRef.current.innerHTML = '';

      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: chartBg },
          textColor: textColor,
          fontSize: 11
        },
        grid: {
          vertLines: { color: gridColor, style: LineStyle.Dotted },
          horzLines: { color: gridColor, style: LineStyle.Dotted }
        },
        crosshair: {
          vertLine: { color: crosshairColor, width: 1, style: LineStyle.Dashed },
          horzLine: { color: crosshairColor, width: 1, style: LineStyle.Dashed }
        },
        rightPriceScale: {
          borderColor: scaleBorder,
          textColor: '#6e6e73'
        },
        timeScale: {
          borderColor: scaleBorder,
          timeVisible: true,
          secondsVisible: false
        },
        width: chartContainerRef.current.clientWidth,
        height: 380
      });

      // Authentic Financial Green & Red Candlesticks
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: true,
        borderColor: '#10b981',
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e'
      });

      // Generate realistic synthetic seed candles anchored around current asset price
      const basePrice = selectedAsset.price;
      const pip = selectedAsset.pipSize || 0.0001;
      const data: CandleData[] = [];
      const now = Math.floor(Date.now() / 1000);
      const step = timeframe === 'M5' ? 300 : timeframe === 'M15' ? 900 : timeframe === 'H1' ? 3600 : 14400;

      let currentClose = basePrice - 30 * pip;
      for (let i = 50; i >= 0; i--) {
        const timeVal = (now - i * step) as any;
        const delta = (Math.sin(i / 4) + (Math.random() - 0.48)) * (12 * pip);
        const open = currentClose;
        const close = open + delta;
        const high = Math.max(open, close) + Math.random() * (8 * pip);
        const low = Math.min(open, close) - Math.random() * (8 * pip);
        currentClose = close;

        const decimals = selectedAsset.type === 'FOREX'
          ? (selectedAsset.pipSize === 0.01 ? 2 : 4)
          : (selectedAsset.pipSize && selectedAsset.pipSize <= 0.01 ? 2 : selectedAsset.price > 1000 ? 1 : 2);

        data.push({
          time: timeVal,
          open: Number(open.toFixed(decimals)),
          high: Number(high.toFixed(decimals)),
          low: Number(low.toFixed(decimals)),
          close: Number(close.toFixed(decimals))
        });
      }

      candleSeries.setData(data);

      // Add Price Lines for Asian High/Low if enabled
      if (showAsianBands && selectedAsset.asianRangeHigh && selectedAsset.asianRangeLow) {
        candleSeries.createPriceLine({
          price: selectedAsset.asianRangeHigh,
          color: '#f59e0b',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'ASIAN HIGH (LIQUIDITY)'
        });
        candleSeries.createPriceLine({
          price: selectedAsset.asianRangeLow,
          color: '#06b6d4',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'ASIAN LOW (SWEPT)'
        });
      }

      // Add Session VWAP line
      if (showVwap && selectedAsset.sessionVwap) {
        candleSeries.createPriceLine({
          price: selectedAsset.sessionVwap,
          color: '#38bdf8',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'SESSION VWAP'
        });
      }

      // Add Active Trade Setup Invalidation & Target Lines
      if (entryPrice > 0) {
        candleSeries.createPriceLine({
          price: entryPrice,
          color: isDark ? '#f5f5f7' : '#1d1d1f',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'ENTRY LEVEL'
        });
      }
      if (stopLossPrice > 0) {
        candleSeries.createPriceLine({
          price: stopLossPrice,
          color: '#f43f5e',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'STOP LOSS (INVALIDATION)'
        });
      }
      if (takeProfitPrice > 0) {
        candleSeries.createPriceLine({
          price: takeProfitPrice,
          color: '#10b981',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'TAKE PROFIT (TARGET)'
        });
      }

      chart.timeScale().fitContent();

      handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth
          });
        }
      };

      window.addEventListener('resize', handleResize);
    }).catch((err) => {
      console.error('Lightweight charts init error:', err);
    });

    return () => {
      isMounted = false;
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (chart) {
        try {
          chart.remove();
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, [selectedAsset, showAsianBands, showVwap, entryPrice, stopLossPrice, takeProfitPrice, timeframe, currentTheme, colorMode, isDark]);

  return (
    <div className="apple-card p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.06)] relative flex flex-col transition-all duration-300">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
              {selectedAsset.symbol}
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase border ${
              selectedAsset.direction === 'BULLISH'
                ? 'bg-[#34c759]/12 text-[#34c759] border-[#34c759]/25'
                : selectedAsset.direction === 'BEARISH'
                ? 'bg-[#ff3b30]/12 text-[#ff3b30] border-[#ff3b30]/25'
                : 'bg-black/[0.04] text-[#6e6e73] border-black/[0.08]'
            }`}>
              {selectedAsset.direction}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-data text-[#6e6e73]">
            <span>Asian Range: [<span className="text-[#0071e3]">{selectedAsset.asianRangeLow}</span> &mdash; <span className="text-[#e37400]">{selectedAsset.asianRangeHigh}</span>]</span>
          </div>
        </div>

        {/* Chart Tools & Overlays Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Switcher (Apple Segmented Pill) */}
          <div className="flex items-center gap-0.5 bg-black/[0.04] p-1 rounded-full border border-black/[0.08]">
            {(['M5', 'M15', 'H1', 'H4'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white text-[#1d1d1f] shadow-sm border border-black/[0.08]'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Asian Bands Overlay */}
          <button
            onClick={() => setShowAsianBands(!showAsianBands)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              showAsianBands
                ? 'bg-[#ff9500]/12 text-[#b25000] border-[#ff9500]/25'
                : 'bg-black/[0.03] text-[#6e6e73] border-black/[0.08] hover:text-[#1d1d1f]'
            }`}
          >
            {showAsianBands ? <Eye className="w-3.5 h-3.5 text-[#ff9500]" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Asian Range</span>
          </button>

          {/* VWAP Overlay */}
          <button
            onClick={() => setShowVwap(!showVwap)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              showVwap
                ? 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20'
                : 'bg-black/[0.03] text-[#6e6e73] border-black/[0.08] hover:text-[#1d1d1f]'
            }`}
          >
            {showVwap ? <Eye className="w-3.5 h-3.5 text-[#0071e3]" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>VWAP</span>
          </button>

          {/* Imbalance Box Toggle */}
          <button
            onClick={() => setShowImbalanceBox(!showImbalanceBox)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              showImbalanceBox
                ? 'bg-[#34c759]/12 text-[#248a3d] border-[#34c759]/25'
                : 'bg-black/[0.03] text-[#6e6e73] border-black/[0.08] hover:text-[#1d1d1f]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#34c759]" />
            <span>FVG Boxes</span>
          </button>
        </div>
      </div>

      {/* Lightweight Chart Render Canvas */}
      <div className={`relative w-full h-[380px] rounded-2xl overflow-hidden border ${isDark ? 'bg-[#121316] border-white/10' : 'bg-white border-black/[0.08]'}`}>
        <div ref={chartContainerRef} className="w-full h-full" />

        {/* Visual Imbalance Box / FVG Overlay badge */}
        {showImbalanceBox && (
          <div className="absolute top-4 left-4 glass-elevated border border-[#34c759]/30 rounded-2xl p-3 shadow-md text-xs z-10">
            <div className="text-[#34c759] font-semibold uppercase text-[10px] tracking-wide mb-0.5">
              HTF Order Block / Demand Zone
            </div>
            <div className="text-[#1d1d1f] dark:text-[#f5f5f7] font-mono-data text-[11px]">
              [{selectedAsset.htfOrderBlock.low} &mdash; {selectedAsset.htfOrderBlock.high}] ({selectedAsset.htfOrderBlock.bias})
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Telemetry with proper Color Meaning */}
      <div className="flex items-center justify-between mt-3.5 text-xs font-mono-data text-[#6e6e73]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#1d1d1f] dark:bg-[#f5f5f7] rounded-full" /> Entry: <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">{entryPrice}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#ff3b30] rounded-full" /> SL Invalidation: <strong className="text-[#ff3b30]">{stopLossPrice}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#34c759] rounded-full" /> TP Target: <strong className="text-[#34c759]">{takeProfitPrice}</strong>
          </span>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-[#6e6e73]">
          TradingView Lightweight Charts v4.2
        </div>
      </div>
    </div>
  );
}
