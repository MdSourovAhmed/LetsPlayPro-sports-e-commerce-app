import { Link } from "react-router-dom";
import { Heart, Scale, ShoppingBag } from "lucide-react";
import { Price } from "../ui/Price";
import { Badge } from "../ui/Badge";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCompareStore } from "../../store/useCompareStore";
import { useCartStore } from "../../store/useCartStore";
import { getDiscountPercent } from "../../utils/formatPrice";
import { cn } from "../../utils/cn";
import toast from "react-hot-toast";

/**
 * @param {{product: import('../../types').Product}} props
 */
export function ProductCard({ product }) {
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product._id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isComparing = useCompareStore((s) => s.isComparing(product._id));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const addToCart = useCartStore((s) => s.addItem);

  const discountPercent = getDiscountPercent(product);
  const outOfStock = product.stock <= 0;
  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1];

  function handleWishlist(e) {
    e.preventDefault();
    toggleWishlist(product._id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  }

  function handleCompare(e) {
    e.preventDefault();
    toggleCompare(product._id);
  }

  function handleQuickAdd(e) {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(product, { quantity: 1 });
    toast.success("Added to cart");
  }

  return (
    <Link to={`/product/${product._id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden bg-paper-dim">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              secondaryImage && "group-hover:opacity-0"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-soft">
            No image
          </div>
        )}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {discountPercent && <Badge tone="danger">-{discountPercent}%</Badge>}
          {outOfStock && <Badge tone="neutral">Out of stock</Badge>}
          {product.featured && !outOfStock && <Badge tone="accent">Featured</Badge>}
        </div>

        <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            className="flex h-8 w-8 items-center justify-center bg-paper text-ink shadow-sm transition-colors hover:bg-ink hover:text-white"
          >
            <Heart className="h-3.5 w-3.5" fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleCompare}
            aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
            aria-pressed={isComparing}
            className={cn(
              "flex h-8 w-8 items-center justify-center bg-paper text-ink shadow-sm transition-colors hover:bg-ink hover:text-white",
              isComparing && "bg-ink text-white"
            )}
          >
            <Scale className="h-3.5 w-3.5" />
          </button>
        </div>

        {!outOfStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-2 bg-ink py-2.5 text-xs font-medium tracking-wide text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {product.brand && (
          <span className="text-[11px] uppercase tracking-wide text-ink-soft">{product.brand}</span>
        )}
        <h3 className="truncate text-sm text-ink">{product.name}</h3>
        <Price price={product.price} discountPrice={product.discountPrice} size="sm" />
      </div>
    </Link>
  );
}
