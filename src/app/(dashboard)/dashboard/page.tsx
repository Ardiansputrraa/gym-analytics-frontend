'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/common/AppShell';
import { CheckInBanner } from '@/components/common/CheckInBanner';
import { MetricCard } from '@/components/ui/MetricCard';
import { Divider } from '@/components/ui/Divider';
import { InsightCard } from '@/components/ui/InsightCard';
import { TimelineEntry } from '@/components/ui/TimelineEntry';
import { Button } from '@/components/ui/Button';
import { PRBadge } from '@/components/ui/PRBadge';
import { useWorkoutSessionStore } from '@/stores/workout-session.store';
import { formatNumber, formatDuration } from '@/lib/utils';
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

// ==========================================
// MOCK ANALYTICS DATA
// ==========================================
const weeklyCalorieData = [
  { day: 'Rab (03)', calories: 2560, target: 2588, water: 3600, weight: 104.8 },
  { day: 'Kam (04)', calories: 2480, target: 2588, water: 3500, weight: 104.6 },
  { day: 'Jum (05)', calories: 2510, target: 2588, water: 3700, weight: 104.5 },
  { day: 'Sab (06)', calories: 2750, target: 2588, water: 3200, weight: 104.4 },
  { day: 'Min (07)', calories: 2610, target: 2588, water: 3400, weight: 104.3 },
  { day: 'Sen (08)', calories: 2540, target: 2588, water: 3600, weight: 104.2 },
  { day: 'Sel (09)', calories: 1780, target: 2588, water: 2400, weight: 104.1 },
];

const muscleVolumeData = [
  { muscle: 'Dada (Chest)', volume: 4200, sets: 16, percentage: 32, fill: '#F05A28' },
  { muscle: 'Punggung (Back)', volume: 3850, sets: 14, percentage: 29, fill: '#E6C659' },
  { muscle: 'Kaki (Legs)', volume: 3100, sets: 12, percentage: 23, fill: '#4A6B4A' },
  { muscle: 'Bahu (Shoulders)', volume: 1450, sets: 8, percentage: 11, fill: '#38BDF8' },
  { muscle: 'Lengan (Arms)', volume: 680, sets: 6, percentage: 5, fill: '#A855F7' },
];

const strengthProgressionData = [
  { week: 'Mgg 1', benchPress: 75, inclineDb: 26, squat: 95, deadlift: 110 },
  { week: 'Mgg 2', benchPress: 77.5, inclineDb: 26, squat: 100, deadlift: 115 },
  { week: 'Mgg 3', benchPress: 80, inclineDb: 28, squat: 105, deadlift: 115 },
  { week: 'Mgg 4', benchPress: 82.5, inclineDb: 30, squat: 110, deadlift: 120 },
];

const workRestRatioData = [
  { session: '03 Sep (Push)', activeMin: 34, restMin: 28, efficiency: 55 },
  { session: '05 Sep (Pull)', activeMin: 38, restMin: 24, efficiency: 61 },
  { session: '07 Sep (Legs)', activeMin: 42, restMin: 32, efficiency: 57 },
  { session: '08 Sep (Upper)', activeMin: 30, restMin: 30, efficiency: 50 },
];

