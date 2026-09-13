import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <Loader2
      className={clsx('animate-spin text-brand-500', sizes[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface dark:bg-surface-dark">
      <Spinner size="lg" />
    </div>
  );
}
