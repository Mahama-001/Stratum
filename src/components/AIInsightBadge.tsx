'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES } from '@/lib/types';
import { useAIAnalysis, AnalysisType } from '@/lib/ai';
import { Activity, RefreshCw, AlertTriangle, X } from 'lucide-react';
import FormattedAIMessage from './FormattedAIMessage';

interface AIInsightBadgeProps {
  type: AnalysisType;
  contextOverride?: string;
  label?: string;
  className?: string;
  align?: 'left' | 'right';
}

/**
 * Drop-in quantitative desk audit badge that can be placed in any component.
 * Fetches structured analytical telemetry for the given type (risk, setup, session, drawdown, preflight).
 */
export default function AIInsightBadge({ 
  type, 
  contextOverride, 
  label, 
  className = '',
  align = 'left'
}: AIInsightBadgeProps) {
  const { currentTheme } = useStratumStore();
  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];
  const { analysis, isLoading, error, analyze } = useAIAnalysis();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isVisible]);

  const handleClick = useCallback(async () => {
    if (isVisible && analysis) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);
    await analyze(type, contextOverride);
  }, [isVisible, analysis, analyze, type, contextOverride]);

  const isActive = isVisible && analysis;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono-data font-bold transition-all ${
          isActive
            ? 'bg-black/[0.08] text-[#1d1d1f] border border-black/[0.15]'
            : 'bg-black/[0.03] hover:bg-black/[0.06] text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.08]'
        }`}
        title="View Quantitative Audit Telemetry"
      >
        {isLoading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <Activity className="w-3 h-3 text-[#6e6e73]" />
        )}
        <span>{label || 'Desk Audit'}</span>
      </button>

      {isVisible && (analysis || error) && (
        <div 
          className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-[260px] sm:w-[280px] max-w-[calc(100vw-32px)] z-50 animate-fadeIn`}
        >
          <div
            className="rounded-xl bg-white/95 border border-black/[0.08] p-3 relative shadow-2xl backdrop-blur-xl text-[#1d1d1f]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0071e3]" />
                <span
                  className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-[#1d1d1f]"
                >
                  Desk Quantitative Audit
                </span>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-[#86868b] hover:text-[#1d1d1f] p-1 rounded hover:bg-black/[0.05] transition-colors"
                title="Close audit"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {error ? (
              <div className="flex items-start gap-2 text-[11px] text-[#ff3b30]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#ff3b30]" />
                <span>{error}</span>
              </div>
            ) : (
              <FormattedAIMessage content={analysis} themeColor={activeTheme.primaryColor} />
            )}

            {/* Actions */}
            <div className="mt-2.5 pt-2 border-t border-black/[0.08] flex items-center justify-between">
              <button
                onClick={() => analyze(type, contextOverride)}
                disabled={isLoading}
                className="flex items-center gap-1 text-[9px] font-mono-data text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh analysis</span>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-[9px] font-mono-data text-[#6e6e73] hover:text-[#1d1d1f] transition-colors px-2 py-0.5 rounded bg-black/[0.04] hover:bg-black/[0.08] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
