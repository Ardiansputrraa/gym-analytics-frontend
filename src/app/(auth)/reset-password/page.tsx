'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell, ArrowRight, Lock, Eye, EyeOff, ShieldCheck, Mail, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { extractApiError } from '@/lib/utils';
import { toast } from 'sonner';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBlur = (field: 'email' | 'newPassword' | 'confirmPassword') => {
    if (field === 'email' && !email.trim()) {
      toast.error('Email harus diisi.');
    } else if (field === 'newPassword' && !newPassword.trim()) {
      toast.error('Kata sandi baru harus diisi.');
    } else if (field === 'confirmPassword' && !confirmPassword.trim()) {
      toast.error('Konfirmasi kata sandi harus diisi.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim(),
        code: fullCode,
        newPassword,
      });
      const successMsg =
        (res as { message?: string; data?: { message?: string } })?.message ||
        (res as { message?: string; data?: { message?: string } })?.data?.message ||
        'Kata sandi berhasil diatur ulang.';
      toast.success(successMsg);
      router.push('/login');
    } catch (err: unknown) {
      const backendMessage = extractApiError(err, 'Gagal mereset kata sandi. Pastikan kode OTP benar.');
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !email.trim()) {
      if (!email.trim()) toast.error('Silakan masukkan alamat email Anda terlebih dahulu.');
      return;
    }
    setIsResending(true);
    try {
      const res = await authService.resendOtp({ email: email.trim(), type: 'PASSWORD_RESET' });
      const successMsg =
        (res as { message?: string; data?: { message?: string } })?.message ||
        (res as { message?: string; data?: { message?: string } })?.data?.message ||
        'Kode OTP reset baru telah dikirim ke email Anda.';
      toast.success(successMsg);
      setCountdown(60);
    } catch (err: unknown) {
      const backendMessage = extractApiError(err, 'Gagal mengirim ulang kode OTP reset.');
      toast.error(backendMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
      <div className="w-full max-w-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 rounded-[16px] space-y-6 shadow-xl my-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-[12px] bg-[var(--accent-primary)] text-white shadow-[0_4px_16px_rgba(255,107,44,0.35)]">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] tracking-tight text-[var(--text-primary)]">
            ATUR ULANG KATA SANDI
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Masukkan kode OTP 6-digit yang dikirimkan ke email Anda dan buat kata sandi baru.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} noValidate className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className="w-full h-12 pl-10 pr-3.5 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* 6-Digit OTP Box */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Kode OTP (6-Digit)
              </label>
              {countdown > 0 ? (
                <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                  Ulangi dalam {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  Kirim Ulang
                </button>
              )}
            </div>
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 sm:w-12 sm:h-13 text-center text-xl font-bold font-mono rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                />
              ))}
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={() => handleBlur('newPassword')}
                className="w-full h-12 pl-10 pr-10 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Konfirmasi Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className="w-full h-12 pl-10 pr-10 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
            <span>Simpan Kata Sandi Baru</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/50 pt-4 space-y-2">
          <div>
            <Link href="/login" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:underline">
              ← Batal & Kembali ke Halaman Login
            </Link>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] pt-1">
            Developed by{' '}
            <a
              href="https://www.linkedin.com/in/ardiansputrraa"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--accent-primary)] hover:underline"
            >
              Fani Muh Ardian Saputra
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)] text-white">
          Memuat...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
