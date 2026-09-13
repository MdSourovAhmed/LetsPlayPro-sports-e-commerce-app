import { Search } from 'lucide-react';
import { Input } from '../common/Input';
import { USER_ROLES } from '@/utils/constants';

/**
 * @param {{filters: object, onChange: (next: object) => void}} props
 */
export function UserFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border dark:border-border-dark p-4">
      <div className="min-w-[220px] flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-muted-dark" />
          <Input
            placeholder="Search name, email, phone…"
            className="pl-9"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      <select
        value={filters.role}
        onChange={(e) => onChange({ ...filters, role: e.target.value })}
        className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
      >
        <option value="">All roles</option>
        {USER_ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
      </select>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
