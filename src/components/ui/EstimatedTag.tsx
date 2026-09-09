import React from 'react';
import { cn } from '@/lib/utils';

export interface EstimatedTagProps {
  className?: string;
  label?: string;
}

export const EstimatedTag: React.FC<EstimatedTagProps> = ({
  className,
  label = 'Estimasi',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-[999px] border border-[var(--accent-secondary)] text-[var(--accent-secondary)] bg-transparent select-none',
        className,
      )}
    >
      {label}
    </span>
  );
};
