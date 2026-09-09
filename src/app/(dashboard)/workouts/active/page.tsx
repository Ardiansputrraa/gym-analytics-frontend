'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWorkoutSessionStore } from '@/stores/workout-session.store';
import { AppShell } from '@/components/common/AppShell';
import { Button } from '@/components/ui/Button';
import { PRBadge } from '@/components/ui/PRBadge';
import { RestTimerRing } from '@/components/ui/RestTimerRing';
import { Divider } from '@/components/ui/Divider';
import { ExerciseSelectorModal } from '@/components/workout/ExerciseSelectorModal';
import { formatDuration, formatNumber } from '@/lib/utils';
import {
  ChevronLeft,
  Plus,
  Check,
  Clock,
  Dumbbell,
  Trash2,
  Activity,
  Sparkles,
  Edit2,
  RotateCcw,
  Play,
  Pause,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';

const QUICK_ROUTINE_NAMES = [
  'Push Day (Dada, Bahu, Triceps)',
  'Pull Day (Punggung, Biceps)',
  'Leg Day (Kaki, Betis & Perut)',
  'Lower Body Focus (Kaki, Glutes & Hamstrings)',
  'Arm Day (Biceps & Triceps)',
  'Upper Body Focus (Dada, Punggung, Bahu)',
  'Core & Abs Focus (Perut & Pinggang)',
  'Full Body Workout',
];

export default function ActiveWorkoutPage() {
  const {
    activeSession,
    setSessionName,
    elapsedSeconds,
    isTimerRunning,
    toggleSessionTimer,
    tickElapsed,
    restTimerSeconds,
    restTimerTotal,
    configuredRestTarget,
    setConfiguredRestTarget,
    isRestTimerRunning,
    toggleRestTimer,
    resetRestTimer,
    addRestTimer15s,
    subRestTimer15s,
    tickRestTimer,
    updateSet,
    toggleSetCompleted,
    addSet,
    removeSet,
    addExerciseFromMaster,
    removeExercise,
    finishSession,
    startNewSession,
  } = useWorkoutSessionStore();

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Elapsed timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      tickElapsed();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickElapsed]);

  // Rest timer countdown interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestTimerRunning) {
      interval = setInterval(() => {
        tickRestTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, tickRestTimer]);

  // Keep selectedExerciseId valid when exercises change
  useEffect(() => {
    if (activeSession && activeSession.exercises.length > 0) {
      const exists = activeSession.exercises.some((e) => e.id === selectedExerciseId);
      if (!exists) {
        setSelectedExerciseId(activeSession.exercises[0].id);
      }
    }
  }, [activeSession, selectedExerciseId]);

  if (!activeSession) {
    return (
      <AppShell>
        <div className="text-center py-20 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center mx-auto text-[var(--accent-primary)]">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
            Tidak Ada Sesi Latihan Aktif
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Mulai sesi baru untuk mulai mencatat gerakan, beban, repetisi, dan waktu istirahat.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => startNewSession('Sesi Latihan Gym')}
            className="shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" /> Mulai Sesi Baru
          </Button>
        </div>
      </AppShell>
    );
  }

  const selectedExercise = activeSession.exercises.find((ex) => ex.id === selectedExerciseId);

  const totalCompletedSets = activeSession.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0,
  );
  const totalSets = activeSession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const handleFinish = () => {
    if (activeSession.exercises.length === 0) {
      toast.error('Tambahkan minimal 1 gerakan latihan sebelum menyelesaikan sesi.');
      return;
    }
    finishSession();
    toast.success(
      `Sesi latihan "${activeSession.name}" selesai! Total volume: ${formatNumber(activeSession.totalVolumeKg)} kg`,
    );
  };

  const handleToggleSetCompleted = (exerciseId: string, setId: string) => {
    const targetEx = activeSession?.exercises.find((ex) => ex.id === exerciseId);
    if (!targetEx) {
      toggleSetCompleted(exerciseId, setId);
      return;
    }

    const currentSet = targetEx.sets.find((s) => s.id === setId);
    const willBeCompleted = currentSet ? !currentSet.isCompleted : false;

    // Trigger store toggle (which recalculates volumes and triggers rest timer)
    toggleSetCompleted(exerciseId, setId);

    // If this set is being marked as finished, check if ALL sets of this exercise are now done
    if (willBeCompleted) {
      const remainingIncomplete = targetEx.sets.filter((s) => s.id !== setId && !s.isCompleted);
      if (remainingIncomplete.length === 0) {
        // All sets in current exercise completed!
        const currIdx = activeSession.exercises.findIndex((ex) => ex.id === exerciseId);
        if (currIdx !== -1 && currIdx < activeSession.exercises.length - 1) {
          const nextEx = activeSession.exercises[currIdx + 1];
          // Auto advance to next movement tab
          setTimeout(() => {
            setSelectedExerciseId(nextEx.id);
            toast.success(
              `Seluruh set "${targetEx.exerciseName}" tuntas. Melanjutkan ke gerakan "${nextEx.exerciseName}".`,
            );
          }, 350);
        } else {
          toast.success(`Seluruh set "${targetEx.exerciseName}" telah diselesaikan.`);
        }
      }
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setSessionName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleExerciseDeleted = (exId: string, exName: string) => {
    removeExercise(exId);
    toast.info(`Gerakan "${exName}" dihapus.`);
    const remaining = activeSession.exercises.filter((ex) => ex.id !== exId);
    if (remaining.length > 0) {
      setSelectedExerciseId(remaining[0].id);
    } else {
      setSelectedExerciseId('');
    }
  };

  return (
    <AppShell>
      {/* Top Bar: Back, Title & Live Stopwatch */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-default)]">
        <Link
          href="/workouts"
          className="flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat</span>
        </Link>

        {/* Live Stopwatch with Play / Pause & Breakdown */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--text-secondary)] mr-1">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <span className={`w-2 h-2 rounded-full ${isRestTimerRunning ? 'bg-[var(--text-tertiary)]' : isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-[var(--text-tertiary)]'}`} />
              <span className="text-[11px]">Waktu Angkat/Set:</span>
              <strong className="text-emerald-400 font-mono text-xs">{formatDuration(activeSession.activeSeconds || 0)}</strong>
            </span>

            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <span className={`w-2 h-2 rounded-full ${isRestTimerRunning ? 'bg-amber-400 animate-pulse' : 'bg-[var(--text-tertiary)]'}`} />
              <span className="text-[11px]">Waktu Istirahat:</span>
              <strong className="text-amber-400 font-mono text-xs">{formatDuration(activeSession.restSeconds || 0)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm">
            <button
              type="button"
              onClick={toggleSessionTimer}
              className="text-[var(--accent-primary)] hover:opacity-80 cursor-pointer"
              title={isTimerRunning ? 'Jeda Stopwatch Sesi' : 'Mulai Stopwatch Sesi'}
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 text-[var(--color-moss-600)]" />
              )}
            </button>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold leading-none">
                Total di Gym
              </span>
              <span className="font-bold font-[var(--font-display)] tabular-nums text-sm leading-tight">
                {formatDuration(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Header & Name Editing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-secondary)]">
              Live Workout Tracking
            </span>
            {isRestTimerRunning ? (
              <span className="px-2 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/40 animate-pulse">
                ⏳ SEDANG ISTIRAHAT (REST TIMER)
              </span>
            ) : isTimerRunning ? (
              <span className="px-2 py-0.5 rounded-[4px] bg-[var(--color-moss-600)]/20 text-[var(--color-moss-600)] text-[10px] font-bold border border-[var(--color-moss-600)]/40 animate-pulse">
                ● AKTIF MEREKAM (LATIHAN)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-base)] text-[var(--text-tertiary)] text-[10px] font-semibold border border-[var(--border-default)]">
                ⏸️ TIMER JEDA
              </span>
            )}
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                placeholder="Nama Sesi Latihan..."
                className="px-3 py-1.5 rounded-[6px] border border-[var(--accent-primary)] bg-[var(--bg-base)] text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] focus:outline-none"
              />
              <Button variant="primary" size="sm" onClick={handleSaveName}>
                Simpan
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                {activeSession.name}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setTempName(activeSession.name);
                  setIsEditingName(true);
                }}
                title="Ubah Nama Sesi"
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsSelectorModalOpen(true)}
            className="border-[var(--accent-primary)]/40 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            + Tambah Alat / Gerakan
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleFinish}
            disabled={
              activeSession.status === 'COMPLETED' ||
              activeSession.exercises.length === 0 ||
              totalCompletedSets === 0
            }
            className="shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 mr-2" />
            {activeSession.status === 'COMPLETED' ? 'Sesi Telah Selesai' : 'Selesaikan Sesi'}
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* IF 0 EXERCISES: Show Clean Empty Onboarding Slate */}
      {/* ============================================================ */}
      {activeSession.exercises.length === 0 ? (
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-8 md:p-12 text-center space-y-6 shadow-xl my-4">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center mx-auto text-[var(--accent-primary)] shadow-inner">
            <Dumbbell className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
              Pilih Gerakan / Alat untuk Memulai
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Sesi latihan ini masih kosong. Silakan pilih alat atau gerakan pertama yang akan Anda lakukan di gym.
            </p>
          </div>

          {/* Big Action Button */}
          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsSelectorModalOpen(true)}
              className="px-6 py-3.5 text-sm shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Pilih Gerakan / Alat dari Katalog Gym
            </Button>
          </div>

          <Divider />

          {/* Quick Routine Suggestion Pills */}
          <div className="space-y-2.5 pt-2 max-w-2xl mx-auto text-left">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block text-center">
              Pilih Variasi Rutinitas Latihan Hari Ini:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_ROUTINE_NAMES.map((routine) => (
                <button
                  key={routine}
                  onClick={() => {
                    setSessionName(routine);
                    setIsSelectorModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/60 transition-colors cursor-pointer"
                >
                  {routine}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* IF 1+ EXERCISES: Show Full Active Logger */
        /* ============================================================ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Exercise tabs & Stepper Logger */}
          <div className="lg:col-span-2 space-y-6">
            {/* Horizontal Exercise Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {activeSession.exercises.map((ex, idx) => {
                const isCurrent = selectedExercise?.id === ex.id;
                const completedCount = ex.sets.filter((s) => s.isCompleted).length;
                return (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExerciseId(ex.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[6px] text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[var(--bg-surface)] border-[var(--accent-primary)] text-[var(--text-primary)] shadow-md'
                        : 'bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        completedCount === ex.sets.length && ex.sets.length > 0
                          ? 'bg-[var(--color-moss-600)] text-white'
                          : isCurrent
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'bg-[var(--border-default)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {completedCount === ex.sets.length && ex.sets.length > 0 ? '✓' : idx + 1}
                    </span>

                    <span>{ex.exerciseName}</span>

                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                      {ex.equipmentName || 'Alat'}
                    </span>
                  </button>
                );
              })}

              {/* Quick Add Button */}
              <button
                onClick={() => setIsSelectorModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-[6px] text-xs font-semibold whitespace-nowrap border border-dashed border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Gerakan</span>
              </button>
            </div>

            {/* Active Exercise Detail & Set Logger Card */}
            {selectedExercise && (() => {
              const isCardio =
                selectedExercise.equipment === 'TREADMILL' ||
                selectedExercise.muscleGroup === 'CARDIO' ||
                selectedExercise.exerciseType === 'CARDIO_TREADMILL' ||
                selectedExercise.exerciseType === 'CARDIO_GENERIC';

              return (
                <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-5 md:p-6 space-y-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                          {selectedExercise.exerciseName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-bold text-[var(--accent-secondary)]">
                          {selectedExercise.muscleGroupName}
                        </span>
                        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-semibold text-sky-400">
                          {selectedExercise.equipmentName}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {isCardio
                          ? 'Atur durasi (menit), kemiringan (incline %), dan kecepatan (km/h) untuk kalkulasi jarak dan kalori.'
                          : 'Catat beban dan repetisi untuk setiap set. Tekan centang untuk memicu timer istirahat.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addSet(selectedExercise.id)}
                        className="text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        {isCardio ? 'Tambah Interval' : 'Tambah Set'}
                      </Button>

                      <button
                        onClick={() =>
                          handleExerciseDeleted(selectedExercise.id, selectedExercise.exerciseName)
                        }
                        title="Hapus Gerakan"
                        className="p-2 rounded-[4px] border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-red-400 hover:border-red-500/40 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* TREADMILL & CARDIO LOGGER FORM */}
                  {/* ============================================================ */}
                  {isCardio ? (
                    <div className="space-y-4">
                      {selectedExercise.sets.map((set) => {
                        const duration = set.durationMinutes ?? 20;
                        const incline = set.inclinePercentage ?? 2.0;
                        const speed = set.speedKmh ?? 6.0;
                        const distance =
                          set.distanceKm ?? +((speed * duration) / 60).toFixed(2);
                        const calories =
                          set.caloriesBurned ??
                          Math.round(duration * (5 + speed * 0.8 + incline * 0.5));
                        const pace =
                          set.paceMinPerKm ??
                          (speed > 0
                            ? `${Math.floor(60 / speed)}:${Math.round(((60 / speed) % 1) * 60)
                                .toString()
                                .padStart(2, '0')}`
                            : '--:--');

                        return (
                          <div
                            key={set.id}
                            className={`p-4 md:p-5 rounded-[8px] border space-y-4 transition-all ${
                              set.isCompleted
                                ? 'border-[var(--color-moss-600)]/40 bg-[var(--bg-base)]/80'
                                : 'border-[var(--border-default)] bg-[var(--bg-surface-raised)] hover:border-[var(--border-default)]/80'
                            }`}
                          >
                            {/* Header of Cardio Interval */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                  🏃 Sesi / Interval #{set.setNumber}
                                </span>
                                {set.isCompleted && (
                                  <span className="text-[10px] text-[var(--color-moss-600)] font-semibold flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Selesai Tercatat
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {selectedExercise.sets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSet(selectedExercise.id, set.id)}
                                    className="p-1 text-[var(--text-tertiary)] hover:text-red-400 cursor-pointer"
                                    title="Hapus Interval"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleToggleSetCompleted(selectedExercise.id, set.id)}
                                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                                    set.isCompleted
                                      ? 'bg-[var(--color-moss-600)] text-white shadow-sm'
                                      : 'border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{set.isCompleted ? 'Selesai' : 'Tandai Selesai'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Steppers Grid (3 Columns: Durasi, Incline, Kecepatan) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {/* 1. Durasi Presisi (Menit : Detik) */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
                                  <span className="flex items-center gap-1.5">
                                    <span>⏱️ Durasi</span>
                                    {!set.isCompleted && isTimerRunning && !isRestTimerRunning ? (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold animate-pulse border border-emerald-500/30">
                                        ● Live Otomatis
                                      </span>
                                    ) : (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                                        (mm:ss)
                                      </span>
                                    )}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const activeSecs = activeSession.activeSeconds || 0;
                                      updateSet(selectedExercise.id, set.id, { durationSeconds: activeSecs });
                                      toast.info(`Durasi disinkronkan ke ${formatDuration(activeSecs)} dari stopwatch aktif.`);
                                    }}
                                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                                    title="Sinkronkan dengan stopwatch aktif"
                                  >
                                    ⚡ Reset ke Stopwatch ({formatDuration(activeSession.activeSeconds || 0)})
                                  </button>
                                </div>

                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    title="Kurangi 1 Menit (-1m)"
                                    onClick={() => {
                                      const currSec = set.durationSeconds ?? 0;
                                      updateSet(selectedExercise.id, set.id, {
                                        durationSeconds: Math.max(0, currSec - 60),
                                      });
                                    }}
                                    className="w-9 h-11 min-h-[44px] rounded-l-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                  >
                                    -1m
                                  </button>

                                  <div className="w-full h-11 min-h-[44px] flex items-center justify-center font-bold text-lg font-[var(--font-display)] tabular-nums border-y border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-2">
                                    <span className="text-emerald-400 font-mono tracking-wider">
                                      {Math.floor((set.durationSeconds ?? 0) / 60)
                                        .toString()
                                        .padStart(2, '0')}
                                      :
                                      {((set.durationSeconds ?? 0) % 60).toString().padStart(2, '0')}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    title="Tambah 10 Detik (+10s)"
                                    onClick={() => {
                                      const currSec = set.durationSeconds ?? 0;
                                      updateSet(selectedExercise.id, set.id, {
                                        durationSeconds: currSec + 10,
                                      });
                                    }}
                                    className="w-9 h-11 min-h-[44px] border-y border-r border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-bold hover:bg-[var(--bg-surface)] text-sky-400 cursor-pointer"
                                  >
                                    +10s
                                  </button>

                                  <button
                                    type="button"
                                    title="Tambah 1 Menit (+1m)"
                                    onClick={() => {
                                      const currSec = set.durationSeconds ?? 0;
                                      updateSet(selectedExercise.id, set.id, {
                                        durationSeconds: currSec + 60,
                                      });
                                    }}
                                    className="w-9 h-11 min-h-[44px] rounded-r-[6px] border-y border-r border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                  >
                                    +1m
                                  </button>
                                </div>

                                {/* Preset Duration Chips */}
                                <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                                  {[5, 10, 15, 20, 30, 45].map((mins) => (
                                    <button
                                      key={mins}
                                      type="button"
                                      onClick={() =>
                                        updateSet(selectedExercise.id, set.id, { durationSeconds: mins * 60 })
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                        Math.round((set.durationSeconds ?? 0) / 60) === mins
                                          ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                                          : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-default)]'
                                      }`}
                                    >
                                      {mins}m
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* 2. Incline / Kemiringan (%) */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center justify-between">
                                  <span>⛰️ Incline / Nanjak (%)</span>
                                  <span className="text-[10px] text-[var(--text-tertiary)]">±0.5%</span>
                                </label>
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateSet(selectedExercise.id, set.id, {
                                        inclinePercentage: Math.max(0, +(incline - 0.5).toFixed(1)),
                                      })
                                    }
                                    className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-l-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-base font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={incline}
                                    onChange={(e) =>
                                      updateSet(selectedExercise.id, set.id, {
                                        inclinePercentage: Math.max(0, parseFloat(e.target.value) || 0),
                                      })
                                    }
                                    className="w-full h-11 min-h-[44px] text-center font-bold text-base font-[var(--font-display)] tabular-nums border-y border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateSet(selectedExercise.id, set.id, {
                                        inclinePercentage: +(incline + 0.5).toFixed(1),
                                      })
                                    }
                                    className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-r-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-base font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Preset Incline Chips */}
                                <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                                  {[0, 2, 6, 10, 12, 15].map((inc) => (
                                    <button
                                      key={inc}
                                      type="button"
                                      onClick={() =>
                                        updateSet(selectedExercise.id, set.id, { inclinePercentage: inc })
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                        incline === inc
                                          ? 'bg-amber-500 text-white border-amber-500'
                                          : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-default)]'
                                      }`}
                                    >
                                      {inc}%
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* 3. Kecepatan (km/h) */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center justify-between">
                                  <span>⚡ Kecepatan (km/h)</span>
                                  <span className="text-[10px] text-[var(--text-tertiary)]">±0.5 km/h</span>
                                </label>
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateSet(selectedExercise.id, set.id, {
                                        speedKmh: Math.max(0.5, +(speed - 0.5).toFixed(1)),
                                      })
                                    }
                                    className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-l-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-base font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={speed}
                                    onChange={(e) =>
                                      updateSet(selectedExercise.id, set.id, {
                                        speedKmh: Math.max(0.5, parseFloat(e.target.value) || 0.5),
                                      })
                                    }
                                    className="w-full h-11 min-h-[44px] text-center font-bold text-base font-[var(--font-display)] tabular-nums border-y border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateSet(selectedExercise.id, set.id, {
                                        speedKmh: +(speed + 0.5).toFixed(1),
                                      })
                                    }
                                    className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-r-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-base font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Preset Speed Chips */}
                                <div className="flex items-center gap-1 pt-1 overflow-x-auto">
                                  {[4.8, 6.0, 8.0, 10.0, 12.0].map((spd) => (
                                    <button
                                      key={spd}
                                      type="button"
                                      onClick={() =>
                                        updateSet(selectedExercise.id, set.id, { speedKmh: spd })
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                        speed === spd
                                          ? 'bg-emerald-500 text-white border-emerald-500'
                                          : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-default)]'
                                      }`}
                                    >
                                      {spd}k
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Realtime Telemetry Summary Strip */}
                            <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">
                                  Jarak Tempuh:
                                </span>
                                <span className="font-bold text-sm font-mono text-emerald-400">
                                  {distance} km
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">
                                  Est. Kalori:
                                </span>
                                <span className="font-bold text-sm font-mono text-[var(--accent-primary)]">
                                  ~{calories} kkal
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">
                                  Pace:
                                </span>
                                <span className="font-bold text-sm font-mono text-sky-400">
                                  {pace} min/km
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* ============================================================ */
                    /* STRENGTH (BEBAN & REPS) LOGGER FORM */
                    /* ============================================================ */
                    <div className="space-y-3">
                      {selectedExercise.sets.map((set) => (
                        <div
                          key={set.id}
                          className={`p-4 rounded-[6px] border transition-all ${
                            set.isCompleted
                              ? 'border-[var(--color-moss-600)]/40 bg-[var(--bg-base)]/80'
                              : 'border-[var(--border-default)] bg-[var(--bg-surface-raised)] hover:border-[var(--border-default)]/80'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                Set #{set.setNumber}
                              </span>
                              {set.isPr && <PRBadge label="Potensi PR 1RM" />}
                              {set.isCompleted && (
                                <span className="text-[10px] text-[var(--color-moss-600)] font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Tercatat
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Remove set if more than 1 */}
                              {selectedExercise.sets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSet(selectedExercise.id, set.id)}
                                  className="p-1 text-[var(--text-tertiary)] hover:text-red-400 cursor-pointer"
                                  title="Hapus Set"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Completed toggle checkbox / button */}
                              <button
                                onClick={() => handleToggleSetCompleted(selectedExercise.id, set.id)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                                  set.isCompleted
                                    ? 'bg-[var(--color-moss-600)] text-white shadow-sm'
                                    : 'border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{set.isCompleted ? 'Selesai' : 'Tandai Selesai'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Stepper Inputs for Weight & Reps */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Weight Stepper */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center justify-between">
                                <span>Beban (kg)</span>
                                <span className="text-[10px] text-[var(--text-tertiary)]">±2.5 kg</span>
                              </label>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSet(selectedExercise.id, set.id, {
                                      weightKg: Math.max(0, +(set.weightKg - 2.5).toFixed(1)),
                                    })
                                  }
                                  className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-l-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-lg font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={set.weightKg}
                                  onChange={(e) =>
                                    updateSet(selectedExercise.id, set.id, {
                                      weightKg: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full h-12 min-h-[48px] text-center font-bold text-lg font-[var(--font-display)] tabular-nums border-y border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSet(selectedExercise.id, set.id, {
                                      weightKg: +(set.weightKg + 2.5).toFixed(1),
                                    })
                                  }
                                  className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-r-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-lg font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Reps Stepper */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center justify-between">
                                <span>Repetisi</span>
                                <span className="text-[10px] text-[var(--text-tertiary)]">±1 rep</span>
                              </label>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSet(selectedExercise.id, set.id, {
                                      reps: Math.max(1, set.reps - 1),
                                    })
                                  }
                                  className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-l-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-lg font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) =>
                                    updateSet(selectedExercise.id, set.id, {
                                      reps: parseInt(e.target.value, 10) || 1,
                                    })
                                  }
                                  className="w-full h-12 min-h-[48px] text-center font-bold text-lg font-[var(--font-display)] tabular-nums border-y border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSet(selectedExercise.id, set.id, {
                                      reps: set.reps + 1,
                                    })
                                  }
                                  className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-r-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-lg font-bold hover:bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right Column (1 col): Rest Timer Ring & Live Telemetry Summary */}
          <div className="space-y-6">
            <RestTimerRing
              remainingSeconds={restTimerSeconds}
              totalSeconds={restTimerTotal}
              configuredTarget={configuredRestTarget}
              isRunning={isRestTimerRunning}
              onToggle={toggleRestTimer}
              onReset={resetRestTimer}
              onAdd15s={addRestTimer15s}
              onSub15s={subRestTimer15s}
              onSelectTarget={setConfiguredRestTarget}
            />

            {/* Live Telemetry Summary Card */}
            <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-5 space-y-4 shadow-xl">
              <h4 className="text-sm font-bold text-[var(--text-primary)] font-[var(--font-display)] flex items-center gap-2 border-b border-[var(--border-default)]/60 pb-2.5">
                <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
                Telemetri Sesi Latihan
              </h4>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block mb-1">
                    Total Volume
                  </span>
                  <span className="text-base font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
                    {formatNumber(activeSession.totalVolumeKg)} kg
                  </span>
                </div>

                <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block mb-1">
                    Set Terselesaikan
                  </span>
                  <span className="text-base font-bold font-[var(--font-display)] tabular-nums text-[var(--color-moss-600)]">
                    {totalCompletedSets} / {totalSets} Set
                  </span>
                </div>

                <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block mb-1">
                    Waktu Latihan Aktif
                  </span>
                  <span className="text-base font-bold font-[var(--font-display)] tabular-nums text-emerald-400">
                    {formatDuration(activeSession.activeSeconds || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block mb-1">
                    Waktu Istirahat (Rest)
                  </span>
                  <span className="text-base font-bold font-[var(--font-display)] tabular-nums text-amber-400">
                    {formatDuration(activeSession.restSeconds || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block mb-1">
                    Jumlah Gerakan
                  </span>
                  <span className="text-base font-bold font-[var(--font-display)] tabular-nums text-[var(--accent-secondary)]">
                    {activeSession.exercises.length} Gerakan
                  </span>
                </div>

                <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block mb-1">
                    Estimasi Kalori
                  </span>
                  <span className="text-base font-bold font-[var(--font-display)] tabular-nums text-[var(--accent-primary)]">
                    ~{activeSession.estimatedCaloriesBurned || 0} kkal
                  </span>
                </div>
              </div>

              {/* Quick Helper Tips */}
              <div className="p-3 rounded-[6px] bg-[var(--bg-base)]/50 border border-[var(--border-default)]/60 text-[11px] text-[var(--text-secondary)] space-y-1">
                <span className="font-bold text-[var(--text-primary)] block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[var(--accent-secondary)]" /> Tips Progressive Overload:
                </span>
                <p>
                  Jika repetisi target tercapai dengan form sempurna pada seluruh set, tingkatkan beban +2.5 kg di sesi berikutnya.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Selector Modal */}
      <ExerciseSelectorModal
        isOpen={isSelectorModalOpen}
        onClose={() => setIsSelectorModalOpen(false)}
        onSelectExercise={(ex) => {
          const newId = addExerciseFromMaster(ex);
          if (newId) {
            setSelectedExerciseId(newId);
          }
          toast.success(`Gerakan "${ex.name}" (${ex.equipmentName}) berhasil ditambahkan!`);
        }}
        alreadySelectedIds={activeSession.exercises.map((e) => e.exerciseId || e.id)}
      />
    </AppShell>
  );
}
