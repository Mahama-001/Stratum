'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { 
  Maximize2, 
  Layers, 
  Activity, 
  Eye, 
  EyeOff, 
  BarChart2, 
  SlidersHorizontal,
  Target
} from 'lucide-react';

interface CandleData {
  time: any;
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
    takeProfitPrice 
  } = useStratumStore();

  const [showAsianBands, setShowAsianBands] = useState(true);
  const [showVwap, setShowVwap] = useState(true);
  const [showImbalanceBox, setShowImbalanceBox] = useState(true);
  const [timeframe, setTimeframe] = useState<'M5' | 'M15' | 'H1' | 'H4'>('M15');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: any = null;
    let candleSeries: any = null;

    // Dynamically import lightweight-charts to prevent SSR hydration mismatches
    import('lightweight-charts').then(({ createChart, ColorType, LineStyle }) => {
      if (!chartContainerRef.current) return;

      chartContainerRef.current.innerHTML = '';

      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#070708' },
          textColor: '#9A9DA3',
          fontFamily: "'Inter', monospace",
          fontSize: 11
        },
        grid: {
          vertLines: { color: 'rgba(35, 36, 38, 0.4)', style: LineStyle.Dotted },
          horzLines: { color: 'rgba(35, 36, 38, 0.4)', style: LineStyle.Dotted }
        },
        crosshair: {
          vertLine: { color: '#50D8E9', width: 1, style: LineStyle.Dashed },
          horzLine: { color: '#50D8E9', width: 1, style: LineStyle.Dashed }
        },
        rightPriceScale: {
          borderColor: '#232426',
          textColor: '#9A9DA3'
        },
        timeScale: {
          borderColor: '#232426',
          timeVisible: true,
          secondsVisible: false
        },
        width: chartContainerRef.current.clientWidth,
        height: 380
      });

      candleSeries = chart.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444'
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

        data.push({
          time: timeVal,
          open: Number(open.toFixed(selectedAsset.type === 'FOREX' ? 4 : 2)),
          high: Number(high.toFixed(selectedAsset.type === 'FOREX' ? 4 : 2)),
          low: Number(low.toFixed(selectedAsset.type === 'FOREX' ? 4 : 2)),
          close: Number(close.toFixed(selectedAsset.type === 'FOREX' ? 4 : 2))
        });
      }

      candleSeries.setData(data);

      // Add Price Lines for Asian High/Low if enabled
      if (showAsianBands && selectedAsset.asianRangeHigh && selectedAsset.asianRangeLow) {
        candleSeries.createPriceLine({
          price: selectedAsset.asianRangeHigh,
          color: '#50D8E9',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'ASIAN HIGH (LIQUIDITY)'
        });
        candleSeries.createPriceLine({
          price: selectedAsset.asianRangeLow,
          color: '#50D8E9',
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
          color: '#F59E0B',
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
          color: '#5E6BFF',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'ENTRY LEVEL'
        });
      }
      if (stopLossPrice > 0) {
        candleSeries.createPriceLine({
          price: stopLossPrice,
          color: '#EF4444',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'STOP LOSS (INVALIDATION)'
        });
      }
      if (takeProfitPrice > 0) {
        candleSeries.createPriceLine({
          price: takeProfitPrice,
          color: '#10B981',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'TAKE PROFIT (TARGET)'
        });
      }

      chart.timeScale().fitContent();

      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth
          });
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart) chart.remove();
      };
    }).catch((err) => {
      console.error('Lightweight charts init error:', err);
    });

  }, [selectedAsset, showAsianBands, showVwap, entryPrice, stopLossPrice, takeProfitPrice, timeframe]);

  return (
    <div className="bg-[#101112] border border-[#232426] rounded-xl p-5 inner-glow relative flex flex-col">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#232426]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-h3 font-bold text-lg text-white">
              {selectedAsset.symbol}
            </span>
            <span className="font-mono-data text-xs text-[#50D8E9] px-2 py-0.5 rounded bg-[#50D8E9]/10 border border-[#50D8E9]/30 font-bold">
              {selectedAsset.direction}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-data text-[#9A9DA3]">
            <span>Asian Range: [{selectedAsset.asianRangeLow} — {selectedAsset.asianRangeHigh}]</span>
          </div>
        </div>

        {/* Chart Tools & Overlays Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Switcher */}
          <div className="flex items-center gap-1 bg-[#070708] p-1 rounded-lg border border-[#232426]">
            {(['M5', 'M15', 'H1', 'H4'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 text-[10px] font-mono-data font-bold rounded ${
                  timeframe === tf
                    ? 'bg-[#1B1C1E] text-white'
                    : 'text-[#9A9DA3] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Asian Bands Overlay */}
          <button
            onClick={() => setShowAsianBands(!showAsianBands)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono-data border transition-colors ${
              showAsianBands
                ? 'bg-[#50D8E9]/15 text-[#50D8E9] border-[#50D8E9]/40'
                : 'bg-[#070708] text-[#9A9DA3] border-[#232426]'
            }`}
          >
            {showAsianBands ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Asian Bands</span>
          </button>

          {/* VWAP Overlay */}
          <button
            onClick={() => setShowVwap(!showVwap)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono-data border transition-colors ${
              showVwap
                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
                : 'bg-[#070708] text-[#9A9DA3] border-[#232426]'
            }`}
          >
            {showVwap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>VWAP</span>
          </button>

          {/* Imbalance Box Toggle */}
          <button
            onClick={() => setShowImbalanceBox(!showImbalanceBox)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono-data border transition-colors ${
              showImbalanceBox
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                : 'bg-[#070708] text-[#9A9DA3] border-[#232426]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>FVG Boxes</span>
          </button>
        </div>
      </div>

      {/* Lightweight Chart Render Canvas */}
      <div className="relative w-full h-[380px] bg-[#070708] rounded-xl overflow-hidden border border-[#232426]">
        <div ref={chartContainerRef} className="w-full h-full" />

        {/* Visual Imbalance Box / FVG Overlay badge */}
        {showImbalanceBox && (
          <div className="absolute top-4 left-4 bg-[#101112]/90 backdrop-blur-md border border-[#10B981]/40 rounded-lg p-2.5 shadow-xl text-[10px] font-mono-data z-10">
            <div className="flex items-center gap-1.5 text-[#10B981] font-bold uppercase mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              HTF Order Block / Demand Zone
            </div>
            <div className="text-[#9A9DA3]">
              [{selectedAsset.htfOrderBlock.low} — {selectedAsset.htfOrderBlock.high}] ({selectedAsset.htfOrderBlock.bias})
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Telemetry */}
      <div className="flex items-center justify-between mt-3 text-[10px] font-mono-data text-[#9A9DA3]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#5E6BFF]" /> Entry: {entryPrice}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#EF4444]" /> SL Invalidation: {stopLossPrice}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#10B981]" /> TP Target: {takeProfitPrice}
          </span>
        </div>
        <div className="text-[9px] uppercase tracking-wider text-[#9A9DA3]/70">
          TradingView Lightweight Charts v4.2
        </div>
      </div>
    </div>
  );
}
