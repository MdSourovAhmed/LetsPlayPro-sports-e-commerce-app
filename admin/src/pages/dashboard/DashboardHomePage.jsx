import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Users,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  PlusCircle,
  Eye,
  UserCog,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { SkeletonCard, SkeletonTable } from '@/components/common/Skeleton';
import { ErrorState, EmptyState } from '@/components/common/States';
import { dashboardApi } from '@/api/dashboardApi';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

const QUICK_ACTIONS = [
  { label: 'Add product', to: '/products/new', icon: PlusCircle },
  { label: 'View orders', to: '/orders', icon: Eye },
  { label: 'Manage users', to: '/users', icon: UserCog },
  { label: 'View analytics', to: '/analytics', icon: BarChart3 },
];

export default function DashboardHomePage() {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | success | error

  async function load() {
    setStatus('loading');
    try {
      const { data } = await dashboardApi.getSummary();
      setSummary(data);
      setStatus('success');
    } catch (err) {
      console.error('[DashboardHomePage]', err);
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (status === 'error') {
    return <ErrorState description="Couldn't load dashboard data." onRetry={load} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to}>
            <Button variant="secondary" icon={Icon} className="w-full justify-start">
              {label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total revenue" value={formatCurrency(summary.totalRevenue)} icon={DollarSign} />
          <StatCard label="Total orders" value={summary.totalOrders} icon={ShoppingCart} />
          <StatCard label="Total products" value={summary.totalProducts} icon={Package} />
          <StatCard label="Total users" value={summary.totalUsers} icon={Users} />
          <StatCard
            label="Pending orders"
            value={summary.pendingOrders}
            icon={Clock}
            tone="attention"
          />
          <StatCard
            label="Completed orders"
            value={summary.completedOrders}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="Cancelled orders"
            value={summary.cancelledOrders}
            icon={XCircle}
            tone="danger"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark shadow-panel">
          <div className="flex items-center justify-between border-b border-border dark:border-border-dark px-5 py-4">
            <h2 className="font-display font-semibold text-ink dark:text-ink-dark">Recent orders</h2>
            <Link to="/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              View all
            </Link>
          </div>
          {status === 'loading' ? (
            <div className="p-4">
              <SkeletonTable rows={4} columns={4} />
            </div>
          ) : summary.recentOrders?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark text-left text-muted dark:text-muted-dark">
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border dark:border-border-dark last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-ink dark:text-ink-dark">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-5 py-3 text-ink dark:text-ink-dark">{order.customerName}</td>
                    <td className="px-5 py-3">
                      <Badge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-ink dark:text-ink-dark">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="No orders yet" description="New orders will show up here." />
          )}
        </div>

        {/* Low stock alert */}
        <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark shadow-panel">
          <div className="flex items-center gap-2 border-b border-border dark:border-border-dark px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-attention-500" />
            <h2 className="font-display font-semibold text-ink dark:text-ink-dark">Low stock</h2>
          </div>
          {status === 'loading' ? (
            <div className="p-5">
              <SkeletonTable rows={3} columns={2} />
            </div>
          ) : summary.lowStockProducts?.length ? (
            <ul className="divide-y divide-border dark:divide-border-dark">
              {summary.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink dark:text-ink-dark">{p.name}</p>
                    <p className="text-xs text-muted dark:text-muted-dark">SKU {p.sku}</p>
                  </div>
                  <Badge status="out_of_stock" label={`${p.stock} left`} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Stock levels look healthy" description="No low-stock alerts right now." />
          )}
        </div>
      </div>

      {/* Recent registrations */}
      <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark shadow-panel">
        <div className="flex items-center justify-between border-b border-border dark:border-border-dark px-5 py-4">
          <h2 className="font-display font-semibold text-ink dark:text-ink-dark">
            Recent registrations
          </h2>
          <Link to="/users" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            View all
          </Link>
        </div>
        {status === 'loading' ? (
          <div className="p-4">
            <SkeletonTable rows={3} columns={3} />
          </div>
        ) : summary.recentUsers?.length ? (
          <ul className="divide-y divide-border dark:divide-border-dark">
            {summary.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink dark:text-ink-dark">{u.name}</p>
                    <p className="text-xs text-muted dark:text-muted-dark">{u.email}</p>
                  </div>
                </div>
                <span className="text-xs text-muted dark:text-muted-dark">
                  {formatDateTime(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No new users yet" description="New registrations will show up here." />
        )}
      </div>
    </div>
  );
}
