'use client';

import React, { useState, useEffect } from 'react';
import { useStratumStore } from '@/lib/store';
import { STRATUM_THEMES } from '@/lib/types';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Shield 
} from 'lucide-react';
import StratumLogo from './StratumLogo';
import { soundEngine } from '@/lib/soundEngine';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalOpen,
    setCurrentUser,
    currentTheme,
    addToast,
  } = useStratumStore();

  const activeTheme = STRATUM_THEMES.find((t) => t.id === currentTheme) || STRATUM_THEMES[0];

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(authModalMode || 'LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email verification state (Signup flow)
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [devPreviewCode, setDevPreviewCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot Password / Password Reset states
  const [forgotStep, setForgotStep] = useState(false);
  const [resetStep, setResetStep] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Two-Factor Authentication state (Login 2FA challenge)
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Keep local mode in sync when store opens modal
  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalMode);
      setVerificationStep(false);
      setVerificationCode('');
      setForgotStep(false);
      setResetStep(false);
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setTwoFactorStep(false);
      setTwoFactorCode('');
      setDevPreviewCode(null);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [authModalOpen, authModalMode]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!authModalOpen) return null;

  const resetAllSubViews = () => {
    setVerificationStep(false);
    setForgotStep(false);
    setResetStep(false);
    setTwoFactorStep(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevPreviewCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Strict validation
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password.length > 128) {
      setErrorMessage('Password cannot exceed 128 characters.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'SIGNUP' ? '/api/auth/signup' : '/api/auth/login';
      const payload = mode === 'SIGNUP' 
        ? { email: cleanEmail, password, name: name.trim().slice(0, 100) } 
        : { email: cleanEmail, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // If signup requires email verification
      if (mode === 'SIGNUP' && data.requiresVerification) {
        setVerificationStep(true);
        setDevPreviewCode(data.previewCode || null);
        setSuccessMessage('A 6-digit confirmation code was sent to your email.');
        setResendCooldown(30);
        setLoading(false);
        return;
      }

      // If login requires two-factor authentication (2FA)
      if (mode === 'LOGIN' && data.requiresTwoFactor) {
        setTwoFactorStep(true);
        setDevPreviewCode(data.previewCode || null);
        setSuccessMessage('A 6-digit two-factor verification code was sent to your email.');
        setResendCooldown(30);
        setLoading(false);
        return;
      }

      const welcomeText = mode === 'SIGNUP' ? 'Account created successfully!' : 'Welcome back!';
      setSuccessMessage(welcomeText);
      soundEngine.playSuccessChime();

      if (data.user) {
        setCurrentUser(data.user);
        addToast({
          type: 'success',
          title: mode === 'SIGNUP' ? 'Welcome to Stratum!' : 'Signed In',
          message: `Logged in as ${data.user.email}`
        });
      }

      setTimeout(() => {
        setAuthModalOpen(false);
        setPassword('');
      }, 700);
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMessage('An unexpected network error occurred. Please check your connection.');
    } finally {
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

      soundEngine.playSuccessChime();
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
        setAuthModalOpen(false);
        setVerificationStep(false);
        setPassword('');
        setVerificationCode('');
      }, 700);
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMessage('Network connection error during code verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || twoFactorCode.trim().length !== 6) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: twoFactorCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid 2FA security code.');
        setLoading(false);
        return;
      }

      soundEngine.playSuccessChime();
      setSuccessMessage('Two-factor security verified! Access granted.');
      if (data.user) {
        setCurrentUser(data.user);
        addToast({
          type: 'success',
          title: 'Welcome Back',
          message: `Logged in securely as ${data.user.email}`
        });
      }

      setTimeout(() => {
        setAuthModalOpen(false);
        setTwoFactorStep(false);
        setTwoFactorCode('');
        setPassword('');
      }, 700);
    } catch {
      setErrorMessage('Network connection error during 2FA code verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to dispatch reset code.');
        setLoading(false);
        return;
      }

      setResetStep(true);
      setForgotStep(false);
      setDevPreviewCode(data.previewCode || null);
      setSuccessMessage('A 6-digit recovery code has been dispatched to your email.');
      setResendCooldown(30);
    } catch {
      setErrorMessage('Network error while requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (resetCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters in length.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: resetCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Password reset failed. Invalid or expired code.');
        setLoading(false);
        return;
      }

      soundEngine.playSuccessChime();
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been changed. You may now log in with your new credentials.',
      });

      setResetStep(false);
      setForgotStep(false);
      setMode('LOGIN');
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password updated successfully! Sign in with your new password.');
    } catch {
      setErrorMessage('Network connection error during password update.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const endpoint = forgotStep || resetStep ? '/api/auth/forgot-password' : '/api/auth/resend-code';
      const res = await fetch(endpoint, {
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn"
      onClick={() => setAuthModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Glassy Modal Container */}
      <div
        className="w-full max-w-md rounded-[28px] border border-black/[0.1] dark:border-white/[0.14] bg-white/95 dark:bg-[#15161b]/98 backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.8)] text-[#1d1d1f] dark:text-[#f5f5f7] relative overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <StratumLogo size="xs" showBadge={false} />
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] flex items-center justify-center text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6">
          {/* ────────────────────────────────────────────────────────── */}
          {/* VIEW 1: TWO-FACTOR AUTHENTICATION (2FA OTP)                */}
          {/* ────────────────────────────────────────────────────────── */}
          {twoFactorStep ? (
            <div className="space-y-4">
              <div className="text-left mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 border border-[#0071e3]/20 dark:border-[#2997ff]/30 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mt-1.5 leading-relaxed">
                  Enter the 6-digit security code sent to <strong className="text-[#1d1d1f] dark:text-white font-mono-data">{email}</strong> to authorize this login session.
                </p>
              </div>

              {/* Error & Success Feedback */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs flex items-start gap-2.5 animate-fadeIn font-semibold">
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/25 text-[#137a34] dark:text-[#30d158] text-xs flex items-center gap-2.5 animate-fadeIn font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {devPreviewCode && (
                <div
                  onClick={() => setTwoFactorCode(devPreviewCode)}
                  className="p-2.5 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-xs text-[#0071e3] dark:text-[#2997ff] flex items-center justify-between cursor-pointer hover:bg-[#0071e3]/15 transition-colors"
                >
                  <span>Simulation 2FA code: <strong>{devPreviewCode}</strong></span>
                  <span className="text-[10px] underline font-bold">Auto-fill</span>
                </div>
              )}

              <form onSubmit={handleVerifyTwoFactor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#e5e5ea] mb-2 uppercase tracking-wider">
                    6-Digit 2FA Security Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    required
                    disabled={loading}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full tracking-[0.45em] text-center text-2xl font-bold font-mono-data bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.22] text-[#1d1d1f] dark:text-white rounded-xl py-3 focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length !== 6}
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
                      <span>Authorize & Sign In</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={resetAllSubViews}
                    className="text-[#515154] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer font-medium"
                  >
                    &larr; Back to Log In
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendCode}
                    className="text-[#0071e3] dark:text-[#2997ff] hover:underline font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          ) : forgotStep ? (
            /* ────────────────────────────────────────────────────────── */
            /* VIEW 2: FORGOT PASSWORD REQUEST                           */
            /* ────────────────────────────────────────────────────────── */
            <div className="space-y-4">
              <div className="text-left mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 border border-[#0071e3]/20 dark:border-[#2997ff]/30 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] mb-3">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                  Reset Password
                </h2>
                <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mt-1.5 leading-relaxed">
                  Enter your registered trader email address and we&apos;ll send a 6-digit recovery code to reset your access.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs flex items-start gap-2.5 animate-fadeIn font-semibold">
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/25 text-[#137a34] dark:text-[#30d158] text-xs flex items-center gap-2.5 animate-fadeIn font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#e5e5ea] mb-1.5 uppercase tracking-wider">
                    Trader Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6e6e73] dark:text-[#a1a1a6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoFocus
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@stratum.prop"
                      className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.22] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1d1d1f] dark:text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send 6-Digit Reset Code</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={resetAllSubViews}
                    className="text-xs text-[#515154] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer font-medium"
                  >
                    &larr; Back to Log In
                  </button>
                </div>
              </form>
            </div>
          ) : resetStep ? (
            /* ────────────────────────────────────────────────────────── */
            /* VIEW 3: SET NEW PASSWORD WITH RESET CODE                  */
            /* ────────────────────────────────────────────────────────── */
            <div className="space-y-4">
              <div className="text-left mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 border border-[#0071e3]/20 dark:border-[#2997ff]/30 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                  Enter Reset Code &amp; New Password
                </h2>
                <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mt-1.5 leading-relaxed">
                  Enter the 6-digit code sent to <strong className="text-[#1d1d1f] dark:text-white font-mono-data">{email}</strong> and choose a new password.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs flex items-start gap-2.5 animate-fadeIn font-semibold">
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/25 text-[#137a34] dark:text-[#30d158] text-xs flex items-center gap-2.5 animate-fadeIn font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {devPreviewCode && (
                <div
                  onClick={() => setResetCode(devPreviewCode)}
                  className="p-2.5 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-xs text-[#0071e3] dark:text-[#2997ff] flex items-center justify-between cursor-pointer hover:bg-[#0071e3]/15 transition-colors"
                >
                  <span>Simulation Reset Code: <strong>{devPreviewCode}</strong></span>
                  <span className="text-[10px] underline font-bold">Auto-fill</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#e5e5ea] mb-1.5 uppercase tracking-wider">
                    6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    disabled={loading}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full tracking-[0.35em] text-center text-xl font-bold font-mono-data bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.22] text-[#1d1d1f] dark:text-white rounded-xl py-2.5 focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#e5e5ea] mb-1.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6e6e73] dark:text-[#a1a1a6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      disabled={loading}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.22] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1d1d1f] dark:text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#e5e5ea] mb-1.5 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6e6e73] dark:text-[#a1a1a6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.22] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1d1d1f] dark:text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetCode.length !== 6 || !newPassword || newPassword !== confirmPassword}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Update Password &amp; Sign In</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={resetAllSubViews}
                    className="text-[#515154] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer font-medium"
                  >
                    &larr; Cancel
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendCode}
                    className="text-[#0071e3] dark:text-[#2997ff] hover:underline font-semibold cursor-pointer disabled:opacity-40"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          ) : verificationStep ? (
            /* ────────────────────────────────────────────────────────── */
            /* VIEW 4: EMAIL VERIFICATION CODE (SIGNUP)                  */
            /* ────────────────────────────────────────────────────────── */
            <div className="space-y-4">
              <div className="text-left mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 border border-[#0071e3]/20 dark:border-[#2997ff]/30 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                  Verify Your Email
                </h2>
                <p className="text-xs font-medium text-[#515154] dark:text-[#d1d1d6] mt-1.5 leading-relaxed">
                  We sent a 6-digit verification code to <strong className="text-[#1d1d1f] dark:text-white font-mono-data">{email}</strong>. Enter the code below to activate your account.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs flex items-start gap-2.5 animate-fadeIn font-semibold">
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/25 text-[#137a34] dark:text-[#30d158] text-xs flex items-center gap-2.5 animate-fadeIn font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {devPreviewCode && (
                <div
                  onClick={() => setVerificationCode(devPreviewCode)}
                  className="p-2.5 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-xs text-[#0071e3] dark:text-[#2997ff] flex items-center justify-between cursor-pointer hover:bg-[#0071e3]/15 transition-colors"
                >
                  <span>Simulation code: <strong>{devPreviewCode}</strong></span>
                  <span className="text-[10px] underline font-bold">Auto-fill</span>
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#e5e5ea] mb-2 uppercase tracking-wider">
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
                    className="w-full tracking-[0.45em] text-center text-2xl font-bold font-mono-data bg-[#f8f8fa] dark:bg-[#0c0d11] border border-black/[0.16] dark:border-white/[0.22] text-[#1d1d1f] dark:text-white rounded-xl py-3 focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
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
                      <span>Confirm &amp; Activate Account</span>
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
                    className="text-[#515154] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer font-medium"
                  >
                    &larr; Back to edit details
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendCode}
                    className="text-[#0071e3] dark:text-[#2997ff] hover:underline font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ────────────────────────────────────────────────────────── */
            /* VIEW 5: DEFAULT LOGIN / SIGNUP TABS                       */
            /* ────────────────────────────────────────────────────────── */
            <>
              <div className="grid grid-cols-2 p-1 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-full mb-6 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                    mode === 'LOGIN'
                      ? 'bg-white dark:bg-[#2c2d33] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.08] dark:border-white/[0.2]'
                      : 'text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGNUP');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                    mode === 'SIGNUP'
                      ? 'bg-white dark:bg-[#2c2d33] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.08] dark:border-white/[0.2]'
                      : 'text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="mb-5 text-left">
                <h2 id="auth-modal-title" className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                  {mode === 'LOGIN' ? 'Access Your Prop Trading Terminal' : 'Join Stratum Institutional'}
                </h2>
                <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] mt-1.5 leading-relaxed font-normal">
                  {mode === 'LOGIN'
                    ? 'Sign in to access your synchronized risk parameters and accounts.'
                    : 'Create your trader profile to persist rules, tickets, and telemetry.'}
                </p>
              </div>

              {/* Error & Success Feedback */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs flex items-start gap-2.5 animate-fadeIn">
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/25 text-[#30d158] text-xs flex items-center gap-2.5 animate-fadeIn">
                  <ShieldCheck className="w-4 h-4 text-[#30d158] shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'SIGNUP' && (
                  <div>
                    <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6] mb-1.5">
                      Trader Name / Handle
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#6e6e73] dark:text-[#a1a1a6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={100}
                        disabled={loading}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.1] dark:border-white/[0.12] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] dark:placeholder-[#8e8e93] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:bg-white dark:focus:bg-[#1e1f25] transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6e6e73] dark:text-[#a1a1a6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      maxLength={254}
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@stratum.prop"
                      className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.1] dark:border-white/[0.12] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] dark:placeholder-[#8e8e93] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:bg-white dark:focus:bg-[#1e1f25] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
                      Password
                    </label>
                    {mode === 'LOGIN' && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep(true);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[11px] font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6e6e73] dark:text-[#a1a1a6] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      maxLength={128}
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.1] dark:border-white/[0.12] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] dark:placeholder-[#8e8e93] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:bg-white dark:focus:bg-[#1e1f25] transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-full text-xs font-medium transition-all shadow-[0_4px_14px_0_rgba(0,113,227,0.39)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'LOGIN' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Footer switch */}
              <div className="mt-5 text-center text-xs text-[#6e6e73] dark:text-[#a1a1a6]">
                {mode === 'LOGIN' ? (
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => {
                        setMode('SIGNUP');
                        setErrorMessage(null);
                      }}
                      className="text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{' '}
                    <button
                      onClick={() => {
                        setMode('LOGIN');
                        setErrorMessage(null);
                      }}
                      className="text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium cursor-pointer"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
