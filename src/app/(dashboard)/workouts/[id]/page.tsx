'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/common/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { PRBadge } from '@/components/ui/PRBadge';
import { Divider } from '@/components/ui/Divider';
import { Skeleton } from '@/components/ui/Skeleton';
import { workoutService } from '@/services/workout.service';
import { formatNumber, formatDuration } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Award,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Share2,
  Play,
  RotateCcw,
  Zap,
  Gauge,
  TrendingUp,
  Timer,
  Footprints,
  Route,
} from 'lucide-react';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = Array.isArray(params.id) ? params.id[0] : params.id as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['workout-detail', workoutId],
    queryFn: () => workoutService.getWorkoutById(workoutId),
    enabled: Boolean(workoutId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const workout = data?.workout;
  const summary = data?.summary;
  const personalRecords = data?.personalRecords || [];

  // Format date helper
  const formattedDate = React.useMemo(() => {
    if (!workout?.startedAt && !workout?.createdAt) return '-';
    const dateObj = new Date(workout.startedAt || workout.createdAt || '');
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [workout]);

  const formattedTimeRange = React.useMemo(() => {
    if (!workout?.startedAt) return '';
    const startObj = new Date(workout.startedAt);
    const startStr = startObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (!workout.completedAt) return `Mulai ${startStr}`;
    const endObj = new Date(workout.completedAt);
    const endStr = endObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${startStr} — ${endStr}`;
  }, [workout]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
          {/* Breadcrumbs skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-4" />
            <Skeleton className="h-5 w-48" />
          </div>

          {/* Header Card skeleton */}
          <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-default)]">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>

          {/* Exercises skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-[10px]" />
            <Skeleton className="h-44 w-full rounded-[10px]" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError || !workout) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Dumbbell className="w-8 h-8 opacity-60" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Sesi Latihan Tidak Ditemukan</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Sesi latihan ini mungkin telah dihapus atau Anda tidak memiliki akses untuk melihatnya.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => router.push('/workouts')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Riwayat
            </Button>
            <Button variant="primary" onClick={() => refetch()}>
              Coba Lagi
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            <Link
              href="/workouts"
              className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Riwayat & Analitik
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            <span className="text-[var(--text-primary)] font-semibold truncate max-w-[200px] sm:max-w-xs">
              {workout.name}
            </span>
          </div>

          <Link href="/workouts/active">
            <Button variant="primary" size="sm" className="font-semibold shadow-sm">
              <Play className="w-3.5 h-3.5 mr-1.5" /> Mulai Sesi Baru
            </Button>
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 sm:p-7 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                  {workout.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Selesai
                </span>
                {workout.routineTemplateName && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                    {workout.routineTemplateName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-secondary)] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[var(--accent-primary)]" /> {formattedDate}
                </span>
                {formattedTimeRange && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 opacity-70" /> {formattedTimeRange}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Telemetry Summary KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {/* Total Volume */}
            <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Beban Volume
                </span>
                <Dumbbell className="w-4 h-4 text-[var(--accent-primary)] opacity-80" />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {formatNumber(summary?.totalVolumeKg || 0)} <span className="text-xs font-normal text-[var(--text-secondary)]">kg</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {summary?.totalCompletedSets || 0} set selesai
              </div>
            </div>

            {/* Durasi Latihan */}
            <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Durasi Sesi
                </span>
                <Clock className="w-4 h-4 text-sky-400 opacity-80" />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {summary?.sessionDurationMinutes || 0} <span className="text-xs font-normal text-[var(--text-secondary)]">menit</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {summary?.activeDurationMinutes || 0}m aktif • {summary?.restDurationMinutes || 0}m istirahat
              </div>
            </div>

            {/* Kalori Terbakar */}
            <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Kalori Terbakar
                </span>
                <Flame className="w-4 h-4 text-orange-500 opacity-80" />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {formatNumber(summary?.estimatedCaloriesBurned || 0)} <span className="text-xs font-normal text-[var(--text-secondary)]">kkal</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {summary?.cardioCalories ? `${summary.cardioCalories}k kardio` : 'Formula ACSM & MET'}
              </div>
            </div>

            {/* Rasio Aktif */}
            <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Rasio Aktif
                </span>
                <Activity className="w-4 h-4 text-emerald-400 opacity-80" />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {summary?.activeRatioPct || 0}%
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Work/Rest density
              </div>
            </div>

            {/* Kardio & Jarak */}
            <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Kardio & Jarak
                </span>
                <Zap className="w-4 h-4 text-teal-400 opacity-80" />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {summary?.cardioMinutes || 0} <span className="text-xs font-normal text-[var(--text-secondary)]">menit</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {summary?.cardioDistanceKm ? `${summary.cardioDistanceKm} km ditempuh` : 'Tidak ada kardio'}
              </div>
            </div>

            {/* Rekor PR Baru */}
            <div className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Rekor PR Baru
                </span>
                <Award className="w-4 h-4 text-amber-400 opacity-80" />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {personalRecords.length} <span className="text-xs font-normal text-[var(--text-secondary)]">PR</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {personalRecords.length > 0 ? 'Prestasi baru!' : 'Sesi standar'}
              </div>
            </div>
          </div>
        </div>

        {/* PR Spotlight Banner if achieved */}
        {personalRecords.length > 0 && (
          <div className="rounded-[10px] border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 sm:p-5 flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> {personalRecords.length} Rekor Pribadi (PR) Baru Terpecahkan di Sesi Ini!
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {personalRecords.map((pr: any) => (
                  <span
                    key={pr.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30"
                  >
                    🏆 {pr.exerciseName || 'Gerakan'} • {pr.recordType === 'MAX_WEIGHT' ? `Beban ${pr.value} kg` : pr.recordType === 'MAX_REPS' ? `${pr.value} Reps` : `Volume ${pr.value} kg`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exercises Breakdown Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
              Rincian Gerakan & Set Latihan ({workout.exercises.length} gerakan)
            </h2>
          </div>

          <div className="space-y-4">
            {workout.exercises.map((ex: any, exIndex: number) => {
              const isCardio =
                ex.equipment === 'TREADMILL' ||
                ex.equipment === 'STATIONARY_BIKE' ||
                ex.equipment === 'STAIR_MASTER' ||
                ex.primaryMuscle === 'CARDIO' ||
                (ex.exerciseName && ex.exerciseName.toLowerCase().includes('treadmill'));

              const completedSetsCount = ex.sets.filter((s: any) => s.isCompleted).length;
              const totalExerciseVolume = ex.sets
                .filter((s: any) => s.isCompleted)
                .reduce((sum: number, s: any) => sum + (Number(s.weightKg) || 0) * (s.reps || 0), 0);

              return (
                <div
                  key={ex.id}
                  className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden shadow-sm"
                >
                  {/* Exercise Header */}
                  <div className="p-4 sm:p-5 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                        {exIndex + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-primary)]">
                          {ex.exerciseName || ex.name || 'Gerakan Gym'}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                            {ex.equipmentName || ex.equipment}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                            {ex.primaryMuscleName || ex.primaryMuscle || ex.muscleGroup}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] flex items-center gap-4 self-end sm:self-auto">
                      <span>{completedSetsCount} / {ex.sets.length} Set Selesai</span>
                      {!isCardio && totalExerciseVolume > 0 && (
                        <span className="font-semibold text-[var(--text-primary)]">
                          Total Volume: {formatNumber(totalExerciseVolume)} kg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="p-4 sm:p-5">
                    {isCardio ? (
                      /* Responsive Cardio Dashboard View */
                      <div className="space-y-4">
                        {ex.sets.map((set: any, sIdx: number) => {
                          const spd = Number(set.speedKmh) || 4.8;
                          const inc = Number(set.inclinePct) || Number(set.inclinePercentage) || 0;
                          const durSec = set.durationSeconds || (Number(set.durationMinutes) || 30) * 60;
                          const durMin = Math.floor(durSec / 60);
                          const durRemSec = durSec % 60;
                          const durationDisplay = durSec > 0
                            ? `${durMin}m ${durRemSec > 0 ? `${durRemSec}s` : ''}`.trim()
                            : `${set.durationMinutes || 30} menit`;

                          const dist = set.distanceKm
                            ? Number(set.distanceKm)
                            : Number(((spd * durSec) / 3600).toFixed(2));

                          const cal = set.caloriesBurned || Math.round((durSec / 60) * (5 + spd * 0.8 + inc * 0.5));

                          // Accurate Treadmill Pace Calculation (mm:ss /km)
                          let paceFormatted = '-';
                          if (set.paceMinPerKm) {
                            paceFormatted = `${set.paceMinPerKm} /km`;
                          } else if (spd > 0) {
                            const totalMins = 60 / spd;
                            const pMin = Math.floor(totalMins);
                            const pSec = Math.round((totalMins - pMin) * 60);
                            paceFormatted = `${pMin}:${pSec.toString().padStart(2, '0')} /km`;
                          }

                          return (
                            <div
                              key={set.id || sIdx}
                              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-[var(--accent-primary)]/40 transition-all"
                            >
                              {/* Cardio Header Badge */}
                              <div className="flex items-center justify-between gap-2 border-b border-[var(--border-default)]/70 pb-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center">
                                    <Footprints className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                                      Sesi Kardio #{set.orderIndex || sIdx + 1}
                                    </span>
                                    <span className="text-[11px] text-[var(--text-secondary)] block sm:inline sm:ml-2">
                                      {ex.exerciseName || ex.name || 'Treadmill Walk/Run'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Selesai
                                  </span>
                                </div>
                              </div>

                              {/* Responsive Telemetry 6-Tile Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                                {/* 1. Kecepatan */}
                                <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] p-3 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    <span>Kecepatan</span>
                                    <Gauge className="w-3.5 h-3.5 text-sky-400 opacity-80" />
                                  </div>
                                  <div className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                                    {spd} <span className="text-xs font-normal text-[var(--text-secondary)]">km/h</span>
                                  </div>
                                  <div className="text-[10px] text-[var(--text-secondary)] truncate">Speed Laju</div>
                                </div>

                                {/* 2. Incline */}
                                <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] p-3 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    <span>Tanjakan</span>
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
                                  </div>
                                  <div className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                                    {inc} <span className="text-xs font-normal text-[var(--text-secondary)]">%</span>
                                  </div>
                                  <div className="text-[10px] text-[var(--text-secondary)] truncate">Kemiringan Incline</div>
                                </div>

                                {/* 3. Durasi */}
                                <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] p-3 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    <span>Durasi</span>
                                    <Clock className="w-3.5 h-3.5 text-amber-400 opacity-80" />
                                  </div>
                                  <div className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                                    {durationDisplay}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-secondary)] truncate">Waktu Aktif</div>
                                </div>

                                {/* 4. Jarak */}
                                <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] p-3 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    <span>Jarak</span>
                                    <Route className="w-3.5 h-3.5 text-indigo-400 opacity-80" />
                                  </div>
                                  <div className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                                    {dist} <span className="text-xs font-normal text-[var(--text-secondary)]">km</span>
                                  </div>
                                  <div className="text-[10px] text-[var(--text-secondary)] truncate">Jarak Tempuh</div>
                                </div>

                                {/* 5. Pace */}
                                <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] p-3 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    <span>Pace</span>
                                    <Timer className="w-3.5 h-3.5 text-purple-400 opacity-80" />
                                  </div>
                                  <div className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                                    {paceFormatted}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-secondary)] truncate">Rata-rata Pace</div>
                                </div>

                                {/* 6. Kalori */}
                                <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] p-3 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                    <span>Kalori</span>
                                    <Flame className="w-3.5 h-3.5 text-orange-400 opacity-80" />
                                  </div>
                                  <div className="text-base sm:text-lg font-bold text-orange-400">
                                    {cal} <span className="text-xs font-normal text-[var(--text-secondary)]">kkal</span>
                                  </div>
                                  <div className="text-[10px] text-[var(--text-secondary)] truncate">Formula ACSM</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Strength/Lifting Sets Table */
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm text-left">
                          <thead>
                            <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                              <th className="pb-2.5 w-16">SET</th>
                              <th className="pb-2.5">BEBAN</th>
                              <th className="pb-2.5">REPETISI</th>
                              <th className="pb-2.5">DURASI (TUT)</th>
                              <th className="pb-2.5">VOLUME</th>
                              <th className="pb-2.5">ISTIRAHAT</th>
                              <th className="pb-2.5">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-default)]">
                            {ex.sets.map((set: any, sIdx: number) => {
                              const setVol = (Number(set.weightKg) || 0) * (set.reps || 0);
                              const tutSeconds = set.durationSeconds && set.durationSeconds > 0
                                ? set.durationSeconds
                                : (set.reps ? Math.max(15, Math.round(set.reps * 3.5)) : 0);

                              return (
                                <tr key={set.id || sIdx} className="hover:bg-[var(--bg-surface)]/30 transition-colors">
                                  <td className="py-2.5 font-bold text-[var(--text-secondary)]">
                                    #{set.orderIndex || sIdx + 1}
                                  </td>
                                  <td className="py-2.5 font-bold text-[var(--text-primary)]">
                                    {set.weightKg || 0} <span className="font-normal text-xs text-[var(--text-secondary)]">kg</span>
                                  </td>
                                  <td className="py-2.5 font-bold text-[var(--text-primary)]">
                                    {set.reps || 0} <span className="font-normal text-xs text-[var(--text-secondary)]">reps</span>
                                  </td>
                                  <td className="py-2.5 font-medium text-[var(--text-primary)]">
                                    {tutSeconds > 0 ? `${tutSeconds}s` : '-'}
                                  </td>
                                  <td className="py-2.5 font-semibold text-[var(--text-primary)]">
                                    {formatNumber(setVol)} <span className="font-normal text-xs text-[var(--text-secondary)]">kg</span>
                                  </td>
                                  <td className="py-2.5 text-[var(--text-secondary)]">
                                    {set.restSeconds ? `${set.restSeconds}s` : '-'}
                                  </td>
                                  <td className="py-2.5">
                                    {set.isCompleted ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                                      </span>
                                    ) : (
                                      <span className="text-xs text-[var(--text-secondary)]">Dilewati</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
          <Link href="/workouts">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Riwayat
            </Button>
          </Link>
          <Link href="/workouts/active">
            <Button variant="primary" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" /> Ulangi Latihan Serupa
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
