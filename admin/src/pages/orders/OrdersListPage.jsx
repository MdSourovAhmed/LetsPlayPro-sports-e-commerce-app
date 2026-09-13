import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PackageSearch } from 'lucide-react';
import { orderApi } from '@/api/orderApi';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { SkeletonTable } from '@/components/common/Skeleton';
import { EmptyState, ErrorState } from '@/components/common/States';
import { Pagination } from '@/components/common/Pagination';
import { OrderFilters } from '@/components/orders/OrderFilters';

export default function OrdersListPage() {
  const [filters, setFilters] = useState({ search: '', status: '', paymentStatus: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });
  const [status, setStatus] = useState('loading');

  useEffect(() => setPage(1), [debouncedSearch, filters.status, filters.paymentStatus, filters.sort]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      sort: filters.sort,
    }),
    [page, debouncedSearch, filters.status, filters.paymentStatus, filters.sort]
  );

  async function load() {
    setStatus('loading');
    try {
      const { data } = await orderApi.list(queryParams);
      setOrders(data.orders);
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
      <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">Orders</h1>

      <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark">
        <OrderFilters filters={filters} onChange={setFilters} />

        {status === 'loading' && <div className="p-4"><SkeletonTable columns={7} /></div>}

        {status === 'error' && <ErrorState onRetry={load} description="Couldn't load orders." />}

        {status === 'success' && orders.length === 0 && (
          <EmptyState icon={PackageSearch} title="No orders found" description="Try adjusting your filters." />
        )}

        {status === 'success' && orders.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark text-left text-xs uppercase tracking-wide text-muted dark:text-muted-dark">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="cursor-pointer border-b border-border dark:border-border-dark last:border-0 hover:bg-surface dark:hover:bg-surface-dark"
                    >
                      <td className="px-4 py-3">
                        <Link to={`/orders/${order._id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink dark:text-ink-dark">
                        {order.deliveryInfo?.firstName} {order.deliveryInfo?.lastName}
                        <p className="text-xs text-muted dark:text-muted-dark">{order.deliveryInfo?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-ink dark:text-ink-dark">{order.items?.length ?? 0}</td>
                      <td className="px-4 py-3 text-ink dark:text-ink-dark">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3"><Badge status={order.status} /></td>
                      <td className="px-4 py-3"><Badge status={order.paymentStatus} /></td>
                      <td className="px-4 py-3 text-muted dark:text-muted-dark">{formatDate(order.createdAt)}</td>
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
