'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/common/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { PRBadge } from '@/components/ui/PRBadge';
import { Divider } from '@/components/ui/Divider';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  MASTER_EXERCISES_LIBRARY,
  ExerciseMaster,
  MuscleGroupCategory,
  WorkoutTelemetryAggregates,
  WorkoutSession,
} from '@/types/workout.types';
import { exerciseService } from '@/services/exercise.service';
import { workoutService } from '@/services/workout.service';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Plus,
  Calendar,
  ChevronRight,
  ChevronDown,
  Dumbbell,
  Award,
  Search,
  Filter,
  Flame,
  Activity,
  Sparkles,
  BarChart3,
  Clock,
  Zap,
  TrendingUp,
  Layers,
  CheckCircle2,
  Loader2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { formatNumber, formatDuration } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';

export type WorkoutTimeframe = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';

export const AVAILABLE_YEARS = ['2026', '2025', '2024', '2023', '2022'];

export const MONTH_NAMES = [
  { num: '01', name: 'Januari', short: 'Jan' },
  { num: '02', name: 'Februari', short: 'Feb' },
  { num: '03', name: 'Maret', short: 'Mar' },
  { num: '04', name: 'April', short: 'Apr' },
  { num: '05', name: 'Mei', short: 'Mei' },
  { num: '06', name: 'Juni', short: 'Jun' },
  { num: '07', name: 'Juli', short: 'Jul' },
  { num: '08', name: 'Agustus', short: 'Agt' },
  { num: '09', name: 'September', short: 'Sep' },
  { num: '10', name: 'Oktober', short: 'Okt' },
  { num: '11', name: 'November', short: 'Nov' },
  { num: '12', name: 'Desember', short: 'Des' },
];

