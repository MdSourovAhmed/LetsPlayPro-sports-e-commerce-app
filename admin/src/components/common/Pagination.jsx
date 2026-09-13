import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

/**
 * @param {{page: number, pages: number, total: number, limit: number, onPageChange: (p: number) => void}} props
 */
export function Pagination({ page, pages, total, limit, onPageChange }) {
  if (!pages || pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-border dark:border-border-dark px-4 py-3">
      <p className="text-sm text-muted dark:text-muted-dark">
        Showing <span className="font-medium text-ink dark:text-ink-dark">{start}–{end}</span> of{' '}
        <span className="font-medium text-ink dark:text-ink-dark">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="px-2 text-sm text-muted dark:text-muted-dark">
          Page {page} of {pages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
