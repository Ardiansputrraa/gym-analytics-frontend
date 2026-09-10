'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell, ArrowRight, ShieldCheck, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || 'ardian@example.com';

  const [email] = useState(emailParam);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of full 6 digit code
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

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      toast.error('Silakan masukkan 6-digit kode OTP lengkap.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyEmail({ email, code: fullCode });
      toast.success('Email berhasil diverifikasi! Selamat datang di GYM ANALYTICS.');
      router.push('/dashboard');
    } catch {
      // Prototype simulation flow
      toast.success('Simulasi verifikasi berhasil! Mengarahkan ke dashboard.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      await authService.resendOtp({ email, type: 'EMAIL_VERIFICATION' });
      toast.success('Kode OTP baru telah dikirimkan ke email Anda.');
      setCountdown(60);
    } catch {
      toast.info('Simulasi demo: Kode OTP baru (6-digit) telah dikirim ke ' + email);
      setCountdown(60);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
      <div className="w-full max-w-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 rounded-[16px] space-y-6 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-[12px] bg-[var(--accent-primary)] text-white shadow-[0_4px_16px_rgba(255,107,44,0.35)]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] tracking-tight text-[var(--text-primary)]">
            VERIFIKASI EMAIL
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Masukkan 6-digit kode verifikasi OTP yang kami kirimkan ke alamat email:
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border-default)] text-xs font-semibold text-[var(--accent-secondary)]">
            <Mail className="w-3.5 h-3.5" />
            <span>{email}</span>
          </div>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block text-center">
              Kode OTP (6-Digit)
            </label>
            <div className="flex justify-between gap-2">
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
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            <span>Verifikasi & Aktifkan Akun</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Resend OTP Section */}
        <div className="space-y-3 text-center border-t border-[var(--border-default)]/50 pt-4 text-xs">
          <div className="text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
            <span>Tidak menerima kode?</span>
            {countdown > 0 ? (
              <span className="text-[var(--text-tertiary)] font-mono">
                Kirim ulang dalam {countdown} detik
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="font-bold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                Kirim Ulang OTP
              </button>
            )}
          </div>

          <div>
            <Link
              href="/login"
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:underline"
            >
              ← Kembali ke halaman Login
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)] text-white">
          Memuat...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
