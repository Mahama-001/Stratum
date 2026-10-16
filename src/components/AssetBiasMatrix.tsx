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
  Target,
  Search
} from 'lucide-react';

export default function AssetBiasMatrix() {
  const { assets, selectedAsset, setSelectedAsset } = useStratumStore();
  const [activeCategory, setActiveCategory] = React.useState<'ALL' | 'INDEX' | 'FOREX' | 'COMMODITY' | 'CRYPTO'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories: { id: 'ALL' | 'INDEX' | 'FOREX' | 'COMMODITY' | 'CRYPTO'; label: string }[] = [
    { id: 'ALL', label: `ALL (${assets.length})` },
    { id: 'INDEX', label: `INDICES (${assets.filter(a => a.type === 'INDEX').length})` },
    { id: 'FOREX', label: `FOREX (${assets.filter(a => a.type === 'FOREX').length})` },
    { id: 'COMMODITY', label: `COMMODITIES (${assets.filter(a => a.type === 'COMMODITY').length})` },
    { id: 'CRYPTO', label: `CRYPTO (${assets.filter(a => a.type === 'CRYPTO').length})` }
  ];

  const filteredAssets = assets
    .filter(a => activeCategory === 'ALL' || a.type === activeCategory)
    .filter(a => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    });

  const formatPrice = (asset: MarketAsset) => {
    if (asset.type === 'FOREX') {
      return asset.pipSize === 0.01 ? asset.price.toFixed(2) : asset.price.toFixed(4);
    }
    if (asset.type === 'COMMODITY') {
      return asset.price > 1000 
        ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : asset.price.toFixed(2);
    }
    if (asset.type === 'INDEX' || asset.type === 'CRYPTO') {
      return asset.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    }
    return asset.price.toString();
  };

  const getTypeBadgeStyle = (type: MarketAsset['type']) => {
    return 'bg-black/[0.04] text-[#6e6e73] border-black/[0.08]';
  };

  return (
    <div className="bg-white/90 backdrop-blur-2xl border border-black/[0.08] rounded-[24px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.06)] flex flex-col h-full relative transition-all duration-300 text-[#1d1d1f]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6e6e73] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0071e3]" />
              Macro &amp; Structure Matrix
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] text-[#6e6e73] border border-black/[0.08]">
              {filteredAssets.length} of {assets.length} Active
            </span>
          </div>
          <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mt-1">Primary Prop Assets</h2>
        </div>

        {/* Controls: Search & Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-full bg-black/[0.04] border border-black/[0.08] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-all w-44 sm:w-56"
            />
          </div>

          {/* Category Filter Pills (Apple Segmented Pill) */}
          <div className="flex flex-wrap items-center gap-0.5 bg-black/[0.04] p-1 rounded-full border border-black/[0.08] text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white text-[#1d1d1f] shadow-sm border border-black/[0.08]'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Table Container */}
      <div className="overflow-x-auto flex-1 max-h-[620px] overflow-y-auto pr-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.06] text-[11px] uppercase tracking-wider text-[#6e6e73] font-medium">
              <th className="pb-3 font-medium">Asset Pair</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Session Bias</th>
              <th className="pb-3 font-medium">DXY Correlation</th>
              <th className="pb-3 font-medium">HTF Structure (4H/1D)</th>
              <th className="pb-3 font-medium">Liquidity Sweep</th>
              <th className="pb-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.symbol === asset.symbol;
              const isBullish = asset.direction === 'BULLISH';
              const isBearish = asset.direction === 'BEARISH';

              return (
                <tr
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`cursor-pointer transition-colors duration-200 group ${
                    isSelected
                      ? 'bg-black/[0.04]'
                      : 'hover:bg-black/[0.02]'
                  }`}
                >
                  {/* Symbol & Name */}
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-1 h-7 rounded-full transition-all ${
                          isSelected 
                            ? 'bg-[#0071e3]' 
                            : 'bg-transparent group-hover:bg-black/10'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-2">
                          {asset.symbol}
                          <span className={`text-[9px] px-2 py-0.2 rounded-full border font-semibold ${getTypeBadgeStyle(asset.type)}`}>
                            {asset.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6e6e73] line-clamp-1 font-normal">{asset.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Price & 24h change */}
                  <td className="py-3.5 pr-3 font-mono-data">
                    <div className="text-xs font-semibold text-[#1d1d1f]">
                      {formatPrice(asset)}
                    </div>
                    <div
                      className={`text-[10px] font-medium flex items-center gap-0.5 ${
                        asset.change24h >= 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'
                      }`}
                    >
                      {asset.change24h >= 0 ? '+' : ''}
                      {asset.change24h}%
                    </div>
                  </td>

                  {/* Session Direction */}
                  <td className="py-3.5 pr-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isBullish
                          ? 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20'
                          : isBearish
                          ? 'bg-[#ff3b30]/10 text-[#ff3b30] border border-[#ff3b30]/20'
                          : 'bg-black/[0.04] text-[#6e6e73] border border-black/[0.08]'
                      }`}
                    >
                      {isBullish ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#34c759]" />
                      ) : isBearish ? (
                        <ArrowDownRight className="w-3.5 h-3.5 text-[#ff3b30]" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-[#6e6e73]" />
                      )}
                      {asset.direction}
                    </span>
                  </td>

                  {/* DXY Correlation */}
                  <td className="py-3.5 pr-3 font-mono-data text-xs">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.04] text-[#1d1d1f] border border-black/[0.08]">
                      {asset.dxyCorrelation}
                    </span>
                  </td>

                  {/* HTF Structure (BOS / ChoCH) */}
                  <td className="py-3.5 pr-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono-data ${
                          asset.htfMarketStructure === 'BOS'
                            ? 'bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20'
                            : 'bg-[#ff3b30]/10 text-[#ff3b30] border border-[#ff3b30]/20'
                        }`}
                      >
                        {asset.htfMarketStructure}
                      </span>
                      <span className="text-[11px] text-[#6e6e73]">
                        {asset.htfMarketStructure === 'BOS' ? 'Bullish Break' : 'Change of Character'}
                      </span>
                    </div>
                  </td>

                  {/* Liquidity Sweep Status */}
                  <td className="py-3.5 pr-3 text-xs">
                    {asset.liquiditySweep === 'ASIAN_LOW_SWEPT' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20">
                        <Target className="w-3 h-3 text-[#34c759]" /> Asian Low Swept
                      </span>
                    )}
                    {asset.liquiditySweep === 'ASIAN_HIGH_SWEPT' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ff3b30]/10 text-[#ff3b30] border border-[#ff3b30]/20">
                        <Target className="w-3 h-3 text-[#ff3b30]" /> Asian High Swept
                      </span>
                    )}
                    {asset.liquiditySweep === 'NONE' && (
                      <span className="text-[11px] text-[#6e6e73]">Range Intact</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0071e3] text-white shadow-sm'
                          : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08] hover:text-[#1d1d1f] border border-black/[0.08]'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Select'}
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
