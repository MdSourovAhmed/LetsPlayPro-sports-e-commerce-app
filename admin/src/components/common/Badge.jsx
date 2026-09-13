import clsx from 'clsx';

// Centralized status -> color mapping so every badge, table row edge, and
// card across the app stays visually consistent. Add new statuses here only.
const STATUS_STYLES = {
  // Order statuses
  pending: 'bg-attention-50 text-attention-600 dark:bg-attention-500/10',
  confirmed: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10',
  processing: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10',
  shipped: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10',
  delivered: 'bg-success-50 text-success-600 dark:bg-success-500/10',
  cancelled: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10',
  returned: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10',
  // Product statuses
  active: 'bg-success-50 text-success-600 dark:bg-success-500/10',
  draft: 'bg-border/60 text-muted dark:bg-border-dark/60',
  out_of_stock: 'bg-attention-50 text-attention-600 dark:bg-attention-500/10',
  archived: 'bg-border/60 text-muted dark:bg-border-dark/60',
  // User account status
  paid: 'bg-success-50 text-success-600 dark:bg-success-500/10',
  unpaid: 'bg-attention-50 text-attention-600 dark:bg-attention-500/10',
  refunded: 'bg-border/60 text-muted dark:bg-border-dark/60',
};

const DOT_STYLES = {
  pending: 'bg-attention-500',
  confirmed: 'bg-brand-500',
  processing: 'bg-brand-500',
  shipped: 'bg-brand-500',
  delivered: 'bg-success-500',
  cancelled: 'bg-danger-500',
  returned: 'bg-danger-500',
  active: 'bg-success-500',
  draft: 'bg-muted',
  out_of_stock: 'bg-attention-500',
  archived: 'bg-muted',
  paid: 'bg-success-500',
  unpaid: 'bg-attention-500',
  refunded: 'bg-muted',
};

function formatLabel(status) {
  return status
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function Badge({ status, label, className }) {
  const key = status?.toLowerCase().replace(/\s+/g, '_');
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_STYLES[key] || 'bg-border/60 text-muted dark:bg-border-dark/60',
        className
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', DOT_STYLES[key] || 'bg-muted')} />
      {label || formatLabel(status || '')}
    </span>
  );
}
