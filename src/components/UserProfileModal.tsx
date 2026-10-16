'use client';

import React, { useState } from 'react';
import { useStratumStore } from '@/lib/store';
import { 
  X, 
  User, 
  Mail, 
  Shield, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { soundEngine } from '@/lib/soundEngine';

export default function UserProfileModal() {
  const {
    currentUser,
    setCurrentUser,
    profileModalOpen,
    setProfileModalOpen,
    setActiveTab,
    logoutUser,
    addToast,
  } = useStratumStore();

  const [toggling2FA, setToggling2FA] = useState(false);

  if (!profileModalOpen || !currentUser) return null;

  const handleToggle2FA = async () => {
    if (toggling2FA) return;
    setToggling2FA(true);

    const willEnable = !(currentUser.twoFactorEnabled === 1);

    try {
      const res = await fetch('/api/auth/2fa/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: willEnable }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({
          type: 'error',
          title: '2FA Update Failed',
          message: data.error || 'Could not update two-factor authentication settings.',
        });
        setToggling2FA(false);
        return;
      }

      soundEngine.playSuccessChime();
      setCurrentUser({
        ...currentUser,
        twoFactorEnabled: data.twoFactorEnabled,
      });

      addToast({
        type: 'success',
        title: willEnable ? '2FA Protection Enabled' : '2FA Protection Disabled',
        message: willEnable 
          ? 'Your account now requires a 6-digit email code on every sign-in.' 
          : 'Two-factor login requirement has been turned off.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to authentication server.',
      });
    } finally {
      setToggling2FA(false);
    }
  };

  const is2FAActive = currentUser.twoFactorEnabled === 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn"
      onClick={() => setProfileModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-title"
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-black/[0.1] dark:border-white/[0.14] bg-white/95 dark:bg-[#15161b]/98 backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.8)] text-[#1d1d1f] dark:text-[#f5f5f7] relative overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-xs font-bold">
              {(currentUser.name || currentUser.email)[0].toUpperCase()}
            </div>
            <div>
              <h2 id="user-profile-title" className="text-sm font-bold text-[#1d1d1f] dark:text-white tracking-tight leading-tight">
                Trader Security &amp; Profile
              </h2>
              <span className="text-[10px] text-[#6e6e73] dark:text-[#a1a1a6] font-mono-data">
                {currentUser.role?.toUpperCase() || 'TRADER'} ACCOUNT
              </span>
            </div>
          </div>

          <button
            onClick={() => setProfileModalOpen(false)}
            className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] flex items-center justify-center text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Trader Overview Card */}
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Trader Name</span>
              <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                {currentUser.name || 'Anonymous Trader'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Email Address</span>
              <span className="text-xs font-mono-data font-semibold text-[#1d1d1f] dark:text-white">
                {currentUser.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Account Status</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137a34] dark:text-[#30d158]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active &amp; Verified
              </span>
            </div>
          </div>

          {/* 2FA Security Control Card */}
          <div className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-[#f8f8fa] dark:bg-[#111217] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  is2FAActive 
                    ? 'bg-[#30d158]/15 text-[#137a34] dark:text-[#30d158] border border-[#30d158]/30' 
                    : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#a1a1a6]'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1d1d1f] dark:text-white">
                      Two-Factor Authentication (2FA)
                    </span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      is2FAActive
                        ? 'bg-[#30d158]/15 text-[#137a34] dark:text-[#30d158] border border-[#30d158]/30'
                        : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#a1a1a6]'
                    }`}>
                      {is2FAActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                    Require a 6-digit confirmation code dispatched to your email on every login attempt.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggle2FA}
                disabled={toggling2FA}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                  is2FAActive ? 'bg-[#34c759]' : 'bg-black/20 dark:bg-white/20'
                }`}
                role="switch"
                aria-checked={is2FAActive}
                aria-label="Toggle Two-Factor Authentication"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    is2FAActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                setProfileModalOpen(false);
                setActiveTab('JOURNAL');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1a1b22] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-xs font-semibold text-[#1d1d1f] dark:text-white transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                <span>Institutional Trade Journal &amp; Audit Reports</span>
              </div>
              <span className="text-[#6e6e73] text-[11px]">&rarr;</span>
            </button>

            <button
              onClick={async () => {
                setProfileModalOpen(false);
                await logoutUser();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#ff453a] hover:bg-[#ff453a]/10 border border-[#ff453a]/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out of Stratum</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
