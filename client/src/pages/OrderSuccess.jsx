import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "../utils/formatPrice";

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    // Direct navigation without an order in state — don't show a fake confirmation.
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
      <CheckCircle2 className="h-14 w-14 text-success" strokeWidth={1.25} />
      <h1 className="font-display text-3xl text-ink">Thank you for your order!</h1>
      <p className="max-w-md text-sm text-ink-soft">
        We've received your order and it's now {order.stockStatus === "confirmed" ? "confirmed" : "awaiting confirmation"}.
        A confirmation email is on its way to {order.deliveryInfo?.email}.
      </p>

      <div className="mt-4 flex flex-col gap-1 border border-line px-8 py-5 text-sm">
        <div className="flex justify-between gap-8">
          <span className="text-ink-soft">Order ID</span>
          <span className="text-ink">{order._id}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-ink-soft">Total</span>
          <span className="text-ink">{formatPrice(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-ink-soft">Payment Method</span>
          <span className="capitalize text-ink">{order.paymentMethod}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link to="/shop" className="btn-secondary">
          Continue Shopping
        </Link>
        <Link to="/account/orders" className="btn-primary">
          Track Order
        </Link>
      </div>
    </div>
  );
}
