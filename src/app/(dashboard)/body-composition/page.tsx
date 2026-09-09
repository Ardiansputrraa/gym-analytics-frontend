'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/common/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { Divider } from '@/components/ui/Divider';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
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
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface MeasurementEntry {
  date: string;
  weight: number;
  smm: number;
  bodyFatPct: number;
  bodyFatKg: number;
  fatFreeMass: number;
  waterContent: number;
  protein?: number;
  mineral?: number;
  bmi?: number;
}

const history7d: MeasurementEntry[] = [
  { date: '03 Sep', weight: 104.6, smm: 35.6, bodyFatPct: 38.5, bodyFatKg: 40.2, fatFreeMass: 64.4, waterContent: 45.4 },
  { date: '05 Sep', weight: 104.4, smm: 35.7, bodyFatPct: 38.3, bodyFatKg: 39.9, fatFreeMass: 64.5, waterContent: 45.5 },
  { date: '07 Sep', weight: 104.2, smm: 35.7, bodyFatPct: 38.2, bodyFatKg: 39.8, fatFreeMass: 64.4, waterContent: 45.6 },
  { date: '09 Sep', weight: 104.1, smm: 35.8, bodyFatPct: 38.1, bodyFatKg: 39.7, fatFreeMass: 64.4, waterContent: 45.7 },
];

const history30d: MeasurementEntry[] = [
  { date: '10 Aug', weight: 106.5, smm: 35.0, bodyFatPct: 40.2, bodyFatKg: 42.8, fatFreeMass: 63.7, waterContent: 44.5 },
  { date: '17 Aug', weight: 105.8, smm: 35.2, bodyFatPct: 39.7, bodyFatKg: 42.0, fatFreeMass: 63.8, waterContent: 44.8 },
  { date: '24 Aug', weight: 105.2, smm: 35.4, bodyFatPct: 39.1, bodyFatKg: 41.1, fatFreeMass: 64.1, waterContent: 45.0 },
  { date: '31 Aug', weight: 104.8, smm: 35.6, bodyFatPct: 38.6, bodyFatKg: 40.4, fatFreeMass: 64.4, waterContent: 45.3 },
  { date: '09 Sep', weight: 104.1, smm: 35.8, bodyFatPct: 38.1, bodyFatKg: 39.7, fatFreeMass: 64.4, waterContent: 45.7 },
];

const history90d: MeasurementEntry[] = [
  { date: '10 Jun', weight: 109.2, smm: 34.2, bodyFatPct: 42.5, bodyFatKg: 46.4, fatFreeMass: 62.8, waterContent: 43.8 },
  { date: '25 Jun', weight: 108.0, smm: 34.6, bodyFatPct: 41.6, bodyFatKg: 44.9, fatFreeMass: 63.1, waterContent: 44.1 },
  { date: '10 Jul', weight: 107.1, smm: 34.9, bodyFatPct: 40.8, bodyFatKg: 43.7, fatFreeMass: 63.4, waterContent: 44.3 },
  { date: '25 Jul', weight: 106.3, smm: 35.1, bodyFatPct: 40.0, bodyFatKg: 42.5, fatFreeMass: 63.8, waterContent: 44.6 },
  { date: '10 Aug', weight: 105.5, smm: 35.3, bodyFatPct: 39.4, bodyFatKg: 41.5, fatFreeMass: 64.0, waterContent: 44.9 },
  { date: '25 Aug', weight: 104.9, smm: 35.6, bodyFatPct: 38.7, bodyFatKg: 40.6, fatFreeMass: 64.3, waterContent: 45.2 },
  { date: '09 Sep', weight: 104.1, smm: 35.8, bodyFatPct: 38.1, bodyFatKg: 39.7, fatFreeMass: 64.4, waterContent: 45.7 },
];

