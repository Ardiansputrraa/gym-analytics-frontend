'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { extractApiError } from '@/lib/utils';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleBlur = () => {
    if (!email.trim()) {
      toast.error('Email harus diisi.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      const successMsg =
        (res as { message?: string; data?: { message?: string } })?.message ||
        (res as { message?: string; data?: { message?: string } })?.data?.message ||
        'Kode OTP reset password telah dikirim ke email Anda.';
      toast.success(successMsg);
      setIsSubmitted(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      }, 1500);
    } catch (err: unknown) {
      const backendMessage = extractApiError(err, 'Gagal mengirim kode OTP reset. Pastikan email terdaftar.');
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
      <div className="w-full max-w-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 rounded-[16px] space-y-6 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-[12px] bg-[var(--accent-secondary)] text-white shadow-[0_4px_16px_rgba(255,167,38,0.35)]">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] tracking-tight text-[var(--text-primary)]">
            LUPA KATA SANDI
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Masukkan alamat email yang terdaftar pada akun GYM ANALYTICS Anda. Kami akan mengirimkan 6-digit kode OTP untuk mereset kata sandi.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-4 rounded-[12px] bg-[var(--bg-base)] border border-[var(--accent-primary)]/40 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-[var(--accent-primary)] mx-auto" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Permintaan Terkirim!</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Kode OTP telah dikirimkan ke <strong>{email}</strong>. Mengarahkan Anda ke halaman reset kata sandi...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Alamat Email Terdaftar</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur}
                  className="w-full h-12 pl-10 pr-3.5 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              <span>Kirim Kode OTP Reset</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/50 pt-4 space-y-2">
          <div>
            Ingat kata sandi Anda?{' '}
            <Link href="/login" className="font-semibold text-[var(--accent-primary)] hover:underline">
              Kembali ke Login
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