export default function WorkoutsPage() {
  // Main Tab State: 'SESSIONS' (Riwayat & Analitik) or 'EXERCISE_LIBRARY' (Katalog Alat)
  const [activeTab, setActiveTab] = useState<'SESSIONS' | 'EXERCISE_LIBRARY'>('SESSIONS');

  // Timeframe Filter: TODAY | WEEK | MONTH | YEAR
  const [timeframe, setTimeframe] = useState<WorkoutTimeframe>('WEEK');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonthPart, setSelectedMonthPart] = useState<string>('09');

  // Chart Metric Mode: 'VOLUME' | 'DENSITY' | 'DURATION'
  const [chartMetric, setChartMetric] = useState<'VOLUME' | 'DENSITY' | 'DURATION'>('VOLUME');

  // Pagination for Workout Sessions
  const [sessionPage, setSessionPage] = useState<number>(1);
  const [sessionPageSize, setSessionPageSize] = useState<number>(5);

  // Pagination & Filters for Exercise Catalog Tab
  const [libraryPage, setLibraryPage] = useState<number>(1);
  const [libraryPageSize, setLibraryPageSize] = useState<number>(9);
  const [searchLibrary, setSearchLibrary] = useState<string>('');
  const debouncedLibrarySearch = useDebounce(searchLibrary, 300);
  const [muscleFilter, setMuscleFilter] = useState<string>('ALL');

  // Compute start and end date query strings based on timeframe
  const dateRange = useMemo(() => {
    const now = new Date();
    if (timeframe === 'TODAY') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    if (timeframe === 'WEEK') {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    if (timeframe === 'MONTH') {
      const year = parseInt(selectedYear, 10);
      const monthIndex = parseInt(selectedMonthPart, 10) - 1;
      const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    if (timeframe === 'YEAR') {
      const year = parseInt(selectedYear, 10);
      const start = new Date(year, 0, 1, 0, 0, 0, 0);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
    return {};
  }, [timeframe, selectedYear, selectedMonthPart]);

  // Query 1: Real Workout Analytics
  const {
    data: backendAnalytics,
    isLoading: isAnalyticsLoading,
  } = useQuery({
    queryKey: ['workout-analytics', timeframe, selectedYear, selectedMonthPart],
    queryFn: () =>
      workoutService.getAnalytics(
        timeframe as any,
        timeframe === 'MONTH' || timeframe === 'YEAR' ? selectedYear : undefined,
        timeframe === 'MONTH' ? selectedMonthPart : undefined,
      ),
    staleTime: 1000 * 30, // 30s
  });

  // Query 2: Real Workout History Sessions
  const {
    data: historyData,
    isLoading: isHistoryLoading,
  } = useQuery({
    queryKey: ['workout-history', sessionPage, sessionPageSize, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      workoutService.getHistory({
        page: sessionPage,
        limit: sessionPageSize,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }),
    staleTime: 1000 * 30,
  });

  // Query 2.5: Active Workout Session Status
  const { data: activeWorkout } = useQuery({
    queryKey: ['active-workout-session'],
    queryFn: () => workoutService.getActiveWorkout(),
    staleTime: 1000 * 10,
  });

  // Query 3: Exercise Master Catalog
  const {
    data: exerciseLibraryData,
    isLoading: isLibraryLoading,
  } = useQuery({
    queryKey: ['exercise-library', libraryPage, libraryPageSize, debouncedLibrarySearch, muscleFilter],
    queryFn: async () => {
      try {
        const res = await exerciseService.getExercises({
          page: libraryPage,
          limit: libraryPageSize,
          search: debouncedLibrarySearch || undefined,
          muscleGroup: muscleFilter !== 'ALL' ? (muscleFilter as MuscleGroupCategory) : undefined,
        });
        return res;
      } catch {
        // Fallback filter over client library
        const filtered = MASTER_EXERCISES_LIBRARY.filter((ex) => {
          const matchSearch =
            debouncedLibrarySearch === '' ||
            ex.name.toLowerCase().includes(debouncedLibrarySearch.toLowerCase()) ||
            ex.equipmentName.toLowerCase().includes(debouncedLibrarySearch.toLowerCase());
          const matchMuscle = muscleFilter === 'ALL' || ex.primaryMuscle === muscleFilter;
          return matchSearch && matchMuscle;
        });
        const start = (libraryPage - 1) * libraryPageSize;
        return {
          items: filtered.slice(start, start + libraryPageSize),
          pagination: {
            page: libraryPage,
            limit: libraryPageSize,
            totalItems: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / libraryPageSize)),
          },
        };
      }
    },
    enabled: activeTab === 'EXERCISE_LIBRARY',
    staleTime: 1000 * 60 * 5,
  });

  // Reset pagination when filter changes
  useEffect(() => {
    setSessionPage(1);
  }, [timeframe, selectedYear, selectedMonthPart]);

  useEffect(() => {
    setLibraryPage(1);
  }, [debouncedLibrarySearch, muscleFilter]);

  const workoutsList = historyData?.items || [];
  const pagination = historyData?.pagination || { page: 1, limit: 5, totalItems: 0, totalPages: 1 };

  // Chart data from real backend analytics
  const chartData = useMemo(() => {
    if (backendAnalytics?.chartData && backendAnalytics.chartData.length > 0) {
      return backendAnalytics.chartData.map((d) => ({
        label: d.label || d.date,
        volume: d.volumeKg || 0,
        activeMin: d.activeMinutes || 0,
        restMin: d.restMinutes || 0,
        totalMin: d.totalMinutes || (d.activeMinutes || 0) + (d.restMinutes || 0),
        density:
          (d.activeMinutes || 0) + (d.restMinutes || 0) > 0
            ? Math.round(((d.activeMinutes || 0) / ((d.activeMinutes || 0) + (d.restMinutes || 0))) * 100)
            : 0,
      }));
    }

    // Default placeholder chart timeline if no workouts yet
    if (timeframe === 'TODAY') {
      return [{ label: 'Hari Ini', volume: 0, activeMin: 0, restMin: 0, density: 0, totalMin: 0 }];
    }
    if (timeframe === 'WEEK') {
      const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      return days.map((day) => ({ label: day, volume: 0, activeMin: 0, restMin: 0, density: 0, totalMin: 0 }));
    }
    if (timeframe === 'MONTH') {
      return [
        { label: 'Mgg 1', volume: 0, activeMin: 0, restMin: 0, density: 0, totalMin: 0 },
        { label: 'Mgg 2', volume: 0, activeMin: 0, restMin: 0, density: 0, totalMin: 0 },
        { label: 'Mgg 3', volume: 0, activeMin: 0, restMin: 0, density: 0, totalMin: 0 },
        { label: 'Mgg 4', volume: 0, activeMin: 0, restMin: 0, density: 0, totalMin: 0 },
      ];
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months.map((m) => ({ label: m, volume: 0, activeMin: 0, restMin: 0, density: 0, totalMin: 0 }));
  }, [backendAnalytics, timeframe]);

  return (
    <AppShell>
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
              Riwayat & Analitik Latihan Gym
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-[var(--accent-secondary)]">
              Modul Workout & Telemetri
            </span>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
            Ikhtisar volume beban, work/rest ratio, rekor PR, dan katalog alat gym.
          </p>
        </div>

        <Link href="/workouts/active" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full sm:w-auto shadow-md text-xs sm:text-sm py-2 sm:py-2.5">
            {activeWorkout ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                Lanjutkan Sesi Aktif ({activeWorkout.name})
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" /> Mulai Sesi Workout
              </>
            )}
          </Button>
        </Link>
      </div>

      {/* Main Tab Switcher: Riwayat Sesi vs Katalog Alat/Gerakan */}
      <div className="flex items-center gap-1.5 mb-5 p-1 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] w-full sm:w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('SESSIONS')}
          className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'SESSIONS'
              ? 'bg-[var(--accent-primary)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Riwayat & Analitik ({backendAnalytics?.totalSessions || pagination.totalItems || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXERCISE_LIBRARY')}
          className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'EXERCISE_LIBRARY'
              ? 'bg-[var(--accent-primary)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          Katalog Alat ({exerciseLibraryData?.pagination.totalItems || MASTER_EXERCISES_LIBRARY.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: RIWAYAT & ANALITIK SESI WORKOUT */}
      {/* ============================================================ */}
      {activeTab === 'SESSIONS' && (
        <div className="space-y-6">
          {/* Global Timeframe Selector: Hari Ini | 7 Hari | Sebulan | 1 Tahun */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  Periode analitik:
                </span>
              </div>

              {(
                [
                  { key: 'TODAY', label: 'Hari Ini' },
                  { key: 'WEEK', label: '7 Hari terakhir' },
                  { key: 'MONTH', label: 'Sebulan' },
                  { key: 'YEAR', label: `1 Tahun (${selectedYear})` },
                ] as const
              ).map((tf) => (
                <button
                  key={tf.key}
                  type="button"
                  onClick={() => setTimeframe(tf.key)}
                  className={`px-3 py-1 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                    timeframe === tf.key
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Sub-Filters for Month / Year */}
            {timeframe === 'MONTH' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonthPart}
                  onChange={(e) => setSelectedMonthPart(e.target.value)}
                  aria-label="Pilih Bulan Analitik"
                  className="h-8 px-3 rounded-[6px] border border-[var(--border-default)] bg-[#1A1C23] text-xs text-white font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer shadow-sm"
                >
                  {MONTH_NAMES.map((m) => (
                    <option key={m.num} value={m.num} className="bg-[#18191E] text-white py-1">
                      {m.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  aria-label="Pilih Tahun Analitik"
                  className="h-8 px-3 rounded-[6px] border border-[var(--border-default)] bg-[#1A1C23] text-xs text-white font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer shadow-sm"
                >
                  {AVAILABLE_YEARS.map((y) => (
                    <option key={y} value={y} className="bg-[#18191E] text-white py-1">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {timeframe === 'YEAR' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  aria-label="Pilih Tahun Analitik"
                  className="h-8 px-3 rounded-[6px] border border-[var(--border-default)] bg-[#1A1C23] text-xs text-white font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer shadow-sm"
                >
                  {AVAILABLE_YEARS.map((y) => (
                    <option key={y} value={y} className="bg-[#18191E] text-white py-1">
                      Tahun {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Telemetry Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Total Volume */}
            <MetricCard
              label="Total volume"
              value={formatNumber(backendAnalytics?.totalVolumeKg || 0)}
              unit="kg"
              trend={
                backendAnalytics?.volumeDeltaPct && backendAnalytics.volumeDeltaPct > 0
                  ? { value: `+${backendAnalytics.volumeDeltaPct}%`, direction: 'UP' }
                  : undefined
              }
              icon={<TrendingUp className="w-4 h-4" />}
            />

            {/* Sesi Latihan */}
            <MetricCard
              label="Sesi latihan"
              value={backendAnalytics?.totalSessions || 0}
              unit="Sesi"
              subValue={`${backendAnalytics?.totalSets || 0} total set`}
              icon={<Activity className="w-4 h-4" />}
            />

            {/* Durasi Latihan */}
            <MetricCard
              label="Durasi latihan"
              value={backendAnalytics?.totalDurationMinutes || 0}
              unit="menit"
              subValue={
                backendAnalytics?.totalDurationMinutes
                  ? `~${(backendAnalytics.totalDurationMinutes / 60).toFixed(1)} jam`
                  : '0 jam'
              }
              icon={<Clock className="w-4 h-4" />}
            />

            {/* Rasio Aktif */}
            <MetricCard
              label="Rasio aktif"
              value={backendAnalytics?.activeRatioPct ? `${backendAnalytics.activeRatioPct}%` : '0%'}
              unit="Aktif"
              subValue="Work / Rest density"
              icon={<Zap className="w-4 h-4" />}
            />

            {/* Kardio & Jarak */}
            <MetricCard
              label="Kardio & jarak"
              value={backendAnalytics?.totalCardioMinutes || 0}
              unit="min"
              subValue={`${backendAnalytics?.totalDistanceKm || 0} km • ~${backendAnalytics?.totalCaloriesBurned || 0} kkal`}
              icon={<Flame className="w-4 h-4" />}
            />

            {/* Rekor PR Baru */}
            <MetricCard
              label="Rekor PR baru"
              value={backendAnalytics?.newPrCount || 0}
              unit="PR"
              subValue={backendAnalytics?.newPrCount ? 'Tercatat periode ini' : 'Belum ada PR baru'}
              icon={<Award className="w-4 h-4" />}
            />
          </div>

          {/* Interactive Recharts Chart Panel */}
          <div className="p-4 sm:p-5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)]/60 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
                  Grafik telemetri kinerja ({timeframe === 'TODAY' ? 'Hari Ini' : timeframe === 'WEEK' ? '7 Hari Terakhir' : timeframe === 'MONTH' ? `Bulan ${MONTH_NAMES.find(m => m.num === selectedMonthPart)?.name || ''}` : `Tahun ${selectedYear}`})
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Analisis beban volume, rasio waktu latihan aktif vs istirahat, dan durasi kardio.
                </p>
              </div>

              {/* Chart Metric Toggle Buttons */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartMetric('VOLUME')}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer ${
                    chartMetric === 'VOLUME'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
                  }`}
                >
                  Volume (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('DENSITY')}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer ${
                    chartMetric === 'DENSITY'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
                  }`}
                >
                  Active vs Rest
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('DURATION')}
                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold transition-all cursor-pointer ${
                    chartMetric === 'DURATION'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)]'
                  }`}
                >
                  Total Durasi
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'VOLUME' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volumeGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-primary, #FF6B2C)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--accent-primary, #FF6B2C)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                    <XAxis dataKey="label" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ stroke: 'var(--accent-primary, #FF6B2C)', strokeDasharray: '3 3', strokeWidth: 1.5 }}
                      contentStyle={{
                        backgroundColor: '#1E2027',
                        borderColor: '#2C303B',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{ color: '#9AA0B0', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(v: any) => [`${formatNumber(Number(v) || 0)} kg`, 'Volume Beban']}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#FF6B2C"
                      strokeWidth={3}
                      fill="url(#volumeGlow)"
                      dot={{ r: 4, fill: '#FF6B2C', stroke: '#121316', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#FF6B2C', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                ) : chartMetric === 'DENSITY' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                    <XAxis dataKey="label" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 8 }}
                      contentStyle={{
                        backgroundColor: '#1E2027',
                        borderColor: '#2C303B',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{ color: '#9AA0B0', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(v: any, name: any) => [
                        `${v} menit`,
                        name === 'activeMin' ? 'Waktu Angkat Aktif' : 'Waktu Istirahat (Rest)',
                      ]}
                    />
                    <Bar dataKey="activeMin" stackId="a" fill="#4CD6DE" name="Waktu Aktif (min)" />
                    <Bar dataKey="restMin" stackId="a" fill="#FF6B2C" radius={[6, 6, 0, 0]} name="Waktu Istirahat (min)" />
                  </BarChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="durationGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4CD6DE" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4CD6DE" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                    <XAxis dataKey="label" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ stroke: '#4CD6DE', strokeDasharray: '3 3', strokeWidth: 1.5 }}
                      contentStyle={{
                        backgroundColor: '#1E2027',
                        borderColor: '#2C303B',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{ color: '#9AA0B0', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(v: any) => [`${v} menit`, 'Total Durasi']}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalMin"
                      stroke="#4CD6DE"
                      strokeWidth={3}
                      fill="url(#durationGlow)"
                      dot={{ r: 4, fill: '#4CD6DE', stroke: '#121316', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#4CD6DE', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <Divider />

          {/* Section: Daftar Sesi Latihan Riil */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                  Daftar sesi latihan terfilter ({pagination.totalItems} sesi)
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Sesi workout yang diselesaikan dalam periode ini.
                </p>
              </div>
            </div>

            {isHistoryLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Skeleton className="h-14" />
                      <Skeleton className="h-14" />
                    </div>
                  </div>
                ))}
              </div>
            ) : workoutsList.length === 0 ? (
              <div className="p-10 text-center rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3">
                <Dumbbell className="w-10 h-10 text-[var(--text-tertiary)] mx-auto opacity-60" />
                <h4 className="text-base font-bold text-[var(--text-primary)]">Belum ada sesi latihan di periode ini</h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  Belum ada catatan latihan yang tersimpan pada rentang tanggal yang dipilih. Mulai sesi latihan baru untuk mencatat performa Anda.
                </p>
                <div className="pt-2">
                  <Link href="/workouts/active">
                    <Button variant="primary" size="sm">
                      <Play className="w-3.5 h-3.5 mr-1.5" /> Mulai Sesi Workout Sekarang
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {workoutsList.map((workout: WorkoutSession) => {
                    // Compute total volume & duration
                    const sessionVol = workout.exercises.reduce((sum, ex) => {
                      return (
                        sum +
                        ex.sets.reduce((sSum, s) => {
                          return s.isCompleted ? sSum + (Number(s.weightKg) || 0) * (s.reps || 0) : sSum;
                        }, 0)
                      );
                    }, 0);

                    const durationMinutes =
                      workout.completedAt && workout.startedAt
                        ? Math.max(1, Math.round((new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000))
                        : workout.totalDurationSeconds
                        ? Math.max(1, Math.round(workout.totalDurationSeconds / 60))
                        : 0;

                    const dateObj = new Date(workout.completedAt || workout.startedAt || '');
                    const dateStr = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-';

                    return (
                      <div
                        key={workout.id}
                        className="p-4 sm:p-5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/50 transition-colors space-y-4"
                      >
                        {/* Session Header Card */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-default)]/60 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {dateStr}
                              </span>
                              {workout.routineTemplateName && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                                  {workout.routineTemplateName}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                              {workout.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6 justify-between md:justify-end">
                            <div className="text-left md:text-right">
                              <span className="text-[10px] text-[var(--text-tertiary)] font-bold block">
                                Volume
                              </span>
                              <span className="text-sm sm:text-base font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
                                {formatNumber(sessionVol)} kg
                              </span>
                            </div>

                            <div className="text-left md:text-right">
                              <span className="text-[10px] text-[var(--text-tertiary)] font-bold block">
                                Durasi
                              </span>
                              <span className="text-sm sm:text-base font-bold font-[var(--font-display)] tabular-nums text-emerald-400">
                                {durationMinutes} min
                              </span>
                            </div>

                            <Link href={`/workouts/${workout.id}`}>
                              <Button variant="secondary" size="sm" className="text-xs">
                                <span>Detail</span>
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Exercise Breakdown Pills */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-[var(--text-secondary)] block">
                            Rincian alat & gerakan ({workout.exercises.length} gerakan):
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {workout.exercises.map((ex, idx) => {
                              const completedSets = ex.sets.filter((s) => s.isCompleted);
                              const isCardio =
                                ex.equipment === 'TREADMILL' ||
                                ex.equipment === 'STATIONARY_BIKE' ||
                                ex.primaryMuscle === 'CARDIO' ||
                                (ex.exerciseName && ex.exerciseName.toLowerCase().includes('treadmill'));

                              // Find best set
                              let bestSetText = '-';
                              if (isCardio) {
                                const totalDist = ex.sets.reduce((sum, s) => sum + (Number(s.distanceKm) || 0), 0);
                                bestSetText = totalDist > 0 ? `${totalDist.toFixed(1)} km` : `${completedSets.length} sesi`;
                              } else if (completedSets.length > 0) {
                                const best = completedSets.reduce((max, s) =>
                                  (Number(s.weightKg) || 0) > (Number(max.weightKg) || 0) ? s : max,
                                  completedSets[0]
                                );
                                bestSetText = `${best.weightKg || 0} kg x ${best.reps || 0}`;
                              }

                              const setsSummaryText = isCardio
                                ? `${completedSets.length} Sesi Kardio`
                                : `${completedSets.length} Set (${completedSets.map(s => `${s.weightKg}kg x ${s.reps}`).join(', ') || 'Belum selesai'})`;

                              return (
                                <div
                                  key={ex.id || idx}
                                  className="p-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-[var(--text-primary)] truncate">
                                        {ex.exerciseName || ex.name}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[9px] font-semibold text-sky-400 border border-[var(--border-default)] shrink-0">
                                        {ex.equipmentName || ex.equipment}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">{setsSummaryText}</p>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[9px] font-bold text-[var(--text-tertiary)] block">
                                      Best Set
                                    </span>
                                    <span className="font-bold font-mono text-[var(--accent-secondary)]">
                                      {bestSetText}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={sessionPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  pageSize={sessionPageSize}
                  onPageChange={setSessionPage}
                  onPageSizeChange={(newSize) => {
                    setSessionPageSize(newSize);
                    setSessionPage(1);
                  }}
                  pageSizeOptions={[5, 10, 15, 20]}
                  itemLabel="sesi latihan"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: KATALOG ALAT & GERAKAN */}
      {/* ============================================================ */}
      {activeTab === 'EXERCISE_LIBRARY' && (
        <div className="space-y-6">
          {/* Top Bar: Search & Link to /exercises */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari alat, dumbbell, barbell, treadmill, atau nama gerakan..."
                value={searchLibrary}
                onChange={(e) => setSearchLibrary(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              {isLibraryLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
                </div>
              )}
            </div>

            <Link href="/exercises" className="shrink-0">
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto h-11 text-xs font-bold border-[var(--accent-primary)]/40 text-[var(--accent-primary)]"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Buka Katalog & Buat Kustom
              </Button>
            </Link>
          </div>

          {/* Muscle Group Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                'ALL',
                'CHEST',
                'BACK',
                'LEGS',
                'SHOULDERS',
                'BICEPS',
                'TRICEPS',
                'CORE',
                'CARDIO',
              ] as const
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setMuscleFilter(cat)}
                className={`px-3 py-2 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  muscleFilter === cat
                    ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white font-bold'
                    : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat === 'ALL' ? 'Semua Otot' : cat}
              </button>
            ))}
          </div>

          {/* Exercise Library Grid */}
          {isLibraryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-4 w-20 rounded" />
                    </div>
                    <Skeleton className="h-8 w-full rounded mt-2" />
                  </div>
                  <Skeleton className="h-8 w-full rounded" />
                </div>
              ))}
            </div>
          ) : !exerciseLibraryData?.items || exerciseLibraryData.items.length === 0 ? (
            <div className="p-12 text-center rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3">
              <Dumbbell className="w-8 h-8 text-[var(--text-tertiary)] mx-auto" />
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Tidak ada gerakan yang cocok</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Coba ubah kata kunci pencarian atau filter kelompok otot.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exerciseLibraryData.items.map((ex: ExerciseMaster) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3 hover:border-[var(--accent-primary)]/40 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] leading-tight">
                        {ex.name}
                      </h4>
                      {ex.isCustom ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          Kustom
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-bold text-[var(--accent-secondary)] shrink-0">
                          {ex.primaryMuscleName || ex.primaryMuscle}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {ex.description || 'Gerakan terverifikasi untuk pembentukan massa otot.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-default)]/60 text-xs">
                    <span className="text-[11px] font-semibold text-sky-400">
                      {ex.equipmentName || ex.equipment}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      {ex.primaryMuscle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exercise Library Pagination */}
          {exerciseLibraryData && (
            <Pagination
              currentPage={libraryPage}
              totalPages={exerciseLibraryData.pagination.totalPages}
              totalItems={exerciseLibraryData.pagination.totalItems}
              pageSize={libraryPageSize}
              onPageChange={setLibraryPage}
              onPageSizeChange={(newSize) => {
                setLibraryPageSize(newSize);
                setLibraryPage(1);
              }}
              pageSizeOptions={[6, 9, 12, 18, 24]}
              itemLabel="gerakan & alat"
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
