'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkoutSessionStore } from '@/stores/workout-session.store';
import { Dumbbell, ChevronRight, Play, Pause, Flame, Timer, Clock } from 'lucide-react';
import { formatTimeMMSS, formatNumber, playRestCompleteAlert, calculateEstimatedCaloriesBurned } from '@/lib/utils';
import { toast } from 'sonner';

export function ActiveWorkoutFloatingBanner() {
  const pathname = usePathname();
  const {
    activeSession,
    isTimerRunning,
    getElapsedSeconds,
    getActiveWorkSeconds,
    getTotalRestSeconds,
    getRestRemainingSeconds,
    isRestTimerRunning,
    stopRestTimer,
    toggleSessionTimer,
    syncWithBackendActiveSession,
  } = useWorkoutSessionStore();

  const [elapsed, setElapsed] = useState(0);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);

  // Live session total volume calculation for accurate calories
  const totalVolume =
    activeSession?.exercises?.reduce((acc, ex) => {
      const exVol = ex.sets.reduce((sAcc, s) => {
        if (!s.isCompleted) return sAcc;
        return sAcc + (Number(s.weightKg) || 0) * (Number(s.reps) || 0);
      }, 0);
      return acc + exVol;
    }, 0) || 0;

  const estimatedCalories = calculateEstimatedCaloriesBurned(workSeconds, restSeconds, totalVolume);

  // Sync on mount
  useEffect(() => {
    syncWithBackendActiveSession();
  }, []);

  // Live timer ticks & rest completion alert
  useEffect(() => {
    if (!activeSession) return;
    const tick = () => {
      setElapsed(getElapsedSeconds());
      setWorkSeconds(getActiveWorkSeconds());
      setRestSeconds(getTotalRestSeconds());
      if (isRestTimerRunning) {
        const rem = getRestRemainingSeconds();
        setRestRemaining(rem);
        if (rem <= 0) {
          stopRestTimer();
          playRestCompleteAlert();
          toast.success('Waktu istirahat selesai! Siap untuk set berikutnya.', {
            duration: 6000,
            description: 'Lanjutkan gerakan latihan berikutnya di gym.',
          });
        }
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSession, isTimerRunning, isRestTimerRunning, getElapsedSeconds, getActiveWorkSeconds, getTotalRestSeconds, getRestRemainingSeconds, stopRestTimer]);

  // Hide when on the active workout page itself
  if (pathname === '/workouts/active') return null;
  if (!activeSession || activeSession.status !== 'IN_PROGRESS') return null;

  return (
    <div className="fixed bottom-[104px] md:bottom-6 right-3 left-3 sm:left-4 sm:right-4 md:left-auto md:right-6 md:w-[460px] z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-3.5 rounded-[12px] border border-[var(--accent-primary)]/50 bg-[var(--bg-surface)]/95 backdrop-blur-md shadow-2xl flex flex-col gap-2.5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-primary)]">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-surface)] animate-ping" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-surface)]" />
            </div>

            <div className="min-w-0 flex items-center gap-2">
              <h4 className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[140px] sm:max-w-[180px]">
                {activeSession.name || 'Sesi Latihan Aktif'}
              </h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase shrink-0">
                Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleSessionTimer();
              }}
              title={isTimerRunning ? 'Jeda Stopwatch' : 'Lanjutkan Stopwatch'}
              className="w-8 h-8 rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            <Link href="/workouts/active">
              <button
                type="button"
                className="h-8 px-3 rounded-[6px] bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                Lanjutkan
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Timers & Active Rest Badge Row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-default)]/60 text-xs flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Total Gym Timer */}
            <div className="flex items-center gap-1 text-[var(--accent-primary)] font-mono font-bold" title="Total Waktu di Gym">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimeMMSS(elapsed)}</span>
            </div>

            {/* Waktu Olahraga */}
            <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold" title="Waktu Aktif Olahraga">
              <Flame className="w-3.5 h-3.5" />
              <span>{formatTimeMMSS(workSeconds)}</span>
            </div>

            {/* Total Istirahat */}
            <div className="flex items-center gap-1 text-amber-400 font-mono font-bold" title="Total Waktu Istirahat">
              <Timer className="w-3.5 h-3.5" />
              <span>{formatTimeMMSS(restSeconds)}</span>
            </div>

            {/* Estimasi Kalori */}
            <div className="flex items-center gap-1 text-rose-400 font-mono font-bold" title="Estimasi Kalori Terbakar">
              <Flame className="w-3.5 h-3.5" />
              <span>{formatNumber(estimatedCalories)} kcal</span>
            </div>
          </div>

          {/* Active Rest Countdown Pill (If Rest Timer is running) */}
          {isRestTimerRunning ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] font-mono animate-pulse shrink-0">
              <span>⏳ Rest Time: {formatTimeMMSS(restRemaining)}</span>
            </div>
          ) : (
            <span className="text-[11px] text-[var(--text-tertiary)] shrink-0">
              {activeSession.exercises?.length || 0} gerakan
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
