'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/common/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { Divider } from '@/components/ui/Divider';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import {
  Scale,
  TrendingDown,
  Droplets,
  Dumbbell,
  FileSpreadsheet,
  ArrowRight,
  Activity,
  Sparkles,
  TrendingUp,
  Search,
  Calendar,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { bodyService } from '@/services/body.service';
import {
  BodyCompositionStatus,
  BodyMeasurement,
} from '@/types/body.types';

// Custom Telemetry Tooltip for Body Composition
interface BodyCompTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  metric: 'weightKg' | 'smmKg' | 'bodyFatKg';
}

function CustomBodyCompTooltip({ active, payload, label, metric }: BodyCompTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0]?.value;

  const metricLabel =
    metric === 'weightKg'
      ? 'Berat Total'
      : metric === 'smmKg'
      ? 'Otot Rangka (SMM)'
      : 'Massa Lemak (Body Fat)';
  const metricColor =
    metric === 'weightKg' ? '#FF6B2C' : metric === 'smmKg' ? '#4CD6DE' : '#FFA726';

  return (
    <div className="rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5 space-y-2 min-w-[200px] shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-1.5">
        <span className="text-xs font-bold text-[var(--text-secondary)]">{label}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-secondary)] font-mono font-bold">
          Data Komposisi
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-[var(--text-secondary)]">{metricLabel}:</span>
          <span
            className="text-base font-bold font-[var(--font-display)] tabular-nums"
            style={{ color: metricColor }}
          >
            {val !== null && val !== undefined ? `${val} kg` : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: BodyCompositionStatus, evaluation?: string | null) {
  const displayText =
    evaluation ||
    (status === 'PR_COMPOSITION'
      ? 'Rekor Komposisi'
      : status === 'MUSCLE_GAIN'
      ? 'Pertumbuhan Otot'
      : status === 'FAT_LOSS'
      ? 'Fat Loss Konsisten'
      : status === 'RECOMPOSITION'
      ? 'Body Recomposition'
      : 'Pemeliharaan Stabil');

  switch (status) {
    case 'PR_COMPOSITION':
      return (
        <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40">
          {displayText}
        </span>
      );
    case 'MUSCLE_GAIN':
      return (
        <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          {displayText}
        </span>
      );
    case 'FAT_LOSS':
      return (
        <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-[var(--color-moss-600)]/20 text-[var(--color-moss-600)] border border-[var(--color-moss-600)]/40">
          {displayText}
        </span>
      );
    case 'RECOMPOSITION':
      return (
        <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
          {displayText}
        </span>
      );
    default:
      return (
        <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-default)]">
          {displayText}
        </span>
      );
  }
}

