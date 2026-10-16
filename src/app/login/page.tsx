'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES } from '@/lib/types';
import StratumLogo from '@/components/StratumLogo';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, currentTheme, addToast } = useStratumStore();
  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (password.length > 128) {
      setErrorMessage('Password cannot exceed 128 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (data.user) {
        setCurrentUser(data.user);
        addToast({
          type: 'success',
          title: 'Signed In',
          message: `Logged in as ${data.user.email}`
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
          <StratumLogo size="xs" showBadge={true} badgeText="AUTH" variant="light" />
        </div>

        {/* Glass Card */}
        <div className="border border-black/[0.08] rounded-2xl bg-white/90 backdrop-blur-2xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative overflow-hidden text-[#1d1d1f]">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${activeTheme.primaryColor}, transparent)`,
            }}
          />

          <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f] mb-1">
            Log In to Stratum
          </h1>
          <p className="text-xs text-[#6e6e73] mb-6">
            Enter your credentials to access your synchronized prop firm workstation.
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs flex items-center gap-2">
              <span>{errorMessage}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/25 text-[#30d158] text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>Authentication successful. Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Your password"
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
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6e6e73]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#0071e3] hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
