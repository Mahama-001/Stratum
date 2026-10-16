import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col justify-center items-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#0071e3]/20 border-t-[#0071e3] animate-spin" />
          <div className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
        </div>
        <div className="font-mono-data text-xs text-[#6e6e73] tracking-wider font-semibold">
          CALIBRATING WORKSTATION...
        </div>
      </div>
    </div>
  );
}
