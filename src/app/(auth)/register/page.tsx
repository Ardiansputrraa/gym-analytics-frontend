'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, Lock, Mail, User, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { extractApiError } from '@/lib/utils';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gym_access_token') : null;
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleBlur = (field: 'name' | 'email' | 'password') => {
    if (field === 'name' && !name.trim()) {
      toast.error('Nama lengkap harus diisi.');
    } else if (field === 'email' && !email.trim()) {
      toast.error('Email harus diisi.');
    } else if (field === 'password' && !password.trim()) {
      toast.error('Password harus diisi.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword: password,
      });
      const successMsg =
        (res as { message?: string; data?: { message?: string } })?.message ||
        (res as { message?: string; data?: { message?: string } })?.data?.message ||
        'Pendaftaran berhasil. Silakan periksa kode OTP di email Anda.';
      toast.success(successMsg);
      setIsOtpStep(true);
    } catch (err: unknown) {
      const backendMessage = extractApiError(err, 'Gagal mendaftar. Silakan periksa kembali data Anda.');
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.verifyEmail({ email: email.trim(), otp: otpCode.trim() });
      const successMsg =
        (res as { message?: string; data?: { message?: string } })?.message ||
        (res as { message?: string; data?: { message?: string } })?.data?.message ||
        'Email berhasil diverifikasi.';
      toast.success(successMsg);
      router.push('/login');
    } catch (err: unknown) {
      const backendMessage = extractApiError(err, 'Kode OTP tidak valid atau telah kedaluwarsa.');
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await authService.googleAuth({
        email: email.trim() || 'athlete.new@gmail.com',
        name: name.trim() || 'Gym Athlete Google',
        phone: phone.trim() || undefined,
      });
      const token =
        (res as { data?: { accessToken?: string }; accessToken?: string })?.data
          ?.accessToken || res?.accessToken;
      if (token) {
        localStorage.setItem('gym_access_token', token);
      }
      const successMsg =
        (res as { message?: string; data?: { message?: string } })?.message ||
        (res as { message?: string; data?: { message?: string } })?.data?.message ||
        'Pendaftaran Google SSO berhasil.';
      toast.success(successMsg);
      router.push('/dashboard');
    } catch (err: unknown) {
      const backendMessage = extractApiError(err, 'Pendaftaran Google SSO gagal.');
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
      <div className="w-full max-w-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 rounded-[16px] space-y-6 shadow-xl my-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-[12px] bg-[var(--accent-primary)] text-[var(--accent-primary-ink)]">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
            {isOtpStep ? 'VERIFIKASI EMAIL' : 'DAFTAR AKUN BARU'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {isOtpStep
              ? `Masukkan 6-digit kode OTP yang kami kirimkan ke ${email}`
              : 'Mulai catat latihan, pantau perubahan tubuh, dan kelola target kalori.'}
          </p>
        </div>

        {!isOtpStep ? (
          <>
            {/* Google SSO Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleRegister}
              className="w-full h-12 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface-raised)] hover:border-[var(--text-tertiary)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Daftar dengan Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[var(--border-default)] w-full" />
              <span className="bg-[var(--bg-surface)] px-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider shrink-0">
                atau isi formulir manual
              </span>
              <div className="border-t border-[var(--border-default)] w-full" />
            </div>

            <form onSubmit={handleRegister} noValidate className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Nama Lengkap</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className="w-full h-12 pl-10 pr-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className="w-full h-12 pl-10 pr-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Nomor WhatsApp / Telepon (Opsional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-12 pl-10 pr-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm tabular-nums text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Password (min. 8 karakter)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className="w-full h-12 pl-10 pr-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
                <span>Lanjut ke Verifikasi</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Kode OTP (6 Digit)</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full h-12 pl-10 pr-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-center tracking-widest text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)]"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              <span>Verifikasi & Aktifkan Akun</span>
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/50 pt-4 space-y-2">
          <div>
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-[var(--accent-primary)] hover:underline">
              Masuk di sini
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
