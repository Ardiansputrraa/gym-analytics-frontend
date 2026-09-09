import React from 'react';
import { Dumbbell, Scale, Utensils, GlassWater, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimelineType = 'WORKOUT' | 'BODY' | 'FOOD' | 'DRINK' | 'ACTIVITY';

export interface TimelineEntryProps {
  time: string;
  type: TimelineType;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  isLast?: boolean;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  time,
  type,
  title,
  subtitle,
  badge,
  isLast = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'WORKOUT':
        return <Dumbbell className="w-4 h-4 text-[var(--accent-primary)]" />;
      case 'BODY':
        return <Scale className="w-4 h-4 text-[var(--accent-secondary)]" />;
      case 'FOOD':
        return <Utensils className="w-4 h-4 text-[var(--color-moss-600)]" />;
      case 'DRINK':
        return <GlassWater className="w-4 h-4 text-sky-400" />;
      case 'ACTIVITY':
      default:
        return <Activity className="w-4 h-4 text-[var(--text-secondary)]" />;
    }
  };

  return (
    <div className="flex gap-4 group">
      {/* Left Column: Timestamp & Vertical Line */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold tabular-nums text-[var(--text-tertiary)] w-12 text-right">
          {time}
        </span>
        <div className="my-1.5 p-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] shrink-0">
          {getIcon()}
        </div>
        {!isLast && <div className="w-[2px] grow bg-[var(--border-default)] my-1" />}
      </div>

      {/* Right Column: Content Card */}
      <div className={cn('grow pb-5', isLast ? 'pb-0' : '')}>
        <div className="p-3.5 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] hover:border-[var(--text-tertiary)] transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h5 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h5>
              {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
            </div>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
