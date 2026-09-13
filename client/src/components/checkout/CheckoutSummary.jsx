import { formatPrice } from "../../utils/formatPrice";
import { calculateOrderTotals } from "../../utils/orderTotals";

/**
 * @param {{subtotal: number, items: Array}} props
 */
export function CheckoutSummary({ subtotal, items }) {
  const { shipping, tax, total } = calculateOrderTotals(subtotal);

  return (
    <div className="flex flex-col gap-4 border border-line p-6">
      <h2 className="font-display text-xl text-ink">Order Summary</h2>

      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto border-b border-line pb-4">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size ?? "default"}`} className="flex justify-between text-sm">
            <span className="text-ink-soft">
              {item.name} {item.size ? `(${item.size})` : ""} × {item.quantity}
            </span>
            <span className="text-ink">{formatPrice((item.discountPrice ?? item.price) * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-ink-soft">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink-soft">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between text-ink-soft">
          <span>Tax (est.)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-medium text-ink">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
