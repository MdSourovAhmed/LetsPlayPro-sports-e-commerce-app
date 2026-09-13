import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface dark:bg-surface-dark">
        <Icon className="h-6 w-6 text-muted dark:text-muted-dark" />
      </div>
      <div>
        <p className="font-medium text-ink dark:text-ink-dark">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-muted dark:text-muted-dark">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-500/10">
        <AlertCircle className="h-6 w-6 text-danger-500" />
      </div>
      <div>
        <p className="font-medium text-ink dark:text-ink-dark">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-muted dark:text-muted-dark">{description}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
