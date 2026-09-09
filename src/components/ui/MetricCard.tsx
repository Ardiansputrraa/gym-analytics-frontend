import React from 'react';
import { cn } from '@/lib/utils';
import { TrendBadge, TrendBadgeProps } from './TrendBadge';
import { EstimatedTag } from './EstimatedTag';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: TrendBadgeProps;
  isEstimated?: boolean;
  subValue?: string;
  icon?: React.ReactNode;
  className?: string;
  size?: 'normal' | 'hero';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  isEstimated = false,
  subValue,
  icon,
  className,
  size = 'normal',
}) => {
  return (
    <div
      className={cn(
        'border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] p-3.5 sm:p-4 md:p-6 flex flex-col justify-between transition-colors shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="text-[11px] sm:text-xs md:text-sm font-medium text-[var(--text-secondary)] line-clamp-1">{label}</span>
        <div className="flex items-center gap-1 shrink-0">
          {isEstimated && <EstimatedTag />}
          {icon && <span className="text-[var(--text-tertiary)]">{icon}</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-1.5">
        <span
          className={cn(
            'font-bold font-[var(--font-display)] tabular-nums tracking-tight text-[var(--text-primary)]',
            size === 'hero' ? 'text-2xl sm:text-4xl md:text-5xl' : 'text-xl sm:text-2xl md:text-3xl',
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-[var(--text-secondary)]">{unit}</span>
        )}
      </div>

      {(trend || subValue) && (
        <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-xs text-[var(--text-tertiary)] border-t border-[var(--border-default)]/40 pt-1.5 gap-1">
          {trend ? <TrendBadge {...trend} /> : <div />}
          {subValue && <span className="truncate text-right">{subValue}</span>}
        </div>
      )}
    </div>
  );
};
