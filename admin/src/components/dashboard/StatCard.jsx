import clsx from 'clsx';

export function StatCard({ label, value, icon: Icon, tone = 'default', hint }) {
  const toneStyles = {
    default: 'border-l-border dark:border-l-border-dark',
    attention: 'border-l-attention-500',
    success: 'border-l-success-500',
    danger: 'border-l-danger-500',
  };

  return (
    <div
      className={clsx(
        'rounded-xl border border-l-[3px] border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5 shadow-panel',
        toneStyles[tone]
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted dark:text-muted-dark">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted dark:text-muted-dark" />}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-ink dark:text-ink-dark">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted dark:text-muted-dark">{hint}</p>}
    </div>
  );
}
