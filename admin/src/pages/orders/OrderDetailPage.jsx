import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download } from 'lucide-react';
import { orderApi } from '@/api/orderApi';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/utils/constants';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import { ErrorState } from '@/components/common/States';
import { AdminNotesPanel } from '@/components/orders/AdminNotesPanel';

const REQUIRES_REASON = ['cancelled', 'returned'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [reason, setReason] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  async function load() {
    setStatus('loading');
    try {
      const { data } = await orderApi.getById(id);
      setOrder(data.order);
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

  function openStatusModal() {
    setNextStatus(order.status);
    setReason('');
    setStatusModalOpen(true);
  }

  async function handleStatusSave() {
    if (REQUIRES_REASON.includes(nextStatus) && !reason.trim()) {
      toast.error('A reason is required for this status change');
      return;
    }
    setIsSavingStatus(true);
    try {
      const { data } = await orderApi.updateStatus(id, { status: nextStatus, reason: reason.trim() || undefined });
      setOrder(data.order);
      toast.success('Order status updated');
      setStatusModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function handlePaymentChange(e) {
    const paymentStatus = e.target.value;
    setIsSavingPayment(true);
    try {
      const { data } = await orderApi.updatePayment(id, paymentStatus);
      setOrder(data.order);
      toast.success('Payment status updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSavingPayment(false);
    }
  }

  async function handleAddNote(note) {
    try {
      const { data } = await orderApi.addNote(id, note);
      setOrder(data.order);
      toast.success('Note added');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  }

  async function handleDownloadInvoice() {
    setIsDownloading(true);
    try {
      const response = await orderApi.downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id.slice(-8)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || "Couldn't download invoice");
    } finally {
      setIsDownloading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (status === 'error' || !order) {
    return <ErrorState onRetry={load} description="Couldn't load this order." />;
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/orders" className="text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-muted dark:text-muted-dark">Placed {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Download} isLoading={isDownloading} onClick={handleDownloadInvoice}>
            Invoice
          </Button>
          <Button onClick={openStatusModal}>Update Status</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-4">
          <p className="text-xs uppercase tracking-wide text-muted dark:text-muted-dark">Order Status</p>
          <div className="mt-2"><Badge status={order.status} /></div>
          {order.cancellationReason && (
            <p className="mt-2 text-xs text-muted dark:text-muted-dark">Reason: {order.cancellationReason}</p>
          )}
        </div>

        <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-4">
          <p className="text-xs uppercase tracking-wide text-muted dark:text-muted-dark">Payment</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge status={order.paymentStatus} />
            <select
              value={order.paymentStatus}
              onChange={handlePaymentChange}
              disabled={isSavingPayment}
              className="h-8 rounded-md border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-2 text-xs text-ink dark:text-ink-dark"
            >
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <p className="mt-2 text-xs capitalize text-muted dark:text-muted-dark">via {order.paymentMethod}</p>
        </div>

        <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-4">
          <p className="text-xs uppercase tracking-wide text-muted dark:text-muted-dark">Total</p>
          <p className="mt-2 text-lg font-semibold text-ink dark:text-ink-dark">{formatCurrency(order.totalAmount)}</p>
          <p className="mt-1 text-xs text-muted dark:text-muted-dark">{order.items?.length ?? 0} item(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
            <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Items</h2>
            <div className="mt-4 flex flex-col divide-y divide-border dark:divide-border-dark">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="text-ink dark:text-ink-dark">
                      Product {String(item.productId).slice(-8)}
                      {item.size ? ` — ${item.size}` : ''}
                    </p>
                    <p className="text-xs text-muted dark:text-muted-dark">Qty {item.quantity}</p>
                  </div>
                  <p className="text-ink dark:text-ink-dark">
                    {formatCurrency((item.priceAtPurchase ?? 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <AdminNotesPanel notes={order.adminNotes || []} onAddNote={handleAddNote} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
            <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Shipping Address</h2>
            <div className="mt-3 text-sm leading-relaxed text-muted dark:text-muted-dark">
              <p className="text-ink dark:text-ink-dark">{order.deliveryInfo?.firstName} {order.deliveryInfo?.lastName}</p>
              <p>{order.deliveryInfo?.street}</p>
              <p>{order.deliveryInfo?.city}, {order.deliveryInfo?.zip}</p>
              <p>{order.deliveryInfo?.country}</p>
              <p className="mt-2">{order.deliveryInfo?.email}</p>
              <p>{order.deliveryInfo?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Order Status"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusSave} isLoading={isSavingStatus}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink dark:text-ink-dark">New status</label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
            >
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {REQUIRES_REASON.includes(nextStatus) && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink dark:text-ink-dark">Reason (required)</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 py-2 text-sm text-ink dark:text-ink-dark"
              />
              {nextStatus === 'cancelled' && order.paymentMethod === 'card' && order.paymentStatus === 'paid' && (
                <p className="text-xs text-attention-600">
                  This was paid by card — cancelling will automatically refund the customer.
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