const history1y: MeasurementEntry[] = [
  { date: 'Okt 25', weight: 114.0, smm: 33.0, bodyFatPct: 45.2, bodyFatKg: 51.5, fatFreeMass: 62.5, waterContent: 42.5 },
  { date: 'Des 25', weight: 111.5, smm: 33.6, bodyFatPct: 43.8, bodyFatKg: 48.8, fatFreeMass: 62.7, waterContent: 43.0 },
  { date: 'Feb 26', weight: 109.0, smm: 34.2, bodyFatPct: 42.2, bodyFatKg: 46.0, fatFreeMass: 63.0, waterContent: 43.7 },
  { date: 'Apr 26', weight: 107.4, smm: 34.8, bodyFatPct: 41.0, bodyFatKg: 44.0, fatFreeMass: 63.4, waterContent: 44.2 },
  { date: 'Jun 26', weight: 105.8, smm: 35.3, bodyFatPct: 39.5, bodyFatKg: 41.8, fatFreeMass: 64.0, waterContent: 44.9 },
  { date: 'Agu 26', weight: 104.7, smm: 35.6, bodyFatPct: 38.5, bodyFatKg: 40.3, fatFreeMass: 64.4, waterContent: 45.4 },
  { date: 'Sep 26', weight: 104.1, smm: 35.8, bodyFatPct: 38.1, bodyFatKg: 39.7, fatFreeMass: 64.4, waterContent: 45.7 },
];

// Custom Telemetry Tooltip for Body Composition
interface BodyCompTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  metric: 'weight' | 'smm' | 'bodyFatPct';
}

