import { forwardRef, useId } from 'react';
import clsx from 'clsx';

export const Input = forwardRef(
  ({ label, error, hint, className, type = 'text', ...props }, ref) => {
    const generatedId = useId();
    const id = props.id || generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink dark:text-ink-dark">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={clsx(
            'h-10 rounded-lg border bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark',
            'placeholder:text-muted dark:placeholder:text-muted-dark',
            'transition-colors duration-150',
            error
              ? 'border-danger-500 focus:border-danger-500'
              : 'border-border dark:border-border-dark focus:border-brand-500',
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-danger-500">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${id}-hint`} className="text-sm text-muted dark:text-muted-dark">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
