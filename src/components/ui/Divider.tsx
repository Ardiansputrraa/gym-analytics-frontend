import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps {
  className?: string;
  thick?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ className, thick = true }) => {
  return (
    <div
      role="separator"
      className={cn(
        thick ? 'h-[3px] bg-[var(--border-default)] rounded-[1px]' : 'h-[1px] bg-[var(--border-default)]',
        'w-full my-4',
        className,
      )}
    />
  );
};
