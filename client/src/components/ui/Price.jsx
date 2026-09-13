import { formatPrice, getDiscountPercent } from "../../utils/formatPrice";
import { cn } from "../../utils/cn";

/**
 * @param {{price: number, discountPrice?: number|null, size?: 'sm'|'md'|'lg', className?: string}} props
 */
export function Price({ price, discountPrice, size = "md", className }) {
  const discountPercent = getDiscountPercent({ price, discountPrice });
  const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-2xl" }[size];

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-medium text-ink", sizeClass)}>
        {formatPrice(discountPrice ?? price)}
      </span>
      {discountPercent && (
        <>
          <span className="text-sm text-ink-soft line-through">{formatPrice(price)}</span>
          <span className="text-xs font-medium text-danger">-{discountPercent}%</span>
        </>
      )}
    </div>
  );
}
