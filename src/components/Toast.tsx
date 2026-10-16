'use client';

import React from 'react';
import { useStratumStore } from '../lib/store';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useStratumStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-[#0071e3]/30 dark:border-[#2997ff]/40';
        let bgGlow = 'bg-white/95 dark:bg-[#15161b]/95';
        let iconColor = 'text-[#0071e3] dark:text-[#2997ff]';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-[#30d158]/35 dark:border-[#30d158]/45';
          iconColor = 'text-[#137a34] dark:text-[#30d158]';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-[#ff9f0a]/35 dark:border-[#ff9f0a]/45';
          iconColor = 'text-[#c97400] dark:text-[#ff9f0a]';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-[#ff453a]/35 dark:border-[#ff453a]/45';
          iconColor = 'text-[#d70015] dark:text-[#ff453a]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border ${borderClass} ${bgGlow} backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-200 transform translate-y-0 opacity-100 animate-in slide-in-from-bottom-3 fade-in`}
            role="status"
          >
            <div className={`mt-0.5 shrink-0 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold text-[#1d1d1f] dark:text-white tracking-tight truncate">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors duration-150 p-1 -mr-1 -mt-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/10 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0071e3] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

