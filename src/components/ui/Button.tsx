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
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 select-none rounded-[14px] cursor-pointer active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[var(--accent-primary)] text-white hover:bg-gradient-to-r hover:from-[#FF7E36] hover:to-[#FF5A1E] font-semibold shadow-[0_4px_16px_rgba(255,107,44,0.35)]',
      secondary:
        'border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] hover:border-[var(--text-secondary)]',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]',
      destructive:
        'border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
      brass:
        'bg-gradient-to-r from-[#FFA726] to-[#FF9100] text-[#121316] hover:brightness-110 font-semibold shadow-[0_4px_14px_rgba(255,167,38,0.3)]',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs rounded-[10px]',
      md: 'h-12 px-5 text-sm min-h-[48px] rounded-[14px]', // Thumb-zone min 48px
      lg: 'h-14 px-6 text-base min-h-[56px] rounded-[16px]',
      icon: 'h-12 w-12 min-h-[48px] min-w-[48px] rounded-[14px]',
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
