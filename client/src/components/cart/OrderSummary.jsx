import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice";
import { calculateOrderTotals, FREE_SHIPPING_THRESHOLD } from "../../utils/orderTotals";

/**
 * @param {{subtotal: number, showCheckoutButton?: boolean, showCouponInput?: boolean}} props
 */
export function OrderSummary({ subtotal, showCheckoutButton = true, showCouponInput = true }) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const discountAmount = subtotal * appliedDiscount;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const { shipping, tax, total } = calculateOrderTotals(discountedSubtotal);

  function handleApplyCoupon(e) {
    e.preventDefault();
    setCouponError("");
    // Client-side placeholder — swap for a real /coupons/validate call once that endpoint exists.
    if (couponCode.trim().toUpperCase() === "PLAYPRO10") {
      setAppliedDiscount(0.1);
    } else {
      setAppliedDiscount(0);
      setCouponError("Invalid or expired coupon code");
    }
  }

  return (
    <div className="flex flex-col gap-4 border border-line p-6">
      <h2 className="font-display text-xl text-ink">Order Summary</h2>

      {showCouponInput && (
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="btn-secondary shrink-0 px-4 py-0 text-xs">
            Apply
          </button>
        </form>
      )}
      {couponError && <p className="-mt-2 text-xs text-danger">{couponError}</p>}
      {appliedDiscount > 0 && (
        <p className="-mt-2 text-xs text-success">Coupon applied: {appliedDiscount * 100}% off</p>
      )}

      <div className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between text-ink-soft">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
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

      {discountedSubtotal > 0 && discountedSubtotal < FREE_SHIPPING_THRESHOLD && (
        <p className="text-xs text-ink-soft">
          Add {formatPrice(FREE_SHIPPING_THRESHOLD - discountedSubtotal)} more for free shipping.
        </p>
      )}

      {showCheckoutButton && (
        <Link
          to="/checkout"
          className={`btn-primary mt-2 ${subtotal === 0 ? "pointer-events-none opacity-40" : ""}`}
        >
          Proceed to Checkout
        </Link>
      )}
    </div>
  );
}
