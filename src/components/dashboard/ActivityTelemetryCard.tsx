'use client';

import React, { useState } from 'react';
import { ChevronDown, Dumbbell, Flame, Scale, Activity, Zap } from 'lucide-react';
import { EstimatedTag } from '@/components/ui/EstimatedTag';
import { cn } from '@/lib/utils';

export interface ActivityTelemetryCardProps {
  className?: string;
  onFilterChange?: (filter: string) => void;
}

interface TelemetryPoint {
  time: string;
  distanceKm: number;
  caloriesKcal: number;
  activeMin: number;
  speedKmh: number;
  cx: number;
  cyOrange: number;
  cyCyan: number;
}

const TELEMETRY_DATA_TODAY: TelemetryPoint[] = [
  { time: '09:00', distanceKm: 1.2, caloriesKcal: 85, activeMin: 12, speedKmh: 4.8, cx: 50, cyOrange: 138, cyCyan: 115 },
  { time: '13:00', distanceKm: 2.8, caloriesKcal: 160, activeMin: 25, speedKmh: 5.2, cx: 150, cyOrange: 100, cyCyan: 90 },
  { time: '17:00', distanceKm: 4.2, caloriesKcal: 245, activeMin: 38, speedKmh: 6.0, cx: 285, cyOrange: 45, cyCyan: 78 },
  { time: '21:00', distanceKm: 5.2, caloriesKcal: 285, activeMin: 48, speedKmh: 5.5, cx: 380, cyOrange: 52, cyCyan: 68 },
  { time: '24:00', distanceKm: 5.7, caloriesKcal: 302, activeMin: 55, speedKmh: 5.0, cx: 440, cyOrange: 60, cyCyan: 65 },
];

