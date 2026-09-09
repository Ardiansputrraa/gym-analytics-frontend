'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/common/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { Divider } from '@/components/ui/Divider';
import { Button } from '@/components/ui/Button';
import { TimelineEntry } from '@/components/ui/TimelineEntry';
import { Pagination } from '@/components/ui/Pagination';
import { formatNumber } from '@/lib/utils';
import {
  Flame,
  Utensils,
  Droplets,
  PieChart,
  GlassWater,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BarChart3,
  Sparkles,
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
  Legend,
  Area,
} from 'recharts';
import { toast } from 'sonner';

export type NutritionTimeframe = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';
export type ChartMetricView = 'CALORIES' | 'WATER' | 'MACROS';

export interface MealLogItem {
  id: string;
  time: string;
  type: 'FOOD' | 'DRINK';
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  waterMl?: number;
  quantity?: string;
}

export interface DayNutritionSummary {
  date: string; // YYYY-MM-DD
  displayDate: string;
  dayName: string;
  totalCalories: number;
  totalWaterMl: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  status: 'ON_TRACK' | 'SURPLUS' | 'UNDER';
  logs: MealLogItem[];
}

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

// Initial Sample Data for Today
const dummyDayLogsToday: MealLogItem[] = [
  {
    id: 'n-1',
    time: '07:30',
    type: 'DRINK',
    name: 'Air Mineral Pagi (Gelas Besar)',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    waterMl: 600,
  },
  {
    id: 'n-2',
    time: '08:00',
    type: 'FOOD',
    name: 'Sarapan: Oatmeal 80g & Telur Rebus 3 Butir',
    calories: 420,
    protein: 26,
    fat: 14,
    carbs: 48,
    quantity: '1 porsi',
  },
  {
    id: 'n-3',
    time: '11:00',
    type: 'DRINK',
    name: 'Air Mineral Botol',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    waterMl: 600,
  },
  {
    id: 'n-4',
    time: '13:15',
    type: 'FOOD',
    name: 'Makan Siang: Nasi Merah 150g, Dada Ayam 200g, Brokoli',
    calories: 680,
    protein: 58,
    fat: 14,
    carbs: 72,
    quantity: '350 gram',
  },
  {
    id: 'n-5',
    time: '16:30',
    type: 'DRINK',
    name: 'Air Mineral + Es Segar',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    waterMl: 500,
  },
  {
    id: 'n-6',
    time: '18:45',
    type: 'DRINK',
    name: 'Air Mineral Saat Workout',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    waterMl: 800,
  },
  {
    id: 'n-7',
    time: '20:30',
    type: 'FOOD',
    name: 'Makan Malam: Daging Sapi Tumis 150g & Tumis Jamur',
    calories: 540,
    protein: 44,
    fat: 22,
    carbs: 22,
    quantity: '250 gram',
  },
];

// Helper to generate realistic daily logs for any selected month across 5 years
function generateMonthHistory(monthKey: string): DayNutritionSummary[] {
  const [year, monthStr] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, monthStr, 0).getDate();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const results: DayNutritionSummary[] = [];

  // Limit September 2026 to up to day 9 (today), otherwise show all days of the month
  const maxDay = monthKey === '2026-09' ? 9 : daysInMonth;

  for (let day = maxDay; day >= 1; day--) {
    const d = new Date(year, monthStr - 1, day);
    const dayOfWeek = dayNames[d.getDay()];
    const padDay = day < 10 ? `0${day}` : `${day}`;
    const padMonth = monthStr < 10 ? `0${monthStr}` : `${monthStr}`;
    const dateStr = `${year}-${padMonth}-${padDay}`;
    const displayDate = `${padDay} ${monthNames[monthStr - 1]} ${year}`;

    // Base variance algorithm for authenticity
    const seed = (day * 17 + monthStr * 31 + year * 11) % 100;
    const isToday = monthKey === '2026-09' && day === 9;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    let cal = 2450 + (seed % 280);
    let water = 3200 + ((seed * 7) % 600);
    let prot = 200 + (seed % 20);
    let fat = 68 + (seed % 14);
    let carbs = 260 + (seed % 35);
    let status: 'ON_TRACK' | 'SURPLUS' | 'UNDER' = 'ON_TRACK';

    if (isToday) {
      cal = 1640;
      water = 2500;
      prot = 128;
      fat = 50;
      carbs = 142;
    } else if (isWeekend && seed > 70) {
      cal = 2780;
      status = 'SURPLUS';
      fat = 82;
      carbs = 305;
    }

    const dayLogs: MealLogItem[] = isToday
      ? dummyDayLogsToday
      : [
          {
            id: `log-${dateStr}-1`,
            time: '07:30',
            type: 'DRINK',
            name: 'Air Mineral Pagi (Botol 600ml)',
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            waterMl: 600,
          },
          {
            id: `log-${dateStr}-2`,
            time: '08:15',
            type: 'FOOD',
            name: 'Sarapan: Oatmeal & Telur Rebus 3 Butir',
            calories: 450,
            protein: 28,
            fat: 16,
            carbs: 48,
            quantity: '1 Porsi',
          },
          {
            id: `log-${dateStr}-3`,
            time: '12:30',
            type: 'FOOD',
            name: 'Makan Siang: Nasi Merah & Dada Ayam Panggang 220g',
            calories: 720,
            protein: 62,
            fat: 14,
            carbs: 76,
            quantity: '380g',
          },
          {
            id: `log-${dateStr}-4`,
            time: '15:30',
            type: 'DRINK',
            name: 'Air Mineral Dingin',
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            waterMl: 1000,
          },
          {
            id: `log-${dateStr}-5`,
            time: '18:30',
            type: 'DRINK',
            name: 'Air Mineral Sesi Workout',
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            waterMl: 1000,
          },
          {
            id: `log-${dateStr}-6`,
            time: '20:00',
            type: 'FOOD',
            name: 'Makan Malam: Daging Sapi Tumis / Salmon Panggang',
            calories: Math.max(450, cal - 1620),
            protein: Math.max(35, prot - 90),
            fat: Math.max(15, fat - 30),
            carbs: Math.max(20, carbs - 124),
            quantity: '250g',
          },
          {
            id: `log-${dateStr}-7`,
            time: '22:00',
            type: 'DRINK',
            name: 'Air Mineral Malam',
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            waterMl: Math.max(400, water - 2600),
          },
        ];

    results.push({
      date: dateStr,
      displayDate,
      dayName: isToday ? 'Hari Ini (Rabu)' : dayOfWeek,
      totalCalories: cal,
      totalWaterMl: water,
      totalProtein: prot,
      totalFat: fat,
      totalCarbs: carbs,
      status,
      logs: dayLogs,
    });
  }

  return results;
}

