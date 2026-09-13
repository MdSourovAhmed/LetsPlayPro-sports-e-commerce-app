import { Construction } from 'lucide-react';

export function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border dark:border-border-dark py-24 text-center">
      <Construction className="h-8 w-8 text-muted dark:text-muted-dark" />
      <div>
        <p className="font-display font-semibold text-ink dark:text-ink-dark">{title}</p>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">
          This module is built in the next pass.
        </p>
      </div>
    </div>
  );
}
