'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES } from '@/lib/types';
import StratumLogo from '@/components/StratumLogo';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { setCurrentUser, currentTheme, addToast } = useStratumStore();
  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verification step state
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [devPreviewCode, setDevPreviewCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (password.length > 128) {
      setErrorMessage('Password cannot exceed 128 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          password, 
          name: name.trim().slice(0, 100) 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      if (data.requiresVerification) {
        setVerificationStep(true);
        setDevPreviewCode(data.previewCode || null);
        setSuccessMessage('A 6-digit confirmation code was sent to your email.');
        setResendCooldown(30);
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (data.user) {
        setCurrentUser(data.user);
        addToast({
          type: 'success',
          title: 'Account Created',
          message: `Welcome to Stratum, ${data.user.name || data.user.email}!`
        });
      }

      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch {
      setErrorMessage('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !verificationCode.trim()) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: verificationCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Verification code failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setSuccessMessage('Email verified successfully! Welcome to Stratum.');
      if (data.user) {
        setCurrentUser(data.user);
        addToast({
          type: 'success',
          title: 'Email Verified',
          message: `Welcome to Stratum, ${data.user.name || data.user.email}!`
        });
      }

      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch {
      setErrorMessage('Network connection error during code verification.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to resend code.');
      } else {
        setSuccessMessage('A fresh verification code has been dispatched.');
        if (data.previewCode) {
          setDevPreviewCode(data.previewCode);
        }
        setResendCooldown(30);
      }
    } catch {
      setErrorMessage('Network error while resending verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-10"
        style={{ backgroundColor: activeTheme.primaryColor }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-mono-data text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Terminal</span>
          </Link>
          <StratumLogo size="xs" showBadge={true} badgeText="JOIN" variant="light" />
        </div>

        {/* Glass Card */}
        <div className="border border-black/[0.08] rounded-2xl bg-white/95 backdrop-blur-2xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative overflow-hidden text-[#1d1d1f]">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${activeTheme.primaryColor}, transparent)`,
            }}
          />

          {verificationStep ? (
            <div className="space-y-4">
              <div className="text-left mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center text-[#0071e3] mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                  Verify Your Email
                </h1>
                <p className="text-xs font-medium text-[#6e6e73] mt-1.5 leading-relaxed">
                  We sent a 6-digit confirmation code to <strong className="text-[#1d1d1f] font-mono-data">{email}</strong>. Enter the code below to activate your account.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs flex items-start gap-2.5 font-semibold">
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/25 text-[#137a34] text-xs flex items-center gap-2.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#30d158]" />
                  <span>{successMessage}</span>
                </div>
              )}

              {devPreviewCode && (
                <div
                  onClick={() => setVerificationCode(devPreviewCode)}
                  className="p-2.5 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-xs text-[#0071e3] flex items-center justify-between cursor-pointer hover:bg-[#0071e3]/15 transition-colors"
                >
                  <span>Simulation code: <strong>{devPreviewCode}</strong></span>
                  <span className="text-[10px] underline font-bold">Auto-fill</span>
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider font-mono-data">
                    6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    required
                    disabled={loading}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full tracking-[0.45em] text-center text-2xl font-bold font-mono-data bg-[#f8f8fa] border border-black/[0.16] text-[#1d1d1f] rounded-xl py-3 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6 || success}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Activate Account</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationStep(false);
                      setErrorMessage(null);
                    }}
                    className="text-[#6e6e73] hover:text-[#1d1d1f] cursor-pointer font-medium"
                  >
                    &larr; Back to edit details
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendCode}
                    className="text-[#0071e3] hover:underline font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f] mb-1">
                Create Trader Account
              </h1>
              <p className="text-xs text-[#6e6e73] mb-6">
                Equip your trading with institutional prop firm rule telemetry.
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs flex items-center gap-2">
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/25 text-[#137a34] text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#30d158] shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono-data text-[#6e6e73] mb-1.5 font-semibold">
                    Trader Name / Nickname
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6e6e73] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={100}
                      disabled={loading}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full bg-black/[0.03] border border-black/[0.1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-data text-[#6e6e73] mb-1.5 font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6e6e73] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      maxLength={254}
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@stratum.prop"
                      className="w-full bg-black/[0.03] border border-black/[0.1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-data text-[#6e6e73] mb-1.5 font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6e6e73] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      maxLength={128}
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-black/[0.03] border border-black/[0.1] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-mono-data font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-[#0071e3] hover:bg-[#0077ed] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue & Verify Email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-[#6e6e73]">
                Already have an account?{' '}
                <Link href="/login" className="text-[#0071e3] hover:underline font-semibold">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

