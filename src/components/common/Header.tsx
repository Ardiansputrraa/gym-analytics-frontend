'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, LogOut, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export const Header: React.FC = () => {
  const router = useRouter();
  const todayFormatted = formatDate(new Date());

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('gym_access_token');
      toast.success('Berhasil logout dari sistem.');
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3.5 bg-[var(--bg-base)]/90 backdrop-blur-md border-b border-[var(--border-default)]">
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 group">
        <div className="p-2 rounded-[12px] bg-[var(--accent-primary)] text-white shadow-[0_4px_12px_rgba(255,107,44,0.4)]">
          <Dumbbell className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg md:text-xl tracking-tight font-[var(--font-display)] text-white">
          GYM ANALYTICS
        </span>
      </Link>

      {/* Center/Right: Date & Logout button */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
          <span>{todayFormatted}</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/40 hover:bg-[var(--bg-surface-raised)] transition-colors cursor-pointer text-xs font-semibold"
          aria-label="Logout"
          title="Keluar dari Akun"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
