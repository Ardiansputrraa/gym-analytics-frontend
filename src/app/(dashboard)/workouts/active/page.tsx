'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkoutSessionStore } from '@/stores/workout-session.store';
import { AppShell } from '@/components/common/AppShell';
import { Button } from '@/components/ui/Button';
import { RestTimerRing } from '@/components/ui/RestTimerRing';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ExerciseSelectorModal } from '@/components/workout/ExerciseSelectorModal';
import { formatTimeMMSS, formatNumber, playRestCompleteAlert, calculateEstimatedCaloriesBurned } from '@/lib/utils';
import { workoutService } from '@/services/workout.service';
import { RoutineTemplate, ExerciseMaster } from '@/types/workout.types';
import {
  ChevronLeft,
  Plus,
  Check,
  Lock,
  Dumbbell,
  Trash2,
  Activity,
  Edit2,
  Play,
  Pause,
  Timer,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const {
    activeSession,
    isTimerRunning,
    toggleSessionTimer,
    resumeSessionTimer,
    getElapsedSeconds,
    getActiveWorkSeconds,
    getTotalRestSeconds,
    getRestRemainingSeconds,
    isRestTimerRunning,
    restTimerTargetSeconds,
    configuredRestTarget,
    setConfiguredRestTarget,
    startRestTimer,
    stopRestTimer,
    resetRestTimer,
    addRestTimer15s,
    subRestTimer15s,
    syncWithBackendActiveSession,
    startNewSession,
    setSessionName,
    addExerciseFromMaster,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    toggleSetCompleted,
    finishSession,
    discardSession,
  } = useWorkoutSessionStore();

  const [elapsed, setElapsed] = useState(0);
  const [activeWorkSeconds, setActiveWorkSeconds] = useState(0);
  const [totalRestSeconds, setTotalRestSeconds] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [cardioElapsedMap, setCardioElapsedMap] = useState<Record<string, number>>({});
  const [cardioRunningMap, setCardioRunningMap] = useState<Record<string, boolean>>({});
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const isExerciseCardio = useCallback((ex: any): boolean => {
    if (!ex) return false;
    const eq = (ex.equipment || '').toUpperCase();
    const type = (ex.exerciseType || '').toUpperCase();
    const muscle = (ex.primaryMuscleName || ex.muscleGroupName || ex.muscleGroup || ex.primaryMuscle || '').toUpperCase();
    const name = (ex.exerciseName || ex.name || '').toUpperCase();
    return (
      eq === 'TREADMILL' ||
      eq === 'STATIONARY_BIKE' ||
      eq === 'STAIR_MASTER' ||
      eq === 'ROWING_MACHINE' ||
      eq === 'ELLIPTICAL' ||
      type === 'CARDIO_TREADMILL' ||
      type === 'CARDIO_GENERIC' ||
      muscle.includes('KARDIO') ||
      muscle.includes('CARDIO') ||
      name.includes('TREADMILL') ||
      name.includes('FAT BURN') ||
      name.includes('12-3-30')
    );
  }, []);

  // Sync on mount & fetch routines
  useEffect(() => {
    syncWithBackendActiveSession();
    workoutService.getRoutines().then((data) => setRoutines(data)).catch(() => {});
  }, []);

  // Live stopwatch interval (Total di Gym, Waktu Olahraga, Total Istirahat, & Cardio Live Timers)
  useEffect(() => {
    const tick = () => {
      setElapsed(getElapsedSeconds());
      setActiveWorkSeconds(getActiveWorkSeconds());
      setTotalRestSeconds(getTotalRestSeconds());

      // Advance live cardio stopwatches
      if (isTimerRunning) {
        setCardioElapsedMap((prev) => {
          let hasChanges = false;
          const next = { ...prev };
          Object.keys(cardioRunningMap).forEach((setId) => {
            if (cardioRunningMap[setId]) {
              next[setId] = (next[setId] || 0) + 1;
              hasChanges = true;
            }
          });
          return hasChanges ? next : prev;
        });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [getElapsedSeconds, getActiveWorkSeconds, getTotalRestSeconds, isTimerRunning, cardioRunningMap]);

  // Rest timer countdown interval & Auto-start Cardio
  useEffect(() => {
    if (!isRestTimerRunning) {
      setRestRemaining(0);
      return;
    }
    const interval = setInterval(() => {
      const rem = getRestRemainingSeconds();
      setRestRemaining(rem);
      if (rem <= 0) {
        stopRestTimer();
        playRestCompleteAlert();
        toast.success('Waktu istirahat selesai! Siap untuk sesi latihan berikutnya.', {
          duration: 5000,
          icon: '🔔',
        });

        // Automatically start the first uncompleted cardio set's live stopwatch
        if (activeSession) {
          const cardioEx = activeSession.exercises.find((e) => isExerciseCardio(e));
          if (cardioEx) {
            const firstUncompletedSet = cardioEx.sets.find((s) => !s.isCompleted);
            if (firstUncompletedSet) {
              setCardioRunningMap((prev) => ({ ...prev, [firstUncompletedSet.id]: true }));
              toast.info(`Treadmill aktif! Stopwatch ${cardioEx.exerciseName || cardioEx.name} mulai berjalan otomatis.`);
            }
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestTimerRunning, getRestRemainingSeconds, stopRestTimer, activeSession, isExerciseCardio]);

  const handleStartPreset = async (routine: RoutineTemplate) => {
    try {
      toast.loading(`Menyiapkan rutinitas ${routine.name}...`, { id: 'start-routine' });
      await startNewSession(routine.name, routine.id);
      toast.success(`Rutinitas ${routine.name} berhasil dimulai!`, { id: 'start-routine' });
    } catch {
      toast.error('Gagal memulai rutinitas.', { id: 'start-routine' });
    }
  };

  const handleFinish = async () => {
    if (!activeSession) return;

    const completedSetsCount = activeSession.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
      0,
    );

    if (completedSetsCount === 0) {
      toast.warning('Anda belum menyelesaikan set apa pun. Harap centang minimal 1 set selesai.');
      return;
    }

    setIsFinishing(true);
    try {
      const res = await finishSession();
      const prCount = res?.data?.newPersonalRecords?.length || 0;
      toast.success(
        prCount > 0
          ? `Luar biasa! Sesi selesai dan Anda memecahkan ${prCount} Rekor PR Baru!`
          : 'Sesi latihan berhasil diselesaikan dan dicatat ke riwayat!',
      );
      router.push('/workouts');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyelesaikan sesi latihan.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleConfirmDiscard = async () => {
    setIsDiscarding(true);
    try {
      await discardSession();
      toast.info('Sesi latihan telah dibatalkan.');
      router.push('/workouts');
    } catch {
      toast.error('Gagal membatalkan sesi latihan.');
    } finally {
      setIsDiscarding(false);
      setIsDiscardModalOpen(false);
    }
  };

  const handleToggleSet = (ex: any, set: any) => {
    // If set is already completed, it is permanently locked
    if (set.isCompleted) {
      toast.info('Set yang sudah diselesaikan telah terkunci dan tidak dapat diubah.');
      return;
    }

    // Ensure session stopwatch is running
    if (!isTimerRunning) {
      resumeSessionTimer();
    }

    const isCardio = isExerciseCardio(ex);

    if (isCardio) {
      // Stop live cardio timer for this set
      setCardioRunningMap((prev) => ({ ...prev, [set.id]: false }));
      const liveSec = cardioElapsedMap[set.id] !== undefined
        ? cardioElapsedMap[set.id]
        : (set.durationSeconds || (Number(set.durationMinutes) || 30) * 60);
      const liveMin = Math.max(1, Math.round(liveSec / 60));
      const speed = Number(set.speedKmh) || 4.8;
      const incline = Number(set.inclinePct) || Number(set.inclinePercentage) || 0;
      const dist = (speed * liveSec) / 3600;
      const cal = Math.round((liveSec / 60) * (5 + speed * 0.8 + incline * 0.5));

      // Update cardio set with computed telemetry and mark complete
      updateSet(ex.id, set.id, {
        durationMinutes: liveMin,
        durationSeconds: liveSec,
        distanceKm: Number(dist.toFixed(2)),
        caloriesBurned: cal,
        weightKg: 0,
        reps: 0,
      });

      toggleSetCompleted(ex.id, set.id);
      return;
    }

    // Resistance Training Validation 2: Repetisi must be > 0
    if (!set.reps || Number(set.reps) <= 0) {
      toast.warning('Harap isi jumlah Repetisi (Reps) terlebih dahulu!');
      return;
    }

    // Resistance Training Validation 3: Beban (weightKg) must be > 0 (unless bodyweight)
    const isBodyweight = ex.equipment === 'BODYWEIGHT';
    if (!isBodyweight && (set.weightKg === undefined || Number(set.weightKg) <= 0)) {
      toast.warning('Harap isi Beban (kg) terlebih dahulu sebelum menyelesaikan set ini!');
      return;
    }

    // All validations passed -> mark set completed and start rest timer automatically!
    toggleSetCompleted(ex.id, set.id);
  };

  const selectedExerciseIds = useMemo(() => {
    if (!activeSession) return [];
    return activeSession.exercises.map((e) => e.exerciseId || e.id);
  }, [activeSession]);

  const totalSetsCount = useMemo(() => {
    if (!activeSession) return 0;
    return activeSession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  }, [activeSession]);

  const totalCompletedSets = useMemo(() => {
    if (!activeSession) return 0;
    return activeSession.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
      0,
    );
  }, [activeSession]);

  const totalSessionVolume = useMemo(() => {
    if (!activeSession) return 0;
    return activeSession.exercises.reduce((acc, ex) => {
      if (isExerciseCardio(ex)) return acc;
      const exVol = ex.sets.reduce((sAcc, s) => {
        if (!s.isCompleted) return sAcc;
        return sAcc + (Number(s.weightKg) || 0) * (Number(s.reps) || 0);
      }, 0);
      return acc + exVol;
    }, 0);
  }, [activeSession, isExerciseCardio]);

  const totalSessionReps = useMemo(() => {
    if (!activeSession) return 0;
    return activeSession.exercises.reduce((acc, ex) => {
      if (isExerciseCardio(ex)) return acc;
      const exReps = ex.sets.reduce((sAcc, s) => {
        if (!s.isCompleted) return sAcc;
        return sAcc + (Number(s.reps) || 0);
      }, 0);
      return acc + exReps;
    }, 0);
  }, [activeSession, isExerciseCardio]);

  const estimatedCalories = useMemo(() => {
    const baseLiftingCalories = calculateEstimatedCaloriesBurned(activeWorkSeconds, totalRestSeconds, totalSessionVolume);
    const cardioCalories =
      activeSession?.exercises.reduce((acc, ex) => {
        if (!isExerciseCardio(ex)) return acc;
        return (
          acc +
          ex.sets.reduce((sAcc, s) => {
            const isRunning = cardioRunningMap[s.id];
            const liveSec = (isRunning || cardioElapsedMap[s.id] !== undefined)
              ? (cardioElapsedMap[s.id] || 0)
              : (s.isCompleted
                  ? (s.durationSeconds || Number(s.durationMinutes) * 60 || 1800)
                  : (s.durationSeconds || Number(s.durationMinutes) * 60 || 0));
            const durMin = liveSec / 60;
            const spd = Number(s.speedKmh) || 4.8;
            const inc = Number(s.inclinePct) || Number(s.inclinePercentage) || 0;
            const setCal = (s.isCompleted && s.caloriesBurned) ? s.caloriesBurned : Math.round(durMin * (5 + spd * 0.8 + inc * 0.5));
            return sAcc + (s.isCompleted || isRunning || liveSec > 0 ? setCal : 0);
          }, 0)
        );
      }, 0) || 0;
    return baseLiftingCalories + cardioCalories;
  }, [activeWorkSeconds, totalRestSeconds, totalSessionVolume, activeSession, isExerciseCardio, cardioElapsedMap, cardioRunningMap]);

  const isAllSetsCompleted = useMemo(() => {
    if (!activeSession || activeSession.exercises.length === 0) return false;
    return totalSetsCount > 0 && totalCompletedSets === totalSetsCount;
  }, [activeSession, totalSetsCount, totalCompletedSets]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Top Navigation & Status */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/workouts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-colors bg-[var(--bg-surface)] px-3 py-2 rounded-[8px] border border-[var(--border-default)]"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Kembali ke Riwayat</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SESI GYM
            </span>
          </div>
        </div>

        {/* Hero Live Telemetry Board (Unified 4 Metric Cards: 2x2 Mobile, 4-Cols Desktop) */}
        <div className="rounded-[14px] border border-[var(--border-default)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-surface)]/80 p-3.5 sm:p-5 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 items-stretch">
            {/* 1. Total di Gym (Primary Hero Stopwatch) */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-[10px] bg-[var(--bg-base)] border border-[var(--border-default)] shadow-sm">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                  <span className="truncate">TOTAL GYM</span>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-[var(--accent-primary)] tabular-nums tracking-tight truncate">
                  {formatTimeMMSS(elapsed)}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleSessionTimer}
                title={isTimerRunning ? 'Jeda Stopwatch Sesi' : 'Lanjutkan Stopwatch Sesi'}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-95 ${
                  isTimerRunning
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-emerald-500 text-slate-950 border border-emerald-400 font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                {isTimerRunning ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* 2. Waktu Olahraga / Latihan (Active Work Time) */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-[10px] bg-[var(--bg-base)] border border-[var(--border-default)] shadow-sm">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">WAKTU LATIHAN</span>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-emerald-400 tabular-nums tracking-tight truncate">
                  {formatTimeMMSS(activeWorkSeconds)}
                </div>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* 3. Total Waktu Istirahat (Total Rest Time) */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-[10px] bg-[var(--bg-base)] border border-[var(--border-default)] shadow-sm">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <Timer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">ISTIRAHAT</span>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-amber-400 tabular-nums tracking-tight truncate">
                  {formatTimeMMSS(totalRestSeconds)}
                </div>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* 4. Estimasi Kalori Terbakar (Calories Burned) */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-[10px] bg-[var(--bg-base)] border border-[var(--border-default)] shadow-sm">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">KALORI TERBAKAR</span>
                </div>
                <div className="flex items-baseline gap-1 text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-rose-400 tabular-nums tracking-tight truncate">
                  <span>{formatNumber(estimatedCalories)}</span>
                  <span className="text-[11px] font-sans font-semibold text-[var(--text-tertiary)]">kcal</span>
                </div>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Session Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
                Live workout tracking
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] flex items-center gap-1">
                <Timer className="w-3 h-3 text-sky-400" /> Timer jeda {configuredRestTarget}s
              </span>
            </div>

            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-3 py-1.5 rounded-[6px] border border-[var(--accent-primary)] bg-[var(--bg-surface)] text-lg font-bold text-white focus:outline-none"
                  autoFocus
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (tempName.trim()) setSessionName(tempName.trim());
                    setIsEditingName(false);
                  }}
                >
                  Simpan
                </Button>
              </div>
            ) : (
              <h1
                onClick={() => {
                  setTempName(activeSession?.name || 'Sesi Latihan Gym');
                  setIsEditingName(true);
                }}
                className="text-2xl md:text-3xl font-bold font-[var(--font-display)] text-white flex items-center gap-2 cursor-pointer hover:text-[var(--accent-primary)] transition-colors group"
              >
                {activeSession?.name || 'Sesi Latihan Gym'}
                <Edit2 className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)]" />
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsSelectorModalOpen(true)}
              className="text-xs font-bold border-[var(--accent-primary)]/40 text-[var(--accent-primary)]"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tambah alat / gerakan
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleFinish}
              disabled={!isAllSetsCompleted || isFinishing}
              title={
                !isAllSetsCompleted
                  ? `Harap selesaikan seluruh set (${totalCompletedSets}/${totalSetsCount}) sebelum menyelesaikan sesi latihan`
                  : 'Selesaikan sesi dan simpan ke riwayat'
              }
              className={`text-xs font-bold shadow-md transition-all ${
                !isAllSetsCompleted
                  ? 'opacity-40 cursor-not-allowed bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-[var(--text-tertiary)] shadow-none hover:bg-[var(--bg-surface-raised)]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
              }`}
            >
              <Check className="w-4 h-4 mr-1.5" />
              {isFinishing
                ? 'Menyimpan...'
                : !isAllSetsCompleted
                  ? `Selesaikan (${totalCompletedSets}/${totalSetsCount})`
                  : 'Selesaikan sesi'}
            </Button>
          </div>
        </div>

        {/* Content Body: Empty State or Active Movement Cards */}
        {!activeSession || activeSession.exercises.length === 0 ? (
          <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center mx-auto text-[var(--accent-primary)]">
              <Dumbbell className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold font-[var(--font-display)] text-white">
                Pilih gerakan / alat untuk memulai
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Sesi latihan ini masih kosong. Silakan pilih alat atau gerakan pertama yang akan Anda lakukan di gym.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsSelectorModalOpen(true)}
              className="font-bold shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Pilih gerakan / alat dari katalog gym
            </Button>

            {/* Quick Routine Starters */}
            <div className="pt-6 border-t border-[var(--border-default)]/60 space-y-3">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                PILIH VARIASI RUTINITAS LATIHAN HARI INI:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {routines.map((routine) => (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => handleStartPreset(routine)}
                    className="px-3.5 py-2 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-primary)] transition-all cursor-pointer font-medium"
                  >
                    {routine.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Exercise Sets Logging Table */}
            <div className="lg:col-span-2 space-y-4">
              {activeSession.exercises.map((ex, exIdx) => {
                const isExCardio = isExerciseCardio(ex);
                const exCompletedSets = ex.sets.filter((s) => s.isCompleted).length;
                const exTotalSets = ex.sets.length;
                const exVol = ex.sets.reduce((sum, s) => (s.isCompleted ? sum + (Number(s.weightKg) || 0) * (Number(s.reps) || 0) : sum), 0);
                const exReps = ex.sets.reduce((sum, s) => (s.isCompleted ? sum + (Number(s.reps) || 0) : sum), 0);
                const isExDone = exTotalSets > 0 && exCompletedSets === exTotalSets;

                const cardioMinutesTotal = ex.sets.reduce(
                  (sum, s) => sum + (Number(s.durationMinutes) || (s.durationSeconds ? Math.floor(s.durationSeconds / 60) : 30)),
                  0,
                );
                const cardioDistTotal = ex.sets.reduce((sum, s) => {
                  const m = Number(s.durationMinutes) || (s.durationSeconds ? Math.floor(s.durationSeconds / 60) : 30);
                  const spd = s.speedKmh !== undefined && s.speedKmh !== null && Number(s.speedKmh) > 0 ? Number(s.speedKmh) : 4.8;
                  return sum + (spd * m) / 60;
                }, 0);
                const cardioCalTotal = ex.sets.reduce((sum, s) => {
                  const m = Number(s.durationMinutes) || (s.durationSeconds ? Math.floor(s.durationSeconds / 60) : 30);
                  const spd = s.speedKmh !== undefined && s.speedKmh !== null && Number(s.speedKmh) > 0 ? Number(s.speedKmh) : 4.8;
                  const inc = Number(s.inclinePct) || Number(s.inclinePercentage) || 0;
                  return sum + (s.caloriesBurned || Math.round(m * (5 + spd * 0.8 + inc * 0.5)));
                }, 0);

                return (
                  <div
                    key={ex.id}
                    className={`rounded-[10px] border transition-all p-4 sm:p-5 space-y-4 shadow-sm ${
                      isExDone
                        ? 'border-emerald-500/40 bg-[var(--bg-surface)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                            isExDone
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                          }`}
                        >
                          {isExDone ? '✓' : exIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-white truncate">
                              {ex.exerciseName || ex.name}
                            </h3>
                            {isExDone && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                Selesai
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] flex-wrap">
                            <span className="text-sky-400 font-semibold">{ex.equipment}</span>
                            &bull;
                            <span>{ex.primaryMuscleName || ex.muscleGroupName || ex.muscleGroup}</span>
                            &bull;
                            {isExCardio ? (
                              <span className="text-[var(--text-secondary)] font-mono">
                                {exCompletedSets}/{exTotalSets} Sesi Kardio • {cardioMinutesTotal}m • {cardioDistTotal.toFixed(1)} km • ~{cardioCalTotal} kkal
                              </span>
                            ) : (
                              <span className="text-[var(--text-secondary)] font-mono">
                                {exCompletedSets}/{exTotalSets} Set • {formatNumber(exVol)} kg • {exReps} Reps
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (ex.sets.some((s) => s.isCompleted)) {
                            toast.warning('Gerakan yang sudah memiliki set selesai tidak dapat dihapus.');
                            return;
                          }
                          removeExercise(ex.exerciseId || ex.id);
                        }}
                        disabled={ex.sets.some((s) => s.isCompleted)}
                        title={
                          ex.sets.some((s) => s.isCompleted)
                            ? 'Gerakan memiliki set yang sudah diselesaikan'
                            : 'Hapus Gerakan'
                        }
                        className={`p-1.5 transition-colors shrink-0 ${
                          ex.sets.some((s) => s.isCompleted)
                            ? 'text-[var(--text-tertiary)]/30 cursor-not-allowed'
                            : 'text-[var(--text-tertiary)] hover:text-rose-400 cursor-pointer'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets Table: Conditional Cardio vs Resistance */}
                    {isExCardio ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1 pb-1">
                          <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                            KONSOL SIMULASI TREADMILL
                          </span>
                          {activeWorkSeconds > 0 && !ex.sets.every((s) => s.isCompleted) && (
                            <button
                              type="button"
                              onClick={() => {
                                const activeMinutes = Math.max(1, Math.round(activeWorkSeconds / 60));
                                ex.sets.forEach((s) => {
                                  if (!s.isCompleted) {
                                    const spd = s.speedKmh !== undefined && s.speedKmh !== null && Number(s.speedKmh) > 0 ? Number(s.speedKmh) : 4.8;
                                    const inc = Number(s.inclinePct) || Number(s.inclinePercentage) || 0;
                                    const calculatedDist = (spd * activeMinutes) / 60;
                                    const calculatedCal = Math.round(activeMinutes * (5 + spd * 0.8 + inc * 0.5));
                                    updateSet(ex.id, s.id, {
                                      durationMinutes: activeMinutes,
                                      durationSeconds: activeMinutes * 60,
                                      distanceKm: Number(calculatedDist.toFixed(2)),
                                      caloriesBurned: calculatedCal,
                                    });
                                  }
                                });
                                toast.success(`Durasi kardio disinkronkan ke waktu latihan aktif (${activeMinutes} menit)!`);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded cursor-pointer"
                            >
                              <Clock className="w-3 h-3" /> Sync Waktu Latihan ({Math.max(1, Math.round(activeWorkSeconds / 60))}m)
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase px-2">
                          <div className="col-span-1">SESI</div>
                          <div className="col-span-3">DURASI (MENIT)</div>
                          <div className="col-span-3">INCLINE (%)</div>
                          <div className="col-span-3">SPEED (KM/H)</div>
                          <div className="col-span-2 text-center">SELESAI</div>
                        </div>

                        {ex.sets.map((set, setIdx) => {
                          const isRunning = !!cardioRunningMap[set.id];
                          const liveSeconds = (isRunning || cardioElapsedMap[set.id] !== undefined)
                            ? (cardioElapsedMap[set.id] || 0)
                            : (set.durationSeconds || (Number(set.durationMinutes) || 30) * 60);
                          const inc = Number(set.inclinePct) || Number(set.inclinePercentage) || 0;
                          const spd = set.speedKmh !== undefined && set.speedKmh !== null && Number(set.speedKmh) > 0 ? Number(set.speedKmh) : 4.8;
                          const liveDist = (spd * liveSeconds) / 3600;
                          const liveCal = (set.isCompleted && set.caloriesBurned)
                            ? set.caloriesBurned
                            : Math.round((liveSeconds / 60) * (5 + spd * 0.8 + inc * 0.5));
                          const paceStr = spd > 0 ? (60 / spd).toFixed(1) + ' min/km' : '-';

                          return (
                            <div
                              key={set.id}
                              className={`p-3 rounded-[10px] border transition-all space-y-2.5 ${
                                set.isCompleted
                                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                                  : isRunning
                                    ? 'bg-sky-950/30 border-sky-500/50 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                                    : 'bg-[var(--bg-base)] border-[var(--border-default)] text-white'
                              }`}
                            >
                              <div className="grid grid-cols-12 gap-2 items-center">
                                {/* Set Index & Running Indicator */}
                                <div className="col-span-1 font-mono font-bold text-xs pl-1 flex items-center gap-1">
                                  <span>{setIdx + 1}</span>
                                  {set.isCompleted ? (
                                    <Lock className="w-2.5 h-2.5 text-emerald-400/80 shrink-0" />
                                  ) : isRunning ? (
                                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0" />
                                  ) : null}
                                </div>

                                {/* Live Duration / Stopwatch Input */}
                                <div className="col-span-4">
                                  <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[6px] px-2 py-1">
                                    <button
                                      type="button"
                                      disabled={set.isCompleted}
                                      onClick={() => {
                                        if (!isTimerRunning) {
                                          toast.warning('Mulai stopwatch TOTAL GYM terlebih dahulu!');
                                          return;
                                        }
                                        if (isRunning) {
                                          // Pausing treadmill -> Start rest timer so Waktu Latihan stops and Istirahat increases
                                          setCardioRunningMap((prev) => ({ ...prev, [set.id]: false }));
                                          startRestTimer(configuredRestTarget || 30);
                                          toast.info('Treadmill dijeda. Waktu istirahat pemulihan mulai berjalan.');
                                        } else {
                                          // Resuming treadmill -> Stop rest timer so Waktu Latihan resumes and Istirahat stops
                                          stopRestTimer();
                                          setCardioRunningMap((prev) => ({ ...prev, [set.id]: true }));
                                          toast.success('Treadmill berjalan! Waktu latihan aktif kembali dihitung.');
                                        }
                                      }}
                                      title={isRunning ? 'Jeda Stopwatch Treadmill & Mulai Istirahat' : 'Jalankan Stopwatch Treadmill & Lanjutkan Latihan'}
                                      className={`p-1 rounded transition-colors ${
                                        set.isCompleted
                                          ? 'opacity-40 cursor-not-allowed'
                                          : isRunning
                                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                      }`}
                                    >
                                      {isRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                                    </button>

                                    <div className="flex-1 text-center font-mono font-bold text-sm tracking-wider text-sky-400">
                                      {formatTimeMMSS(liveSeconds)}
                                    </div>
                                  </div>
                                </div>

                                {/* Incline % Stepper & Input */}
                                <div className="col-span-3">
                                  <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[6px] p-0.5">
                                    <button
                                      type="button"
                                      disabled={set.isCompleted || inc <= 0}
                                      onClick={() => {
                                        const newInc = Math.max(0, inc - 0.5);
                                        updateSet(ex.id, set.id, { inclinePct: newInc, inclinePercentage: newInc });
                                      }}
                                      className="w-6 h-7 text-xs font-bold text-[var(--text-secondary)] hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      max="30"
                                      step="0.5"
                                      disabled={set.isCompleted}
                                      readOnly={set.isCompleted}
                                      value={inc}
                                      onChange={(e) => {
                                        const newInc = Number(e.target.value) || 0;
                                        updateSet(ex.id, set.id, { inclinePct: newInc, inclinePercentage: newInc });
                                      }}
                                      className="w-full text-center text-xs font-bold bg-transparent focus:outline-none text-white"
                                    />
                                    <span className="text-[10px] text-[var(--text-tertiary)] pr-1 pointer-events-none">%</span>
                                    <button
                                      type="button"
                                      disabled={set.isCompleted || inc >= 30}
                                      onClick={() => {
                                        const newInc = Math.min(30, inc + 0.5);
                                        updateSet(ex.id, set.id, { inclinePct: newInc, inclinePercentage: newInc });
                                      }}
                                      className="w-6 h-7 text-xs font-bold text-[var(--text-secondary)] hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Speed km/h Stepper & Input */}
                                <div className="col-span-3">
                                  <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[6px] p-0.5">
                                    <button
                                      type="button"
                                      disabled={set.isCompleted || spd <= 0.5}
                                      onClick={() => {
                                        const newSpd = Number(Math.max(0.5, spd - 0.2).toFixed(1));
                                        updateSet(ex.id, set.id, { speedKmh: newSpd });
                                      }}
                                      className="w-6 h-7 text-xs font-bold text-[var(--text-secondary)] hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0.5"
                                      max="30"
                                      step="0.1"
                                      disabled={set.isCompleted}
                                      readOnly={set.isCompleted}
                                      value={spd}
                                      onChange={(e) => {
                                        const newSpd = Number(e.target.value) || 0.5;
                                        updateSet(ex.id, set.id, { speedKmh: newSpd });
                                      }}
                                      className="w-full text-center text-xs font-bold bg-transparent focus:outline-none text-white"
                                    />
                                    <button
                                      type="button"
                                      disabled={set.isCompleted || spd >= 30}
                                      onClick={() => {
                                        const newSpd = Number(Math.min(30, spd + 0.2).toFixed(1));
                                        updateSet(ex.id, set.id, { speedKmh: newSpd });
                                      }}
                                      className="w-6 h-7 text-xs font-bold text-[var(--text-secondary)] hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Completed Checklist */}
                                <div className="col-span-1 flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSet(ex, set)}
                                    disabled={set.isCompleted}
                                    title={
                                      set.isCompleted
                                        ? 'Sesi kardio telah diselesaikan dan terkunci'
                                        : !isTimerRunning
                                          ? 'Mulai stopwatch gym terlebih dahulu'
                                          : 'Centang sesi kardio selesai'
                                    }
                                    className={`w-8 h-8 rounded-[6px] border flex items-center justify-center transition-all ${
                                      set.isCompleted
                                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm cursor-not-allowed opacity-90'
                                        : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:border-emerald-500 hover:text-emerald-400 cursor-pointer'
                                    }`}
                                  >
                                    <Check className="w-4 h-4 font-bold" />
                                  </button>
                                </div>
                              </div>

                              {/* Live Telemetry Preview Chips */}
                              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[var(--border-default)]/40 px-1 text-[var(--text-tertiary)] flex-wrap gap-2">
                                <span className="font-mono">
                                  Jarak: <strong className="text-sky-400 tabular-nums">{liveDist.toFixed(2)} km</strong>
                                </span>
                                <span className="font-mono">
                                  Kalori: <strong className="text-rose-400 tabular-nums">{liveCal} kcal</strong>
                                </span>
                                <span className="font-mono">
                                  Pace: <strong className="text-amber-400 tabular-nums">{paceStr}</strong>
                                </span>
                                <span className="font-mono text-[10px]">
                                  {set.isCompleted ? (
                                    <span className="text-emerald-400 font-bold">✓ Selesai Terkunci</span>
                                  ) : isRunning ? (
                                    <span className="text-sky-400 font-bold animate-pulse">🟢 Treadmill Berjalan</span>
                                  ) : (
                                    <span className="text-amber-400/80 font-bold">⏸️ Standby</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase px-2">
                          <div className="col-span-2">SET</div>
                          <div className="col-span-4">BEBAN (KG)</div>
                          <div className="col-span-4">REPS</div>
                          <div className="col-span-2 text-center">SELESAI</div>
                        </div>

                        {ex.sets.map((set, setIdx) => (
                          <div
                            key={set.id}
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-[6px] border transition-all ${
                              set.isCompleted
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                                : 'bg-[var(--bg-base)] border-[var(--border-default)] text-white'
                            }`}
                          >
                            <div className="col-span-2 font-mono font-bold text-xs pl-1 flex items-center gap-1">
                              <span>{setIdx + 1}</span>
                              {set.isCompleted && (
                                <Lock className="w-2.5 h-2.5 text-emerald-400/80 shrink-0" />
                              )}
                            </div>

                            <div className="col-span-4">
                              <input
                                type="number"
                                step="0.5"
                                disabled={set.isCompleted}
                                readOnly={set.isCompleted}
                                value={set.weightKg === 0 ? '' : set.weightKg}
                                placeholder="0"
                                onChange={(e) =>
                                  updateSet(ex.id, set.id, { weightKg: Number(e.target.value) || 0 })
                                }
                                className={`w-full h-8 px-2 rounded-[4px] border text-xs font-bold text-center focus:outline-none transition-colors ${
                                  set.isCompleted
                                    ? 'border-emerald-500/20 bg-emerald-950/40 text-emerald-300 cursor-not-allowed select-none'
                                    : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-white focus:border-[var(--accent-primary)]'
                                }`}
                              />
                            </div>

                            <div className="col-span-4">
                              <input
                                type="number"
                                disabled={set.isCompleted}
                                readOnly={set.isCompleted}
                                value={set.reps === 0 ? '' : set.reps}
                                placeholder="0"
                                onChange={(e) =>
                                  updateSet(ex.id, set.id, { reps: Number(e.target.value) || 0 })
                                }
                                className={`w-full h-8 px-2 rounded-[4px] border text-xs font-bold text-center focus:outline-none transition-colors ${
                                  set.isCompleted
                                    ? 'border-emerald-500/20 bg-emerald-950/40 text-emerald-300 cursor-not-allowed select-none'
                                    : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-white focus:border-[var(--accent-primary)]'
                                }`}
                              />
                            </div>

                            <div className="col-span-2 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSet(ex, set)}
                                disabled={set.isCompleted}
                                title={
                                  set.isCompleted
                                    ? 'Set telah diselesaikan dan terkunci'
                                    : !isTimerRunning
                                      ? 'Mulai stopwatch gym terlebih dahulu'
                                      : 'Centang set selesai (memulai rest timer otomatis)'
                                }
                                className={`w-8 h-8 rounded-[6px] border flex items-center justify-center transition-all ${
                                  set.isCompleted
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm cursor-not-allowed opacity-90'
                                    : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:border-emerald-500 hover:text-emerald-400 cursor-pointer'
                                }`}
                              >
                                <Check className="w-4 h-4 font-bold" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => addSet(ex.exerciseId || ex.id)}
                        className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Set
                      </button>

                      {ex.sets.length > 1 && (
                        <button
                          type="button"
                          disabled={ex.sets[ex.sets.length - 1].isCompleted}
                          onClick={() => {
                            if (ex.sets[ex.sets.length - 1].isCompleted) {
                              toast.warning('Set yang sudah diselesaikan tidak dapat dihapus.');
                              return;
                            }
                            removeSet(ex.id, ex.sets[ex.sets.length - 1].id);
                          }}
                          className={`text-[11px] transition-colors ${
                            ex.sets[ex.sets.length - 1].isCompleted
                              ? 'text-[var(--text-tertiary)]/40 cursor-not-allowed line-through'
                              : 'text-[var(--text-tertiary)] hover:text-rose-400 cursor-pointer'
                          }`}
                        >
                          Hapus Set Terakhir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsSelectorModalOpen(true)}
                className="w-full border-dashed border-[var(--border-default)] hover:border-[var(--accent-primary)] text-xs font-bold"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Gerakan Lain
              </Button>
            </div>

            {/* Right Column (1 Col): Live Telemetry & Rest Ring Widget */}
            <div className="space-y-6">
              {/* Rest Timer Card */}
              <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-center space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-amber-400" /> Rest Timer
                  </h4>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    Target: {configuredRestTarget}s
                  </span>
                </div>

                <div className="py-2 flex justify-center">
                  <RestTimerRing
                    totalSeconds={restTimerTargetSeconds}
                    configuredTarget={configuredRestTarget}
                    remainingSeconds={isRestTimerRunning ? restRemaining : configuredRestTarget}
                    isRunning={isRestTimerRunning}
                    onToggle={isRestTimerRunning ? stopRestTimer : () => startRestTimer(configuredRestTarget)}
                    onReset={resetRestTimer}
                    onAdd15s={addRestTimer15s}
                    onSub15s={subRestTimer15s}
                    onSelectTarget={setConfiguredRestTarget}
                  />
                </div>
              </div>

              {/* Enhanced Session Live Telemetry Card (Global Overview & Per-movement Breakdown) */}
              <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[var(--accent-primary)]" /> Telemetri Sesi
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isAllSetsCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[var(--bg-base)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
                    }`}
                  >
                    {isAllSetsCompleted ? 'Siap Diselesaikan' : `${totalCompletedSets}/${totalSetsCount} Set`}
                  </span>
                </div>

                {/* Global Overview 3 Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                    <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold block mb-0.5">
                      TOTAL VOLUME
                    </span>
                    <span className="text-sm font-bold font-mono text-[var(--accent-primary)] tabular-nums">
                      {formatNumber(totalSessionVolume)} <span className="text-[10px] font-normal">kg</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                    <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold block mb-0.5">
                      SET SELESAI
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      {totalCompletedSets}/{totalSetsCount}
                    </span>
                  </div>

                  <div className="p-2 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                    <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold block mb-0.5">
                      TOTAL REPS
                    </span>
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      {totalSessionReps} <span className="text-[10px] font-normal">Reps</span>
                    </span>
                  </div>
                </div>

                {/* Overall Session Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-[var(--text-tertiary)] uppercase">Progres Seluruh Latihan</span>
                    <span className={isAllSetsCompleted ? 'text-emerald-400' : 'text-[var(--accent-primary)]'}>
                      {totalSetsCount > 0 ? Math.round((totalCompletedSets / totalSetsCount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-base)] border border-[var(--border-default)] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isAllSetsCompleted ? 'bg-emerald-500' : 'bg-[var(--accent-primary)]'
                      }`}
                      style={{
                        width: `${totalSetsCount > 0 ? (totalCompletedSets / totalSetsCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Per-Movement / Per-Equipment Telemetry Breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-[var(--border-default)]/60">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                    RINCIAN PER GERAKAN / ALAT:
                  </span>

                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {activeSession.exercises.map((ex) => {
                      const isExCardio = isExerciseCardio(ex);
                      const exCompletedSets = ex.sets.filter((s) => s.isCompleted).length;
                      const exTotalSets = ex.sets.length;
                      const exVol = ex.sets.reduce((sum, s) => (s.isCompleted ? sum + (Number(s.weightKg) || 0) * (Number(s.reps) || 0) : sum), 0);
                      const exReps = ex.sets.reduce((sum, s) => (s.isCompleted ? sum + (Number(s.reps) || 0) : sum), 0);
                      const isExDone = exTotalSets > 0 && exCompletedSets === exTotalSets;

                      const cardioMinutes = ex.sets.reduce(
                        (sum, s) => sum + (Number(s.durationMinutes) || (s.durationSeconds ? Math.floor(s.durationSeconds / 60) : 30)),
                        0,
                      );
                      const cardioDist = ex.sets.reduce((sum, s) => {
                        const m = Number(s.durationMinutes) || (s.durationSeconds ? Math.floor(s.durationSeconds / 60) : 30);
                        const spd = s.speedKmh !== undefined && s.speedKmh !== null && Number(s.speedKmh) > 0 ? Number(s.speedKmh) : 4.8;
                        return sum + (spd * m) / 60;
                      }, 0);
                      const cardioCal = ex.sets.reduce((sum, s) => {
                        const m = Number(s.durationMinutes) || (s.durationSeconds ? Math.floor(s.durationSeconds / 60) : 30);
                        const spd = s.speedKmh !== undefined && s.speedKmh !== null && Number(s.speedKmh) > 0 ? Number(s.speedKmh) : 4.8;
                        const inc = Number(s.inclinePct) || Number(s.inclinePercentage) || 0;
                        return sum + (s.caloriesBurned || Math.round(m * (5 + spd * 0.8 + inc * 0.5)));
                      }, 0);

                      return (
                        <div
                          key={ex.id}
                          className={`p-2.5 rounded-[8px] border transition-all ${
                            isExDone
                              ? 'bg-emerald-950/20 border-emerald-500/30'
                              : 'bg-[var(--bg-base)] border-[var(--border-default)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">
                                {ex.exerciseName || ex.name}
                              </h5>
                              <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                                <span className="text-sky-400 font-semibold">{ex.equipment}</span>
                                <span>&bull;</span>
                                <span>{ex.primaryMuscleName || ex.muscleGroupName || ex.muscleGroup}</span>
                              </div>
                            </div>

                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                isExDone
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                              }`}
                            >
                              {isExDone ? '✓ Selesai' : `${exCompletedSets}/${exTotalSets}`}
                            </span>
                          </div>

                          {/* 3 Metrics Grid per movement */}
                          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-[var(--border-default)]/50 text-center">
                            {isExCardio ? (
                              <>
                                <div className="bg-[var(--bg-surface)]/60 p-1 rounded">
                                  <span className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold block">
                                    SESI
                                  </span>
                                  <span className="text-[11px] font-bold font-mono text-white">
                                    {exCompletedSets}/{exTotalSets}
                                  </span>
                                </div>

                                <div className="bg-[var(--bg-surface)]/60 p-1 rounded">
                                  <span className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold block">
                                    DURASI
                                  </span>
                                  <span className="text-[11px] font-bold font-mono text-white">
                                    {cardioMinutes}m
                                  </span>
                                </div>

                                <div className="bg-[var(--bg-surface)]/60 p-1 rounded">
                                  <span className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold block">
                                    ESTIMASI
                                  </span>
                                  <span className="text-[11px] font-bold font-mono text-rose-400">
                                    {cardioCal} kcal
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="bg-[var(--bg-surface)]/60 p-1 rounded">
                                  <span className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold block">
                                    SET
                                  </span>
                                  <span className="text-[11px] font-bold font-mono text-white">
                                    {exCompletedSets}/{exTotalSets}
                                  </span>
                                </div>

                                <div className="bg-[var(--bg-surface)]/60 p-1 rounded">
                                  <span className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold block">
                                    REPS
                                  </span>
                                  <span className="text-[11px] font-bold font-mono text-white">
                                    {exReps}
                                  </span>
                                </div>

                                <div className="bg-[var(--bg-surface)]/60 p-1 rounded">
                                  <span className="text-[8px] text-[var(--text-tertiary)] uppercase font-bold block">
                                    VOLUME
                                  </span>
                                  <span className="text-[11px] font-bold font-mono text-[var(--accent-primary)]">
                                    {formatNumber(exVol)} kg
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDiscardModalOpen(true)}
                    disabled={isDiscarding}
                    className="w-full text-xs font-semibold"
                  >
                    Batalkan Sesi Latihan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Selector Modal (10 items pagination) */}
      <ExerciseSelectorModal
        isOpen={isSelectorModalOpen}
        onClose={() => setIsSelectorModalOpen(false)}
        alreadySelectedIds={selectedExerciseIds}
        onSelectExercise={async (exercise: ExerciseMaster) => {
          await addExerciseFromMaster(exercise);
          toast.success(`${exercise.name} berhasil ditambahkan!`);
        }}
        onRemoveExercise={async (exerciseId: string) => {
          await removeExercise(exerciseId);
          toast.info('Gerakan dihapus dari sesi.');
        }}
      />

      {/* Custom Confirmation Modal for Cancelling/Discarding Workout */}
      <ConfirmationModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={handleConfirmDiscard}
        title="Batalkan Sesi Latihan?"
        description="Apakah Anda yakin ingin membatalkan sesi latihan ini? Seluruh data set dan progres gerakan yang belum diselesaikan tidak akan disimpan ke riwayat."
        confirmText="Ya, Batalkan Sesi"
        cancelText="Lanjut Latihan"
        variant="danger"
        isLoading={isDiscarding}
      />
    </AppShell>
  );
}
