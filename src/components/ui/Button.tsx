import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'brass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 select-none rounded-[6px] cursor-pointer';

    const variants = {
      primary:
        'bg-[var(--accent-primary)] text-[var(--accent-primary-ink)] hover:bg-[#A83518] active:bg-[#912D14] font-semibold',
      secondary:
        'border border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface)] active:bg-[var(--bg-surface-raised)]',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]',
      destructive:
        'border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
      brass:
        'bg-[var(--accent-secondary)] text-[var(--bg-base)] hover:bg-[#8F6D24] font-semibold',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-12 px-5 text-sm min-h-[48px]', // Thumb-zone min 48px
      lg: 'h-14 px-6 text-base min-h-[56px]',
      icon: 'h-12 w-12 min-h-[48px] min-w-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Memproses...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
