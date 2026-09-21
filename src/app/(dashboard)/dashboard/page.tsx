'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/common/AppShell';
import { CheckInBanner } from '@/components/common/CheckInBanner';
import { MetricCard } from '@/components/ui/MetricCard';
import { Divider } from '@/components/ui/Divider';
import { InsightCard } from '@/components/ui/InsightCard';
import { TimelineEntry } from '@/components/ui/TimelineEntry';
import { Button } from '@/components/ui/Button';
import { PRBadge } from '@/components/ui/PRBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkoutSessionStore } from '@/stores/workout-session.store';
import { formatNumber, formatDuration } from '@/lib/utils';
import {
  useDashboardSummary,
  useDashboardInsights,
  useDashboardTimeline,
} from '@/hooks/use-dashboard-analytics';
import { AnalyticsTimeframe } from '@/types/analytics.types';
import {
  Dumbbell,
  ArrowRight,
  Flame,
  Scale,
  Activity,
  Droplets,
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  HeartPulse,
  Utensils,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';

const MUSCLE_PALETTE: Record<string, string> = {
  CHEST: '#F05A28',
  BACK: '#E6C659',
  LEGS: '#4A6B4A',
  SHOULDERS: '#38BDF8',
  ARMS: '#A855F7',
  BICEPS: '#A855F7',
  TRICEPS: '#C084FC',
  CORE: '#EC4899',
  CARDIO: '#06B6D4',
  OTHER: '#94A3B8',
};

export default function DashboardPage() {
  const { activeSession, isTimerRunning, getElapsedSeconds } = useWorkoutSessionStore();
  const [analyticsTab, setAnalyticsTab] = useState<'VOLUME' | 'STRENGTH' | 'CALORIE_WEIGHT' | 'WORK_REST'>('VOLUME');
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('7D');
  const [elapsed, setElapsed] = useState(0);

  // TanStack Query Hooks
  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
    isRefetching,
  } = useDashboardSummary(timeframe);

  const { data: insightsList } = useDashboardInsights();
  const { data: timelineEvents, isLoading: isTimelineLoading } = useDashboardTimeline();

  useEffect(() => {
    if (!activeSession) return;
    setElapsed(getElapsedSeconds());
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, getElapsedSeconds]);

  // Derived Active Workout: prioritize store session, otherwise fallback to API active workout
  const liveActiveWorkout =
    activeSession && activeSession.exercises.length > 0
      ? {
          name: activeSession.name,
          exercisesCount: activeSession.exercises.length,
          setsCount: activeSession.exercises.reduce((a, b) => a + b.sets.length, 0),
          elapsedSeconds: elapsed,
        }
      : summary?.activeWorkout
      ? {
          name: summary.activeWorkout.name,
          exercisesCount: summary.activeWorkout.totalExercises,
          setsCount: summary.activeWorkout.totalSets,
          elapsedSeconds: summary.activeWorkout.elapsedSeconds,
        }
      : null;

  // Radial Gauges Calculation (Circumference: 2 * pi * 38 = 238.76)
  const GAUGE_CIRCUMFERENCE = 238.76;
  const calPct = summary?.radialGauges?.calorieProgress?.targetKcal
    ? Math.min(
        100,
        Math.round(
          (summary.radialGauges.calorieProgress.consumedKcal /
            summary.radialGauges.calorieProgress.targetKcal) *
            100,
        ),
      )
    : 0;
  const calOffset = GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * Math.max(0, calPct)) / 100;

  const hydroPct = summary?.radialGauges?.hydrationProgress?.pct || 0;
  const hydroOffset = GAUGE_CIRCUMFERENCE - (GAUGE_CIRCUMFERENCE * Math.max(0, hydroPct)) / 100;

  const insightsToRender =
    insightsList && insightsList.length > 0
      ? insightsList
      : summary?.deterministicInsights && summary.deterministicInsights.length > 0
      ? summary.deterministicInsights
      : [];

  const timelineToRender = timelineEvents && timelineEvents.length > 0 ? timelineEvents : [];

  return (
    <AppShell>
      {/* 30-Day Evaluation Reminder Banner */}
      {summary?.checkInBanner && (
        <CheckInBanner
          daysSinceLastCheckIn={
            summary.checkInBanner.intervalDays - summary.checkInBanner.daysRemaining
          }
        />
      )}

      {/* Active Workout Floating Hero */}
      {liveActiveWorkout && (
        <div className="mb-5 p-4 rounded-[6px] border border-[var(--accent-primary)]/60 bg-[var(--accent-primary)]/10 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold animate-pulse">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--accent-primary)]">
                  Sesi latihan sedang berlangsung
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-base)] border border-[var(--accent-primary)]/40 font-mono text-[var(--accent-primary)]">
                  {formatDuration(liveActiveWorkout.elapsedSeconds)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {liveActiveWorkout.name} ({liveActiveWorkout.exercisesCount} gerakan ·{' '}
                {liveActiveWorkout.setsCount} set)
              </h3>
            </div>
          </div>

          <Link href="/workouts/active">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              Lanjutkan sesi workout <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-[var(--font-display)] tracking-tight text-[var(--text-primary)]">
              Dashboard analitik
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-[var(--accent-secondary)]">
              Fase: Hypertrophy & fat loss
            </span>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
            Ikhtisar performa latihan, distribusi volume, estimasi 1RM, progres kalori, dan telemetri komposisi tubuh.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 sm:pt-0">
          {/* Timeframe selector pills */}
          <div className="grid grid-cols-3 sm:flex items-center rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 text-center">
            {(['7D', '30D', '90D'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1.5 sm:py-1 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tf === '7D' ? '7 Hari' : tf === '30D' ? '30 Hari' : '3 Bulan'}
              </button>
            ))}
          </div>

          <Link href="/workouts/active" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full sm:w-auto text-xs sm:text-sm py-2 sm:py-2.5">
              <Dumbbell className="w-4 h-4 mr-1.5" />
              + Mulai workout
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Hero Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
        {isSummaryLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))
        ) : (
          <>
            <MetricCard
              label={`Volume latihan (${timeframe})`}
              value={formatNumber(summary?.heroMetrics?.volume?.totalKg || 0)}
              unit="kg"
              trend={
                summary?.heroMetrics?.volume
                  ? {
                      direction: summary.heroMetrics.volume.isPositive ? 'UP' : 'DOWN',
                      value: `${Math.abs(summary.heroMetrics.volume.trendPct)}%`,
                      percentage: `${summary.heroMetrics.volume.isPositive ? '+' : '-'}${Math.abs(summary.heroMetrics.volume.trendPct)}`,
                      alignment: summary.heroMetrics.volume.isPositive ? 'ON_TRACK' : 'NEUTRAL',
                    }
                  : undefined
              }
              icon={<Activity className="w-4 h-4 text-[#4CD6DE]" />}
            />
            <MetricCard
              label="Protein harian"
              value={summary?.heroMetrics?.protein?.consumedG || 0}
              unit={`/ ${summary?.heroMetrics?.protein?.targetG || 0}g`}
              subValue={`Sisa: ${summary?.heroMetrics?.protein?.remainingG || 0}g (${summary?.heroMetrics?.protein?.pct || 0}%)`}
              icon={<Utensils className="w-4 h-4 text-[#FF6B2C]" />}
            />
            <MetricCard
              label="Lemak harian"
              value={summary?.heroMetrics?.fat?.consumedG || 0}
              unit={`/ ${summary?.heroMetrics?.fat?.targetG || 0}g`}
              subValue={`Sisa: ${summary?.heroMetrics?.fat?.remainingG || 0}g (${summary?.heroMetrics?.fat?.pct || 0}%)`}
              icon={<PieChart className="w-4 h-4 text-[#FFA726]" />}
            />
            <MetricCard
              label="Karbohidrat"
              value={summary?.heroMetrics?.carbs?.consumedG || 0}
              unit={`/ ${summary?.heroMetrics?.carbs?.targetG || 0}g`}
              subValue={`Sisa: ${summary?.heroMetrics?.carbs?.remainingG || 0}g (${summary?.heroMetrics?.carbs?.pct || 0}%)`}
              icon={<Zap className="w-4 h-4 text-[#9B7CF6]" />}
            />
            <MetricCard
              label="Berat badan"
              value={summary?.heroMetrics?.weight?.currentKg || 0}
              unit="kg"
              trend={
                summary?.heroMetrics?.weight
                  ? {
                      direction: summary.heroMetrics.weight.trendKg <= 0 ? 'DOWN' : 'UP',
                      value: `${Math.abs(summary.heroMetrics.weight.trendKg)} kg`,
                      percentage: `${summary.heroMetrics.weight.trendPct}%`,
                      alignment: summary.heroMetrics.weight.isAlignedWithGoal ? 'ON_TRACK' : 'NEUTRAL',
                    }
                  : undefined
              }
              icon={<Scale className="w-4 h-4 text-[var(--accent-secondary)]" />}
            />
            <MetricCard
              label="Rasio aktif (work/rest)"
              value={`${summary?.heroMetrics?.activeRatio?.activePct || 50}%`}
              unit="Aktif"
              subValue={`${summary?.heroMetrics?.activeRatio?.restPct || 50}% Istirahat`}
              icon={<Clock className="w-4 h-4 text-emerald-400" />}
            />
          </>
        )}
      </div>

      {/* Dual Circular Radial Gauges */}
      <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Circular Radial Gauge - Progres Kalori Harian */}
        <div className="p-5 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="p-1.5 rounded-[8px] bg-[#FF6B2C]/15 text-[#FF6B2C]">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Progres Kalori Harian
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-center sm:justify-start gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                  {formatNumber(summary?.radialGauges?.calorieProgress?.consumedKcal || 0)}
                </span>
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  / {formatNumber(summary?.radialGauges?.calorieProgress?.targetKcal || 2200)} kkal
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/60 pt-2.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-tertiary)]">Sisa Kalori:</span>
                <span className="font-bold text-[#FF6B2C] font-mono">
                  {formatNumber(summary?.radialGauges?.calorieProgress?.deltaKcal || 0)} kkal
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-tertiary)]">Distribusi Makro:</span>
                <span className="font-mono text-[11px] flex items-center gap-1.5">
                  <span className="text-[#FF6B2C] font-bold">
                    P: {summary?.heroMetrics?.protein?.consumedG || 0}g ({summary?.radialGauges?.calorieProgress?.macroSplit?.proteinPct || 30}%)
                  </span>
                  <span className="text-[#FFA726] font-bold">
                    L: {summary?.heroMetrics?.fat?.consumedG || 0}g ({summary?.radialGauges?.calorieProgress?.macroSplit?.fatPct || 25}%)
                  </span>
                  <span className="text-[#9B7CF6] font-bold">
                    K: {summary?.heroMetrics?.carbs?.consumedG || 0}g ({summary?.radialGauges?.calorieProgress?.macroSplit?.carbsPct || 45}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-tertiary)]">Target Kalori:</span>
                <span className="font-semibold text-white font-mono">
                  {formatNumber(summary?.radialGauges?.calorieProgress?.targetKcal || 2200)} kkal
                </span>
              </div>
            </div>
          </div>

          {/* Right Circular Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#262934"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#FF6B2C"
                strokeWidth="10"
                strokeDasharray={`${GAUGE_CIRCUMFERENCE}`}
                strokeDashoffset={`${calOffset}`}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                {calPct}%
              </span>
              <span className="text-[9px] font-bold text-[#FF6B2C] uppercase tracking-wider">
                Tercapai
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Circular Radial Gauge - Progres Hidrasi Air Minum */}
        <div className="p-5 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="p-1.5 rounded-[8px] bg-[#4CD6DE]/15 text-[#4CD6DE]">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Progres Hidrasi Air Minum
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-center sm:justify-start gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                  {formatNumber(summary?.radialGauges?.hydrationProgress?.consumedMl || 0)}
                </span>
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  / {formatNumber(summary?.radialGauges?.hydrationProgress?.targetMl || 2500)} ml
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/60 pt-2.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-tertiary)]">Sisa Target Hidrasi:</span>
                <span className="font-bold text-[#4CD6DE] font-mono">
                  {formatNumber(summary?.radialGauges?.hydrationProgress?.remainingMl || 0)} ml
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-tertiary)]">Setara:</span>
                <span className="font-semibold text-white font-mono">
                  ~{Math.max(0, Math.ceil((summary?.radialGauges?.hydrationProgress?.remainingMl || 0) / 300))} Gelas Air
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-tertiary)]">Standar Rumus:</span>
                <span className="font-mono text-[var(--text-secondary)]">35 ml × Berat Badan (BR-010)</span>
              </div>
            </div>
          </div>

          {/* Right Circular Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#262934"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#4CD6DE"
                strokeWidth="10"
                strokeDasharray={`${GAUGE_CIRCUMFERENCE}`}
                strokeDashoffset={`${hydroOffset}`}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                {hydroPct}%
              </span>
              <span className="text-[9px] font-bold text-[#4CD6DE] uppercase tracking-wider">
                Terpenuhi
              </span>
            </div>
          </div>
        </div>
      </div>

      <Divider thick />

      {/* ============================================================ */}
      {/* SECTION: INTERACTIVE ANALYTICS VISUALIZATION HUB */}
      {/* ============================================================ */}
      <section className="my-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--accent-primary)]" />
              Visualisasi & Tren Kinerja Latihan
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Korelasi data deterministik antara beban latihan, progres kekuatan (1RM), dan keseimbangan metabolisme.
            </p>
          </div>

          {/* Chart View Switcher Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
            <button
              type="button"
              onClick={() => setAnalyticsTab('VOLUME')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                analyticsTab === 'VOLUME'
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Distribusi Volume Otot
            </button>
            <button
              type="button"
              onClick={() => setAnalyticsTab('STRENGTH')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                analyticsTab === 'STRENGTH'
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Progresi 1RM Beban
            </button>
            <button
              type="button"
              onClick={() => setAnalyticsTab('CALORIE_WEIGHT')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                analyticsTab === 'CALORIE_WEIGHT'
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Kalori vs Berat Badan
            </button>
            <button
              type="button"
              onClick={() => setAnalyticsTab('WORK_REST')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                analyticsTab === 'WORK_REST'
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Rasio Efisiensi Set/Rest
            </button>
          </div>
        </div>

        {/* Main Chart Container Card */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5">
          {/* TAB 1: VOLUME DISTRIBUTION BY MUSCLE GROUP */}
          {analyticsTab === 'VOLUME' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)]/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Total volume beban per kelompok otot ({timeframe})
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Total volume akumulatif:{' '}
                    <strong className="text-[var(--text-primary)]">
                      {formatNumber(summary?.heroMetrics?.volume?.totalKg || 0)} kg
                    </strong>
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-moss-600)] font-semibold bg-[var(--color-moss-600)]/10 px-2 py-1 rounded border border-[var(--color-moss-600)]/30">
                  Data real dari riwayat sesi
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={summary?.charts?.volumeByMuscleGroup || []}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                      <XAxis dataKey="name" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 8 }}
                        contentStyle={{
                          backgroundColor: '#1E2027',
                          borderColor: '#2C303B',
                          borderRadius: '14px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        }}
                        labelStyle={{ color: '#9AA0B0', fontWeight: 'bold', marginBottom: '4px' }}
                        formatter={(v: unknown) => [`${formatNumber(v as number)} kg`, 'Volume Beban']}
                      />
                      <Bar dataKey="volumeKg" radius={[8, 8, 0, 0]}>
                        {(summary?.charts?.volumeByMuscleGroup || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MUSCLE_PALETTE[entry.muscle] || '#F05A28'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5 border-t lg:border-t-0 lg:border-l border-[var(--border-default)] pt-4 lg:pt-0 lg:pl-6">
                  <span className="text-xs font-bold text-[var(--text-tertiary)] block">
                    Distribusi persentase beban
                  </span>
                  {(summary?.charts?.volumeByMuscleGroup || []).map((item) => (
                    <div key={item.muscle} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-secondary)] font-medium">{item.name}</span>
                        <span className="font-bold tabular-nums text-white">
                          {formatNumber(item.volumeKg)} kg ({item.pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-default)]/40">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.pct}%`,
                            backgroundColor: MUSCLE_PALETTE[item.muscle] || '#F05A28',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRENGTH PROGRESSION & 1RM ESTIMATION */}
          {analyticsTab === 'STRENGTH' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)]/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Tren estimasi 1RM (Epley formula: w × (1 + r/30))
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Progressive overload pada gerakan compound utama yang tercatat.
                  </p>
                </div>
                <span className="text-[11px] text-[var(--accent-primary)] font-semibold bg-[var(--accent-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--accent-primary)]/30">
                  Dihitung otomatis per set latihan
                </span>
              </div>

              {summary?.charts?.strengthProgression && summary.charts.strengthProgression.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center text-xs">
                    {summary.charts.strengthProgression.map((item) => (
                      <div
                        key={item.exerciseId}
                        className="p-3 rounded-[14px] bg-[var(--bg-base)] border border-[var(--border-default)]"
                      >
                        <span className="text-[10px] text-[var(--text-tertiary)] block">
                          {item.exerciseName}
                        </span>
                        <span className="text-sm font-bold text-[#FF6B2C] font-[var(--font-display)]">
                          1RM: {item.current1RM} kg{' '}
                          {item.deltaPct !== 0 && (
                            <span className={item.deltaPct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              ({item.deltaPct > 0 ? '+' : ''}
                              {item.deltaPct}%)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">
                  Belum ada log gerakan compound (Bench Press, Squat, Deadlift, OHP) yang tercatat.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALORIE VS WEIGHT CORRELATION */}
          {analyticsTab === 'CALORIE_WEIGHT' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)]/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Korelasi asupan kalori harian vs tren berat badan
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Target kalori harian:{' '}
                    <strong className="text-[var(--accent-secondary)]">
                      {summary?.radialGauges?.calorieProgress?.targetKcal || 2200} kkal
                    </strong>
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={summary?.charts?.calorieVsWeight || []}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                    <XAxis dataKey="date" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="cal" stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="wt" orientation="right" stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 8 }}
                      contentStyle={{
                        backgroundColor: '#1E2027',
                        borderColor: '#2C303B',
                        borderRadius: '14px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{ color: '#9AA0B0', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <ReferenceLine
                      yAxisId="cal"
                      y={summary?.radialGauges?.calorieProgress?.targetKcal || 2200}
                      stroke="#FFA726"
                      strokeDasharray="4 4"
                    />
                    <Bar
                      yAxisId="cal"
                      dataKey="calories"
                      fill="#FF6B2C"
                      opacity={0.9}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={24}
                      name="Asupan Kalori (kkal)"
                    />
                    <Line
                      yAxisId="wt"
                      type="monotone"
                      dataKey="weightKg"
                      stroke="#4CD6DE"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4CD6DE', stroke: '#121316', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#4CD6DE', stroke: '#FFFFFF', strokeWidth: 2 }}
                      name="Berat Badan (kg)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: WORK / REST RATIO EFFICIENCY */}
          {analyticsTab === 'WORK_REST' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)]/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Distribusi waktu latihan aktif vs istirahat (Rest)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Evaluasi durasi set vs waktu istirahat antar-set untuk intensitas optimal.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary?.charts?.workRestRatio || []}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                    <XAxis dataKey="date" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 8 }}
                      contentStyle={{
                        backgroundColor: '#1E2027',
                        borderColor: '#2C303B',
                        borderRadius: '14px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{ color: '#9AA0B0', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(v: unknown, name: unknown) => [
                        `${v} menit`,
                        name === 'activeMin' ? 'Waktu Angkat Aktif' : 'Waktu Istirahat (Rest)',
                      ]}
                    />
                    <Bar dataKey="activeMin" stackId="a" fill="#4CD6DE" name="Waktu Aktif (min)" />
                    <Bar
                      dataKey="restMin"
                      stackId="a"
                      fill="#FF6B2C"
                      radius={[6, 6, 0, 0]}
                      name="Waktu Istirahat (min)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: MUSCLE RECOVERY MATRIX & WORKOUT CONSISTENCY */}
      {/* ============================================================ */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Muscle Recovery & Fatigue Matrix */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[var(--color-moss-600)]" />
                Matriks pemulihan otot (recovery status)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Estimasi biologis kesiapan kelompok otot berdasarkan volume sesi terakhir.
              </p>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
              Rule BR-017
            </span>
          </div>

          <div className="space-y-3">
            {(summary?.muscleRecovery || []).map((m) => (
              <div
                key={m.muscleGroupName}
                className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)]">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {m.hoursAgo < 500 ? `Dilatih ${m.hoursAgo} jam lalu` : 'Belum dilatih'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.pct >= 90
                          ? 'bg-[var(--color-moss-600)]/20 text-[var(--color-moss-600)] border border-[var(--color-moss-600)]/30'
                          : 'bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/30'
                      }`}
                    >
                      {m.pct}% · {m.label}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.pct >= 90 ? 'bg-[var(--color-moss-600)]' : 'bg-[var(--accent-secondary)]'
                    }`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 28-Day Workout Consistency Heatmap */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
                  Konsistensi latihan (heatmap 28 hari)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {summary?.consistencyHeatmap?.completedSessions || 0} Sesi Latihan Selesai ·{' '}
                  {summary?.consistencyHeatmap?.adherencePct || 0}% Kepatuhan Program.
                </p>
              </div>
              <span className="text-[10px] text-[var(--color-moss-600)] font-bold bg-[var(--color-moss-600)]/10 px-2 py-0.5 rounded border border-[var(--color-moss-600)]/30">
                Streak: {summary?.consistencyHeatmap?.activeStreakWeeks || 0} Minggu Aktif
              </span>
            </div>

            {/* Heatmap Grid (4 rows x 7 cols) */}
            <div className="pt-4 space-y-2">
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-[var(--text-tertiary)] font-bold mb-1">
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
                <span>Min</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {(summary?.consistencyHeatmap?.items || []).map((item) => (
                  <div
                    key={item.day}
                    title={`${item.date}: ${
                      item.hasWorkout
                        ? `Sesi Latihan (${item.volume} kg, ${item.durationMinutes} min)`
                        : 'Hari Istirahat (Rest Day)'
                    }`}
                    className={`h-8 rounded-[4px] border flex items-center justify-center text-[9px] font-mono transition-transform hover:scale-105 cursor-pointer ${
                      item.hasWorkout
                        ? 'bg-[var(--accent-primary)]/80 border-[var(--accent-primary)] text-white font-bold shadow-sm'
                        : 'bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-tertiary)]'
                    }`}
                  >
                    {item.hasWorkout ? '🏋️' : '·'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]/60 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[var(--bg-base)] border border-[var(--border-default)]" />
              <span className="text-[11px]">Rest day</span>
              <div className="w-3 h-3 rounded bg-[var(--accent-primary)] ml-2" />
              <span className="text-[11px]">Sesi latihan gym</span>
            </div>
            <Link href="/workouts" className="text-[var(--accent-primary)] hover:underline font-semibold text-[11px]">
              Lihat riwayat lengkap →
            </Link>
          </div>
        </div>
      </div>

      <Divider thick />

      {/* ============================================================ */}
      {/* SECTION: PERSONAL RECORD (PR) & RECENT SESSIONS */}
      {/* ============================================================ */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                Sesi latihan terkini & rekor baru (PR)
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Riwayat sesi terakhir dan rincian beban kerja yang tercatat.
              </p>
            </div>
            <Link
              href="/workouts"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1"
            >
              Semua riwayat <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 flex-1 flex flex-col justify-between space-y-4">
            {summary?.lastWorkoutSession ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[var(--accent-secondary)]">
                      Sesi terakhir · {new Date(summary.lastWorkoutSession.completedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {summary.lastWorkoutSession.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {summary.lastWorkoutSession.totalExercises} Gerakan · {summary.lastWorkoutSession.totalSets} Total Set
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-[var(--border-default)] pt-3 md:pt-0 md:pl-6 text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-bold block">
                        Total volume
                      </span>
                      <span className="text-base font-bold tabular-nums text-[var(--text-primary)]">
                        {formatNumber(summary.lastWorkoutSession.totalVolumeKg)} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-bold block">
                        Durasi
                      </span>
                      <span className="text-base font-bold tabular-nums text-[var(--text-primary)]">
                        {summary.lastWorkoutSession.durationMinutes} menit
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-bold block">
                        Rasio aktif
                      </span>
                      <span className="text-base font-bold tabular-nums text-[var(--color-moss-600)]">
                        {summary.lastWorkoutSession.activeRatioPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rincian Gerakan Sesi Ini */}
                <div className="pt-2 border-t border-[var(--border-default)]/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Rincian Gerakan ({summary.lastWorkoutSession.exercises.length} Gerakan)
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      Set terbaik & estimasi 1RM
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {summary.lastWorkoutSession.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-[var(--text-primary)]">
                            {ex.exerciseName}
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)]">
                            {ex.totalSets} Set ({ex.topSet}) · {ex.muscleGroupName}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-[var(--accent-secondary)]">
                            1RM: {ex.oneRepMaxEst} kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-tertiary)] space-y-2">
                <p>Belum ada riwayat sesi latihan yang tercatat.</p>
                <Link href="/workouts/active">
                  <Button variant="primary" size="sm">
                    Mulai Sesi Latihan Pertama
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: PR Hall of Fame */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-2.5 mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[var(--accent-secondary)]" />
                Papan rekor pribadi (PR)
              </h3>
              <span className="text-[10px] text-[var(--accent-secondary)] font-bold">
                {summary?.recentPRs?.length || 0} Rekor aktif
              </span>
            </div>

            <div className="space-y-2">
              {(summary?.recentPRs || []).map((pr) => (
                <div
                  key={pr.exerciseId}
                  className="p-2.5 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-primary)]">{pr.exercise}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">{pr.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-secondary)]">{pr.metric}</span>
                    <span className="font-bold font-mono text-[var(--accent-secondary)]">
                      Est 1RM: {pr.e1rm}
                    </span>
                  </div>
                </div>
              ))}
              {(!summary?.recentPRs || summary.recentPRs.length === 0) && (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
                  Belum ada rekor PR tersimpan. Selesaikan set dengan beban maksimal untuk memecahkan rekor baru.
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-default)]/40 text-[11px] text-center text-[var(--text-tertiary)]">
            Dihitung otomatis menggunakan formula Epley & Brzycki.
          </div>
        </div>
      </div>

      <Divider thick />

      {/* ============================================================ */}
      {/* SECTION: DETERMINISTIC INSIGHTS ENGINE */}
      {/* ============================================================ */}
      <section className="my-6 space-y-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
            Insight & rekomendasi deterministik
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Analisis aturan deterministik (PRD Section 17 & 26) berbasis data murni tanpa asumsi tak terverifikasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {insightsToRender.map((insight) => (
            <InsightCard
              key={insight.id}
              type={insight.type}
              title={insight.title}
              description={insight.description}
            />
          ))}
        </div>
      </section>

      <Divider thick />

      {/* ============================================================ */}
      {/* SECTION: DAILY TIMELINE CHRONOLOGY */}
      {/* ============================================================ */}
      <section className="my-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
              Aktivitas Terkini (Timeline)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Kronologi pencatatan aktivitas hari ini.</p>
          </div>
        </div>

        <div className="p-4 border border-[var(--border-default)] bg-[var(--bg-surface)]/40 rounded-[6px]">
          {isTimelineLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : timelineToRender.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--text-tertiary)]">
              Belum ada aktivitas yang dicatat hari ini. Mulai dengan mencatat sesi latihan, makanan, atau hidrasi.
            </div>
          ) : (
            timelineToRender.map((entry, idx) => (
              <TimelineEntry
                key={entry.id}
                time={entry.time}
                type={entry.type}
                title={entry.title}
                subtitle={entry.subtitle}
                isLast={idx === timelineToRender.length - 1}
              />
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
