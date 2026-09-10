'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/common/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { PRBadge } from '@/components/ui/PRBadge';
import { Divider } from '@/components/ui/Divider';
import { Pagination } from '@/components/ui/Pagination';
import {
  MASTER_EXERCISES_LIBRARY,
  MuscleGroupCategory,
} from '@/types/workout.types';
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

export interface WorkoutHistoryItem {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  displayDate: string;
  durationMinutes: number;
  activeMinutes: number;
  restMinutes: number;
  volumeKg: number;
  totalSets: number;
  hasPr: boolean;
  prDetails?: string;
  cardioMinutes?: number;
  cardioDistanceKm?: number;
  caloriesBurned?: number;
  exercises: {
    name: string;
    equipment: string;
    muscle: string;
    setsSummary: string;
    bestSet: string;
  }[];
}

// Sample Database of Workouts
const allWorkoutHistory: WorkoutHistoryItem[] = [
  {
    id: 'w-today',
    name: 'Push Day (Dada, Bahu & Triceps)',
    date: '2026-09-09',
    displayDate: 'Hari Ini, 09 Sep 2026',
    durationMinutes: 65,
    activeMinutes: 36,
    restMinutes: 29,
    volumeKg: 1780,
    totalSets: 14,
    hasPr: true,
    prDetails: 'Incline DB Press (30kg × 8 reps)',
    cardioMinutes: 15,
    cardioDistanceKm: 2.0,
    caloriesBurned: 380,
    exercises: [
      { name: 'Barbell Bench Press', equipment: 'Barbell', muscle: 'Dada', setsSummary: '4 Set (60kg x 10, 70kg x 8, 75kg x 6, 80kg x 4)', bestSet: '80 kg x 4' },
      { name: 'Incline Dumbbell Press', equipment: 'Dumbbell', muscle: 'Dada', setsSummary: '3 Set (26kg x 10, 28kg x 8, 30kg x 8)', bestSet: '30 kg x 8 (PR)' },
      { name: 'Standing Overhead Barbell Press', equipment: 'Barbell', muscle: 'Bahu', setsSummary: '3 Set (40kg x 10, 45kg x 8, 50kg x 6)', bestSet: '50 kg x 6' },
      { name: 'Cable Tricep Pushdown', equipment: 'Cable', muscle: 'Triceps', setsSummary: '4 Set (30kg x 12, 35kg x 10, 35kg x 10, 40kg x 8)', bestSet: '40 kg x 8' },
    ],
  },
  {
    id: 'w-1',
    name: 'Chest & Triceps Focus Session',
    date: '2026-09-08',
    displayDate: 'Kemarin, 08 Sep 2026',
    durationMinutes: 60,
    activeMinutes: 32,
    restMinutes: 28,
    volumeKg: 1680,
    totalSets: 14,
    hasPr: true,
    prDetails: 'Barbell Bench Press (82.5kg × 6 reps)',
    cardioMinutes: 0,
    cardioDistanceKm: 0,
    caloriesBurned: 310,
    exercises: [
      { name: 'Barbell Bench Press', equipment: 'Barbell', muscle: 'Dada', setsSummary: '3 Set (60kg x 10, 70kg x 8, 82.5kg x 6)', bestSet: '82.5 kg x 6 (PR)' },
      { name: 'Incline Dumbbell Press', equipment: 'Dumbbell', muscle: 'Dada', setsSummary: '3 Set (24kg x 12, 26kg x 10, 28kg x 8)', bestSet: '28 kg x 8' },
      { name: 'Cable Tricep Pushdown', equipment: 'Cable', muscle: 'Triceps', setsSummary: '4 Set (30kg x 12, 35kg x 10, 35kg x 10, 35kg x 8)', bestSet: '35 kg x 10' },
      { name: 'Cable Chest Fly', equipment: 'Cable', muscle: 'Dada', setsSummary: '4 Set (15kg x 12, 15kg x 12, 15kg x 10, 15kg x 10)', bestSet: '15 kg x 12' },
    ],
  },
  {
    id: 'w-2',
    name: 'Treadmill Incline Fat Burn & HIIT',
    date: '2026-09-07',
    displayDate: '07 Sep 2026',
    durationMinutes: 45,
    activeMinutes: 45,
    restMinutes: 0,
    volumeKg: 0,
    totalSets: 2,
    hasPr: true,
    prDetails: 'Treadmill Incline (12% @ 4.8 km/h for 30m)',
    cardioMinutes: 45,
    cardioDistanceKm: 4.4,
    caloriesBurned: 375,
    exercises: [
      { name: 'Treadmill Incline Fat Burn (12-3-30 Walk)', equipment: 'Treadmill', muscle: 'Kardio', setsSummary: '1 Sesi (30m, Incline 12%, Speed 4.8km/h, 2.4km)', bestSet: '2.4 km (~215 kkal)' },
      { name: 'Treadmill Running / Jogging', equipment: 'Treadmill', muscle: 'Kardio', setsSummary: '1 Sesi (15m, Incline 2%, Speed 8.0km/h, 2.0km)', bestSet: '2.0 km (~160 kkal)' },
    ],
  },
  {
    id: 'w-3',
    name: 'Back & Biceps Heavy Day',
    date: '2026-09-06',
    displayDate: '06 Sep 2026',
    durationMinutes: 55,
    activeMinutes: 31,
    restMinutes: 24,
    volumeKg: 2150,
    totalSets: 13,
    hasPr: false,
    cardioMinutes: 0,
    cardioDistanceKm: 0,
    caloriesBurned: 290,
    exercises: [
      { name: 'Wide-Grip Lat Pulldown', equipment: 'Cable', muscle: 'Punggung', setsSummary: '4 Set (50kg x 10, 55kg x 8, 60kg x 6, 50kg x 10)', bestSet: '60 kg x 6' },
      { name: 'Seated Cable Row', equipment: 'Cable', muscle: 'Punggung', setsSummary: '3 Set (50kg x 10, 55kg x 8, 55kg x 8)', bestSet: '55 kg x 8' },
      { name: 'Standing Dumbbell Bicep Curl', equipment: 'Dumbbell', muscle: 'Biceps', setsSummary: '3 Set (12.5kg x 12, 15kg x 10, 15kg x 8)', bestSet: '15 kg x 10' },
      { name: 'Cable Rope Hammer Curl', equipment: 'Cable', muscle: 'Biceps', setsSummary: '3 Set (25kg x 12, 30kg x 10, 30kg x 10)', bestSet: '30 kg x 10' },
    ],
  },
  {
    id: 'w-4',
    name: 'Legs & Lower Body Strength',
    date: '2026-09-04',
    displayDate: '04 Sep 2026',
    durationMinutes: 70,
    activeMinutes: 38,
    restMinutes: 32,
    volumeKg: 3200,
    totalSets: 14,
    hasPr: true,
    prDetails: 'Barbell Back Squat (110kg × 5 reps)',
    cardioMinutes: 15,
    cardioDistanceKm: 1.5,
    caloriesBurned: 420,
    exercises: [
      { name: 'Barbell Back Squat', equipment: 'Barbell', muscle: 'Kaki', setsSummary: '4 Set (80kg x 10, 95kg x 8, 105kg x 6, 110kg x 5)', bestSet: '110 kg x 5 (PR)' },
      { name: 'Incline 45° Leg Press Machine', equipment: 'Mesin', muscle: 'Kaki', setsSummary: '3 Set (140kg x 12, 160kg x 10, 180kg x 8)', bestSet: '180 kg x 8' },
      { name: 'Lying Leg Curl Machine', equipment: 'Mesin', muscle: 'Kaki', setsSummary: '3 Set (40kg x 12, 45kg x 10, 45kg x 10)', bestSet: '45 kg x 10' },
      { name: 'Hanging Leg Raise', equipment: 'Bodyweight', muscle: 'Perut', setsSummary: '4 Set (15 reps, 12 reps, 10 reps, 10 reps)', bestSet: 'BW x 15' },
    ],
  },
  {
    id: 'w-5',
    name: 'Upper Body Hypertrophy & Arms',
    date: '2026-09-03',
    displayDate: '03 Sep 2026',
    durationMinutes: 58,
    activeMinutes: 30,
    restMinutes: 28,
    volumeKg: 1540,
    totalSets: 12,
    hasPr: false,
    cardioMinutes: 0,
    cardioDistanceKm: 0,
    caloriesBurned: 275,
    exercises: [
      { name: 'Incline Dumbbell Press', equipment: 'Dumbbell', muscle: 'Dada', setsSummary: '3 Set (24kg x 10, 26kg x 8, 26kg x 8)', bestSet: '26 kg x 8' },
      { name: 'Wide-Grip Lat Pulldown', equipment: 'Cable', muscle: 'Punggung', setsSummary: '3 Set (50kg x 10, 55kg x 8, 55kg x 8)', bestSet: '55 kg x 8' },
      { name: 'Standing Overhead DB Extension', equipment: 'Dumbbell', muscle: 'Triceps', setsSummary: '3 Set (20kg x 10, 22kg x 8, 22kg x 8)', bestSet: '22 kg x 8' },
      { name: 'Standing Dumbbell Bicep Curl', equipment: 'Dumbbell', muscle: 'Biceps', setsSummary: '3 Set (12.5kg x 10, 15kg x 8, 15kg x 8)', bestSet: '15 kg x 8' },
    ],
  },
  {
    id: 'w-6',
    name: 'Lower Body & Core Focus',
    date: '2026-08-28',
    displayDate: '28 Agu 2026',
    durationMinutes: 62,
    activeMinutes: 34,
    restMinutes: 28,
    volumeKg: 2850,
    totalSets: 12,
    hasPr: false,
    cardioMinutes: 0,
    cardioDistanceKm: 0,
    caloriesBurned: 350,
    exercises: [
      { name: 'Barbell Back Squat', equipment: 'Barbell', muscle: 'Kaki', setsSummary: '4 Set (80kg x 10, 90kg x 8, 100kg x 6, 100kg x 6)', bestSet: '100 kg x 6' },
      { name: 'Incline 45° Leg Press Machine', equipment: 'Mesin', muscle: 'Kaki', setsSummary: '4 Set (140kg x 12, 160kg x 10, 160kg x 10, 160kg x 8)', bestSet: '160 kg x 10' },
      { name: 'Lying Leg Curl Machine', equipment: 'Mesin', muscle: 'Kaki', setsSummary: '4 Set (40kg x 10, 40kg x 10, 40kg x 10, 40kg x 8)', bestSet: '40 kg x 10' },
    ],
  },
  {
    id: 'w-7',
    name: 'Push & Cardio Blast Session',
    date: '2026-08-25',
    displayDate: '25 Agu 2026',
    durationMinutes: 65,
    activeMinutes: 35,
    restMinutes: 30,
    volumeKg: 1950,
    totalSets: 13,
    hasPr: true,
    prDetails: 'Deadlift (130kg × 5 reps)',
    cardioMinutes: 20,
    cardioDistanceKm: 2.5,
    caloriesBurned: 410,
    exercises: [
      { name: 'Conventional Deadlift', equipment: 'Barbell', muscle: 'Punggung', setsSummary: '4 Set (90kg x 8, 110kg x 6, 120kg x 5, 130kg x 5)', bestSet: '130 kg x 5 (PR)' },
      { name: 'Barbell Bench Press', equipment: 'Barbell', muscle: 'Dada', setsSummary: '4 Set (60kg x 10, 70kg x 8, 70kg x 8, 70kg x 6)', bestSet: '70 kg x 8' },
      { name: 'Treadmill Incline Fat Burn (12-3-30 Walk)', equipment: 'Treadmill', muscle: 'Kardio', setsSummary: '1 Sesi (20m, Incline 10%, Speed 5.0km/h, 1.7km)', bestSet: '1.7 km (~170 kkal)' },
    ],
  },
];

