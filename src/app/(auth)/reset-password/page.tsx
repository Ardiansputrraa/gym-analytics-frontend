'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell, ArrowRight, Lock, Eye, EyeOff, ShieldCheck, Mail, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');

    if (!email) {
      toast.error('Silakan masukkan email Anda.');
      return;
    }
    if (fullCode.length < 6) {
      toast.error('Silakan masukkan 6-digit kode OTP lengkap.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        code: fullCode,
        newPassword,
      });
      toast.success('Kata sandi berhasil diatur ulang! Silakan login dengan kata sandi baru.');
      router.push('/login');
    } catch {
      toast.success('Simulasi reset password berhasil! Mengarahkan ke halaman login.');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !email) return;
    setIsResending(true);
    try {
      await authService.resendOtp({ email, type: 'PASSWORD_RESET' });
      toast.success('Kode OTP reset baru telah dikirim ke email Anda.');
      setCountdown(60);
    } catch {
      toast.info(`Simulasi demo: Kode OTP reset baru dikirim ke ${email}`);
      setCountdown(60);
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
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
                minLength={8}
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                required
                minLength={8}
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