export const ActivityTelemetryCard: React.FC<ActivityTelemetryCardProps> = ({
  className,
}) => {
  const [activeFilter, setActiveFilter] = useState<'TODAY' | '7D' | '30D'>('TODAY');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const activePoint = hoveredPointIndex !== null 
    ? TELEMETRY_DATA_TODAY[hoveredPointIndex] 
    : TELEMETRY_DATA_TODAY[2]; // Default highlighted 17:00 session

  return (
    <div
      className={cn(
        'border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[20px] p-4 sm:p-6 text-[var(--text-primary)] space-y-6 shadow-md transition-all',
        className,
      )}
    >
      {/* Top Header & Filter */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-[var(--font-display)] tracking-tight text-white">
              Activity Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B2C]/10 text-[#FF6B2C] border border-[#FF6B2C]/30">
              Kinetic Curve
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Telemetri laju pembakaran kalori (Cyan) & akumulasi jarak gerak (Orange) harian.
          </p>
        </div>

        {/* Filter Dropdown Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-xs font-semibold text-white hover:border-[#FF6B2C] transition-colors cursor-pointer"
          >
            <span>{activeFilter === 'TODAY' ? 'TODAY' : activeFilter === '7D' ? '7 DAYS' : '30 DAYS'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          </button>

          {filterDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 rounded-[12px] bg-[var(--bg-surface-raised)] border border-[var(--border-default)] py-1 z-20 shadow-xl">
              {(['TODAY', '7D', '30D'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setActiveFilter(opt);
                    setFilterDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer font-medium',
                    activeFilter === opt
                      ? 'bg-[var(--accent-primary)] text-white font-bold'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-base)]',
                  )}
                >
                  {opt === 'TODAY' ? 'TODAY' : opt === '7D' ? '7 DAYS' : '30 DAYS'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Telemetry Interactive Curve Chart */}
      <div className="relative w-full pt-2 pb-2">
        {/* Time X-Axis Grid Labels */}
        <div className="grid grid-cols-5 text-center text-[11px] sm:text-xs font-semibold mb-2">
          {TELEMETRY_DATA_TODAY.map((item, idx) => {
            const isHovered = hoveredPointIndex === idx;
            const isDefaultActive = hoveredPointIndex === null && idx === 2;
            const isSelected = isHovered || isDefaultActive;

            return (
              <button
                key={item.time}
                type="button"
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
                onClick={() => setHoveredPointIndex(idx)}
                className={cn(
                  'tabular-nums py-1 rounded-[6px] transition-all cursor-pointer font-medium',
                  isSelected
                    ? 'text-[#FF6B2C] font-bold bg-[#FF6B2C]/10 scale-105'
                    : 'text-[var(--text-tertiary)] hover:text-white',
                )}
              >
                {item.time}
              </button>
            );
          })}
        </div>

        {/* SVG Interactive Curve Telemetry Canvas */}
        <div 
          className="relative h-48 sm:h-56 w-full overflow-visible select-none"
        >
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 500 160"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Subtle Dark Mountain Area Fill Gradient */}
              <linearGradient id="areaDarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#262934" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#121316" stopOpacity="0.95" />
              </linearGradient>

              {/* Primary Curve (Vibrant Orange) Gradient */}
              <linearGradient id="curveOrange" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF7E36" />
                <stop offset="60%" stopColor="#FF6B2C" />
                <stop offset="100%" stopColor="#FF5A1E" />
              </linearGradient>

              {/* Secondary Curve (Electric Cyan) Gradient */}
              <linearGradient id="curveCyan" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4CD6DE" />
                <stop offset="60%" stopColor="#4CD6DE" />
                <stop offset="100%" stopColor="#38D1DB" />
              </linearGradient>

              {/* Orange Area Glow */}
              <linearGradient id="orangeGlowArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Dashed Reference Baseline Line */}
            <line
              x1="0"
              y1="90"
              x2="500"
              y2="90"
              stroke="#2C303B"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />

            {/* Dark Mountain/Wave Base Silhouette (Matching lower black hills in image) */}
            <path
              d="M 0 160 L 0 135 Q 80 120 160 140 T 320 130 T 450 100 T 500 110 L 500 160 Z"
              fill="url(#areaDarkGradient)"
              opacity="0.95"
            />

            {/* Orange Area Glow underneath main curve */}
            <path
              d="M 0 138 C 50 130, 80 90, 110 82 C 160 72, 210 38, 280 34 C 330 31, 380 62, 440 60 L 440 160 L 0 160 Z"
              fill="url(#orangeGlowArea)"
            />

            {/* Interactive Scanline on active point */}
            <line
              x1={activePoint.cx}
              y1="10"
              x2={activePoint.cx}
              y2="155"
              stroke="#FF6B2C"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />

            {/* Secondary Smooth Curve (Electric Cyan) */}
            <path
              d="M 0 115 C 40 105, 70 85, 110 82 C 160 78, 200 100, 250 88 C 265 84, 275 80, 285 78"
              fill="none"
              stroke="url(#curveCyan)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Primary Smooth Curve (Vibrant Fire Orange) */}
            <path
              d="M 0 138 C 50 130, 80 90, 110 82 C 160 72, 210 38, 280 34 C 330 31, 380 62, 440 60"
              fill="none"
              stroke="url(#curveOrange)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Interactive Hover Hotspots & Dots for each point */}
            {TELEMETRY_DATA_TODAY.map((p, idx) => {
              const isSelected = activePoint.time === p.time;

              return (
                <g key={p.time} className="cursor-pointer">
                  {/* Invisible wide hover trigger zone */}
                  <rect
                    x={p.cx - 30}
                    y="0"
                    width="60"
                    height="160"
                    fill="transparent"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />

                  {/* Cyan point dot */}
                  <circle
                    cx={p.cx}
                    cy={p.cyCyan}
                    r={isSelected ? 6 : 4}
                    fill="#4CD6DE"
                    stroke="#121316"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />

                  {/* Orange point dot */}
                  <circle
                    cx={p.cx}
                    cy={p.cyOrange}
                    r={isSelected ? 7 : 5}
                    fill="#FF6B2C"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  {isSelected && (
                    <circle
                      cx={p.cx}
                      cy={p.cyOrange}
                      r="12"
                      fill="#FF6B2C"
                      opacity="0.35"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}

            {/* Glowing Dot on Cyan Curve Peak (285, 78) */}
            <circle cx="285" cy="78" r="5" fill="#4CD6DE" className="animate-pulse" />
            <circle cx="285" cy="78" r="9" fill="#4CD6DE" opacity="0.35" />

            {/* Glowing Dot on Orange Curve Endpoint (440, 60) */}
            <circle cx="440" cy="60" r="5" fill="#FFFFFF" />
            <circle cx="440" cy="60" r="9" fill="#FF6B2C" opacity="0.6" />
          </svg>

          {/* Floating Speech-Bubble Badge 1: 302k (Cyan Peak) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-200"
            style={{ left: '57%', top: '48%' }}
          >
            <div className="relative px-3 py-1 rounded-full bg-[#4CD6DE] text-[#121316] text-[11px] font-extrabold shadow-[0_4px_14px_rgba(76,214,222,0.45)] flex items-center justify-center font-[var(--font-display)]">
              302k
              {/* Little speech pointer triangle */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#4CD6DE] rotate-45" />
            </div>
          </div>

          {/* Floating Speech-Bubble Badge 2: 5.7 km (Orange Peak) */}
          <div
            className="absolute translate-x-2 -translate-y-1/2 pointer-events-none transition-all duration-200"
            style={{ left: '88%', top: '38%' }}
          >
            <div className="relative px-3 py-1 rounded-full bg-[#FF6B2C] text-white text-[11px] font-extrabold shadow-[0_4px_14px_rgba(255,107,44,0.5)] flex items-center justify-center font-[var(--font-display)] whitespace-nowrap">
              5.7 km
              {/* Little speech pointer */}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#FF6B2C] rotate-45" />
            </div>
          </div>

          {/* Live Dynamic Telemetry Hover Tooltip Card */}
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-30 transition-all duration-200"
            style={{
              left: `${(activePoint.cx / 500) * 100}%`,
              top: `${(Math.min(activePoint.cyOrange, activePoint.cyCyan) / 160) * 100 - 12}%`,
            }}
          >
            <div className="px-3.5 py-2 rounded-[14px] bg-[#1E2027]/95 border border-[var(--border-default)] backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.7)] text-xs space-y-1">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border-default)]/60 pb-1">
                <span className="text-[10px] font-bold text-white font-mono">{activePoint.time}</span>
                <span className="text-[9px] text-[var(--text-tertiary)]">{activePoint.activeMin} min aktif</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] pt-0.5">
                <span className="text-[#FF6B2C] font-bold font-[var(--font-display)]">
                  {activePoint.distanceKm} km
                </span>
                <span className="text-[#4CD6DE] font-bold font-[var(--font-display)]">
                  {activePoint.caloriesKcal} kcal
                </span>
                <span className="text-[#9B7CF6] font-semibold">
                  {activePoint.speedKmh} km/h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Counters Trio (28 Days Loyalty / 02 Months / 16 Practices) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-[var(--border-default)]">
        <div className="space-y-0.5">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-[var(--font-display)] text-white tabular-nums tracking-tight">
            28
          </div>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Days Loyalty
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-[var(--font-display)] text-white tabular-nums tracking-tight">
            02
          </div>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Months
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-[var(--font-display)] text-white tabular-nums tracking-tight">
            16
          </div>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Practices
          </p>
        </div>
      </div>

      {/* Telemetry Cards Grid (Healthy / Calories / Weight) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {/* Card 1: HEALTHY / 5.7 km with Circular Radial Gauge (%71) */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-base)] rounded-[18px] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-secondary)]">
                HEALTHY
              </span>
              <div className="w-5 h-1.5 rounded-full bg-[#FF6B2C]" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                5.7
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">km</span>
            </div>
          </div>

          {/* Semicircular Radial Gauge Ring Matching Screenshot (%71) */}
          <div className="flex items-center justify-center pt-1">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
                {/* Background Track Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#262934"
                  strokeWidth="12"
                  strokeDasharray="170 230"
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Active Orange Progress Arc (%71) */}
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#FF6B2C"
                  strokeWidth="12"
                  strokeDasharray="120 230"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center %71 Pill Badge */}
              <div className="absolute w-14 h-14 rounded-full bg-[var(--bg-surface-raised)] border border-[var(--border-default)] flex items-center justify-center shadow-inner">
                <span className="text-sm font-extrabold font-[var(--font-display)] text-white tabular-nums">
                  %71
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: CALORIES / 302 kcal */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-base)] rounded-[18px] p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-secondary)]">
                CALORIES
              </span>
              <div className="w-5 h-1.5 rounded-full bg-[#4CD6DE]" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                302
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">kcal</span>
              <EstimatedTag />
            </div>
          </div>

          <div className="space-y-1.5 pt-4">
            <div className="flex justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>Target Harian</span>
              <span className="font-semibold text-[var(--text-secondary)]">450 kcal</span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-surface-raised)] rounded-full overflow-hidden border border-[var(--border-default)]/60">
              <div className="h-full bg-[#4CD6DE] rounded-full w-[67%]" />
            </div>
          </div>
        </div>

        {/* Card 3: WEIGHT / 1250 kcal or kg */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-base)] rounded-[18px] p-4 flex flex-col justify-between space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-secondary)]">
                WEIGHT
              </span>
              <div className="w-5 h-1.5 rounded-full bg-[#9B7CF6]" />
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-[var(--font-display)] text-white tabular-nums">
                1250
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">kcal</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-4">
            <div className="flex justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>Efisiensi Angkatan</span>
              <span className="font-semibold text-[var(--text-secondary)]">84% Optimal</span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-surface-raised)] rounded-full overflow-hidden border border-[var(--border-default)]/60">
              <div className="h-full bg-[#9B7CF6] rounded-full w-[84%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
