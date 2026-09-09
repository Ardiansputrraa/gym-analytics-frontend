'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarClock, ArrowRight } from 'lucide-react';

export interface CheckInBannerProps {
  daysSinceLastCheckIn?: number;
  onDismiss?: () => void;
}

export const CheckInBanner: React.FC<CheckInBannerProps> = ({
  daysSinceLastCheckIn = 30,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 mb-6 rounded-[6px] border border-[var(--accent-secondary)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
            Waktunya Evaluasi Bulanan (Check-in 30 Hari)
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Sudah {daysSinceLastCheckIn} hari sejak update terakhir. Perbarui berat badan terkini untuk mengkalibrasi target kalori dan BMR/TDEE Anda.
          </p>
        </div>
      </div>

      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[6px] bg-[var(--accent-secondary)] text-[var(--bg-base)] hover:bg-[#8F6D24] transition-colors shrink-0"
      >
        <span>Update Profil</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
