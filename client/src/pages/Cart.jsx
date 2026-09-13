import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCartStore, selectCartSubtotal } from "../store/useCartStore";
import { CartLineItem } from "../components/cart/CartLineItem";
import { OrderSummary } from "../components/cart/OrderSummary";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);

  const activeItems = items.filter((i) => !i.savedForLater);
  const savedItems = items.filter((i) => i.savedForLater);

  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" strokeWidth={1.25} />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Let's fix that."
          action={
            <Link to="/shop" className="btn-primary mt-2">
              Continue Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <SectionHeading eyebrow="Your Items" title="Shopping Cart" align="left" />

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          {activeItems.map((item) => (
            <CartLineItem key={`${item.productId}-${item.size ?? "default"}`} item={item} />
          ))}

          {savedItems.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink">
                Saved for later ({savedItems.length})
              </h3>
              {savedItems.map((item) => (
                <CartLineItem key={`${item.productId}-${item.size ?? "default"}-saved`} item={item} />
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 lg:shrink-0">
          <OrderSummary subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}
