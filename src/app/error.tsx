'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client error to monitoring
    console.error('Unhandled runtime error caught by Stratum ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background ambient red glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#ff453a]/05 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md border border-[#ff453a]/25 apple-card p-7 shadow-2xl relative z-10 text-center bg-white">
        <div className="w-12 h-12 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/20 flex items-center justify-center mx-auto mb-4 text-[#ff453a] shadow-sm">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f] mb-2">
          Runtime Exception Caught
        </h1>
        <p className="text-xs text-[#6e6e73] mb-6 leading-relaxed">
          An unexpected interface or data state occurred. Your active trade tickets and prop rules remain safely preserved.
        </p>

        {error?.digest && (
          <div className="mb-5 p-2 rounded-lg bg-black/[0.03] border border-black/[0.08] text-[10px] font-mono-data text-[#6e6e73]">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#0071e3] text-white font-bold text-xs hover:bg-[#0077ed] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl border border-black/[0.1] text-[#1d1d1f] hover:bg-black/[0.04] transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Workstation</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
