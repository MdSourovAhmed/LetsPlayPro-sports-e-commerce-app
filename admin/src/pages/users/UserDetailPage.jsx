import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Phone, Calendar, Shield, PackageSearch } from 'lucide-react';
import { userApi } from '@/api/userApi';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import { ErrorState, EmptyState } from '@/components/common/States';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const hasRole = useAuthStore((s) => s.hasRole);

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load() {
    setStatus('loading');
    try {
      const [{ data: userData }, { data: orderData }] = await Promise.all([
        userApi.getById(id),
        userApi.getOrderHistory(id).catch(() => ({ data: { orders: [] } })), // don't block the page on this one failing
      ]);
      setUser(userData.user);
      setOrders(orderData.orders || []);
      setStatus('success');
    } catch (err) {
      toast.error(err.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isSelf = currentUserId === id;

  async function handleToggleStatus() {
    setIsTogglingStatus(true);
    try {
      const { data } = await userApi.setActiveStatus(id, !user.isActive);
      setUser(data.user);
      toast.success(data.user.isActive ? 'User activated' : 'User deactivated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsTogglingStatus(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await userApi.remove(id);
      toast.success('User deleted');
      navigate('/users');
    } catch (err) {
      toast.error(err.message);
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (status === 'error' || !user) {
    return <ErrorState onRetry={load} description="Couldn't load this user." />;
  }

  // Deleting/deactivating users requires 'admin' (not just 'staff') — mirrors the backend's
  // requireRole('admin') guard on DELETE /admin/users/:id. Hiding the action for staff avoids
  // a confusing "click it, get a 403" round trip.
  const canManageAccount = hasRole('admin');

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link to="/users" className="text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">{user.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Profile</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              user.isActive
                ? 'bg-success-50 text-success-600 dark:bg-success-500/10'
                : 'bg-border/60 text-muted dark:bg-border-dark/60'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-success-500' : 'bg-muted'}`} />
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-ink dark:text-ink-dark">
              <Mail className="h-4 w-4 text-muted dark:text-muted-dark" /> {user.email}
            </div>
            <div className="flex items-center gap-2 text-ink dark:text-ink-dark">
              <Phone className="h-4 w-4 text-muted dark:text-muted-dark" /> {user.phone || '—'}
            </div>
            <div className="flex items-center gap-2 text-ink dark:text-ink-dark">
              <Shield className="h-4 w-4 text-muted dark:text-muted-dark" /> <span className="capitalize">{user.role.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-ink dark:text-ink-dark">
              <Calendar className="h-4 w-4 text-muted dark:text-muted-dark" /> Joined {formatDate(user.createdAt)}
            </div>
          </div>

          {canManageAccount && (
            <div className="mt-5 flex gap-2 border-t border-border dark:border-border-dark pt-4">
              <Button
                variant="secondary"
                size="sm"
                isLoading={isTogglingStatus}
                disabled={isSelf}
                onClick={handleToggleStatus}
              >
                {user.isActive ? 'Deactivate' : 'Activate'} Account
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isSelf}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete Account
              </Button>
              {isSelf && (
                <p className="flex items-center text-xs text-muted dark:text-muted-dark">
                  You can't deactivate or delete your own account.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark">
        <h2 className="border-b border-border dark:border-border-dark p-5 font-display text-sm font-semibold text-ink dark:text-ink-dark">
          Order History
        </h2>

        {orders.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No orders yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark text-left text-xs uppercase tracking-wide text-muted dark:text-muted-dark">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-surface dark:hover:bg-surface-dark">
                  <td className="px-5 py-3">
                    <Link to={`/orders/${order._id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink dark:text-ink-dark">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-3"><Badge status={order.status} /></td>
                  <td className="px-5 py-3 text-muted dark:text-muted-dark">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete this account?"
        description={`"${user.name}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
