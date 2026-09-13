import { Link } from "react-router-dom";
import { Minus, Plus, X, Heart } from "lucide-react";
import { Price } from "../ui/Price";
import { useCartStore } from "../../store/useCartStore";

/**
 * @param {{item: object}} props
 */
export function CartLineItem({ item }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleSaveForLater = useCartStore((s) => s.toggleSaveForLater);

  return (
    <div className="flex gap-4 border-b border-line py-5">
      <Link to={`/product/${item.productId}`} className="h-24 w-24 shrink-0 bg-paper-dim">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/product/${item.productId}`} className="text-sm text-ink hover:underline">
              {item.name}
            </Link>
            {item.size && <p className="mt-0.5 text-xs text-ink-soft">Size: {item.size}</p>}
          </div>
          <button
            onClick={() => removeItem(item.productId, item.size)}
            aria-label="Remove item"
            className="text-ink-soft hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Price price={item.price} discountPrice={item.discountPrice} size="sm" />

        <div className="mt-1 flex items-center justify-between">
          {!item.savedForLater ? (
            <div className="flex items-center border border-line">
              <button
                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                aria-label="Decrease quantity"
                className="p-2 text-ink-soft hover:text-ink"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                aria-label="Increase quantity"
                className="p-2 text-ink-soft hover:text-ink"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-ink-soft">Saved for later</span>
          )}

          <button
            onClick={() => toggleSaveForLater(item.productId, item.size)}
            className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
          >
            <Heart className="h-3.5 w-3.5" />
            {item.savedForLater ? "Move to cart" : "Save for later"}
          </button>
        </div>
      </div>
    </div>
  );
}
