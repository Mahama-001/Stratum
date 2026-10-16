import React from 'react';
import Link from 'next/link';
import StratumLogo from '@/components/StratumLogo';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#0071e3]/08 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md apple-card p-8 shadow-2xl border border-black/[0.08] relative z-10 text-center bg-white">
        <div className="mb-6 flex justify-center">
          <StratumLogo size="sm" showBadge={true} badgeText="404" variant="light" />
        </div>

        <div className="font-mono-data text-xs text-[#0071e3] font-bold uppercase tracking-widest mb-1.5">
          Route Not Found
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] mb-2.5">
          Terminal Vector Out of Range
        </h1>
        <p className="text-xs text-[#6e6e73] mb-6 leading-relaxed">
          The requested coordinate or dashboard view does not exist. All active accounts and parameters remain intact.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#0071e3] text-white font-bold text-xs hover:bg-[#0077ed] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Terminal</span>
          </Link>
          <Link
            href="/#overview"
            className="flex-1 py-2.5 px-4 rounded-xl border border-black/[0.1] text-[#1d1d1f] hover:bg-black/[0.04] transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