// Consistency Heatmap (Past 28 Days)
const activityHeatmap = [
  { day: 1, hasWorkout: true, volume: 1420, date: '12 Agu' },
  { day: 2, hasWorkout: true, volume: 1650, date: '13 Agu' },
  { day: 3, hasWorkout: false, volume: 0, date: '14 Agu' },
  { day: 4, hasWorkout: true, volume: 1800, date: '15 Agu' },
  { day: 5, hasWorkout: false, volume: 0, date: '16 Agu' },
  { day: 6, hasWorkout: true, volume: 1550, date: '17 Agu' },
  { day: 7, hasWorkout: false, volume: 0, date: '18 Agu' },
  { day: 8, hasWorkout: true, volume: 1620, date: '19 Agu' },
  { day: 9, hasWorkout: true, volume: 1710, date: '20 Agu' },
  { day: 10, hasWorkout: false, volume: 0, date: '21 Agu' },
  { day: 11, hasWorkout: true, volume: 1900, date: '22 Agu' },
  { day: 12, hasWorkout: false, volume: 0, date: '23 Agu' },
  { day: 13, hasWorkout: true, volume: 1450, date: '24 Agu' },
  { day: 14, hasWorkout: false, volume: 0, date: '25 Agu' },
  { day: 15, hasWorkout: true, volume: 1580, date: '26 Agu' },
  { day: 16, hasWorkout: true, volume: 1620, date: '27 Agu' },
  { day: 17, hasWorkout: false, volume: 0, date: '28 Agu' },
  { day: 18, hasWorkout: true, volume: 1750, date: '29 Agu' },
  { day: 19, hasWorkout: false, volume: 0, date: '30 Agu' },
  { day: 20, hasWorkout: true, volume: 1600, date: '31 Agu' },
  { day: 21, hasWorkout: false, volume: 0, date: '01 Sep' },
  { day: 22, hasWorkout: true, volume: 1540, date: '02 Sep' },
  { day: 23, hasWorkout: true, volume: 1540, date: '03 Sep' },
  { day: 24, hasWorkout: false, volume: 0, date: '04 Sep' },
  { day: 25, hasWorkout: true, volume: 1820, date: '05 Sep' },
  { day: 26, hasWorkout: false, volume: 0, date: '06 Sep' },
  { day: 27, hasWorkout: true, volume: 1450, date: '07 Sep' },
  { day: 28, hasWorkout: true, volume: 1680, date: '08 Sep' },
];

const muscleRecoveryStates = [
  { name: 'Dada (Chest)', status: 'RECOVERED', pct: 95, hoursAgo: 48, label: 'Siap Dilatih' },
  { name: 'Punggung (Back)', status: 'RECOVERED', pct: 100, hoursAgo: 72, label: 'Siap Dilatih' },
  { name: 'Kaki (Legs)', status: 'RECOVERING', pct: 60, hoursAgo: 24, label: 'Pemulihan Aktif' },
  { name: 'Bahu (Shoulders)', status: 'RECOVERED', pct: 90, hoursAgo: 48, label: 'Siap Dilatih' },
  { name: 'Lengan & Core', status: 'RECOVERED', pct: 92, hoursAgo: 48, label: 'Siap Dilatih' },
];

const recentPRs = [
  { exercise: 'Barbell Bench Press', metric: '82.5 kg × 6 reps', e1rm: '95.7 kg', date: '08 Sep 2026' },
  { exercise: 'Incline Dumbbell Press', metric: '30.0 kg × 8 reps', e1rm: '37.2 kg', date: '08 Sep 2026' },
  { exercise: 'Barbell Squat', metric: '110.0 kg × 5 reps', e1rm: '128.3 kg', date: '05 Sep 2026' },
  { exercise: 'Treadmill Incline Fat Burn', metric: '30 min @ 12% / 4.8 km/h', e1rm: '315 kkal', date: '07 Sep 2026' },
];