export default function BodyCompositionPage() {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeChartMetric, setActiveChartMetric] = useState<'weightKg' | 'smmKg' | 'bodyFatKg'>('weightKg');

  // Table pagination & search state
  const [scanPage, setScanPage] = useState(1);
  const [scanPageSize, setScanPageSize] = useState(5);
  const [scanSearch, setScanSearch] = useState('');

  // Modals state
  const [deletingScan, setDeletingScan] = useState<BodyMeasurement | null>(null);

  // 1. Query: Analytics & Chart Data (with instant cache invalidation on focus/mount)
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
  } = useQuery({
    queryKey: ['body-composition-analytics', timeRange],
    queryFn: () => bodyService.getAnalytics(timeRange),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // 2. Query: Measurements History Table
  const {
    data: measurementsData,
    isLoading: isMeasurementsLoading,
  } = useQuery({
    queryKey: ['body-measurements', scanPage, scanPageSize, scanSearch],
    queryFn: () =>
      bodyService.getMeasurements({
        page: scanPage,
        limit: scanPageSize,
        search: scanSearch || undefined,
      }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // 3. Mutation: Delete Scan
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bodyService.deleteMeasurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-composition-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['body-measurements'] });
      setDeletingScan(null);
    },
  });

  const summary = analytics?.summary;
  const chartPeriod = analytics?.chartPeriod;
  const rawChartData = analytics?.chartData || [];

  // If there's only 1 point, duplicate with slightly earlier label or point so Recharts Area/Line renders smoothly
  const chartData = React.useMemo(() => {
    if (rawChartData.length === 1) {
      return [
        {
          ...rawChartData[0],
          displayDate: 'Awal',
        },
        rawChartData[0],
      ];
    }
    return rawChartData;
  }, [rawChartData]);

  // Computed stats for the active metric
  const metricStats = React.useMemo(() => {
    if (!rawChartData || rawChartData.length === 0) {
      const fallbackVal =
        activeChartMetric === 'weightKg'
          ? summary?.currentWeightKg || 0
          : activeChartMetric === 'smmKg'
          ? summary?.currentSmmKg || 0
          : summary?.currentBodyFatKg || 0;
      return { first: fallbackVal, last: fallbackVal, delta: 0, unit: 'kg' };
    }

    const firstPoint = rawChartData[0];
    const lastPoint = rawChartData[rawChartData.length - 1];

    const firstVal = firstPoint[activeChartMetric] ?? 0;
    const lastVal = lastPoint[activeChartMetric] ?? 0;
    const delta = +(lastVal - firstVal).toFixed(1);

    return {
      first: firstVal,
      last: lastVal,
      delta,
      unit: 'kg',
    };
  }, [rawChartData, activeChartMetric, summary]);

  const formatEvaluationDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Evaluasi: Terkini';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `Evaluasi: ${day} ${month} ${year}`;
  };

  const formatReceiptDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} · ${hours}:${mins} WIB`;
  };

  const formatTableDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Support both items and data, pagination and meta from API
  const tableRows: BodyMeasurement[] =
    measurementsData?.items || measurementsData?.data || [];
  const totalItems: number =
    measurementsData?.pagination?.totalItems ??
    measurementsData?.meta?.total ??
    tableRows.length;
  const totalPages: number =
    measurementsData?.pagination?.totalPages ??
    measurementsData?.meta?.totalPages ??
    (totalItems > 0 ? Math.ceil(totalItems / scanPageSize) : 1);

  return (
    <AppShell>
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
            Analitik Komposisi Tubuh
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
            Visualisasi historis & tren perubahan elemen tubuh dari profil biometrik Anda. Semua massa lemak diukur dalam kilogram (kg).
          </p>
        </div>

        <Link href="/profile">
          <Button variant="primary" size="md" className="text-xs font-bold shadow-md">
            <Scale className="w-4 h-4 mr-1.5" />
            Perbarui Profil & Kalori
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Primary Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {isAnalyticsLoading ? (
          <>
            <Skeleton className="h-32 rounded-[8px]" />
            <Skeleton className="h-32 rounded-[8px]" />
            <Skeleton className="h-32 rounded-[8px]" />
            <Skeleton className="h-32 rounded-[8px]" />
          </>
        ) : (
          <>
            {/* Berat Total Terkini */}
            <MetricCard
              label="Berat Total Terkini"
              value={summary?.currentWeightKg ? summary.currentWeightKg.toFixed(1) : '-'}
              unit="kg"
              trend={
                summary?.weightDeltaKg !== null && summary?.weightDeltaKg !== undefined
                  ? {
                      direction: summary.weightDeltaKg > 0 ? 'UP' : summary.weightDeltaKg < 0 ? 'DOWN' : 'UP',
                      value: `${Math.abs(summary.weightDeltaKg)} kg`,
                      percentage: summary.weightDeltaPct !== null ? `${summary.weightDeltaPct > 0 ? '+' : ''}${summary.weightDeltaPct}%` : undefined,
                      alignment: 'NEUTRAL',
                    }
                  : undefined
              }
              subValue={formatEvaluationDate(summary?.latestEvaluationDate)}
              icon={<Scale className="w-4 h-4 text-[var(--accent-secondary)]" />}
              size="hero"
            />

            {/* Skeletal Muscle Mass (SMM) */}
            <MetricCard
              label="Skeletal Muscle Mass (SMM)"
              value={summary?.currentSmmKg ? summary.currentSmmKg.toFixed(1) : '-'}
              unit="kg"
              trend={
                summary?.smmDeltaKg !== null && summary?.smmDeltaKg !== undefined
                  ? {
                      direction: summary.smmDeltaKg >= 0 ? 'UP' : 'DOWN',
                      value: `${Math.abs(summary.smmDeltaKg)} kg`,
                      percentage: summary.smmDeltaPct !== null ? `${summary.smmDeltaPct > 0 ? '+' : ''}${summary.smmDeltaPct}%` : undefined,
                      alignment: summary.smmDeltaKg >= 0 ? 'ON_TRACK' : 'NEUTRAL',
                    }
                  : undefined
              }
              subValue={
                summary
                  ? `Normal ref: ${summary.smmNormalRefMin} - ${summary.smmNormalRefMax} kg`
                  : undefined
              }
              icon={<Dumbbell className="w-4 h-4 text-[var(--color-moss-600)]" />}
            />

            {/* Massa Lemak (Body Fat KG only) */}
            <MetricCard
              label="Massa Lemak (Body Fat)"
              value={summary?.currentBodyFatKg ? summary.currentBodyFatKg.toFixed(1) : '-'}
              unit="kg"
              trend={
                summary?.bodyFatKgDelta !== null && summary?.bodyFatKgDelta !== undefined
                  ? {
                      direction: summary.bodyFatKgDelta <= 0 ? 'DOWN' : 'UP',
                      value: `${Math.abs(summary.bodyFatKgDelta)} kg`,
                      alignment: summary.bodyFatKgDelta <= 0 ? 'ON_TRACK' : 'NEUTRAL',
                    }
                  : undefined
              }
              subValue={
                summary?.currentFatFreeMassKg
                  ? `Massa Bebas Lemak: ${summary.currentFatFreeMassKg.toFixed(1)} kg`
                  : undefined
              }
              icon={<TrendingDown className="w-4 h-4 text-[var(--accent-primary)]" />}
            />

            {/* Kandungan Air (Water Content) */}
            <MetricCard
              label="Kandungan Air (Water Content)"
              value={summary?.currentWaterContentKg ? summary.currentWaterContentKg.toFixed(1) : '-'}
              unit="kg"
              trend={
                summary?.waterContentKgDelta !== null && summary?.waterContentKgDelta !== undefined
                  ? {
                      direction: summary.waterContentKgDelta >= 0 ? 'UP' : 'DOWN',
                      value: `${Math.abs(summary.waterContentKgDelta)} kg`,
                      alignment: 'NEUTRAL',
                    }
                  : undefined
              }
              subValue={
                summary
                  ? `Protein: ${summary.currentProteinKg ? summary.currentProteinKg.toFixed(1) : '-'} kg · Mineral: ${summary.currentMineralKg ? summary.currentMineralKg.toFixed(2) : '-'} kg`
                  : undefined
              }
              icon={<Droplets className="w-4 h-4 text-sky-400" />}
            />
          </>
        )}
      </div>

      <Divider thick />

      {/* Detailed Elements Analysis Breakdown (Digital Receipt) */}
      <section className="my-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[var(--accent-secondary)]" />
              Detail Elemen Komposisi Tubuh Terakhir ({summary?.receiptNumber || 'Profil Aktif'})
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {formatReceiptDate(summary?.receiptTimestamp)}
            </p>
          </div>

          <span className="text-xs text-[var(--color-moss-600)] font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Terkalibrasi Aktif
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Massa Bebas Lemak</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
              {summary?.currentFatFreeMassKg ? `${summary.currentFatFreeMassKg.toFixed(1)} kg` : '-'}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Fat Free Mass</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Massa Lemak</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--accent-primary)]">
              {summary?.currentBodyFatKg ? `${summary.currentBodyFatKg.toFixed(1)} kg` : '-'}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Body Fat Mass</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Protein</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
              {summary?.currentProteinKg ? `${summary.currentProteinKg.toFixed(1)} kg` : '-'}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Normal: 9.4 - 11.2</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Inorganic Salt</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
              {summary?.currentMineralKg ? `${summary.currentMineralKg.toFixed(2)} kg` : '-'}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Mineral Tulang</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Water Content</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-sky-400">
              {summary?.currentWaterContentKg ? `${summary.currentWaterContentKg.toFixed(1)} kg` : '-'}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Total Body Water</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">BMI</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--accent-secondary)]">
              {summary?.bmi ? summary.bmi.toFixed(1) : '-'}
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">
              Normal: {summary?.bmiNormalRefMin || 18.5} - {summary?.bmiNormalRefMax || 25.0}
            </span>
          </div>
        </div>
      </section>

      <Divider thick />

      {/* ============================================================ */}
      {/* HISTORICAL LINE CHART SECTION */}
      {/* ============================================================ */}
      <div className="my-6 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-default)]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[4px] bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                  Grafik perkembangan komposisi tubuh (historis)
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Evaluasi pergerakan berat, massa otot rangka, dan massa lemak (kg) dengan sensor visual presisi tinggi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Switcher - Lemak in KG only */}
            <div className="flex rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-base)] p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveChartMetric('weightKg')}
                className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                  activeChartMetric === 'weightKg'
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Berat (kg)
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('smmKg')}
                className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                  activeChartMetric === 'smmKg'
                    ? 'bg-[var(--color-moss-600)] text-white font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Otot SMM (kg)
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('bodyFatKg')}
                className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                  activeChartMetric === 'bodyFatKg'
                    ? 'bg-[var(--accent-secondary)] text-[var(--bg-base)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Massa Lemak (kg)
              </button>
            </div>

            {/* Segmented Control Time Range */}
            <div className="flex rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-base)] p-1 text-xs">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)] border border-[var(--border-default)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {range === '7d' ? '7H' : range === '30d' ? '30H' : range === '90d' ? '90H' : '1Th'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Micro-Telemetry Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)]">
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] block">Awal periode</span>
            <span className="text-sm font-bold font-[var(--font-display)] text-[var(--text-primary)] tabular-nums">
              {metricStats.first} {metricStats.unit}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)]">
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] block">Nilai terkini</span>
            <span className="text-sm font-bold font-[var(--font-display)] text-[var(--text-primary)] tabular-nums">
              {metricStats.last} {metricStats.unit}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)]">
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] block">Total perubahan</span>
            <span
              className={`text-sm font-bold font-[var(--font-display)] tabular-nums ${
                activeChartMetric === 'smmKg'
                  ? metricStats.delta >= 0
                    ? 'text-[var(--color-moss-600)]'
                    : 'text-[var(--accent-primary)]'
                  : metricStats.delta <= 0
                  ? 'text-[var(--color-moss-600)]'
                  : 'text-[var(--accent-primary)]'
              }`}
            >
              {metricStats.delta > 0 ? `+${metricStats.delta}` : metricStats.delta} {metricStats.unit}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] block">Evaluasi tren</span>
              <span className="text-xs font-bold font-[var(--font-display)] text-[#4CD6DE] flex items-center gap-1">
                {activeChartMetric === 'smmKg' ? (
                  metricStats.delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  metricStats.delta <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />
                )}
                {chartPeriod?.trendEvaluation || 'Komposisi stabil'}
              </span>
            </div>
          </div>
        </div>

        {/* Kinetic Area Chart */}
        <div className="h-72 w-full pt-3">
          {isAnalyticsLoading ? (
            <Skeleton className="h-full w-full rounded-[6px]" />
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-[var(--text-tertiary)]" />
              <p className="text-xs">Belum ada riwayat data komposisi dalam periode ini.</p>
              <Link href="/profile">
                <Button variant="secondary" size="sm" className="text-xs">
                  Perbarui Data Profil
                </Button>
              </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="bodyCompGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={
                        activeChartMetric === 'weightKg'
                          ? '#FF6B2C'
                          : activeChartMetric === 'smmKg'
                          ? '#4CD6DE'
                          : '#FFA726'
                      }
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        activeChartMetric === 'weightKg'
                          ? '#FF6B2C'
                          : activeChartMetric === 'smmKg'
                          ? '#4CD6DE'
                          : '#FFA726'
                      }
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#2C303B" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#646A7C"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  stroke="#646A7C"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  unit="kg"
                />

                <Tooltip
                  cursor={{
                    stroke:
                      activeChartMetric === 'weightKg'
                        ? '#FF6B2C'
                        : activeChartMetric === 'smmKg'
                        ? '#4CD6DE'
                        : '#FFA726',
                    strokeDasharray: '3 3',
                    strokeWidth: 1.5,
                  }}
                  content={<CustomBodyCompTooltip metric={activeChartMetric} />}
                />

                <Area
                  type="monotone"
                  dataKey={activeChartMetric}
                  name={
                    activeChartMetric === 'weightKg'
                      ? 'Berat Total (kg)'
                      : activeChartMetric === 'smmKg'
                      ? 'Skeletal Muscle Mass (kg)'
                      : 'Massa Lemak (kg)'
                  }
                  stroke={
                    activeChartMetric === 'weightKg'
                      ? '#FF6B2C'
                      : activeChartMetric === 'smmKg'
                      ? '#4CD6DE'
                      : '#FFA726'
                  }
                  strokeWidth={3}
                  fill="url(#bodyCompGlow)"
                  dot={{
                    r: 4,
                    fill:
                      activeChartMetric === 'weightKg'
                        ? '#FF6B2C'
                        : activeChartMetric === 'smmKg'
                        ? '#4CD6DE'
                        : '#FFA726',
                    stroke: '#121316',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                    fill:
                      activeChartMetric === 'weightKg'
                        ? '#FF6B2C'
                        : activeChartMetric === 'smmKg'
                        ? '#4CD6DE'
                        : '#FFA726',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <Divider thick />

      {/* ============================================================ */}
      {/* 4. Tabel Riwayat InBody Scan & Evaluasi Komposisi Tubuh */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[var(--accent-primary)]" />
              Tabel riwayat scan & update profil ({totalItems} data)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Rekapitulasi pengukuran body composition berkala beserta analisis delta dan PR.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari evaluasi atau tanggal..."
              value={scanSearch}
              onChange={(e) => {
                setScanSearch(e.target.value);
                setScanPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-base)] text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal Pengukuran</th>
                  <th className="py-3 px-4 text-right">Berat Badan</th>
                  <th className="py-3 px-4 text-right">Otot (SMM)</th>
                  <th className="py-3 px-4 text-right">Massa Lemak (kg)</th>
                  <th className="py-3 px-4 text-right">Bebas Lemak (FFM)</th>
                  <th className="py-3 px-4 text-right">Air Tubuh (kg)</th>
                  <th className="py-3 px-4 text-right">BMI</th>
                  <th className="py-3 px-4">Evaluasi / Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]/50">
                {isMeasurementsLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[var(--text-secondary)]">
                      Memuat data scan...
                    </td>
                  </tr>
                ) : !tableRows || tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[var(--text-secondary)]">
                      {scanSearch
                        ? `Tidak ada data yang cocok dengan pencarian "${scanSearch}".`
                        : 'Belum ada data riwayat body composition. Perbarui data Anda di menu Profil untuk mulai memantau.'}
                    </td>
                  </tr>
                ) : (
                  tableRows.map((scan) => (
                    <tr
                      key={scan.id}
                      className="hover:bg-[var(--bg-base)]/60 transition-colors group"
                    >
                      {/* Tanggal */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                          <span>{formatTableDate(scan.measuredAt)}</span>
                          {scan.status === 'PR_COMPOSITION' && (
                            <span className="px-1.5 py-0.2 rounded bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 text-[9px] font-bold text-[var(--accent-primary)]">
                              BEST
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Berat Badan */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold font-mono text-[var(--text-primary)]">
                        {scan.weightKg ? scan.weightKg.toFixed(1) : '-'} kg
                      </td>

                      {/* SMM */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold font-mono text-[var(--color-moss-600)]">
                        {scan.skeletalMuscleKg !== null && scan.skeletalMuscleKg !== undefined
                          ? `${scan.skeletalMuscleKg.toFixed(1)} kg`
                          : '-'}
                      </td>

                      {/* Massa Lemak in kg only */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold font-mono text-[var(--accent-primary)]">
                        {scan.bodyFatKg !== null && scan.bodyFatKg !== undefined
                          ? `${scan.bodyFatKg.toFixed(1)} kg`
                          : '-'}
                      </td>

                      {/* FFM */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[var(--text-secondary)]">
                        {scan.fatFreeMassKg !== null && scan.fatFreeMassKg !== undefined
                          ? `${scan.fatFreeMassKg.toFixed(1)} kg`
                          : '-'}
                      </td>

                      {/* TBW Water Content in kg */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-sky-400">
                        {scan.waterContentKg !== null && scan.waterContentKg !== undefined
                          ? `${scan.waterContentKg.toFixed(1)} kg`
                          : '-'}
                      </td>

                      {/* BMI */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[var(--text-secondary)]">
                        {scan.bmi !== null && scan.bmi !== undefined ? scan.bmi.toFixed(1) : '-'}
                      </td>

                      {/* Status / Evaluasi */}
                      <td className="py-3 px-4">
                        {getStatusBadge(scan.status, scan.evaluation)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeletingScan(scan)}
                          className="p-1.5 rounded-[4px] text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Hapus data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* InBody Table Pagination */}
          {totalItems > 0 && totalPages > 0 && (
            <div className="p-3 bg-[var(--bg-base)]/40 border-t border-[var(--border-default)]/60">
              <Pagination
                currentPage={scanPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={scanPageSize}
                onPageChange={setScanPage}
                onPageSizeChange={(newSize) => {
                  setScanPageSize(newSize);
                  setScanPage(1);
                }}
                pageSizeOptions={[5, 10, 15, 20]}
                itemLabel="data scan"
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingScan}
        onClose={() => setDeletingScan(null)}
        onConfirm={async () => {
          if (deletingScan) {
            await deleteMutation.mutateAsync(deletingScan.id);
          }
        }}
        title="Hapus Data"
        description={`Apakah Anda yakin ingin menghapus data tanggal ${
          deletingScan ? formatTableDate(deletingScan.measuredAt) : ''
        }? Data yang dihapus tidak dapat dipulihkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </AppShell>
  );
}