function CustomBodyCompTooltip({ active, payload, label, metric }: BodyCompTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0].value;

  const metricLabel = metric === 'weight' ? 'Berat Badan' : metric === 'smm' ? 'Otot Rangka (SMM)' : 'Kadar Lemak (Body Fat)';
  const metricUnit = metric === 'bodyFatPct' ? '%' : 'kg';
  const metricColor = metric === 'weight' ? '#F05A28' : metric === 'smm' ? '#4E6848' : '#E6C659';

  return (
    <div className="rounded-[8px] border border-[var(--border-default)] bg-[#181816]/95 backdrop-blur-md p-3.5 shadow-2xl space-y-2 min-w-[210px]">
      <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-1.5">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-tertiary)] font-mono">
          INBODY SCAN
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-[var(--text-secondary)]">{metricLabel}:</span>
          <span className="text-base font-bold font-[var(--font-display)] tabular-nums" style={{ color: metricColor }}>
            {val} <span className="text-xs font-normal">{metricUnit}</span>
          </span>
        </div>

        <div className="text-[11px] pt-1 text-[var(--text-secondary)] flex items-center justify-between">
          <span>Klasifikasi:</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {metric === 'weight' ? 'Fase Fat Loss' : metric === 'smm' ? 'Progressive Overload' : 'Defisit Terkalibrasi'}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface InBodyScanRecord {
  id: string;
  date: string;
  displayDate: string;
  weight: number;
  weightDelta: string;
  smm: number;
  smmDelta: string;
  bodyFatPct: number;
  bodyFatKg: number;
  fatFreeMass: number;
  waterContent: number;
  bmi: number;
  status: 'FAT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'PR_COMPOSITION';
  evaluation: string;
}

const allInBodyScans: InBodyScanRecord[] = [
  { id: 'ib-1', date: '2026-09-09', displayDate: '09 Sep 2026', weight: 104.1, weightDelta: '-0.1 kg', smm: 35.8, smmDelta: '+0.1 kg', bodyFatPct: 38.1, bodyFatKg: 39.7, fatFreeMass: 64.4, waterContent: 45.7, bmi: 34.0, status: 'PR_COMPOSITION', evaluation: 'All-Time Low Body Fat (38.1%) & Rekor SMM' },
  { id: 'ib-2', date: '2026-09-07', displayDate: '07 Sep 2026', weight: 104.2, weightDelta: '-0.2 kg', smm: 35.7, smmDelta: '0.0 kg', bodyFatPct: 38.2, bodyFatKg: 39.8, fatFreeMass: 64.4, waterContent: 45.6, bmi: 34.0, status: 'FAT_LOSS', evaluation: 'Fat Loss Konsisten & Otot Terjaga' },
  { id: 'ib-3', date: '2026-09-05', displayDate: '05 Sep 2026', weight: 104.4, weightDelta: '-0.2 kg', smm: 35.7, smmDelta: '+0.1 kg', bodyFatPct: 38.3, bodyFatKg: 39.9, fatFreeMass: 64.5, waterContent: 45.5, bmi: 34.1, status: 'FAT_LOSS', evaluation: 'Defisit Terkalibrasi Sempurna' },
  { id: 'ib-4', date: '2026-09-03', displayDate: '03 Sep 2026', weight: 104.6, weightDelta: '-0.2 kg', smm: 35.6, smmDelta: '0.0 kg', bodyFatPct: 38.5, bodyFatKg: 40.2, fatFreeMass: 64.4, waterContent: 45.4, bmi: 34.2, status: 'FAT_LOSS', evaluation: 'Penurunan Lemak Stabil' },
  { id: 'ib-5', date: '2026-08-31', displayDate: '31 Agu 2026', weight: 104.8, weightDelta: '-0.4 kg', smm: 35.6, smmDelta: '+0.2 kg', bodyFatPct: 38.6, bodyFatKg: 40.4, fatFreeMass: 64.4, waterContent: 45.3, bmi: 34.2, status: 'MUSCLE_GAIN', evaluation: 'Pertumbuhan Otot Rangka (+200g)' },
  { id: 'ib-6', date: '2026-08-24', displayDate: '24 Agu 2026', weight: 105.2, weightDelta: '-0.6 kg', smm: 35.4, smmDelta: '+0.2 kg', bodyFatPct: 39.1, bodyFatKg: 41.1, fatFreeMass: 64.1, waterContent: 45.0, bmi: 34.3, status: 'FAT_LOSS', evaluation: 'Fat Loss Fase Cepat' },
  { id: 'ib-7', date: '2026-08-17', displayDate: '17 Agu 2026', weight: 105.8, weightDelta: '-0.7 kg', smm: 35.2, smmDelta: '+0.2 kg', bodyFatPct: 39.7, bodyFatKg: 42.0, fatFreeMass: 63.8, waterContent: 44.8, bmi: 34.5, status: 'FAT_LOSS', evaluation: 'Fase Re-composition Bagus' },
  { id: 'ib-8', date: '2026-08-10', displayDate: '10 Agu 2026', weight: 106.5, weightDelta: '-0.6 kg', smm: 35.0, smmDelta: '+0.1 kg', bodyFatPct: 40.2, bodyFatKg: 42.8, fatFreeMass: 63.7, waterContent: 44.5, bmi: 34.8, status: 'FAT_LOSS', evaluation: 'Penurunan Sub-41% Body Fat' },
  { id: 'ib-9', date: '2026-07-25', displayDate: '25 Jul 2026', weight: 107.1, weightDelta: '-0.9 kg', smm: 34.9, smmDelta: '+0.3 kg', bodyFatPct: 40.8, bodyFatKg: 43.7, fatFreeMass: 63.4, waterContent: 44.3, bmi: 35.0, status: 'FAT_LOSS', evaluation: 'Siklus Defisit Juli Selesai' },
  { id: 'ib-10', date: '2026-07-10', displayDate: '10 Jul 2026', weight: 108.0, weightDelta: '-1.2 kg', smm: 34.6, smmDelta: '+0.4 kg', bodyFatPct: 41.6, bodyFatKg: 44.9, fatFreeMass: 63.1, waterContent: 44.1, bmi: 35.3, status: 'FAT_LOSS', evaluation: 'Overload Beban Berdampak Positif' },
  { id: 'ib-11', date: '2026-06-25', displayDate: '25 Jun 2026', weight: 109.2, weightDelta: '-1.5 kg', smm: 34.2, smmDelta: '+0.3 kg', bodyFatPct: 42.5, bodyFatKg: 46.4, fatFreeMass: 62.8, waterContent: 43.8, bmi: 35.7, status: 'FAT_LOSS', evaluation: 'Fase Awal Program Gym Dimulai' },
  { id: 'ib-12', date: '2026-05-15', displayDate: '15 Mei 2026', weight: 110.7, weightDelta: '-1.8 kg', smm: 33.9, smmDelta: '+0.3 kg', bodyFatPct: 43.1, bodyFatKg: 47.7, fatFreeMass: 63.0, waterContent: 43.4, bmi: 36.1, status: 'MAINTENANCE', evaluation: 'Evaluasi Adaptasi Nutrisi' },
  { id: 'ib-13', date: '2026-04-10', displayDate: '10 Apr 2026', weight: 112.5, weightDelta: '-1.5 kg', smm: 33.6, smmDelta: '+0.6 kg', bodyFatPct: 44.0, bodyFatKg: 49.5, fatFreeMass: 63.0, waterContent: 43.0, bmi: 36.7, status: 'FAT_LOSS', evaluation: 'Pola Makan Defisit Bersih Dimulai' },
  { id: 'ib-14', date: '2026-02-18', displayDate: '18 Feb 2026', weight: 114.0, weightDelta: '-2.0 kg', smm: 33.0, smmDelta: '0.0 kg', bodyFatPct: 45.2, bodyFatKg: 51.5, fatFreeMass: 62.5, waterContent: 42.5, bmi: 37.2, status: 'MAINTENANCE', evaluation: 'Scan Awal Transformasi Komposisi Tubuh' },
];

export default function BodyCompositionPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeChartMetric, setActiveChartMetric] = useState<'weight' | 'smm' | 'bodyFatPct'>('weight');

  // Table pagination & search state
  const [scanPage, setScanPage] = useState(1);
  const [scanPageSize, setScanPageSize] = useState(5);
  const [scanSearch, setScanSearch] = useState('');

  const filteredScans = React.useMemo(() => {
    return allInBodyScans.filter((s) => {
      const q = scanSearch.toLowerCase();
      return (
        s.displayDate.toLowerCase().includes(q) ||
        s.evaluation.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
      );
    });
  }, [scanSearch]);

  React.useEffect(() => {
    setScanPage(1);
  }, [scanSearch]);

  const totalScanPages = Math.ceil(filteredScans.length / scanPageSize) || 1;
  const paginatedScans = React.useMemo(() => {
    const start = (scanPage - 1) * scanPageSize;
    return filteredScans.slice(start, start + scanPageSize);
  }, [filteredScans, scanPage, scanPageSize]);

  const activeData = React.useMemo(() => {
    switch (timeRange) {
      case '7d':
        return history7d;
      case '30d':
        return history30d;
      case '90d':
        return history90d;
      case '1y':
        return history1y;
      default:
        return history30d;
    }
  }, [timeRange]);

  const stats = React.useMemo(() => {
    const first = activeData[0][activeChartMetric];
    const last = activeData[activeData.length - 1][activeChartMetric];
    const delta = +(last - first).toFixed(1);
    const unit = activeChartMetric === 'bodyFatPct' ? '%' : 'kg';

    return {
      first,
      last,
      delta,
      unit,
    };
  }, [activeData, activeChartMetric]);

  return (
    <AppShell>
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
            Analitik Komposisi Tubuh
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
            Visualisasi historis & tren perubahan elemen tubuh dari hasil analisa mesin gym (InBody / Tanita).
          </p>
        </div>

        <Link href="/profile">
          <Button variant="primary" size="md">
            <Scale className="w-4 h-4 mr-2" />
            Perbarui Data di Profil & Kalori
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Primary Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <MetricCard
          label="Berat Total Terkini"
          value="104.1"
          unit="kg"
          trend={{
            direction: 'DOWN',
            value: '1.1 kg',
            percentage: '-1.0',
            alignment: 'NEUTRAL',
          }}
          subValue="Evaluasi: 01 Okt 2026"
          icon={<Scale className="w-4 h-4 text-[var(--accent-secondary)]" />}
          size="hero"
        />

        <MetricCard
          label="Skeletal Muscle Mass (SMM)"
          value="35.8"
          unit="kg"
          trend={{
            direction: 'UP',
            value: '0.4 kg',
            percentage: '+1.1',
            alignment: 'ON_TRACK', // Progressive muscle gain
          }}
          subValue="Normal ref: 26.3 - 32.6 kg"
          icon={<Dumbbell className="w-4 h-4 text-[var(--color-moss-600)]" />}
        />

        <MetricCard
          label="Body Fat (%) & Massa (kg)"
          value="38.1"
          unit="% (39.7 kg)"
          trend={{
            direction: 'DOWN',
            value: '1.0%',
            alignment: 'NEUTRAL',
          }}
          subValue="Fat-Free Mass: 64.4 kg"
          icon={<TrendingDown className="w-4 h-4 text-[var(--accent-primary)]" />}
        />

        <MetricCard
          label="Kandungan Air (Water Content)"
          value="45.7"
          unit="kg"
          trend={{
            direction: 'UP',
            value: '0.7 kg',
            alignment: 'NEUTRAL',
          }}
          subValue="Protein: 14.9kg · Mineral: 3.73kg"
          icon={<Droplets className="w-4 h-4 text-sky-400" />}
        />
      </div>

      <Divider thick />

      {/* Detailed Elements Analysis Breakdown (Digital Receipt) */}
      <section className="my-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[var(--accent-secondary)]" />
              Detail Elemen Struk Analyzer Terakhir (#20555-1)
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">01 Oktober 2026 · 13:32 WIB</p>
          </div>

          <span className="text-xs text-[var(--color-moss-600)] font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Terkalibrasi Aktif
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Massa Bebas Lemak</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
              64.4 kg
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Remove Fat W.</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Massa Lemak</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--accent-primary)]">
              39.7 kg
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Body Fat Mass</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Protein</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
              14.9 kg
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Normal: 9.4 - 11.2</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Inorganic Salt</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
              3.73 kg
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Mineral Tulang</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">Water Content</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-sky-400">
              45.7 kg
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Total Body Water</span>
          </div>

          <div className="p-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm">
            <span className="text-[11px] text-[var(--text-tertiary)] block">BMI</span>
            <span className="text-lg font-bold font-[var(--font-display)] tabular-nums text-[var(--accent-secondary)]">
              36.4
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Normal: 18.5 - 25.0</span>
          </div>
        </div>
      </section>

      <Divider thick />

      {/* ============================================================ */}
      {/* HIGH-END ELEGANT AREA CHART SECTION */}
      {/* ============================================================ */}
      <div className="my-6 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-5 md:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-default)]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[4px] bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                  Grafik Perkembangan Komposisi Tubuh (Historis)
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Evaluasi pergerakan berat, massa otot rangka, dan kadar lemak dengan sensor visual presisi tinggi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Switcher */}
            <div className="flex rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-base)] p-1 text-xs">
              <button
                onClick={() => setActiveChartMetric('weight')}
                className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                  activeChartMetric === 'weight'
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Berat (kg)
              </button>
              <button
                onClick={() => setActiveChartMetric('smm')}
                className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                  activeChartMetric === 'smm'
                    ? 'bg-[var(--color-moss-600)] text-white font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Otot SMM (kg)
              </button>
              <button
                onClick={() => setActiveChartMetric('bodyFatPct')}
                className={`px-3 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                  activeChartMetric === 'bodyFatPct'
                    ? 'bg-[var(--accent-secondary)] text-[var(--bg-base)] font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Body Fat (%)
              </button>
            </div>

            {/* Segmented Control Time Range */}
            <div className="flex rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-base)] p-1 text-xs">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-[4px] font-semibold transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)] border border-[var(--border-default)] font-bold shadow-sm'
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
            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">Awal Periode</span>
            <span className="text-sm font-bold font-[var(--font-display)] text-[var(--text-primary)] tabular-nums">
              {stats.first} {stats.unit}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">Nilai Terkini</span>
            <span className="text-sm font-bold font-[var(--font-display)] text-[var(--text-primary)] tabular-nums">
              {stats.last} {stats.unit}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">Total Perubahan</span>
            <span
              className={`text-sm font-bold font-[var(--font-display)] tabular-nums ${
                activeChartMetric === 'smm'
                  ? stats.delta >= 0
                    ? 'text-[var(--color-moss-600)]'
                    : 'text-[var(--accent-primary)]'
                  : stats.delta <= 0
                  ? 'text-[var(--color-moss-600)]'
                  : 'text-[var(--accent-primary)]'
              }`}
            >
              {stats.delta > 0 ? `+${stats.delta}` : stats.delta} {stats.unit}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">Evaluasi Tren</span>
              <span className="text-sm font-bold font-[var(--font-display)] text-[var(--color-moss-600)] flex items-center gap-1">
                {activeChartMetric === 'smm' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {activeChartMetric === 'smm' ? 'Otot Meningkat' : 'Lemak Menurun'}
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F05A28" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F05A28" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="smmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4E6848" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#4E6848" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E6C659" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E6C659" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" stroke="#333330" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#888880"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#333330' }}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="#888880"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#333330' }}
                unit={activeChartMetric === 'bodyFatPct' ? '%' : 'kg'}
              />

              <Tooltip
                content={<CustomBodyCompTooltip metric={activeChartMetric} />}
              />

              <Area
                type="monotone"
                dataKey={activeChartMetric}
                name={
                  activeChartMetric === 'weight'
                    ? 'Berat Total (kg)'
                    : activeChartMetric === 'smm'
                    ? 'Skeletal Muscle Mass (kg)'
                    : 'Body Fat (%)'
                }
                stroke={
                  activeChartMetric === 'weight'
                    ? '#F05A28'
                    : activeChartMetric === 'smm'
                    ? '#4E6848'
                    : '#E6C659'
                }
                strokeWidth={3}
                fill={
                  activeChartMetric === 'weight'
                    ? 'url(#weightGrad)'
                    : activeChartMetric === 'smm'
                    ? 'url(#smmGrad)'
                    : 'url(#fatGrad)'
                }
                dot={{
                  r: 4,
                  fill:
                    activeChartMetric === 'weight'
                      ? '#F05A28'
                      : activeChartMetric === 'smm'
                      ? '#4E6848'
                      : '#E6C659',
                  stroke: '#1C1C1A',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  stroke: '#F4F4F0',
                  strokeWidth: 2,
                  fill:
                    activeChartMetric === 'weight'
                      ? '#F05A28'
                      : activeChartMetric === 'smm'
                      ? '#4E6848'
                      : '#E6C659',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
              Tabel Riwayat InBody Scan ({filteredScans.length} Data Scan)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Rekapitulasi pengukuran body composition berkala beserta analisis delta dan PR.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari tanggal atau evaluasi..."
              value={scanSearch}
              onChange={(e) => setScanSearch(e.target.value)}
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
                  <th className="py-3 px-4">Tanggal Scan</th>
                  <th className="py-3 px-4 text-right">Berat Badan</th>
                  <th className="py-3 px-4 text-right">Otot (SMM)</th>
                  <th className="py-3 px-4 text-right">Body Fat (%)</th>
                  <th className="py-3 px-4 text-right">Lemak (kg)</th>
                  <th className="py-3 px-4 text-right">Air Tubuh (%)</th>
                  <th className="py-3 px-4 text-right">BMI</th>
                  <th className="py-3 px-4">Evaluasi / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]/50">
                {paginatedScans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[var(--text-secondary)]">
                      Tidak ada data scan yang cocok dengan pencarian &quot;{scanSearch}&quot;.
                    </td>
                  </tr>
                ) : (
                  paginatedScans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="hover:bg-[var(--bg-base)]/60 transition-colors group"
                    >
                      {/* Tanggal */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                          <span>{scan.displayDate}</span>
                          {scan.status === 'PR_COMPOSITION' && (
                            <span className="px-1.5 py-0.2 rounded bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 text-[9px] font-bold text-[var(--accent-primary)]">
                              BEST
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Berat Badan */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold font-mono text-[var(--text-primary)]">
                        {scan.weight} kg
                        <span className="block text-[10px] text-[var(--color-moss-600)] font-normal">
                          {scan.weightDelta}
                        </span>
                      </td>

                      {/* SMM */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold font-mono text-[var(--color-moss-600)]">
                        {scan.smm} kg
                        <span className="block text-[10px] text-[var(--color-moss-600)] font-normal">
                          {scan.smmDelta}
                        </span>
                      </td>

                      {/* Body Fat % */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold font-mono text-[var(--accent-secondary)]">
                        {scan.bodyFatPct}%
                      </td>

                      {/* Lemak (kg) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[var(--text-secondary)]">
                        {scan.bodyFatKg} kg
                      </td>

                      {/* TBW */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-sky-400">
                        {scan.waterContent}%
                      </td>

                      {/* BMI */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[var(--text-secondary)]">
                        {scan.bmi}
                      </td>

                      {/* Status / Evaluasi */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${
                            scan.status === 'PR_COMPOSITION'
                              ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40'
                              : scan.status === 'MUSCLE_GAIN'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : scan.status === 'FAT_LOSS'
                              ? 'bg-[var(--color-moss-600)]/20 text-[var(--color-moss-600)] border border-[var(--color-moss-600)]/40'
                              : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                          }`}
                        >
                          {scan.evaluation}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* InBody Table Pagination */}
          <div className="p-3 bg-[var(--bg-base)]/40">
            <Pagination
              currentPage={scanPage}
              totalPages={totalScanPages}
              totalItems={filteredScans.length}
              pageSize={scanPageSize}
              onPageChange={setScanPage}
              onPageSizeChange={(newSize) => {
                setScanPageSize(newSize);
                setScanPage(1);
              }}
              pageSizeOptions={[1, 5, 10, 15, 20]}
              itemLabel="data scan InBody"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
