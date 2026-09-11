'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/common/AppShell';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { MetricCard } from '@/components/ui/MetricCard';
import { Pagination } from '@/components/ui/Pagination';
import { AddFoodModal } from '@/components/nutrition/AddFoodModal';
import { EditFoodModal } from '@/components/nutrition/EditFoodModal';
import { nutritionService } from '@/services/nutrition.service';
import {
  NutritionEntry,
  NutritionType,
  CreateNutritionEntryInput,
  UpdateNutritionEntryInput,
} from '@/types/nutrition.types';
import { formatNumber } from '@/lib/utils';
import {
  Flame,
  Utensils,
  Droplets,
  PieChart,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Search,
  ListFilter,
  Plus,
  Trash2,
  Edit3,
  Dumbbell,
  Sparkles,
  Zap,
  BarChart3,
  Activity,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
} from 'recharts';
import { toast } from 'sonner';

export type NutritionTimeframe = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';

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

export default function NutritionPage() {
  const queryClient = useQueryClient();

  // State
  const [timeframe, setTimeframe] = useState<NutritionTimeframe>('TODAY');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonthPart, setSelectedMonthPart] = useState<string>('09');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NutritionEntry | null>(null);

  // History View Mode, Search, Filter & Pagination states
  const [historyViewMode, setHistoryViewMode] = useState<'DAILY' | 'ENTRIES'>('DAILY');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);
  const [showEmptyDays, setShowEmptyDays] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Toggle expand day accordion
  const toggleExpandDay = (dateKey: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // Query 1: Daily Summary (Today / Active Day)
  const {
    data: dailySummary,
    isLoading: isDailyLoading,
  } = useQuery({
    queryKey: ['nutrition-daily-summary'],
    queryFn: () => nutritionService.getDailySummary(),
    staleTime: 1000 * 15,
  });

  // Query 2: History & Chart Telemetry
  const {
    data: historyData,
    isLoading: isHistoryLoading,
  } = useQuery({
    queryKey: ['nutrition-history', timeframe, selectedYear, selectedMonthPart],
    queryFn: () =>
      nutritionService.getHistory(
        timeframe,
        timeframe === 'MONTH' || timeframe === 'YEAR' ? selectedYear : undefined,
        timeframe === 'MONTH' ? selectedMonthPart : undefined,
      ),
    enabled: timeframe !== 'TODAY',
    staleTime: 1000 * 30,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateNutritionEntryInput) => nutritionService.createEntry(data),
    onSuccess: () => {
      toast.success('Catatan nutrisi berhasil ditambahkan!');
      queryClient.invalidateQueries({ queryKey: ['nutrition-daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition-history'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan catatan nutrisi.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNutritionEntryInput }) =>
      nutritionService.updateEntry(id, data),
    onSuccess: () => {
      toast.success('Catatan nutrisi berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: ['nutrition-daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition-history'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui catatan nutrisi.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => nutritionService.deleteEntry(id),
    onSuccess: () => {
      toast.success('Catatan nutrisi berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['nutrition-daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition-history'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menghapus catatan nutrisi.');
    },
  });

  // Quick Log Water Helper (100ml, 250ml, 500ml, 750ml, 1000ml)
  const handleQuickLogWater = async (ml: number) => {
    try {
      const getWaterName = (vol: number) => {
        if (vol === 100) return 'Air Mineral (100 ml)';
        if (vol === 250) return 'Air Mineral (Gelas 250 ml)';
        if (vol === 500) return 'Air Mineral (Botol 500 ml)';
        if (vol === 750) return 'Air Mineral (Botol 750 ml)';
        if (vol === 1000) return 'Air Mineral (1 Liter / 1.000 ml)';
        return `Air Mineral (${vol} ml)`;
      };

      await createMutation.mutateAsync({
        type: 'DRINK',
        name: getWaterName(ml),
        calories: 0,
        quantity: ml,
        unit: 'ml',
        waterMl: ml,
        proteinG: 0,
        fatG: 0,
        carbsG: 0,
      });
    } catch {
      // Handled in onError
    }
  };

  // Extract metrics from dailySummary or sensible fallbacks
  const targetCalories = dailySummary?.targetCalories || 2000;
  const consumedCalories = dailySummary?.consumedCalories || 0;
  const workoutCaloriesBurned = dailySummary?.workoutCaloriesBurned || 0;
  const netCalories = dailySummary?.netCalories || Math.max(0, consumedCalories - workoutCaloriesBurned);
  const remainingCalories = dailySummary?.remainingCalories ?? targetCalories - consumedCalories + workoutCaloriesBurned;

  const targetWaterMl = dailySummary?.targetWaterMl || 2500;
  const consumedWaterMl = dailySummary?.consumedWaterMl || 0;
  const remainingWaterMl = dailySummary?.remainingWaterMl ?? targetWaterMl - consumedWaterMl;

  const targetProtein = dailySummary?.targetProteinG || 150;
  const consumedProtein = dailySummary?.consumedProteinG || 0;

  const targetFat = dailySummary?.targetFatG || 55;
  const consumedFat = dailySummary?.consumedFatG || 0;

  const targetCarbs = dailySummary?.targetCarbsG || 220;
  const consumedCarbs = dailySummary?.consumedCarbsG || 0;

  const entriesList = dailySummary?.entries || [];

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (typeFilter === 'ALL') return entriesList;
    return entriesList.filter((e) => e.type === typeFilter);
  }, [entriesList, typeFilter]);

  // Calorie gauge percentage (Net vs Target)
  const caloriePct = Math.min(150, Math.round((netCalories / targetCalories) * 100));
  const waterPct = Math.min(150, Math.round((consumedWaterMl / targetWaterMl) * 100));

  // Chart data
  const chartData = useMemo(() => {
    if (historyData?.chartData && historyData.chartData.length > 0) {
      return historyData.chartData;
    }
    return [];
  }, [historyData]);

  // Historical Daily List (reversed: newest first)
  const dailyList = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    return [...chartData].reverse();
  }, [chartData]);

  // Filter daily list: show days with data by default, or all days if toggled
  const displayDailyList = useMemo(() => {
    if (!dailyList || dailyList.length === 0) return [];
    if (showEmptyDays) return dailyList;
    return dailyList.filter(
      (d) => d.consumedCalories > 0 || d.burnedCalories > 0 || d.waterMl > 0,
    );
  }, [dailyList, showEmptyDays]);

  // Helper to filter entries for a specific day
  const getEntriesForDate = (dateStr: string) => {
    const all = historyData?.entries || [];
    return all.filter((e) => {
      const d = new Date(e.consumedAt);
      if (isNaN(d.getTime())) return false;
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return ymd === dateStr;
    });
  };

  // Historical Itemized Entries List
  const allHistoryEntries = useMemo(() => {
    let list = historyData?.entries || [];
    if (historyTypeFilter !== 'ALL') {
      list = list.filter((e) => e.type === historyTypeFilter);
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [historyData?.entries, historyTypeFilter, historySearch]);

  // Pagination for Daily View
  const totalDailyPages = Math.max(1, Math.ceil(displayDailyList.length / historyPageSize));
  const paginatedDailyList = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return displayDailyList.slice(start, start + historyPageSize);
  }, [displayDailyList, historyPage, historyPageSize]);

  // Pagination for Entries View
  const totalEntriesPages = Math.max(1, Math.ceil(allHistoryEntries.length / historyPageSize));
  const paginatedEntriesList = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return allHistoryEntries.slice(start, start + historyPageSize);
  }, [allHistoryEntries, historyPage, historyPageSize]);

  return (
    <AppShell>
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
              Pelacak Nutrisi & Kalori Harian
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-[var(--accent-primary)]">
              Terintegrasi Profil & Workout
            </span>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
            Catat asupan makanan, minuman, pantau sisa kuota kalori harian, dan integrasi kalori terbakar.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto shadow-md text-xs sm:text-sm py-2 sm:py-2.5"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Catat Makanan / Minuman
        </Button>
      </div>

      {/* Timeframe Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-6 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)]">
              Periode:
            </span>
          </div>

          {(
            [
              { key: 'TODAY', label: 'Hari Ini (Live)' },
              { key: 'WEEK', label: '7 Hari Terakhir' },
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
              className="h-8 px-3 rounded-[6px] border border-[var(--border-default)] bg-[#1A1C23] text-xs text-white font-medium focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer shadow-sm"
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
              className="h-8 px-3 rounded-[6px] border border-[var(--border-default)] bg-[#1A1C23] text-xs text-white font-medium focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer shadow-sm"
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
              className="h-8 px-3 rounded-[6px] border border-[var(--border-default)] bg-[#1A1C23] text-xs text-white font-medium focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer shadow-sm"
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

      {/* ============================================================ */}
      {/* TAB 1: TODAY LIVE NUTRITION DASHBOARD */}
      {/* ============================================================ */}
      {timeframe === 'TODAY' && (
        <div className="space-y-6">
          {/* Circular Radial Gauges: Kalori Terintegrasi & Hidrasi Air */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Card Circular Radial Gauge - Progres Kalori Harian */}
            <div className="p-5 sm:p-6 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="space-y-3 flex-1 text-center sm:text-left w-full">
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
                      {formatNumber(consumedCalories)}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      / {formatNumber(targetCalories)} kkal
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/60 pt-2.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[var(--text-tertiary)]">Sisa Kuota Kalori:</span>
                    <span className={`font-bold font-mono ${remainingCalories >= 0 ? 'text-[#FF6B2C]' : 'text-rose-400'}`}>
                      {remainingCalories >= 0 ? `${formatNumber(remainingCalories)} kkal` : `+${formatNumber(Math.abs(remainingCalories))} kkal (Surplus)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" /> Terbakar Latihan:
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">+{formatNumber(workoutCaloriesBurned)} kkal</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#4CD6DE]">Kalori Bersih (Net):</span>
                    <span className="font-semibold text-[#4CD6DE] font-mono">{formatNumber(netCalories)} kkal</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[var(--text-tertiary)]">Target Harian:</span>
                    <span className="font-mono text-[var(--text-secondary)]">{formatNumber(targetCalories)} kkal/hari</span>
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
                    stroke={caloriePct > 100 ? '#EF4444' : '#FF6B2C'}
                    strokeWidth="10"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - Math.min(100, caloriePct) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                    {caloriePct}%
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${caloriePct > 100 ? 'text-rose-400' : 'text-[#FF6B2C]'}`}>
                    {caloriePct > 100 ? 'Surplus' : 'Tercapai'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Card Circular Radial Gauge - Progres Hidrasi Air Minum */}
            <div className="p-5 sm:p-6 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="space-y-3 flex-1 text-center sm:text-left w-full">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <div className="p-1.5 rounded-[8px] bg-[#4CD6DE]/15 text-[#4CD6DE]">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Target Hidrasi Air Harian
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-center sm:justify-start gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                      {formatNumber(consumedWaterMl)}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      / {formatNumber(targetWaterMl)} ml (~{(targetWaterMl / 1000).toFixed(1)}L)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] border-t border-[var(--border-default)]/60 pt-2.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[var(--text-tertiary)]">Sisa Target Hidrasi:</span>
                    <span className={`font-bold font-mono ${remainingWaterMl <= 0 ? 'text-emerald-400' : 'text-[#4CD6DE]'}`}>
                      {remainingWaterMl <= 0 ? 'Target Terpenuhi' : `${formatNumber(remainingWaterMl)} ml`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[var(--text-tertiary)]">Standar Rumus:</span>
                    <span className="font-mono text-[var(--text-secondary)]">35 ml / kg Berat Badan</span>
                  </div>
                  {/* Quick Add Water Buttons: 100ml, 250ml, 500ml, 750ml, 1000ml */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1">
                    <span className="text-[11px] text-[var(--text-tertiary)] shrink-0 font-medium">Catat Cepat:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[100, 250, 500, 750, 1000].map((vol) => (
                        <button
                          key={vol}
                          type="button"
                          onClick={() => handleQuickLogWater(vol)}
                          disabled={createMutation.isPending}
                          className="px-2 py-0.5 rounded-[6px] bg-[var(--bg-base)] hover:bg-[#4CD6DE]/15 border border-[var(--border-default)] hover:border-[#4CD6DE]/50 text-[10px] font-bold text-white transition-all cursor-pointer active:scale-95 flex items-center gap-0.5"
                        >
                          <Plus className="w-2.5 h-2.5 text-[#4CD6DE]" />
                          +{vol >= 1000 ? '1.000ml' : `${vol}ml`}
                        </button>
                      ))}
                    </div>
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
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - Math.min(100, waterPct) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                    {waterPct}%
                  </span>
                  <span className="text-[9px] font-bold text-[#4CD6DE] uppercase tracking-wider">
                    Terpenuhi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Three Dedicated Macro Circular Radial Gauges: Protein, Lemak, Karbohidrat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Macro 1: Protein Circular Gauge */}
            <div className="p-4 sm:p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-[6px] bg-[#FF6B2C]/15 text-[#FF6B2C]">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Protein Harian
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-[var(--font-display)] text-white tabular-nums">
                    {consumedProtein}g
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">/ {targetProtein}g</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[var(--text-tertiary)] block">
                    {consumedProtein * 4} kkal &bull; Sisa {Math.max(0, targetProtein - consumedProtein)}g lagi
                  </span>
                </div>
              </div>

              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#262934" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#FF6B2C"
                    strokeWidth="10"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - Math.min(100, Math.round((consumedProtein / targetProtein) * 100)) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold font-[var(--font-display)] text-white tabular-nums">
                    {Math.round((consumedProtein / targetProtein) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Macro 2: Lemak (Fat) Circular Gauge */}
            <div className="p-4 sm:p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-[6px] bg-[#FFA726]/15 text-[#FFA726]">
                    <PieChart className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Lemak Harian
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-[var(--font-display)] text-white tabular-nums">
                    {consumedFat}g
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">/ {targetFat}g</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[var(--text-tertiary)] block">
                    {consumedFat * 9} kkal &bull; Sisa {Math.max(0, targetFat - consumedFat)}g lagi
                  </span>
                </div>
              </div>

              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#262934" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#FFA726"
                    strokeWidth="10"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - Math.min(100, Math.round((consumedFat / targetFat) * 100)) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold font-[var(--font-display)] text-white tabular-nums">
                    {Math.round((consumedFat / targetFat) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Macro 3: Karbohidrat Circular Gauge */}
            <div className="p-4 sm:p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-[6px] bg-[#9B7CF6]/15 text-[#9B7CF6]">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Karbohidrat Harian
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-[var(--font-display)] text-white tabular-nums">
                    {consumedCarbs}g
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">/ {targetCarbs}g</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[var(--text-tertiary)] block">
                    {consumedCarbs * 4} kkal &bull; Sisa {Math.max(0, targetCarbs - consumedCarbs)}g lagi
                  </span>
                </div>
              </div>

              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#262934" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#9B7CF6"
                    strokeWidth="10"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - Math.min(100, Math.round((consumedCarbs / targetCarbs) * 100)) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold font-[var(--font-display)] text-white tabular-nums">
                    {Math.round((consumedCarbs / targetCarbs) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Section: Timeline Log Makanan & Minuman Hari Ini */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                  Log Konsumsi Hari Ini ({entriesList.length} entri)
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Daftar makanan dan minuman yang Anda konsumsi hari ini.
                </p>
              </div>

              {/* Filter Type Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === 'ALL'
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Semua ({entriesList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('FOOD')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === 'FOOD'
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Makanan ({entriesList.filter((e) => e.type === 'FOOD').length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('DRINK')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === 'DRINK'
                      ? 'bg-[#4CD6DE] text-slate-950 font-extrabold'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Minuman ({entriesList.filter((e) => e.type === 'DRINK').length})
                </button>
              </div>
            </div>

            {/* List Entries */}
            {isDailyLoading ? (
              <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                Memuat data log nutrisi hari ini...
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-10 text-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3">
                <Utensils className="w-10 h-10 text-[var(--text-tertiary)] mx-auto opacity-50" />
                <h4 className="text-base font-bold text-white">Belum Ada Catatan Konsumsi</h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Catat makanan atau minuman pertama Anda hari ini untuk memantau kalori dan asupan makronutrisi.
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Catat Makanan Sekarang
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => {
                  const d = new Date(entry.consumedAt);
                  const timeFormatted = !isNaN(d.getTime())
                    ? `${new Intl.DateTimeFormat('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      }).format(d).replace('.', ':')} WIB`
                    : '-';

                  return (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            entry.type === 'DRINK'
                              ? 'bg-[#4CD6DE]/10 text-[#4CD6DE] border border-[#4CD6DE]/20'
                              : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20'
                          }`}
                        >
                          {entry.type === 'DRINK' ? <Droplets className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[var(--text-tertiary)] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {timeFormatted}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                              {entry.quantity} {entry.unit}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white truncate">{entry.name}</h4>

                          {/* Macro tags */}
                          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-[var(--text-secondary)]">
                            {entry.proteinG !== null && entry.proteinG !== undefined && (
                              <span className="text-[var(--accent-primary)] font-medium">
                                P: {entry.proteinG}g
                              </span>
                            )}
                            {entry.fatG !== null && entry.fatG !== undefined && (
                              <span className="text-[#FFA726] font-medium">
                                L: {entry.fatG}g
                              </span>
                            )}
                            {entry.carbsG !== null && entry.carbsG !== undefined && (
                              <span className="text-[#9B7CF6] font-medium">
                                K: {entry.carbsG}g
                              </span>
                            )}
                            {entry.waterMl !== null && entry.waterMl !== undefined && entry.waterMl > 0 && (
                              <span className="text-[#4CD6DE] font-medium">
                                Air: {entry.waterMl}ml
                              </span>
                            )}
                            {entry.notes && (
                              <span className="text-[var(--text-tertiary)] italic truncate max-w-[200px]">
                                • {entry.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Calories & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-default)]/60">
                        <div className="text-left sm:text-right">
                          <span className="text-base sm:text-lg font-bold font-mono text-[var(--accent-primary)] tabular-nums block">
                            {formatNumber(entry.calories)} kkal
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingEntry(entry)}
                            title="Edit Catatan"
                            className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus catatan "${entry.name}"?`)) {
                                deleteMutation.mutate(entry.id);
                              }
                            }}
                            title="Hapus Catatan"
                            className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-default)] text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: HISTORICAL ANALYTICS & CHARTS */}
      {/* ============================================================ */}
      {timeframe !== 'TODAY' && (
        <div className="space-y-6">
          {/* 3 Metric Cards for Historical Average */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Rata-rata Konsumsi Harian"
              value={formatNumber(historyData?.avgDailyConsumedCalories || 0)}
              unit="kkal/hari"
              subValue={`Target: ${formatNumber(targetCalories)} kkal`}
              icon={<Flame className="w-4 h-4 text-[var(--accent-primary)]" />}
            />

            <MetricCard
              label="Rata-rata Kalori Terbakar Latihan"
              value={formatNumber(historyData?.avgDailyBurnedCalories || 0)}
              unit="kkal/hari"
              subValue="Dari sesi workout selesai"
              icon={<Dumbbell className="w-4 h-4 text-emerald-400" />}
            />

            <MetricCard
              label="Rata-rata Asupan Air Harian"
              value={formatNumber(historyData?.avgDailyWaterMl || 0)}
              unit="ml/hari"
              subValue={`Target: ${formatNumber(targetWaterMl)} ml`}
              icon={<Droplets className="w-4 h-4 text-[#4CD6DE]" />}
            />
          </div>

          {/* Interactive Composed Chart */}
          <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)]/60 pb-3">
              <div>
                <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
                  Tren Asupan Kalori vs Terbakar vs Target
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Perbandingan kalori terkonsumsi (oranye), kalori terbakar workout (hijau), dan batas target (garis putus-putus).
                </p>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-72 w-full pt-2">
              {isHistoryLoading ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">
                  Memuat data grafik analitik...
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">
                  Belum ada data nutrisi pada periode yang dipilih.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                    <XAxis dataKey="label" stroke="#646A7C" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#646A7C" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E2027',
                        borderColor: '#2C303B',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{ color: '#9AA0B0', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(v: any, name: any) => {
                        if (name === 'consumedCalories') return [`${formatNumber(Number(v) || 0)} kkal`, 'Kalori Terkonsumsi'];
                        if (name === 'burnedCalories') return [`${formatNumber(Number(v) || 0)} kkal`, 'Kalori Terbakar (Workout)'];
                        if (name === 'netCalories') return [`${formatNumber(Number(v) || 0)} kkal`, 'Kalori Bersih (Net)'];
                        return [v, name];
                      }}
                    />
                    <ReferenceLine
                      y={targetCalories}
                      stroke="#4CD6DE"
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      label={{ value: 'Target Harian', fill: '#4CD6DE', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Bar dataKey="consumedCalories" fill="#FF6B2C" radius={[4, 4, 0, 0]} name="consumedCalories" />
                    <Bar dataKey="burnedCalories" fill="#10B981" radius={[4, 4, 0, 0]} name="burnedCalories" />
                    <Line
                      type="monotone"
                      dataKey="netCalories"
                      stroke="#4CD6DE"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#4CD6DE' }}
                      name="netCalories"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Section: Riwayat & Rincian Log Nutrisi Periode Ini */}
          <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
            {/* Section Header with View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-default)]/60 pb-3.5">
              <div>
                <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[var(--accent-primary)]" />
                  Riwayat & Rincian Log Nutrisi ({timeframe === 'WEEK' ? '7 Hari Terakhir' : timeframe === 'MONTH' ? `Bulan ${MONTH_NAMES.find((m) => m.num === selectedMonthPart)?.name || ''} ${selectedYear}` : `Tahun ${selectedYear}`})
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Lihat rincian kalori, makronutrisi harian, dan riwayat makanan/minuman yang tercatat pada periode ini.
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setHistoryViewMode('DAILY');
                    setHistoryPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    historyViewMode === 'DAILY'
                      ? 'bg-[var(--accent-primary)] text-white shadow'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Rincian Per Hari ({dailyList.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistoryViewMode('ENTRIES');
                    setHistoryPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    historyViewMode === 'ENTRIES'
                      ? 'bg-[var(--accent-primary)] text-white shadow'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Semua Catatan Item ({allHistoryEntries.length})
                </button>
              </div>
            </div>            {/* ============================================================ */}
            {/* SUB-VIEW 1: RINCIAN PER HARI (DAILY ACCORDION) */}
            {/* ============================================================ */}
            {historyViewMode === 'DAILY' && (
              <div className="space-y-3">
                {/* Header Filter: Only Days with Data vs All Calendar Days */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-1">
                  <span className="text-[var(--text-secondary)] font-medium">
                    Menampilkan <strong className="text-white font-bold">{displayDailyList.length}</strong> hari {showEmptyDays ? 'keseluruhan kalender' : 'dengan catatan aktivitas'}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)] hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={showEmptyDays}
                      onChange={(e) => {
                        setShowEmptyDays(e.target.checked);
                        setHistoryPage(1);
                      }}
                      className="rounded border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--accent-primary)] focus:ring-0 cursor-pointer"
                    />
                    <span>Tampilkan juga hari tanpa log</span>
                  </label>
                </div>

                {isHistoryLoading ? (
                  <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                    Memuat riwayat harian...
                  </div>
                ) : paginatedDailyList.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] space-y-2">
                    <Calendar className="w-8 h-8 text-[var(--text-tertiary)] mx-auto opacity-40" />
                    <p className="text-xs text-[var(--text-secondary)]">
                      Belum ada catatan aktivitas nutrisi pada periode ini.
                    </p>
                  </div>
                ) : (
                  paginatedDailyList.map((day) => {
                    const dayEntries = getEntriesForDate(day.date);
                    const isExpanded = !!expandedDays[day.date];

                    // Date label formatting
                    let dayFormatted = day.label;
                    if (day.date.length === 10) {
                      const dObj = new Date(day.date);
                      if (!isNaN(dObj.getTime())) {
                        dayFormatted = dObj.toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        });
                      }
                    }

                    // Status Badge
                    const hasEntries = day.consumedCalories > 0 || dayEntries.length > 0;
                    const isUnderTarget = day.netCalories <= day.targetCalories;
                    const diffCalories = Math.abs(day.targetCalories - day.netCalories);

                    return (
                      <div
                        key={day.date}
                        className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)]/60 overflow-hidden transition-all hover:border-[var(--border-default)]/80"
                      >
                        {/* Day Header Row */}
                        <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[var(--bg-surface)]">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                                {dayFormatted}
                              </span>

                              {/* Status Tag */}
                              {!hasEntries ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-tertiary)] border border-[var(--border-default)]">
                                  Belum ada log
                                </span>
                              ) : isUnderTarget ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Target Terpenuhi (Defisit {formatNumber(diffCalories)} kkal)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Surplus {formatNumber(diffCalories)} kkal
                                </span>
                              )}
                            </div>

                            {/* Macro Tags */}
                            <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[var(--text-secondary)]">
                              <span className="text-[var(--accent-primary)] font-semibold">
                                Protein: {day.proteinG}g
                              </span>
                              <span className="text-[#FFA726] font-semibold">
                                Lemak: {day.fatG}g
                              </span>
                              <span className="text-[#9B7CF6] font-semibold">
                                Karbo: {day.carbsG}g
                              </span>
                              <span className="text-[#4CD6DE] font-semibold">
                                Air: {formatNumber(day.waterMl)} ml
                              </span>
                            </div>
                          </div>

                          {/* Day KPI Stats & Toggle */}
                          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border-default)]/60">
                            <div className="flex items-center gap-3 text-xs">
                              <div className="text-left lg:text-right">
                                <span className="text-[10px] text-[var(--text-tertiary)] uppercase block">Masuk</span>
                                <span className="font-bold text-[#FF6B2C] tabular-nums">
                                  {formatNumber(day.consumedCalories)} kkal
                                </span>
                              </div>

                              <div className="text-left lg:text-right">
                                <span className="text-[10px] text-[var(--text-tertiary)] uppercase block">Terbakar</span>
                                <span className="font-bold text-emerald-400 tabular-nums">
                                  -{formatNumber(day.burnedCalories)} kkal
                                </span>
                              </div>

                              <div className="text-left lg:text-right">
                                <span className="text-[10px] text-[var(--text-tertiary)] uppercase block">Net</span>
                                <span className="font-bold text-[#4CD6DE] tabular-nums">
                                  {formatNumber(day.netCalories)} kkal
                                </span>
                              </div>
                            </div>

                            {/* Expand Accordion Button */}
                            {dayEntries.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleExpandDay(day.date)}
                                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-primary)] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span>{dayEntries.length} Item</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Items for this Day */}
                        {isExpanded && dayEntries.length > 0 && (
                          <div className="p-3.5 space-y-2 border-t border-[var(--border-default)]/60 bg-[var(--bg-base)]">
                            <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block px-1">
                              Catatan Makanan & Minuman Hari Ini:
                            </span>
                            <div className="space-y-2">
                              {dayEntries.map((entry) => {
                                const d = new Date(entry.consumedAt);
                                const timeFormatted = !isNaN(d.getTime())
                                  ? `${new Intl.DateTimeFormat('id-ID', {
                                      timeZone: 'Asia/Jakarta',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false,
                                    }).format(d).replace('.', ':')} WIB`
                                  : '-';

                                return (
                                  <div
                                    key={entry.id}
                                    className="p-2.5 sm:p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                          entry.type === 'DRINK'
                                            ? 'bg-[#4CD6DE]/15 text-[#4CD6DE]'
                                            : 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                                        }`}
                                      >
                                        {entry.type === 'DRINK' ? (
                                          <Droplets className="w-3.5 h-3.5" />
                                        ) : (
                                          <Utensils className="w-3.5 h-3.5" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-white truncate">
                                            {entry.name}
                                          </span>
                                          <span className="text-[10px] text-[var(--text-tertiary)]">
                                            ({entry.quantity} {entry.unit})
                                          </span>
                                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                                            {timeFormatted}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                                          {entry.proteinG !== null && entry.proteinG !== undefined && (
                                            <span>P: {entry.proteinG}g</span>
                                          )}
                                          {entry.fatG !== null && entry.fatG !== undefined && (
                                            <span>L: {entry.fatG}g</span>
                                          )}
                                          {entry.carbsG !== null && entry.carbsG !== undefined && (
                                            <span>K: {entry.carbsG}g</span>
                                          )}
                                          {entry.waterMl !== null && entry.waterMl !== undefined && entry.waterMl > 0 && (
                                            <span>Air: {entry.waterMl}ml</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                      <span className="text-xs font-bold font-mono text-[var(--accent-primary)] tabular-nums">
                                        {formatNumber(entry.calories)} kkal
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditingEntry(entry)}
                                          className="p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white"
                                          title="Edit"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(`Hapus catatan "${entry.name}"?`)) {
                                              deleteMutation.mutate(entry.id);
                                            }
                                          }}
                                          className="p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-default)] text-rose-400 hover:bg-rose-500/10"
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Standard Project-wide Pagination for Daily View */}
                <Pagination
                  currentPage={historyPage}
                  totalPages={totalDailyPages}
                  totalItems={displayDailyList.length}
                  pageSize={historyPageSize}
                  onPageChange={setHistoryPage}
                  onPageSizeChange={(newSize) => {
                    setHistoryPageSize(newSize);
                    setHistoryPage(1);
                  }}
                  pageSizeOptions={[5, 10, 15, 20]}
                  itemLabel="hari"
                />
              </div>
            )}

            {/* ============================================================ */}
            {/* SUB-VIEW 2: SEMUA CATATAN ITEM (ITEMIZED LIST) */}
            {/* ============================================================ */}
            {historyViewMode === 'ENTRIES' && (
              <div className="space-y-4">
                {/* Filter and Search Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Type Filter Buttons */}
                  <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryTypeFilter('ALL');
                        setHistoryPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        historyTypeFilter === 'ALL'
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      Semua ({historyData?.entries?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryTypeFilter('FOOD');
                        setHistoryPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        historyTypeFilter === 'FOOD'
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      Makanan ({(historyData?.entries || []).filter((e) => e.type === 'FOOD').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryTypeFilter('DRINK');
                        setHistoryPage(1);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        historyTypeFilter === 'DRINK'
                          ? 'bg-[#4CD6DE] text-slate-950 font-extrabold'
                          : 'text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      Minuman ({(historyData?.entries || []).filter((e) => e.type === 'DRINK').length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama makanan/minuman..."
                      value={historySearch}
                      onChange={(e) => {
                        setHistorySearch(e.target.value);
                        setHistoryPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                {/* Item List */}
                {isHistoryLoading ? (
                  <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                    Memuat daftar catatan...
                  </div>
                ) : paginatedEntriesList.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] space-y-2">
                    <Utensils className="w-8 h-8 text-[var(--text-tertiary)] mx-auto opacity-40" />
                    <p className="text-xs text-[var(--text-secondary)]">
                      Tidak ada catatan konsumsi yang cocok dengan filter.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {paginatedEntriesList.map((entry) => {
                      const d = new Date(entry.consumedAt);
                      const fullFormatted = !isNaN(d.getTime())
                        ? `${d.toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} • ${new Intl.DateTimeFormat('id-ID', {
                            timeZone: 'Asia/Jakarta',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).format(d).replace('.', ':')} WIB`
                        : '-';

                      return (
                        <div
                          key={entry.id}
                          className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] hover:border-[var(--accent-primary)]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                entry.type === 'DRINK'
                                  ? 'bg-[#4CD6DE]/10 text-[#4CD6DE] border border-[#4CD6DE]/20'
                                  : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20'
                              }`}
                            >
                              {entry.type === 'DRINK' ? (
                                <Droplets className="w-4 h-4" />
                              ) : (
                                <Utensils className="w-4 h-4" />
                              )}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-[var(--text-tertiary)] flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {fullFormatted}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                                  {entry.quantity} {entry.unit}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-white truncate">{entry.name}</h4>

                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                                {entry.proteinG !== null && entry.proteinG !== undefined && (
                                  <span className="text-[var(--accent-primary)] font-medium">
                                    P: {entry.proteinG}g
                                  </span>
                                )}
                                {entry.fatG !== null && entry.fatG !== undefined && (
                                  <span className="text-[#FFA726] font-medium">
                                    L: {entry.fatG}g
                                  </span>
                                )}
                                {entry.carbsG !== null && entry.carbsG !== undefined && (
                                  <span className="text-[#9B7CF6] font-medium">
                                    K: {entry.carbsG}g
                                  </span>
                                )}
                                {entry.waterMl !== null && entry.waterMl !== undefined && entry.waterMl > 0 && (
                                  <span className="text-[#4CD6DE] font-medium">
                                    Air: {entry.waterMl}ml
                                  </span>
                                )}
                                {entry.notes && (
                                  <span className="text-[var(--text-tertiary)] italic truncate max-w-[200px]">
                                    • {entry.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-default)]/60">
                            <span className="text-base font-bold font-mono text-[var(--accent-primary)] tabular-nums block">
                              {formatNumber(entry.calories)} kkal
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingEntry(entry)}
                                title="Edit Catatan"
                                className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus catatan "${entry.name}"?`)) {
                                    deleteMutation.mutate(entry.id);
                                  }
                                }}
                                title="Hapus Catatan"
                                className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Standard Project-wide Pagination for Itemized View */}
                <Pagination
                  currentPage={historyPage}
                  totalPages={totalEntriesPages}
                  totalItems={allHistoryEntries.length}
                  pageSize={historyPageSize}
                  onPageChange={setHistoryPage}
                  onPageSizeChange={(newSize) => {
                    setHistoryPageSize(newSize);
                    setHistoryPage(1);
                  }}
                  pageSizeOptions={[5, 10, 15, 20]}
                  itemLabel="catatan"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Food Modal */}
      <EditFoodModal
        isOpen={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={async (id, data) => {
          await updateMutation.mutateAsync({ id, data });
        }}
        isSubmitting={updateMutation.isPending}
      />
    </AppShell>
  );
}
