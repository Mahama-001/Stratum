'use client';

import React from 'react';
import { useStratumStore } from '@/lib/store';

interface StratumLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showBadge?: boolean;
  badgeText?: string;
  subtitle?: string;
  className?: string;
  hideTextOnMobile?: boolean;
}

export default function StratumLogo({
  size = 'md',
  variant,
  showBadge = true,
  badgeText = 'PRO',
  subtitle,
  className = '',
  hideTextOnMobile = false
}: StratumLogoProps) {
  const storeColorMode = useStratumStore((s) => s.colorMode);
  const isLight = storeColorMode === 'dark' ? false : (variant ? variant === 'light' : storeColorMode === 'light');
  const iconSizeClasses = {
    xs: 'w-6 h-6 rounded-[8px] p-1',
    sm: 'w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-[9px] p-1.5',
    md: 'w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-[10px] p-1.5',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] p-2'
  }[size];

  const textClasses = {
    xs: 'text-[12px] tracking-[0.05em]',
    sm: 'text-[13px] sm:text-[14px] tracking-[0.05em]',
    md: 'text-[15px] sm:text-[16px] tracking-[0.05em]',
    lg: 'text-[18px] sm:text-[20px] tracking-[0.04em]'
  }[size];

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none shrink-0 whitespace-nowrap group ${className}`}>
      {/* Apple Minimalist Stratum Emblem */}
      <div 
        className={`relative ${iconSizeClasses} shrink-0 backdrop-blur-md shadow-sm transition-all duration-200 flex items-center justify-center overflow-hidden ${
          isLight 
            ? 'bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.1] hover:border-black/[0.18]'
            : 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] hover:border-white/[0.22]'
        }`}
      >
        {/* Subtle Specular Highlight Line on Top Edge */}
        <div 
          className={`absolute top-0 inset-x-0 h-[1px] pointer-events-none ${
            isLight
              ? 'bg-gradient-to-r from-transparent via-black/10 to-transparent'
              : 'bg-gradient-to-r from-transparent via-white/25 to-transparent'
          }`} 
        />

        {/* Minimalist 3-Layer Strata Glyphs */}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Layer 1: Top Plate */}
          <rect 
            x="3" 
            y="4.5" 
            width="12" 
            height="2" 
            rx="1" 
            fill={isLight ? '#1d1d1f' : 'white'} 
            fillOpacity={isLight ? 0.9 : 0.9} 
          />
          
          {/* Layer 2: Institutional Displaced Accent Plate (Apple Blue) */}
          <rect 
            x="5" 
            y="9" 
            width="12" 
            height="2" 
            rx="1" 
            fill={isLight ? '#0071e3' : '#2997ff'} 
          />
          
          {/* Layer 3: Base Foundation Plate */}
          <rect 
            x="3" 
            y="13.5" 
            width="10" 
            height="2" 
            rx="1" 
            fill={isLight ? '#1d1d1f' : 'white'} 
            fillOpacity={isLight ? 0.5 : 0.55} 
          />
        </svg>
      </div>

      {/* Refined Apple Typography */}
      <div className={`flex flex-col justify-center leading-none ${hideTextOnMobile ? 'hidden sm:flex' : 'flex'}`}>
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold font-sans ${isLight ? 'text-[#1d1d1f]' : 'text-white'} ${textClasses}`}>
            STRATUM
          </span>
          {showBadge && (
            <span 
              className={`font-mono-data text-[9px] font-medium px-1.5 py-0.5 rounded-full tracking-wider hidden xs:inline-block ${
                isLight 
                  ? 'bg-black/[0.04] text-[#6e6e73] border border-black/[0.08]' 
                  : 'bg-white/[0.06] text-[#86868b] border border-white/[0.1]'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <span 
            className={`text-[10px] font-medium tracking-normal mt-0.5 ${
              isLight ? 'text-[#6e6e73]' : 'text-[#86868b]'
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