// Generate 12 months summary for any of the past 5 years
function generateYearlySummary(yearStr: string) {
  const year = Number(yearStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  return months.map((m, idx) => {
    const monthNum = idx + 1;
    const seed = (year * 13 + monthNum * 29) % 100;
    const cal = 2480 + (seed % 220);
    const water = 3200 + ((seed * 5) % 550);
    const prot = 195 + (seed % 18);
    const fat = 68 + (seed % 12);
    const carbs = 265 + (seed % 28);

    return {
      label: `${m}`,
      fullLabel: `${m} ${year}`,
      calories: cal,
      water,
      protein: prot,
      fat,
      carbs,
      targetCalories: 2588,
      targetWater: 3500,
    };
  });
}

// Custom Elegant Glassmorphic Telemetry Tooltip for Recharts
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  metricType: ChartMetricView;
  targetCalories: number;
  targetWater: number;
}

function CustomTelemetryTooltip({
  active,
  payload,
  label,
  metricType,
  targetCalories,
  targetWater,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const primaryValue = payload[0]?.value ?? 0;

  return (
    <div className="rounded-[8px] border border-[var(--border-default)] bg-[#181816]/95 backdrop-blur-md p-3.5 shadow-2xl space-y-2 min-w-[200px]">
      <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-1.5">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-tertiary)] font-mono">
          TELEMETRY
        </span>
      </div>

      {metricType === 'CALORIES' && (
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Kalori:</span>
            <span className="text-sm font-bold font-[var(--font-display)] text-[var(--accent-primary)] tabular-nums">
              {formatNumber(primaryValue)} <span className="text-xs font-normal">kkal</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 text-[var(--text-secondary)]">
            <span>Target Defisit:</span>
            <span className="font-semibold text-[var(--accent-secondary)] tabular-nums">
              {formatNumber(targetCalories)} kkal
            </span>
          </div>
          <div className="text-[10px] pt-1 border-t border-[var(--border-default)]/40 text-[var(--text-tertiary)]">
            {primaryValue <= targetCalories ? (
              <span className="text-[var(--color-moss-600)] font-medium flex items-center gap-1">
                ✓ Defisit terjaga (-{targetCalories - primaryValue} kkal)
              </span>
            ) : (
              <span className="text-[var(--accent-primary)] font-medium">
                Surplus +{primaryValue - targetCalories} kkal
              </span>
            )}
          </div>
        </div>
      )}

      {metricType === 'WATER' && (
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Hidrasi Air:</span>
            <span className="text-sm font-bold font-[var(--font-display)] text-sky-400 tabular-nums">
              {formatNumber(primaryValue)} <span className="text-xs font-normal">ml</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 text-[var(--text-secondary)]">
            <span>Target Harian:</span>
            <span className="font-semibold text-sky-300 tabular-nums">{formatNumber(targetWater)} ml</span>
          </div>
          <div className="text-[10px] pt-1 border-t border-[var(--border-default)]/40">
            {primaryValue >= targetWater ? (
              <span className="text-sky-400 font-medium">✓ Target 3.5L Tercapai ({Math.round((primaryValue / targetWater) * 100)}%)</span>
            ) : (
              <span className="text-[var(--text-secondary)]">Kurang {targetWater - primaryValue} ml</span>
            )}
          </div>
        </div>
      )}

      {metricType === 'MACROS' && (
        <div className="space-y-1.5 pt-0.5">
          {payload.map((item) => (
            <div key={item.dataKey} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-bold tabular-nums text-[var(--text-primary)]">
                {item.value}g
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NutritionPage() {
  // Timeframe, Year (5 Years Back), and Month Selection
  const [timeframe, setTimeframe] = useState<NutritionTimeframe>('TODAY');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonthPart, setSelectedMonthPart] = useState<string>('09');
  const [chartMetric, setChartMetric] = useState<ChartMetricView>('CALORIES');

  // Today's active log items
  const [todayLogs, setTodayLogs] = useState<MealLogItem[]>(dummyDayLogsToday);
  const [logFilter, setLogFilter] = useState<'ALL' | 'FOOD' | 'DRINK'>('ALL');

  // Expandable day in history list
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Modals state
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);

  // Food Form state (Complete with Carbs, Fat, Protein, Calories)
  const [foodName, setFoodName] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');

  // Drink Form state (Pure Hydration / Water Input)
  const [drinkName, setDrinkName] = useState('');
  const [drinkWaterMl, setDrinkWaterMl] = useState('500');

  // Targets
  const targetCalories = 2588;
  const targetWaterMl = 3500; // 3.5 Liters
  const targetProtein = 208; // 2.0g/kg for 104.1kg
  const targetFat = 72;
  const targetCarbs = 280;

  // Real-time totals from today's logs
  const totalConsumedCalories = todayLogs.reduce((acc, item) => acc + item.calories, 0);
  const totalConsumedWater = todayLogs.reduce((acc, item) => acc + (item.waterMl || 0), 0);
  const totalProtein = todayLogs.reduce((acc, item) => acc + item.protein, 0);
  const totalFat = todayLogs.reduce((acc, item) => acc + item.fat, 0);
  const totalCarbs = todayLogs.reduce((acc, item) => acc + item.carbs, 0);

  const remainingCalories = targetCalories - totalConsumedCalories;
  const remainingWater = targetWaterMl - totalConsumedWater;

  // Selected combined month key (e.g. "2026-09", "2024-03")
  const activeMonthKey = `${selectedYear}-${selectedMonthPart}`;

  // Pagination states for history list
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(6);

  // History dataset based on selected timeframe & 5-year selection
  const activeHistoryList: DayNutritionSummary[] = React.useMemo(() => {
    if (timeframe === 'WEEK') {
      const sepLogs = generateMonthHistory('2026-09');
      return sepLogs.slice(0, 7);
    }
    if (timeframe === 'MONTH') {
      return generateMonthHistory(activeMonthKey);
    }
    return generateMonthHistory(`${selectedYear}-09`);
  }, [timeframe, activeMonthKey, selectedYear]);

  // Reset historyPage when timeframe/filter changes
  React.useEffect(() => {
    setHistoryPage(1);
  }, [timeframe, activeMonthKey, selectedYear]);

  // Paginated History List
  const totalHistoryPages = Math.ceil(activeHistoryList.length / historyPageSize) || 1;
  const paginatedHistoryList = React.useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return activeHistoryList.slice(start, start + historyPageSize);
  }, [activeHistoryList, historyPage, historyPageSize]);

  // Aggregate stats for the selected period
  const aggregateStats = React.useMemo(() => {
    if (timeframe === 'YEAR') {
      const yearlyList = generateYearlySummary(selectedYear);
      const sumCal = yearlyList.reduce((acc, d) => acc + d.calories, 0);
      const sumWater = yearlyList.reduce((acc, d) => acc + d.water, 0);
      const sumProt = yearlyList.reduce((acc, d) => acc + d.protein, 0);
      const calArray = yearlyList.map((d) => d.calories);

      return {
        avgCalories: Math.round(sumCal / yearlyList.length),
        avgWater: Math.round(sumWater / yearlyList.length),
        avgProtein: Math.round(sumProt / yearlyList.length),
        complianceRate: 92,
        maxCal: Math.max(...calArray),
        minCal: Math.min(...calArray),
      };
    }

    if (activeHistoryList.length === 0) {
      return { avgCalories: targetCalories, avgWater: targetWaterMl, avgProtein: targetProtein, complianceRate: 100, maxCal: targetCalories, minCal: targetCalories };
    }
    const sumCal = activeHistoryList.reduce((acc, d) => acc + d.totalCalories, 0);
    const sumWater = activeHistoryList.reduce((acc, d) => acc + d.totalWaterMl, 0);
    const sumProt = activeHistoryList.reduce((acc, d) => acc + d.totalProtein, 0);
    const onTrackDays = activeHistoryList.filter((d) => d.status === 'ON_TRACK').length;

    const calArray = activeHistoryList.map((d) => d.totalCalories);
    const maxCal = Math.max(...calArray);
    const minCal = Math.min(...calArray);

    return {
      avgCalories: Math.round(sumCal / activeHistoryList.length),
      avgWater: Math.round(sumWater / activeHistoryList.length),
      avgProtein: Math.round(sumProt / activeHistoryList.length),
      complianceRate: Math.round((onTrackDays / activeHistoryList.length) * 100),
      maxCal,
      minCal,
    };
  }, [timeframe, activeHistoryList, selectedYear, targetCalories, targetWaterMl, targetProtein]);

  // Chart dataset transformation
  const chartData = React.useMemo(() => {
    if (timeframe === 'YEAR') {
      return generateYearlySummary(selectedYear);
    }
    return [...activeHistoryList]
      .reverse()
      .map((item) => ({
        label: item.displayDate.split(' ').slice(0, 2).join(' '),
        calories: item.totalCalories,
        targetCalories: targetCalories,
        water: item.totalWaterMl,
        targetWater: targetWaterMl,
        protein: item.totalProtein,
        fat: item.totalFat,
        carbs: item.totalCarbs,
      }));
  }, [timeframe, selectedYear, activeHistoryList, targetCalories, targetWaterMl]);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MealLogItem = {
      id: `food-${Date.now()}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'FOOD',
      name: foodName,
      quantity: foodQuantity || undefined,
      calories: Number(foodCalories) || 0,
      protein: Number(foodProtein) || 0,
      fat: Number(foodFat) || 0,
      carbs: Number(foodCarbs) || 0,
    };
    setTodayLogs([newEntry, ...todayLogs]);
    toast.success(`Makanan "${foodName}" berhasil dicatat!`);
    setIsFoodModalOpen(false);
    setFoodName('');
    setFoodQuantity('');
    setFoodCalories('');
    setFoodProtein('');
    setFoodFat('');
    setFoodCarbs('');
  };

  const handleAddDrink = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MealLogItem = {
      id: `drink-${Date.now()}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'DRINK',
      name: drinkName || 'Air Mineral',
      waterMl: Number(drinkWaterMl) || 0,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };
    setTodayLogs([newEntry, ...todayLogs]);
    toast.success(`Air Minum "${newEntry.name}" (${newEntry.waterMl} ml) berhasil dicatat!`);
    setIsDrinkModalOpen(false);
    setDrinkName('');
    setDrinkWaterMl('500');
  };

  const filteredTodayLogs = todayLogs.filter((item) => {
    if (logFilter === 'ALL') return true;
    return item.type === logFilter;
  });

  const toggleExpandDay = (date: string) => {
    setExpandedDay((prev) => (prev === date ? null : date));
  };

  const selectedMonthObj = MONTH_NAMES.find((m) => m.num === selectedMonthPart);

  return (
    <AppShell>
      {/* ============================================================ */}
      {/* 1. Header & Quick Action Buttons */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
            Nutrisi, Kalori & Hidrasi Air
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
            Pencatatan harian terpisah untuk makanan, asupan air minum, serta riwayat historis nutrisi 5 tahun.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Button Catat Minuman */}
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsDrinkModalOpen(true)}
            className="border-sky-500/50 text-sky-400 hover:bg-sky-500/10"
          >
            <Droplets className="w-4 h-4 mr-1.5" />
            + Catat Minuman / Air
          </Button>

          {/* Button Catat Makanan */}
          <Button variant="primary" size="md" onClick={() => setIsFoodModalOpen(true)}>
            <Utensils className="w-4 h-4 mr-1.5" />
            + Catat Makanan
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Global Timeframe Selector: Hari Ini | 7 Hari | Sebulan | 1 Tahun (5 Tahun Ke Belakang) */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Periode Riwayat:
            </span>
          </div>

          <div className="flex rounded-[4px] bg-[var(--bg-base)] p-1 gap-1 border border-[var(--border-default)]">
            {[
              { key: 'TODAY', label: 'Hari Ini' },
              { key: 'WEEK', label: '7 Hari Terakhir' },
              { key: 'MONTH', label: 'Sebulan' },
              { key: 'YEAR', label: `1 Tahun (${selectedYear})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTimeframe(tab.key as NutritionTimeframe)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all cursor-pointer ${
                  timeframe === tab.key
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] font-bold shadow-sm'
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] font-medium">Pilih Tahun (5 Tahun Terakhir):</span>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                aria-label="Pilih Tahun Riwayat Nutrisi"
                className="pl-3 pr-8 py-1.5 rounded-[4px] border border-[var(--accent-primary)]/50 bg-[var(--bg-base)] text-xs text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer appearance-none shadow-sm"
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
          <div className="flex flex-wrap items-center gap-2.5">
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
                  className="pl-2.5 pr-7 py-1.5 rounded-[4px] border border-[var(--accent-primary)]/50 bg-[var(--bg-base)] text-xs text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer appearance-none shadow-sm"
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

      {/* ============================================================ */}
      {/* 3. TODAY VIEW: Real-time Metric Cards & Progress Bars */}
      {/* ============================================================ */}
      {timeframe === 'TODAY' && (
        <>
          {/* Hero Metric Cards for Today */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Kalori Terkonsumsi"
              value={formatNumber(totalConsumedCalories)}
              unit={`/ ${formatNumber(targetCalories)} kkal`}
              subValue={
                remainingCalories >= 0
                  ? `Sisa: ${formatNumber(remainingCalories)} kkal`
                  : `Kelebihan: +${formatNumber(Math.abs(remainingCalories))} kkal`
              }
              icon={<Flame className="w-4 h-4 text-[var(--accent-primary)]" />}
            />

            <MetricCard
              label="Asupan Air Minum (Hidrasi)"
              value={formatNumber(totalConsumedWater)}
              unit={`/ ${formatNumber(targetWaterMl)} ml`}
              subValue={
                remainingWater >= 0
                  ? `Sisa: ${formatNumber(remainingWater)} ml`
                  : `Target Tercapai (+${formatNumber(Math.abs(remainingWater))} ml)`
              }
              icon={<Droplets className="w-4 h-4 text-sky-400" />}
            />

            <MetricCard
              label="Protein Harian"
              value={formatNumber(totalProtein)}
              unit={`/ ${targetProtein}g`}
              subValue={`Target: 2.0g/kg (${Math.round((totalProtein / targetProtein) * 100)}%)`}
              icon={<PieChart className="w-4 h-4 text-[var(--accent-secondary)]" />}
            />

            <MetricCard
              label="Lemak & Karbohidrat"
              value={`${totalFat}g / ${totalCarbs}g`}
              subValue={`Target: ${targetFat}g Lemak · ${targetCarbs}g Karbo`}
              icon={<Utensils className="w-4 h-4 text-[var(--color-moss-600)]" />}
            />
          </div>

          <Divider thick />

          {/* Primary Progress Bars: 1. Daily Calories & 2. Daily Water Intake */}
          <section className="my-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Progress Bar 1: Kalori Harian */}
            <div className="p-5 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[var(--accent-primary)]" />
                  Progres Kalori Harian
                </h3>
                <span className="text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
                  {Math.round((totalConsumedCalories / targetCalories) * 100)}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-default)]">
                  <div
                    className="h-full bg-gradient-to-r from-[#D64317] to-[var(--accent-primary)] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(240,90,40,0.3)]"
                    style={{
                      width: `${Math.min(100, (totalConsumedCalories / targetCalories) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-[var(--text-tertiary)] pt-1">
                  <span>Terkonsumsi: {formatNumber(totalConsumedCalories)} kkal</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    Target: {formatNumber(targetCalories)} kkal
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar 2: Hidrasi Air Harian */}
            <div className="p-5 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  Progres Hidrasi Air Minum
                </h3>
                <span className="text-xs font-semibold tabular-nums text-sky-400">
                  {Math.round((totalConsumedWater / targetWaterMl) * 100)}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-default)]">
                  <div
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                    style={{
                      width: `${Math.min(100, (totalConsumedWater / targetWaterMl) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-[var(--text-tertiary)] pt-1">
                  <span>Diminum: {formatNumber(totalConsumedWater)} ml</span>
                  <span className="font-bold text-sky-400">
                    Target: {formatNumber(targetWaterMl)} ml (3.5L)
                  </span>
                </div>
              </div>
            </div>
          </section>

          <Divider thick />

          {/* Today's Log Feed & Filter Section */}
          <section className="my-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--accent-secondary)]" />
                  Log Aktivitas Nutrisi & Air Hari Ini
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">Kronologi asupan makanan dan hidrasi hari ini.</p>
              </div>

              {/* Filter Pills */}
              <div className="flex rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] p-1 text-xs">
                {(['ALL', 'FOOD', 'DRINK'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLogFilter(tab)}
                    className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors cursor-pointer ${
                      logFilter === tab
                        ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab === 'ALL' ? 'Semua Log' : tab === 'FOOD' ? 'Makanan Saja' : 'Air Minum'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border border-[var(--border-default)] bg-[var(--bg-surface)]/40 rounded-[6px]">
              {filteredTodayLogs.map((item, idx) => (
                <TimelineEntry
                  key={item.id}
                  time={item.time}
                  type={item.type}
                  title={item.name}
                  subtitle={
                    item.type === 'FOOD'
                      ? `${item.calories} kkal · Protein: ${item.protein}g · Lemak: ${item.fat}g · Karbo: ${item.carbs}g ${item.quantity ? `(${item.quantity})` : ''}`
                      : `${item.waterMl} ml air`
                  }
                  isLast={idx === filteredTodayLogs.length - 1}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* ============================================================ */}
      {/* 4. AGGREGATE VIEW (7 HARI / SEBULAN / 1 TAHUN DENGAN FILTER 5 TAHUN) */}
      {/* ============================================================ */}
      {timeframe !== 'TODAY' && (
        <div className="space-y-6">
          {/* Summary Metric Cards for Selected Timeframe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Rata-rata Kalori Harian"
              value={formatNumber(aggregateStats.avgCalories)}
              unit="kkal/hari"
              subValue={`Target: ${formatNumber(targetCalories)} kkal`}
              icon={<Flame className="w-4 h-4 text-[var(--accent-primary)]" />}
            />

            <MetricCard
              label="Rata-rata Asupan Air"
              value={formatNumber(aggregateStats.avgWater)}
              unit="ml/hari"
              subValue={`Target: ${formatNumber(targetWaterMl)} ml (3.5L)`}
              icon={<Droplets className="w-4 h-4 text-sky-400" />}
            />

            <MetricCard
              label="Rata-rata Protein"
              value={`${aggregateStats.avgProtein}`}
              unit="g/hari"
              subValue={`Target: ${targetProtein}g/hari (2.0g/kg)`}
              icon={<PieChart className="w-4 h-4 text-[var(--accent-secondary)]" />}
            />

            <MetricCard
              label="Kepatuhan Defisit Target"
              value={`${aggregateStats.complianceRate}%`}
              unit="On Track"
              subValue={
                timeframe === 'YEAR'
                  ? `12 Bulan evaluasi di tahun ${selectedYear}`
                  : `${activeHistoryList.length} hari tercatat di periode ini`
              }
              icon={<CheckCircle2 className="w-4 h-4 text-[var(--color-moss-600)]" />}
            />
          </div>

          <Divider thick />

          {/* ============================================================ */}
          {/* HIGH-END ELEGANT RECHARTS TELEMETRY CHART */}
          {/* ============================================================ */}
          <section className="p-5 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-default)]/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[4px] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                      Grafik Analitik Nutrisi & Telemetri Hidrasi
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {timeframe === 'WEEK'
                        ? 'Periode 7 Hari Terakhir'
                        : timeframe === 'MONTH'
                        ? `Periode Bulan ${selectedMonthObj?.name} ${selectedYear}`
                        : `Periode 12 Bulan Sepanjang Tahun ${selectedYear}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Metric Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-[4px] bg-[var(--bg-base)] p-1 text-xs border border-[var(--border-default)]">
                  {[
                    { key: 'CALORIES', label: 'Kalori (kkal)' },
                    { key: 'WATER', label: 'Hidrasi (ml)' },
                    { key: 'MACROS', label: 'Makronutrisi (g)' },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setChartMetric(m.key as ChartMetricView)}
                      className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                        chartMetric === m.key
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] font-bold shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Micro-Telemetry Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">
                  Rata-rata {chartMetric === 'CALORIES' ? 'Kalori' : chartMetric === 'WATER' ? 'Air' : 'Protein'}
                </span>
                <span className="text-sm font-bold font-[var(--font-display)] text-[var(--text-primary)] tabular-nums">
                  {chartMetric === 'CALORIES'
                    ? `${formatNumber(aggregateStats.avgCalories)} kkal`
                    : chartMetric === 'WATER'
                    ? `${formatNumber(aggregateStats.avgWater)} ml`
                    : `${aggregateStats.avgProtein}g`}
                </span>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">Puncak Tertinggi</span>
                <span className="text-sm font-bold font-[var(--font-display)] text-[var(--accent-primary)] tabular-nums">
                  {chartMetric === 'CALORIES'
                    ? `${formatNumber(aggregateStats.maxCal)} kkal`
                    : chartMetric === 'WATER'
                    ? '3.700 ml'
                    : '215g'}
                </span>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">Titik Terendah</span>
                <span className="text-sm font-bold font-[var(--font-display)] text-[var(--color-moss-600)] tabular-nums">
                  {chartMetric === 'CALORIES'
                    ? `${formatNumber(aggregateStats.minCal)} kkal`
                    : chartMetric === 'WATER'
                    ? '2.500 ml'
                    : '128g'}
                </span>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">Kepatuhan Target</span>
                  <span className="text-sm font-bold font-[var(--font-display)] text-[var(--accent-secondary)] tabular-nums">
                    {aggregateStats.complianceRate}%
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-[var(--accent-secondary)] opacity-70" />
              </div>
            </div>

            {/* Recharts Chart Container with Custom SVG Gradients */}
            <div className="h-[300px] w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'CALORIES' ? (
                  <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="calorieBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F05A28" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#A3320B" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="calorieAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F05A28" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#F05A28" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="4 4" stroke="#333330" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#888880"
                      tick={{ fill: '#888880', fontSize: 11, fontFamily: 'var(--font-sans)' }}
                      axisLine={{ stroke: '#333330' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#888880"
                      tick={{ fill: '#888880', fontSize: 11, fontFamily: 'var(--font-display)' }}
                      axisLine={{ stroke: '#333330' }}
                      tickLine={false}
                      domain={[1400, 3200]}
                    />

                    <Tooltip
                      content={
                        <CustomTelemetryTooltip
                          metricType="CALORIES"
                          targetCalories={targetCalories}
                          targetWater={targetWaterMl}
                        />
                      }
                    />

                    <ReferenceLine
                      y={targetCalories}
                      stroke="#E6C659"
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      label={{
                        value: `Target Defisit: ${targetCalories} kkal`,
                        fill: '#E6C659',
                        fontSize: 10,
                        position: 'insideTopRight',
                        fontWeight: 'bold',
                      }}
                    />

                    {/* Area under curve for ambient lighting */}
                    <Area
                      type="monotone"
                      dataKey="calories"
                      fill="url(#calorieAreaGrad)"
                      stroke="none"
                    />

                    {/* Sleek industrial bars with background slot */}
                    <Bar
                      dataKey="calories"
                      fill="url(#calorieBarGrad)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                      background={{ fill: 'rgba(255, 255, 255, 0.02)', radius: 6 }}
                    />
                  </ComposedChart>
                ) : chartMetric === 'WATER' ? (
                  <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="waterBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#0369a1" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="waterAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="4 4" stroke="#333330" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#888880"
                      tick={{ fill: '#888880', fontSize: 11 }}
                      axisLine={{ stroke: '#333330' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#888880"
                      tick={{ fill: '#888880', fontSize: 11 }}
                      axisLine={{ stroke: '#333330' }}
                      tickLine={false}
                      domain={[0, 4500]}
                    />

                    <Tooltip
                      content={
                        <CustomTelemetryTooltip
                          metricType="WATER"
                          targetCalories={targetCalories}
                          targetWater={targetWaterMl}
                        />
                      }
                    />

                    <ReferenceLine
                      y={targetWaterMl}
                      stroke="#38bdf8"
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                      label={{
                        value: `Target Hidrasi: 3.500 ml`,
                        fill: '#38bdf8',
                        fontSize: 10,
                        position: 'insideTopRight',
                        fontWeight: 'bold',
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="water"
                      fill="url(#waterAreaGrad)"
                      stroke="none"
                    />

                    <Bar
                      dataKey="water"
                      fill="url(#waterBarGrad)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                      background={{ fill: 'rgba(255, 255, 255, 0.02)', radius: 6 }}
                    />
                  </ComposedChart>
                ) : (
                  <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E6C659" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#E6C659" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="4 4" stroke="#333330" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#888880"
                      tick={{ fill: '#888880', fontSize: 11 }}
                      axisLine={{ stroke: '#333330' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#888880"
                      tick={{ fill: '#888880', fontSize: 11 }}
                      axisLine={{ stroke: '#333330' }}
                      tickLine={false}
                    />

                    <Tooltip
                      content={
                        <CustomTelemetryTooltip
                          metricType="MACROS"
                          targetCalories={targetCalories}
                          targetWater={targetWaterMl}
                        />
                      }
                    />

                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      formatter={(val) => <span className="text-xs text-[var(--text-secondary)]">{val}</span>}
                    />

                    <Area type="monotone" dataKey="protein" fill="url(#proteinGrad)" stroke="none" />
                    <Line
                      type="monotone"
                      dataKey="protein"
                      stroke="#E6C659"
                      strokeWidth={2.5}
                      name="Protein (g)"
                      dot={{ r: 3, fill: '#E6C659', stroke: '#1C1C1A', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, stroke: '#E6C659', strokeWidth: 2, fill: '#1C1C1A' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="carbs"
                      stroke="#4E6848"
                      strokeWidth={2}
                      name="Karbohidrat (g)"
                      dot={{ r: 3, fill: '#4E6848', stroke: '#1C1C1A', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, stroke: '#4E6848', strokeWidth: 2, fill: '#1C1C1A' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fat"
                      stroke="#F05A28"
                      strokeWidth={2}
                      name="Lemak (g)"
                      dot={{ r: 3, fill: '#F05A28', stroke: '#1C1C1A', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, stroke: '#F05A28', strokeWidth: 2, fill: '#1C1C1A' }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </section>

          <Divider thick />

          {/* ============================================================ */}
          {/* 5. Riwayat Aktivitas Log Nutrisi (Daily List / Monthly List) */}
          {/* ============================================================ */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--accent-secondary)]" />
                  Riwayat Aktivitas ({timeframe === 'YEAR' ? `12 Bulan (${selectedYear})` : `${activeHistoryList.length} Hari (${selectedMonthObj?.name} ${selectedYear})`})
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {timeframe === 'YEAR'
                    ? `Ringkasan performa nutrisi & hidrasi setiap bulan sepanjang tahun ${selectedYear}.`
                    : `Klik pada tanggal mana saja untuk melihat detail log makanan & asupan air.`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {paginatedHistoryList.map((day) => {
                const isExpanded = expandedDay === day.date;
                return (
                  <div
                    key={day.date}
                    className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] overflow-hidden transition-all hover:border-[var(--border-default)]/80"
                  >
                    {/* Day Summary Header Card */}
                    <div
                      onClick={() => toggleExpandDay(day.date)}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[var(--bg-base)]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] flex flex-col items-center justify-center text-center shadow-inner">
                          <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                            {day.displayDate.split(' ')[1]}
                          </span>
                          <span className="text-sm font-bold font-[var(--font-display)] text-[var(--text-primary)] leading-none">
                            {day.displayDate.split(' ')[0]}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--text-primary)] font-[var(--font-display)]">
                              {day.dayName}, {day.displayDate}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-[4px] uppercase ${
                                day.status === 'ON_TRACK'
                                  ? 'bg-[var(--color-moss-600)]/20 text-[var(--color-moss-600)] border border-[var(--color-moss-600)]/40'
                                  : 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40'
                              }`}
                            >
                              {day.status === 'ON_TRACK' ? 'Target Defisit OK' : 'Surplus'}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {day.logs.length > 0 ? `${day.logs.length} entri tercatat` : 'Ringkasan harian'}
                          </span>
                        </div>
                      </div>

                      {/* Summary Badges on the right */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Kalori</span>
                          <span className="font-bold tabular-nums text-[var(--text-primary)]">
                            {formatNumber(day.totalCalories)} kkal
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Air</span>
                          <span className="font-bold tabular-nums text-sky-400">
                            {formatNumber(day.totalWaterMl)} ml
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Makro (P/L/K)</span>
                          <span className="font-semibold tabular-nums text-[var(--text-secondary)]">
                            {day.totalProtein}g · {day.totalFat}g · {day.totalCarbs}g
                          </span>
                        </div>

                        <div className="pl-2">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Log Entries */}
                    {isExpanded && (
                      <div className="border-t border-[var(--border-default)] bg-[var(--bg-base)]/60 p-4 space-y-3 animate-in fade-in">
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                          Detail Log Makanan & Minuman ({day.displayDate}):
                        </span>

                        {day.logs.length === 0 ? (
                          <p className="text-xs text-[var(--text-secondary)] italic">
                            Tidak ada rincian item individu untuk tanggal historis ini.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {day.logs.map((item, idx) => (
                              <TimelineEntry
                                key={item.id}
                                time={item.time}
                                type={item.type}
                                title={item.name}
                                subtitle={
                                  item.type === 'FOOD'
                                    ? `${item.calories} kkal · Protein: ${item.protein}g · Lemak: ${item.fat}g · Karbo: ${item.carbs}g ${item.quantity ? `(${item.quantity})` : ''}`
                                    : `${item.waterMl} ml air`
                                }
                                isLast={idx === day.logs.length - 1}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nutrition History Pagination */}
            <Pagination
              currentPage={historyPage}
              totalPages={totalHistoryPages}
              totalItems={activeHistoryList.length}
              pageSize={historyPageSize}
              onPageChange={setHistoryPage}
              onPageSizeChange={(newSize) => {
                setHistoryPageSize(newSize);
                setHistoryPage(1);
              }}
              pageSizeOptions={[1, 5, 10, 15, 20]}
              itemLabel="hari log nutrisi"
            />
          </section>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: CATAT MAKANAN (Lengkap Kalori, Protein, Lemak, Karbo) */}
      {/* ============================================================ */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 rounded-[6px] space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[var(--accent-primary)]" />
                Catat Konsumsi Makanan
              </h3>
            </div>

            <form onSubmit={handleAddFood} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Nama Makanan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dada Ayam Panggang & Nasi Merah"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Porsi / Gramasi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 200 gram / 1 porsi"
                  value={foodQuantity}
                  onChange={(e) => setFoodQuantity(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--accent-primary)]">Kalori (kkal) *</label>
                  <input
                    type="number"
                    required
                    placeholder="450"
                    value={foodCalories}
                    onChange={(e) => setFoodCalories(e.target.value)}
                    className="w-full h-11 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-bold tabular-nums focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Protein (g) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="35"
                    value={foodProtein}
                    onChange={(e) => setFoodProtein(e.target.value)}
                    className="w-full h-11 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm tabular-nums focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Lemak (g) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="12"
                    value={foodFat}
                    onChange={(e) => setFoodFat(e.target.value)}
                    className="w-full h-11 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm tabular-nums focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Karbohidrat (g) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="45"
                    value={foodCarbs}
                    onChange={(e) => setFoodCarbs(e.target.value)}
                    className="w-full h-11 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm tabular-nums focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-default)]">
                <Button type="button" variant="secondary" size="md" onClick={() => setIsFoodModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Simpan Makanan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CATAT MINUMAN / AIR (Volume ml Saja) */}
      {/* ============================================================ */}
      {isDrinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 rounded-[6px] space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                <GlassWater className="w-5 h-5 text-sky-400" />
                Catat Minuman & Asupan Air
              </h3>
            </div>

            <form onSubmit={handleAddDrink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Nama Minuman (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Air Mineral / Air Dingin"
                  value={drinkName}
                  onChange={(e) => setDrinkName(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm focus:outline-none"
                />
              </div>

              {/* Volume Air (ml) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sky-400">Volume Air (ml) *</label>
                <input
                  type="number"
                  required
                  placeholder="500"
                  value={drinkWaterMl}
                  onChange={(e) => setDrinkWaterMl(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-base font-bold tabular-nums focus:outline-none font-[var(--font-display)]"
                />
                {/* Quick volume preset buttons: 100ml, 250ml, 500ml, 750ml, 1000ml */}
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {[100, 250, 500, 750, 1000].map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setDrinkWaterMl(vol.toString())}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                        drinkWaterMl === vol.toString()
                          ? 'border-sky-500 bg-sky-500/20 text-sky-400 font-bold'
                          : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/50'
                      }`}
                    >
                      {vol}ml
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-default)]">
                <Button type="button" variant="secondary" size="md" onClick={() => setIsDrinkModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" className="bg-sky-600 hover:bg-sky-500">
                  Simpan Air Minum
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
