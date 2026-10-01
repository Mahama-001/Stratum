'use client';

import React from 'react';
import { useStratumStore } from '@/lib/store';
import { MarketAsset } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Compass, 
  CheckCircle2, 
  Target 
} from 'lucide-react';

export default function AssetBiasMatrix() {
  const { assets, selectedAsset, setSelectedAsset } = useStratumStore();

  return (
    <div className="bg-[#101112] border border-[#232426] rounded-xl p-5 inner-glow flex flex-col h-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-[10px] text-[#50D8E9] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              MACRO & STRUCTURE MATRIX
            </span>
            <span className="font-mono-data text-[9px] text-[#9A9DA3]">[INSTITUTIONAL_BIAS]</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">Primary Prop Assets</h2>
        </div>

        <div className="text-[11px] font-mono-data text-[#9A9DA3]">
          Click asset to sync <span className="text-[#50D8E9]">Chart</span> & <span className="text-[#10B981]">Risk Engine</span>
        </div>
      </div>

      {/* Asset Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#232426] text-[10px] font-mono-data uppercase tracking-wider text-[#9A9DA3]">
              <th className="pb-2.5 font-semibold">Asset Pair</th>
              <th className="pb-2.5 font-semibold">Live Price</th>
              <th className="pb-2.5 font-semibold">Session Bias</th>
              <th className="pb-2.5 font-semibold">DXY Correlation</th>
              <th className="pb-2.5 font-semibold">HTF Structure (4H/1D)</th>
              <th className="pb-2.5 font-semibold">Liquidity Sweep</th>
              <th className="pb-2.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232426]/50">
            {assets.map((asset) => {
              const isSelected = selectedAsset.symbol === asset.symbol;
              const isBullish = asset.direction === 'BULLISH';
              const isBearish = asset.direction === 'BEARISH';

              return (
                <tr
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-[#50D8E9]/10'
                      : 'hover:bg-[#1B1C1E]'
                  }`}
                >
                  {/* Symbol & Name */}
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-5 rounded-full ${
                          isSelected ? 'bg-[#50D8E9]' : 'bg-transparent group-hover:bg-[#9A9DA3]/30'
                        }`}
                      />
                      <div>
                        <div className="font-mono-data text-xs font-bold text-white flex items-center gap-1.5">
                          {asset.symbol}
                          <span className="text-[9px] px-1 py-0.2 rounded bg-white/[0.04] text-[#9A9DA3] font-normal">
                            {asset.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9A9DA3] line-clamp-1">{asset.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Price & 24h change */}
                  <td className="py-3 pr-3 font-mono-data">
                    <div className="text-xs font-bold text-white">
                      {asset.type === 'FOREX'
                        ? asset.price.toFixed(4)
                        : asset.type === 'COMMODITY'
                        ? asset.price.toFixed(2)
                        : asset.price.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </div>
                    <div
                      className={`text-[10px] flex items-center gap-0.5 ${
                        asset.change24h >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}
                    >
                      {asset.change24h >= 0 ? '+' : ''}
                      {asset.change24h}%
                    </div>
                  </td>

                  {/* Session Direction */}
                  <td className="py-3 pr-3 font-mono-data">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isBullish
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : isBearish
                          ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                          : 'bg-[#9A9DA3]/15 text-[#9A9DA3] border border-[#9A9DA3]/30'
                      }`}
                    >
                      {isBullish ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : isBearish ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      {asset.direction}
                    </span>
                  </td>

                  {/* DXY Correlation */}
                  <td className="py-3 pr-3 font-mono-data text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        asset.dxyCorrelation === 'INVERSE'
                          ? 'bg-[#5E6BFF]/15 text-[#5E6BFF] border border-[#5E6BFF]/30'
                          : 'bg-white/[0.04] text-[#9A9DA3]'
                      }`}
                    >
                      {asset.dxyCorrelation}
                    </span>
                  </td>

                  {/* HTF Structure (BOS / ChoCH) */}
                  <td className="py-3 pr-3 font-mono-data text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          asset.htfMarketStructure === 'BOS'
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                        }`}
                      >
                        {asset.htfMarketStructure}
                      </span>
                      <span className="text-[10px] text-[#9A9DA3]">
                        {asset.htfMarketStructure === 'BOS' ? 'Bullish Break' : 'Change of Character'}
                      </span>
                    </div>
                  </td>

                  {/* Liquidity Sweep Status */}
                  <td className="py-3 pr-3 font-mono-data text-xs">
                    {asset.liquiditySweep === 'ASIAN_LOW_SWEPT' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#50D8E9]/15 text-[#50D8E9] border border-[#50D8E9]/30">
                        <Target className="w-3 h-3" /> Asian Low Swept
                      </span>
                    )}
                    {asset.liquiditySweep === 'ASIAN_HIGH_SWEPT' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                        <Target className="w-3 h-3" /> Asian High Swept
                      </span>
                    )}
                    {asset.liquiditySweep === 'NONE' && (
                      <span className="text-[10px] text-[#9A9DA3]/70">Range Intact</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                      }}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold transition-all ${
                        isSelected
                          ? 'bg-[#50D8E9] text-black shadow-sm'
                          : 'bg-[#1B1C1E] text-white hover:bg-white hover:text-black border border-[#232426]'
                      }`}
                    >
                      {isSelected ? 'ACTIVE' : 'SELECT'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
