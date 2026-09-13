import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useOrder, useCancelOrder } from "../../hooks/useOrders";
import { OrderStatusTimeline } from "../../components/account/OrderStatusTimeline";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { formatPrice } from "../../utils/formatPrice";

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

export default function OrderDetails() {
  const { orderId } = useParams();
  const { data, isLoading, isError, error, refetch } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const order = data?.data;

  if (isError || !order) {
    return (
      <ErrorState
        message={error?.message || "We couldn't find this order. It may belong to a different account."}
        onRetry={refetch}
      />
    );
  }

  const isCancellable = CANCELLABLE_STATUSES.includes(order.status);

  async function handleCancel(e) {
    e.preventDefault();
    try {
      await cancelOrder.mutateAsync({ orderId: order._id, reason: cancelReason });
      toast.success("Order cancelled");
      setShowCancelForm(false);
    } catch (err) {
      toast.error(err.message || "Couldn't cancel this order. Please contact support.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-sm text-ink-soft">Order</p>
          <h2 className="font-display text-2xl text-ink">#{order._id.slice(-8).toUpperCase()}</h2>
        </div>
        <Badge tone={order.paymentStatus === "paid" ? "success" : "neutral"}>
          Payment {order.paymentStatus}
        </Badge>
      </div>

      <OrderStatusTimeline status={order.status} />

      {order.status === "cancelled" && order.cancellationReason && (
        <p className="text-sm text-ink-soft">
          Cancellation reason: <span className="text-ink">{order.cancellationReason}</span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">
            Shipping Address
          </h3>
          <div className="text-sm leading-relaxed text-ink-soft">
            <p className="text-ink">
              {order.deliveryInfo?.firstName} {order.deliveryInfo?.lastName}
            </p>
            <p>{order.deliveryInfo?.street}</p>
            <p>
              {order.deliveryInfo?.city}, {order.deliveryInfo?.zip}
            </p>
            <p>{order.deliveryInfo?.country}</p>
            <p>{order.deliveryInfo?.phone}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">
            Payment Method
          </h3>
          <p className="text-sm capitalize text-ink-soft">{order.paymentMethod}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">Items</h3>
        <div className="flex flex-col divide-y divide-line border-y border-line">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between py-3 text-sm">
              <span className="text-ink-soft">
                {item.quantity} × Product {item.productId.slice(-6)}
                {item.size ? ` (${item.size})` : ""}
              </span>
              <span className="text-ink">{formatPrice((item.priceAtPurchase ?? 0) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-3 text-base font-medium text-ink">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {isCancellable && !showCancelForm && (
          <button onClick={() => setShowCancelForm(true)} className="btn-secondary">
            Cancel Order
          </button>
        )}
        <Link to="/contact" className="btn-ghost">
          Contact Support
        </Link>
      </div>

      {showCancelForm && (
        <form onSubmit={handleCancel} className="flex flex-col gap-3 border border-line p-5">
          <label className="text-sm text-ink">Why are you cancelling?</label>
          <textarea
            required
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="input-field resize-none"
            placeholder="Let us know what happened…"
          />
          <div className="flex gap-3">
            <button type="submit" disabled={cancelOrder.isPending} className="btn-primary">
              {cancelOrder.isPending ? "Cancelling…" : "Confirm Cancellation"}
            </button>
            <button type="button" onClick={() => setShowCancelForm(false)} className="btn-ghost">
              Never mind
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
