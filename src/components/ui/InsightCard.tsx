import React from 'react';
import { Lightbulb, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InsightCardProps {
  title: string;
  description: string;
  type?: 'INFO' | 'ACTION' | 'WARNING';
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  type = 'INFO',
  className,
}) => {
  return (
    <div
      className={cn(
        'border-l-[3px] border-[var(--accent-secondary)] bg-[var(--bg-surface)] border-y border-r border-[var(--border-default)] p-4 rounded-r-[6px]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-[var(--accent-secondary)] mt-0.5 shrink-0">
          {type === 'WARNING' ? (
            <AlertCircle className="w-5 h-5" />
          ) : type === 'ACTION' ? (
            <Lightbulb className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm md:text-base font-semibold text-[var(--text-primary)] leading-snug">
            {title}
          </h4>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
