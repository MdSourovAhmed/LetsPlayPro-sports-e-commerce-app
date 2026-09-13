import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users as UsersIcon } from 'lucide-react';
import { userApi } from '@/api/userApi';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatters';
import { SkeletonTable } from '@/components/common/Skeleton';
import { EmptyState, ErrorState } from '@/components/common/States';
import { Pagination } from '@/components/common/Pagination';
import { UserFilters } from '@/components/users/UserFilters';

export default function UsersListPage() {
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });
  const [status, setStatus] = useState('loading');

  useEffect(() => setPage(1), [debouncedSearch, filters.role, filters.status]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
    }),
    [page, debouncedSearch, filters.role, filters.status]
  );

  async function load() {
    setStatus('loading');
    try {
      const { data } = await userApi.list(queryParams);
      setUsers(data.users);
      setPagination(data.pagination);
      setStatus('success');
    } catch (err) {
      toast.error(err.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">Users</h1>

      <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark">
        <UserFilters filters={filters} onChange={setFilters} />

        {status === 'loading' && <div className="p-4"><SkeletonTable columns={5} /></div>}

        {status === 'error' && <ErrorState onRetry={load} description="Couldn't load users." />}

        {status === 'success' && users.length === 0 && (
          <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your filters." />
        )}

        {status === 'success' && users.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark text-left text-xs uppercase tracking-wide text-muted dark:text-muted-dark">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-surface dark:hover:bg-surface-dark">
                      <td className="px-4 py-3">
                        <Link to={`/users/${user.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                          {user.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink dark:text-ink-dark">{user.email}</td>
                      <td className="px-4 py-3 capitalize text-ink dark:text-ink-dark">{user.role.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.isActive
                            ? 'bg-success-50 text-success-600 dark:bg-success-500/10'
                            : 'bg-border/60 text-muted dark:bg-border-dark/60'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-success-500' : 'bg-muted'}`} />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted dark:text-muted-dark">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
