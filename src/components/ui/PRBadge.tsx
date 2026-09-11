import React from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PRBadgeProps {
  label?: string;
  className?: string;
}

export const PRBadge: React.FC<PRBadgeProps> = ({
  label = 'PR Baru',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-[999px] bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] select-none animate-in fade-in zoom-in-95 duration-200',
        className,
      )}
    >
      <Trophy className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
};