export default function DashboardPage() {
  const { activeSession, isTimerRunning, elapsedSeconds } = useWorkoutSessionStore();
  const [analyticsTab, setAnalyticsTab] = useState<'VOLUME' | 'STRENGTH' | 'CALORIE_WEIGHT' | 'WORK_REST'>('VOLUME');
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D'>('7D');

  return (
    <AppShell>
      {/* 30-Day Evaluation Reminder Banner */}
      <CheckInBanner daysSinceLastCheckIn={32} />

      {/* Active Workout Floating Hero (if active session exists with exercises) */}
      {activeSession && activeSession.exercises.length > 0 && (
        <div className="mb-5 p-4 rounded-[8px] border border-[var(--accent-primary)]/60 bg-[var(--accent-primary)]/10 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold animate-pulse">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                  Sesi Latihan Sedang Berlangsung
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-base)] border border-[var(--accent-primary)]/40 font-mono text-[var(--accent-primary)]">
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {activeSession.name} ({activeSession.exercises.length} Gerakan · {activeSession.exercises.reduce((a, b) => a + b.sets.length, 0)} Set)
              </h3>
            </div>
          </div>

          <Link href="/workouts/active">
            <Button variant="primary" size="sm" className="w-full sm:w-auto shadow-md">
              Lanjutkan Sesi Workout <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-[var(--font-display)] tracking-tight text-[var(--text-primary)]">
              Dashboard Analitik
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-[var(--accent-secondary)]">
              Fase: Hypertrophy & Fat Loss
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
            <Button variant="primary" size="md" className="w-full sm:w-auto shadow-sm text-xs sm:text-sm py-2 sm:py-2.5">
              <Dumbbell className="w-4 h-4 mr-1.5" />
              + Mulai Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Hero Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
        <MetricCard
          label="Volume Latihan (7D)"
          value="13.280"
          unit="kg"
          trend={{
            direction: 'UP',
            value: '980 kg',
            percentage: '+8.0',
            alignment: 'ON_TRACK',
          }}
          icon={<Activity className="w-4 h-4 text-[var(--color-moss-600)]" />}
        />
        <MetricCard
          label="Asupan Kalori"
          value="1.780"
          unit="/ 2.588 kkal"
          subValue="Sisa: 808 kkal (69%)"
          icon={<Flame className="w-4 h-4 text-[var(--accent-primary)]" />}
        />
        <MetricCard
          label="Hidrasi Air Minum"
          value="2.400"
          unit="/ 3.500 ml"
          subValue="Sisa: 1.100 ml (68%)"
          icon={<Droplets className="w-4 h-4 text-sky-400" />}
        />
        <MetricCard
          label="Berat Badan"
          value="104.1"
          unit="kg"
          trend={{
            direction: 'DOWN',
            value: '1.1 kg',
            percentage: '-1.0',
            alignment: 'NEUTRAL',
          }}
          icon={<Scale className="w-4 h-4 text-[var(--accent-secondary)]" />}
        />
        <MetricCard
          label="Rasio Aktif (Work/Rest)"
          value="54%"
          unit="Aktif"
          subValue="46% Istirahat (Optimal)"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          label="Kardio & Kalori"
          value="75"
          unit="min"
          subValue="12.4 km · ~680 kkal"
          icon={<Zap className="w-4 h-4 text-emerald-400" />}
        />
      </div>

      {/* Dual Progress Bars: Kalori & Hidrasi Air */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progres Kalori */}
        <div className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
              <Flame className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              Progres Kalori Harian
            </span>
            <span className="tabular-nums text-[var(--accent-primary)] font-bold">
              69% (1.780 / 2.588 kkal)
            </span>
          </div>
          <div className="h-2.5 w-full bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-default)]">
            <div className="h-full bg-gradient-to-r from-[#D64317] to-[var(--accent-primary)] rounded-full w-[69%]" />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[var(--text-tertiary)] pt-0.5">
            <span>BMR: 1.940 kkal · TDEE: 2.788 kkal</span>
            <span className="text-[var(--text-secondary)]">Defisit Target: -200 kkal</span>
          </div>
        </div>

        {/* Progres Air Minum */}
        <div className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Progres Hidrasi Air Minum
            </span>
            <span className="tabular-nums text-sky-400 font-bold">
              68% (2.400 / 3.500 ml)
            </span>
          </div>
          <div className="h-2.5 w-full bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-default)]">
            <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full w-[68%]" />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[var(--text-tertiary)] pt-0.5">
            <span>Rekomendasi: 35 ml × 100 kg</span>
            <span className="text-sky-400">Sisa 3-4 gelas air</span>
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
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-5 shadow-xl">
          {/* TAB 1: VOLUME DISTRIBUTION BY MUSCLE GROUP */}
          {analyticsTab === 'VOLUME' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)]/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Total Volume Beban per Kelompok Otot (7 Hari Terakhir)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Total volume akumulatif: <strong className="text-[var(--text-primary)]">13.280 kg</strong> · 56 Total Set Terselesaikan
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-moss-600)] font-semibold bg-[var(--color-moss-600)]/10 px-2 py-1 rounded border border-[var(--color-moss-600)]/30">
                  Keseimbangan Anterior/Posterior: Optimal (52% / 48%)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Bar Chart */}
                <div className="lg:col-span-2 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={muscleVolumeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333330" vertical={false} />
                      <XAxis dataKey="muscle" stroke="#888880" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888880" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#181816',
                          borderColor: '#333330',
                          borderRadius: '6px',
                          color: '#F4F4F0',
                          fontSize: '12px',
                        }}
                        formatter={(v: unknown) => [`${formatNumber(v as number)} kg`, 'Volume Beban']}
                      />
                      <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                        {muscleVolumeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5 border-t lg:border-t-0 lg:border-l border-[var(--border-default)] pt-4 lg:pt-0 lg:pl-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                    Distribusi Persentase Beban
                  </span>
                  {muscleVolumeData.map((item) => (
                    <div key={item.muscle} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-secondary)] font-medium">{item.muscle}</span>
                        <span className="font-bold tabular-nums text-[var(--text-primary)]">
                          {formatNumber(item.volume)} kg ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.fill }}
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
                    Tren Estimasi 1RM (Epley Formula: w × (1 + r/30))
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Progressive overload pada 4 gerakan utama selama 4 minggu program latihan.
                  </p>
                </div>
                <span className="text-[11px] text-[var(--accent-primary)] font-semibold bg-[var(--accent-primary)]/10 px-2 py-1 rounded border border-[var(--accent-primary)]/30">
                  Rata-rata Kenaikan Beban: +5.8% / Bulan
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strengthProgressionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333330" vertical={false} />
                    <XAxis dataKey="week" stroke="#888880" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888880" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 10']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#181816',
                        borderColor: '#333330',
                        borderRadius: '6px',
                        color: '#F4F4F0',
                        fontSize: '12px',
                      }}
                      formatter={(v: unknown, name: unknown) => [
                        `${v} kg`,
                        name === 'benchPress'
                          ? 'Bench Press (1RM)'
                          : name === 'squat'
                          ? 'Squat (1RM)'
                          : name === 'deadlift'
                          ? 'Deadlift (1RM)'
                          : 'Incline DB (1RM)',
                      ]}
                    />
                    <Line type="monotone" dataKey="benchPress" stroke="#F05A28" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="squat" stroke="#4A6B4A" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="deadlift" stroke="#E6C659" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="inclineDb" stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
                <div className="p-2 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] block">Bench Press 1RM</span>
                  <span className="text-sm font-bold text-[var(--accent-primary)]">82.5 → 95.7 kg (+10%)</span>
                </div>
                <div className="p-2 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] block">Squat 1RM</span>
                  <span className="text-sm font-bold text-[var(--color-moss-600)]">110 → 128.3 kg (+15%)</span>
                </div>
                <div className="p-2 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] block">Deadlift 1RM</span>
                  <span className="text-sm font-bold text-[var(--accent-secondary)]">120 → 138.0 kg (+9%)</span>
                </div>
                <div className="p-2 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] block">Incline DB 1RM</span>
                  <span className="text-sm font-bold text-sky-400">30 → 37.2 kg (+12%)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALORIE VS WEIGHT CORRELATION */}
          {analyticsTab === 'CALORIE_WEIGHT' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)]/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Korelasi Asupan Kalori Harian vs Tren Penurunan Berat Badan
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Target Kalori Terjadwal: <strong className="text-[var(--accent-secondary)]">2.588 kkal</strong> (Defisit 200 kkal terhadap TDEE 2.788 kkal).
                  </p>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                  Laju Fat Loss Rata-rata: -0.28 kg / minggu (Sangat Aman)
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={weeklyCalorieData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333330" vertical={false} />
                    <XAxis dataKey="day" stroke="#888880" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="cal" stroke="#888880" fontSize={10} tickLine={false} axisLine={false} domain={[1200, 3200]} />
                    <YAxis yAxisId="wt" orientation="right" stroke="#888880" fontSize={10} tickLine={false} axisLine={false} domain={[103.5, 105.5]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#181816',
                        borderColor: '#333330',
                        borderRadius: '6px',
                        color: '#F4F4F0',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine yAxisId="cal" y={2588} stroke="#E6C659" strokeDasharray="3 3" label={{ value: 'Target 2.588 kkal', fill: '#E6C659', fontSize: 10 }} />
                    <Bar yAxisId="cal" dataKey="calories" fill="#F05A28" opacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={24} name="Asupan Kalori (kkal)" />
                    <Line yAxisId="wt" type="monotone" dataKey="weight" stroke="#38BDF8" strokeWidth={3} dot={{ r: 4 }} name="Berat Badan (kg)" />
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
                    Distribusi Waktu Latihan Aktif (Under Tension) vs Istirahat (Rest)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Evaluasi durasi set vs waktu istirahat antar-set untuk memastikan intensitas hipertrofi optimal.
                  </p>
                </div>
                <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                  Efisiensi Rata-rata Sesi: 56% Active Density
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workRestRatioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333330" vertical={false} />
                    <XAxis dataKey="session" stroke="#888880" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888880" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#181816',
                        borderColor: '#333330',
                        borderRadius: '6px',
                        color: '#F4F4F0',
                        fontSize: '12px',
                      }}
                      formatter={(v: unknown, name: unknown) => [
                        `${v} menit`,
                        name === 'activeMin' ? 'Waktu Angkat Aktif' : 'Waktu Istirahat (Rest)',
                      ]}
                    />
                    <Bar dataKey="activeMin" stackId="a" fill="#4A6B4A" radius={[0, 0, 0, 0]} name="Waktu Aktif (min)" />
                    <Bar dataKey="restMin" stackId="a" fill="#F05A28" radius={[4, 4, 0, 0]} name="Waktu Istirahat (min)" />
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
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                Matriks Pemulihan Otot (Recovery Status)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Estimasi biologis kesiapan kelompok otot berdasarkan volume sesi terakhir.
              </p>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono">
              Rule BR-017
            </span>
          </div>

          <div className="space-y-3">
            {muscleRecoveryStates.map((m) => (
              <div key={m.name} className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)]">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-tertiary)]">Dilatih {m.hoursAgo} jam lalu</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.pct >= 90
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {m.pct}% · {m.label}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.pct >= 90 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 28-Day Workout Consistency Heatmap */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
                  Konsistensi Latihan (Heatmap 28 Hari)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  18 Sesi Latihan Selesai · 80% Kepatuhan Program (Target 4-5 sesi/minggu).
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Streak: 4 Minggu Aktif
              </span>
            </div>

            {/* Heatmap Grid (4 rows x 7 cols) */}
            <div className="pt-4 space-y-2">
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-[var(--text-tertiary)] font-bold mb-1">
                <span>SEN</span>
                <span>SEL</span>
                <span>RAB</span>
                <span>KAM</span>
                <span>JUM</span>
                <span>SAB</span>
                <span>MIN</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {activityHeatmap.map((item) => (
                  <div
                    key={item.day}
                    title={`${item.date}: ${item.hasWorkout ? `Sesi Latihan (${item.volume} kg)` : 'Hari Istirahat (Rest Day)'}`}
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
              <span className="text-[11px]">Rest Day</span>
              <div className="w-3 h-3 rounded bg-[var(--accent-primary)] ml-2" />
              <span className="text-[11px]">Sesi Latihan Gym</span>
            </div>
            <Link href="/workouts" className="text-[var(--accent-primary)] hover:underline font-semibold text-[11px]">
              Lihat Kalender Lengkap →
            </Link>
          </div>
        </div>
      </div>

      <Divider thick />

      {/* ============================================================ */}
      {/* SECTION: PERSONAL RECORD (PR) HALL OF FAME & RECENT SESSIONS */}
      {/* ============================================================ */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Workout Terakhir & PR Highlights */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                Sesi Latihan Terkini & Rekor Baru (PR)
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Riwayat sesi terakhir dan rekor angkatan terbaru yang terdeteksi.
              </p>
            </div>
            <Link
              href="/workouts"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1"
            >
              Semua riwayat <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-5 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[var(--accent-secondary)] uppercase tracking-wider">
                  Sesi Terakhir · Kemarin, 08 Sep 2026 (18:30 WIB)
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Chest & Triceps Focus Session
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  4 Gerakan · 14 Total Set · 1 Personal Record (PR) Terdeteksi
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-[var(--border-default)] pt-3 md:pt-0 md:pl-6 text-xs">
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block">
                    Total Volume
                  </span>
                  <span className="text-base font-bold tabular-nums text-[var(--text-primary)]">
                    1.680 kg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block">
                    Durasi
                  </span>
                  <span className="text-base font-bold tabular-nums text-[var(--text-primary)]">
                    60 menit
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold block">
                    Rasio Aktif
                  </span>
                  <span className="text-base font-bold tabular-nums text-[var(--color-moss-600)]">
                    54%
                  </span>
                </div>
              </div>
            </div>

            {/* Sub PR Banner */}
            <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--accent-secondary)]/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--accent-secondary)]" />
                <span className="text-[var(--text-primary)] font-semibold">
                  Personal Record Baru Terdeteksi: <strong>Barbell Bench Press (82.5 kg × 6 reps)</strong>
                </span>
              </div>
              <PRBadge label="PR 1RM: 95.7 kg" />
            </div>
          </div>
        </div>

        {/* Right 1 Col: PR Hall of Fame */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-5 space-y-3 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-2.5 mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[var(--accent-secondary)]" />
                Papan Rekor Pribadi (PR)
              </h3>
              <span className="text-[10px] text-[var(--accent-secondary)] font-bold">4 Rekor Aktif</span>
            </div>

            <div className="space-y-2">
              {recentPRs.map((pr) => (
                <div key={pr.exercise} className="p-2.5 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-primary)]">{pr.exercise}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">{pr.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-secondary)]">{pr.metric}</span>
                    <span className="font-bold font-mono text-[var(--accent-secondary)]">Est 1RM: {pr.e1rm}</span>
                  </div>
                </div>
              ))}
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
            Insight & Rekomendasi Deterministik
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Analisis aturan deterministik (PRD Section 17 & 26) berbasis data murni tanpa asumsi tak terverifikasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          <InsightCard
            type="INFO"
            title="Progres Komposisi Tubuh Terpantau"
            description="Estimasi Body Fat turun 1.0% dalam evaluasi terakhir dengan massa otot stabil (35.8 kg). Pertahankan asupan protein harian di kisaran 208g."
          />
          <InsightCard
            type="ACTION"
            title="Progressive Overload Terdeteksi pada Bench Press"
            description="Beban kerja naik dari 75kg ke 82.5kg (+10.0%) pada rep range yang sama. Waktu istirahat rata-rata optimal (90 detik)."
          />
          <InsightCard
            type="INFO"
            title="Kepatuhan Target Hidrasi & Kalori Optimal"
            description="Asupan kalori 7 hari konsisten berada di rentang defisit sehat (-200 s/d -300 kkal). Hidrasi harian rata-rata mencapai 3.4 liter."
          />
          <InsightCard
            type="WARNING"
            title="Jadwal Latihan Kaki (Leg Day) Mendatang"
            description="Kelompok otot kaki telah mencapai 60% pemulihan dan akan siap 100% dalam 24 jam ke depan untuk sesi latihan lower body."
          />
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
          <TimelineEntry
            time="18:45"
            type="DRINK"
            title="Konsumsi Air Mineral 800ml Saat Workout"
            subtitle="800 ml air hidrasi"
          />
          <TimelineEntry
            time="18:30"
            type="WORKOUT"
            title="Sesi Latihan: Barbell Bench Press & Treadmill Incline"
            subtitle="Volume: 1.680 kg · Durasi: 60 menit · 1 PR Terdeteksi"
          />
          <TimelineEntry
            time="13:15"
            type="FOOD"
            title="Makan Siang: Nasi Merah, Dada Ayam Panggang & Brokoli"
            subtitle="680 kkal · Protein: 58g · Lemak: 14g · Karbo: 72g"
          />
          <TimelineEntry
            time="07:30"
            type="DRINK"
            title="Air Mineral Pagi (Gelas Besar)"
            subtitle="600 ml air hidrasi"
            isLast
          />
        </div>
      </section>
    </AppShell>
  );
}
