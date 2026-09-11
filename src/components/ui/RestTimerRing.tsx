'use client';

import React from 'react';
import { formatDuration } from '@/lib/utils';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { Button } from './Button';

export interface RestTimerRingProps {
  remainingSeconds: number;
  totalSeconds: number;
  configuredTarget: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onAdd15s: () => void;
  onSub15s: () => void;
  onSelectTarget?: (seconds: number) => void;
}

export const RestTimerRing: React.FC<RestTimerRingProps> = ({
  remainingSeconds,
  totalSeconds,
  configuredTarget,
  isRunning,
  onToggle,
  onReset,
  onAdd15s,
  onSub15s,
}) => {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-5 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] space-y-4 shadow-xl">
      <div className="w-full flex items-center justify-between border-b border-[var(--border-default)]/60 pb-2">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          Rest Timer Antar Set
        </span>
        <span className="text-xs px-2.5 py-0.5 rounded bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-mono font-bold border border-[var(--accent-primary)]/30">
          Target: {formatDuration(configuredTarget)}
        </span>
      </div>

      {/* SVG Ring Countdown */}
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-[var(--border-default)]"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`transition-all duration-300 ease-linear ${
              isRunning ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'
            }`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold font-[var(--font-display)] tabular-nums text-[var(--text-primary)]">
            {formatDuration(remainingSeconds)}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-medium">
            {isRunning ? '⏳ Sedang Istirahat' : '⏸️ Timer Jeda'}
          </span>
        </div>
      </div>

      {/* Action Controls (-15s, Reset, Play/Pause, +15s) */}
      <div className="flex items-center gap-2 w-full justify-center pt-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={onSub15s}
          title="Kurangi Waktu Istirahat (-15s)"
          className="px-2.5 text-xs font-bold"
        >
          <Minus className="w-3.5 h-3.5 mr-0.5 text-red-400" /> 15s
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onReset}
          title="Reset ke Target Durasi"
          aria-label="Reset Timer"
          className="px-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant={isRunning ? 'secondary' : 'primary'}
          size="sm"
          onClick={onToggle}
          disabled={!isRunning}
          title={
            isRunning
              ? 'Jeda Waktu Istirahat'
              : 'Rest timer akan berjalan otomatis saat Anda mencentang set selesai'
          }
          className={`min-w-[96px] text-xs font-bold shadow-sm transition-all ${
            !isRunning
              ? 'opacity-40 cursor-not-allowed bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-raised)] shadow-none'
              : ''
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 mr-1" /> Jeda
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 mr-1" /> Mulai
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onAdd15s}
          title="Tambah Waktu Istirahat (+15s)"
          className="px-2.5 text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5 mr-0.5 text-emerald-400" /> 15s
        </Button>
      </div>
    </div>
  );
};
