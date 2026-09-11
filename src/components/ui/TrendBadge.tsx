import React from 'react';
import { cn } from '@/lib/utils';

export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';
export type InsightAlignment = 'ON_TRACK' | 'WATCH' | 'NEUTRAL';

export interface TrendBadgeProps {
  direction: TrendDirection;
  value: string | number;
  percentage?: string | number;
  unit?: string;
  alignment?: InsightAlignment;
  className?: string;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  direction,
  value,
  percentage,
  unit,
  alignment = 'NEUTRAL',
  className,
}) => {
  const glyph = direction === 'UP' ? '▲' : direction === 'DOWN' ? '▼' : '→';

  // Rule Section 4.4: Default color is neutral Chalk Dust. Moss only when alignment === 'ON_TRACK'
  const textColor =
    alignment === 'ON_TRACK'
      ? 'text-[var(--accent-neutral-positive)]'
      : alignment === 'WATCH'
        ? 'text-[var(--accent-secondary)]'
        : 'text-[var(--text-secondary)]';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold tabular-nums',
        textColor,
        className,
      )}
    >
      <span aria-hidden="true" className="text-[10px]">
        {glyph}
      </span>
      <span>
        {value}
        {unit ? ` ${unit}` : ''}
      </span>
      {percentage !== undefined && percentage !== null && (
        <span className="opacity-80">({percentage}%)</span>
      )}
    </span>
  );
};
