import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { formatPrice } from "../../utils/formatPrice";

const STATUS_TONE = {
  pending: "neutral",
  confirmed: "accent",
  processing: "accent",
  shipped: "accent",
  delivered: "success",
  cancelled: "danger",
  returned: "neutral",
};

/**
 * @param {{order: object}} props
 */
export function OrderCard({ order }) {
  return (
    <Link
      to={`/account/orders/${order._id}`}
      className="flex flex-col gap-3 border border-line p-5 transition-colors hover:border-ink sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-sm text-ink">Order #{order._id.slice(-8).toUpperCase()}</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          Placed {new Date(order.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          {" · "}
          {order.items?.length ?? 0} item{order.items?.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-ink">{formatPrice(order.totalAmount)}</span>
        <Badge tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status}</Badge>
      </div>
    </Link>
  );
}
