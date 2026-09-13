import { Star } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * @param {{value: number, count?: number, size?: number, className?: string}} props
 */
export function Rating({ value = 0, count, size = 14, className }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={i < Math.round(value) ? "fill-accent text-accent" : "fill-transparent text-line"}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="sr-only">{value.toFixed(1)} out of 5 stars</span>
      {typeof count === "number" && (
        <span className="text-xs text-ink-soft">({count})</span>
      )}
    </div>
  );
}