export interface TrendChartPoint {
  label: string;
  volume: number;
  activeMin?: number;
  restMin?: number;
  cardioMin?: number;
  density?: number;
  sessions?: number;
  durationHours?: number;
  avgDensity?: number;
}

// Telemetry Trend Data for Charts
const weeklyTrendChartData: TrendChartPoint[] = [
  { label: 'Rab (03)', volume: 1540, activeMin: 30, restMin: 28, cardioMin: 0, density: 52 },
  { label: 'Kam (04)', volume: 3200, activeMin: 38, restMin: 32, cardioMin: 15, density: 54 },
  { label: 'Jum (05)', volume: 0, activeMin: 0, restMin: 0, cardioMin: 0, density: 0 },
  { label: 'Sab (06)', volume: 2150, activeMin: 31, restMin: 24, cardioMin: 0, density: 56 },
  { label: 'Min (07)', volume: 0, activeMin: 45, restMin: 0, cardioMin: 45, density: 100 },
  { label: 'Sen (08)', volume: 1680, activeMin: 32, restMin: 28, cardioMin: 0, density: 53 },
  { label: 'Sel (09)', volume: 1780, activeMin: 36, restMin: 29, cardioMin: 15, density: 55 },
];

const monthlyTrendChartData: TrendChartPoint[] = [
  { label: 'Mgg 1 (1-7 Agu)', volume: 9400, sessions: 4, durationHours: 4.2 },
  { label: 'Mgg 2 (8-14 Agu)', volume: 11200, sessions: 5, durationHours: 5.1 },
  { label: 'Mgg 3 (15-21 Agu)', volume: 10800, sessions: 4, durationHours: 4.8 },
  { label: 'Mgg 4 (22-28 Agu)', volume: 12450, sessions: 5, durationHours: 5.5 },
  { label: 'Mgg 5 (29-31 Agu)', volume: 5600, sessions: 2, durationHours: 2.1 },
];

