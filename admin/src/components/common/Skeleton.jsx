import clsx from 'clsx';

export function Skeleton({ className }) {
  return (
    <div
      className={clsx('animate-pulse rounded-md bg-border/60 dark:bg-border-dark/60', className)}
    />
  );
}

export function SkeletonText({ lines = 1, className }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={clsx('h-4', i === lines - 1 ? 'w-2/3' : 'w-full', className)} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border dark:border-border-dark">
      <div className="grid gap-4 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-3/4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 p-4 border-b border-border dark:border-border-dark last:border-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
