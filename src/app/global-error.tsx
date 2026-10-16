'use client';

import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#fbfbfd] text-[#1d1d1f] min-h-screen flex items-center justify-center p-4 antialiased font-sans">
        <div className="max-w-md w-full border border-black/[0.08] bg-white rounded-2xl p-7 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#1d1d1f] mb-2">Critical Application Fault</h1>
          <p className="text-xs text-[#6e6e73] mb-6 leading-relaxed">
            A critical layout-level error occurred. Stratum system safeguards caught the exception before data corruption.
          </p>
          {error?.digest && (
            <div className="mb-5 p-2 rounded-lg bg-black/[0.03] border border-black/[0.08] text-[10px] font-mono text-[#6e6e73]">
              Digest: {error.digest}
            </div>
          )}
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0071e3] text-white font-bold text-xs hover:bg-[#0077ed] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Platform</span>
          </button>
        </div>
      </body>
    </html>
  );
}
