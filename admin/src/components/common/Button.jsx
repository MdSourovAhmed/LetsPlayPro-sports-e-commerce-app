import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500',
  secondary:
    'bg-panel dark:bg-panel-dark border border-border dark:border-border-dark text-ink dark:text-ink-dark hover:bg-surface dark:hover:bg-surface-dark',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
  ghost: 'text-ink dark:text-ink-dark hover:bg-surface dark:hover:bg-surface-dark',
};

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      className,
      children,
      icon: Icon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          Icon && <Icon className="h-4 w-4" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
