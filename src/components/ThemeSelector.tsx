'use client';

import React, { useEffect, useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { Sun, Moon } from 'lucide-react';

interface ThemeSelectorProps {
  compact?: boolean;
}

export default function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const { colorMode, setColorMode } = useStratumStore();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('stratum-color-mode') : null;
    if (stored === 'dark' || stored === 'light') {
      setColorMode(stored);
    }
  }, [setColorMode]);

  const toggleTheme = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(nextMode);
  };

  const isDark = colorMode === 'dark';

  if (!mounted) {
    return (
      <div
        className={`rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] ${
          compact ? 'w-7 h-7' : 'w-24 h-7'
        }`}
      />
    );
  }

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className="p-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-[#ff9500]" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-[#0071e3]" />
        )}
      </button>
    );
  }

  return (
    <div
      onClick={toggleTheme}
      className="flex items-center p-0.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.08] cursor-pointer shadow-sm select-none transition-all hover:border-black/[0.15] dark:hover:border-white/[0.2] shrink-0"
      title={isDark ? 'Switch to Apple Light Mode' : 'Switch to Apple Dark Mode'}
      aria-label="Toggle Apple Dark and White Mode"
      role="button"
    >
      <div
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-all ${
          !isDark
            ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
            : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
        }`}
      >
        <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-[#ff9500]' : 'opacity-60'}`} />
        <span className="hidden sm:inline font-medium">Light</span>
      </div>
      <div
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-all ${
          isDark
            ? 'bg-[#1c1c1e] text-[#f5f5f7] shadow-sm border border-white/[0.1] font-semibold'
            : 'text-[#6e6e73] hover:text-[#1d1d1f]'
        }`}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-[#2997ff]' : 'opacity-60'}`} />
        <span className="hidden sm:inline font-medium">Dark</span>
      </div>
    </div>
  );
}
