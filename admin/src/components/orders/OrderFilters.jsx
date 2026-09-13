import { Search } from 'lucide-react';
import { Input } from '../common/Input';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/utils/constants';

/**
 * @param {{filters: object, onChange: (next: object) => void}} props
 */
export function OrderFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border dark:border-border-dark p-4">
      <div className="min-w-[220px] flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-muted-dark" />
          <Input
            placeholder="Search order ID, name, email, phone…"
            className="pl-9"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
      >
        <option value="">All statuses</option>
        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select
        value={filters.paymentStatus}
        onChange={(e) => onChange({ ...filters, paymentStatus: e.target.value })}
        className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
      >
        <option value="">All payment statuses</option>
        {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value })}
        className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="total_desc">Total: High to Low</option>
        <option value="total_asc">Total: Low to High</option>
      </select>
    </div>
  );
}