const yearlyTrendChartData: TrendChartPoint[] = [
  { label: 'Jan', volume: 38500, sessions: 16, avgDensity: 52 },
  { label: 'Feb', volume: 41200, sessions: 17, avgDensity: 53 },
  { label: 'Mar', volume: 44800, sessions: 18, avgDensity: 55 },
  { label: 'Apr', volume: 42000, sessions: 16, avgDensity: 54 },
  { label: 'Mei', volume: 46500, sessions: 19, avgDensity: 56 },
  { label: 'Jun', volume: 48900, sessions: 19, avgDensity: 55 },
  { label: 'Jul', volume: 51200, sessions: 20, avgDensity: 57 },
  { label: 'Agu', volume: 49450, sessions: 19, avgDensity: 54 },
  { label: 'Sep', volume: 13280, sessions: 5, avgDensity: 55 },
  { label: 'Okt', volume: 0, sessions: 0, avgDensity: 0 },
  { label: 'Nov', volume: 0, sessions: 0, avgDensity: 0 },
  { label: 'Des', volume: 0, sessions: 0, avgDensity: 0 },
];

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState<'SESSIONS' | 'EXERCISE_LIBRARY'>('SESSIONS');
  const [timeframe, setTimeframe] = useState<WorkoutTimeframe>('WEEK');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonthPart, setSelectedMonthPart] = useState('09');
  const [chartMetric, setChartMetric] = useState<'VOLUME' | 'DENSITY' | 'DURATION'>('VOLUME');

  // Exercise Library search & filter
  const [searchLibrary, setSearchLibrary] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<'ALL' | MuscleGroupCategory>('ALL');

  // Pagination states
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPageSize, setSessionPageSize] = useState(4);
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryPageSize, setLibraryPageSize] = useState(6);

  // Filtered workout history based on active timeframe
  const filteredWorkouts = useMemo(() => {
    return allWorkoutHistory.filter((w) => {
      if (timeframe === 'TODAY') {
        return w.date === '2026-09-09';
      }
      if (timeframe === 'WEEK') {
        // Last 7 days
        return w.date >= '2026-09-03' && w.date <= '2026-09-09';
      }
      if (timeframe === 'MONTH') {
        const targetPrefix = `${selectedYear}-${selectedMonthPart}`;
        return w.date.startsWith(targetPrefix);
      }
      if (timeframe === 'YEAR') {
        return w.date.startsWith(selectedYear);
      }
      return true;
    });
  }, [timeframe, selectedYear, selectedMonthPart]);

  // Reset sessionPage when timeframe/filter changes
  useEffect(() => {
    setSessionPage(1);
  }, [timeframe, selectedYear, selectedMonthPart]);

  // Reset libraryPage when library filters change
  useEffect(() => {
    setLibraryPage(1);
  }, [searchLibrary, muscleFilter]);

  // Paginated workouts
  const totalSessionPages = Math.ceil(filteredWorkouts.length / sessionPageSize) || 1;
  const paginatedWorkouts = useMemo(() => {
    const start = (sessionPage - 1) * sessionPageSize;
    return filteredWorkouts.slice(start, start + sessionPageSize);
  }, [filteredWorkouts, sessionPage, sessionPageSize]);

  // Aggregated KPIs for selected timeframe
  const aggregatedStats = useMemo(() => {
    const totalVolume = filteredWorkouts.reduce((acc, w) => acc + w.volumeKg, 0);
    const totalDuration = filteredWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);
    const totalActive = filteredWorkouts.reduce((acc, w) => acc + w.activeMinutes, 0);
    const totalRest = filteredWorkouts.reduce((acc, w) => acc + w.restMinutes, 0);
    const totalCardio = filteredWorkouts.reduce((acc, w) => acc + (w.cardioMinutes || 0), 0);
    const totalDistance = filteredWorkouts.reduce((acc, w) => acc + (w.cardioDistanceKm || 0), 0);
    const totalCalories = filteredWorkouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
    const prCount = filteredWorkouts.filter((w) => w.hasPr).length;
    const totalSets = filteredWorkouts.reduce((acc, w) => acc + w.totalSets, 0);

    const activeDensity = totalActive + totalRest > 0
      ? Math.round((totalActive / (totalActive + totalRest)) * 100)
      : 54;

    return {
      totalVolume,
      totalDuration,
      totalActive,
      totalRest,
      totalCardio,
      totalDistance: +totalDistance.toFixed(1),
      totalCalories,
      prCount,
      totalSets,
      activeDensity,
      sessionCount: filteredWorkouts.length,
    };
  }, [filteredWorkouts]);

  const filteredLibrary = MASTER_EXERCISES_LIBRARY.filter((ex) => {
    const matchSearch =
      ex.name.toLowerCase().includes(searchLibrary.toLowerCase()) ||
      ex.equipmentName.toLowerCase().includes(searchLibrary.toLowerCase());
    const matchMuscle = muscleFilter === 'ALL' || ex.primaryMuscle === muscleFilter;
    return matchSearch && matchMuscle;
  });

  // Paginated library
  const totalLibraryPages = Math.ceil(filteredLibrary.length / libraryPageSize) || 1;
  const paginatedLibrary = useMemo(() => {
    const start = (libraryPage - 1) * libraryPageSize;
    return filteredLibrary.slice(start, start + libraryPageSize);
  }, [filteredLibrary, libraryPage, libraryPageSize]);

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
            <Plus className="w-4 h-4 mr-1.5" /> Mulai Sesi Workout
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
          Riwayat & Analitik ({allWorkoutHistory.length})
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
          Katalog Alat ({MASTER_EXERCISES_LIBRARY.length})
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

              <div className="grid grid-cols-2 sm:flex rounded-[6px] bg-[var(--bg-base)] p-1 gap-1 border border-[var(--border-default)] w-full sm:w-auto">
                {[
                  { key: 'TODAY', label: 'Hari ini' },
                  { key: 'WEEK', label: '7 Hari terakhir' },
                  { key: 'MONTH', label: 'Sebulan' },
                  { key: 'YEAR', label: `1 Tahun (${selectedYear})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTimeframe(tab.key as WorkoutTimeframe)}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer text-center ${
                      timeframe === tab.key
                        ? 'bg-[var(--accent-primary)] text-white font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5-YEAR FILTER when 'YEAR' is selected */}
            {timeframe === 'YEAR' && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-[var(--text-secondary)] font-medium">Pilih tahun:</span>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    aria-label="Pilih Tahun Riwayat Workout"
                    className="pl-3 pr-8 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer appearance-none"
                  >
                    {AVAILABLE_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        Tahun {yr} {yr === '2026' ? '(Terkini)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--accent-primary)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* 12-MONTH & 5-YEAR PICKER when 'MONTH' is selected */}
            {timeframe === 'MONTH' && (
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                {/* Year Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">Tahun:</span>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      aria-label="Pilih Tahun"
                      className="pl-2.5 pr-7 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer appearance-none"
                    >
                      {AVAILABLE_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-[var(--text-secondary)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Month Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">Bulan:</span>
                  <div className="relative">
                    <select
                      value={selectedMonthPart}
                      onChange={(e) => setSelectedMonthPart(e.target.value)}
                      aria-label="Pilih Bulan"
                      className="pl-2.5 pr-7 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer appearance-none"
                    >
                      {MONTH_NAMES.map((m) => (
                        <option key={m.num} value={m.num}>
                          {m.name} {selectedYear === '2026' && m.num === '09' ? '(Bulan Ini)' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-[var(--accent-primary)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6 Hero Analytics KPI Cards for Selected Timeframe */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              label="Total volume"
              value={formatNumber(aggregatedStats.totalVolume)}
              unit="kg"
              trend={{
                direction: 'UP',
                value: '8.4%',
                percentage: '+8.4',
                alignment: 'ON_TRACK',
              }}
              icon={<Activity className="w-4 h-4 text-[var(--color-moss-600)]" />}
            />

            <MetricCard
              label="Sesi latihan"
              value={aggregatedStats.sessionCount}
              unit="Sesi"
              subValue={`${aggregatedStats.totalSets} total set`}
              icon={<Dumbbell className="w-4 h-4 text-[var(--accent-primary)]" />}
            />

            <MetricCard
              label="Durasi latihan"
              value={aggregatedStats.totalDuration}
              unit="menit"
              subValue={`~${(aggregatedStats.totalDuration / 60).toFixed(1)} jam`}
              icon={<Clock className="w-4 h-4 text-sky-400" />}
            />

            <MetricCard
              label="Rasio aktif"
              value={`${aggregatedStats.activeDensity}%`}
              unit="Aktif"
              subValue="Work / Rest density"
              icon={<Sparkles className="w-4 h-4 text-amber-400" />}
            />

            <MetricCard
              label="Kardio & jarak"
              value={aggregatedStats.totalCardio}
              unit="min"
              subValue={`${aggregatedStats.totalDistance} km · ~${aggregatedStats.totalCalories} kkal`}
              icon={<Zap className="w-4 h-4 text-emerald-400" />}
            />

            <MetricCard
              label="Rekor PR baru"
              value={aggregatedStats.prCount}
              unit="PR"
              subValue="Tercatat periode ini"
              icon={<Award className="w-4 h-4 text-[var(--accent-secondary)]" />}
            />
          </div>

          {/* Telemetry Visual Analytics Chart Card */}
          <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
                  Grafik telemetri kinerja ({timeframe === 'TODAY' ? 'Hari ini' : timeframe === 'WEEK' ? '7 Hari terakhir' : timeframe === 'MONTH' ? `Bulan ${MONTH_NAMES.find(m => m.num === selectedMonthPart)?.name} ${selectedYear}` : `Tahun ${selectedYear}`})
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Analisis beban volume, rasio waktu latihan aktif vs istirahat, dan durasi kardio.
                </p>
              </div>

              {/* Chart Metric Selector */}
              <div className="flex items-center gap-1 p-1 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartMetric('VOLUME')}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                    chartMetric === 'VOLUME'
                      ? 'bg-[var(--accent-primary)] text-white font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Volume (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('DENSITY')}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                    chartMetric === 'DENSITY'
                      ? 'bg-[var(--accent-primary)] text-white font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Active vs Rest
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('DURATION')}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                    chartMetric === 'DURATION'
                      ? 'bg-[var(--accent-primary)] text-white font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Total Durasi
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'VOLUME' ? (
                  <AreaChart
                    data={
                      timeframe === 'YEAR'
                        ? yearlyTrendChartData
                        : timeframe === 'MONTH'
                        ? monthlyTrendChartData
                        : weeklyTrendChartData
                    }
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="workoutVolumeGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                    <XAxis dataKey="label" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ stroke: '#FF6B2C', strokeDasharray: '3 3', strokeWidth: 1.5 }}
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
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#FF6B2C"
                      strokeWidth={3}
                      fill="url(#workoutVolumeGlow)"
                      dot={{ r: 4, fill: '#FF6B2C', stroke: '#121316', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#FF6B2C', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                ) : chartMetric === 'DENSITY' ? (
                  <BarChart
                    data={weeklyTrendChartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                    <XAxis dataKey="label" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
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
                    <Bar dataKey="restMin" stackId="a" fill="#FF6B2C" radius={[6, 6, 0, 0]} name="Waktu Istirahat (min)" />
                  </BarChart>
                ) : (
                  <AreaChart
                    data={
                      timeframe === 'YEAR'
                        ? yearlyTrendChartData
                        : timeframe === 'MONTH'
                        ? monthlyTrendChartData
                        : weeklyTrendChartData
                    }
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="workoutDurationGlow" x1="0" y1="0" x2="0" y2="1">
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
                        borderRadius: '14px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{ color: '#9AA0B0', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey={timeframe === 'YEAR' ? 'sessions' : 'activeMin'}
                      stroke="#4CD6DE"
                      strokeWidth={3}
                      fill="url(#workoutDurationGlow)"
                      dot={{ r: 4, fill: '#4CD6DE', stroke: '#121316', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#4CD6DE', stroke: '#FFFFFF', strokeWidth: 2 }}
                      name={timeframe === 'YEAR' ? 'Jumlah Sesi' : 'Durasi Latihan (min)'}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <Divider />

          {/* Section: Sesi Latihan pada Periode Ini */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                  Daftar sesi latihan terfilter ({filteredWorkouts.length} sesi)
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Sesi workout yang diselesaikan dalam periode ini.
                </p>
              </div>
            </div>

            {filteredWorkouts.length === 0 ? (
              <div className="p-8 text-center rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3">
                <Dumbbell className="w-8 h-8 text-[var(--text-tertiary)] mx-auto" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Tidak ada sesi di periode ini</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Belum ada catatan latihan yang tercatat pada rentang waktu yang dipilih.
                </p>
                <Link href="/workouts/active">
                  <Button variant="primary" size="sm">
                    + Mulai latihan sekarang
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedWorkouts.map((workout) => (
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
                              {workout.displayDate}
                            </span>
                            {workout.hasPr && <PRBadge label="PR Baru" />}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                            {workout.name}
                          </h3>

                          {workout.prDetails && (
                            <span className="text-xs text-[var(--accent-secondary)] font-semibold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> {workout.prDetails}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 justify-between md:justify-end">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] text-[var(--text-tertiary)] font-bold block">
                              Volume
                            </span>
                            <span className="text-sm sm:text-base font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
                              {formatNumber(workout.volumeKg)} kg
                            </span>
                          </div>

                          <div className="text-left md:text-right">
                            <span className="text-[10px] text-[var(--text-tertiary)] font-bold block">
                              Durasi
                            </span>
                            <span className="text-sm sm:text-base font-bold font-[var(--font-display)] tabular-nums text-[var(--color-moss-600)]">
                              {workout.durationMinutes} min
                            </span>
                          </div>

                          <Link href="/workouts/active">
                            <Button variant="secondary" size="sm" className="text-xs">
                              <span>Detail</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Exercise Breakdown per Alat */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] block">
                          Rincian alat & gerakan ({workout.exercises.length} gerakan):
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {workout.exercises.map((ex, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[var(--text-primary)]">{ex.name}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[9px] font-semibold text-sky-400 border border-[var(--border-default)]">
                                    {ex.equipment}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-tertiary)]">{ex.setsSummary}</p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[9px] font-bold text-[var(--text-tertiary)] block">
                                  Best Set
                                </span>
                                <span className="font-bold font-mono text-[var(--accent-secondary)]">
                                  {ex.bestSet}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Workout Sessions Pagination */}
                <Pagination
                  currentPage={sessionPage}
                  totalPages={totalSessionPages}
                  totalItems={filteredWorkouts.length}
                  pageSize={sessionPageSize}
                  onPageChange={setSessionPage}
                  onPageSizeChange={(newSize) => {
                    setSessionPageSize(newSize);
                    setSessionPage(1);
                  }}
                  pageSizeOptions={[1, 5, 10, 15, 20]}
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
          {/* Search & Muscle Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari alat, dumbbell, barbell, treadmill, atau nama gerakan..."
                value={searchLibrary}
                onChange={(e) => setSearchLibrary(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

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
                  {cat === 'ALL' ? 'Semua' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Library Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedLibrary.map((ex) => (
              <div
                key={ex.id}
                className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3 hover:border-[var(--accent-primary)]/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] leading-tight">
                      {ex.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-bold text-[var(--accent-secondary)] shrink-0">
                      {ex.primaryMuscleName}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {ex.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-default)]/60 text-xs">
                  <span className="text-[11px] font-semibold text-sky-400">
                    {ex.equipmentName}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {ex.primaryMuscle}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Exercise Library Pagination */}
          <Pagination
            currentPage={libraryPage}
            totalPages={totalLibraryPages}
            totalItems={filteredLibrary.length}
            pageSize={libraryPageSize}
            onPageChange={setLibraryPage}
            onPageSizeChange={(newSize) => {
              setLibraryPageSize(newSize);
              setLibraryPage(1);
            }}
            pageSizeOptions={[1, 5, 10, 15, 20]}
            itemLabel="gerakan & alat"
          />
        </div>
      )}
    </AppShell>
  );
}
