import { PackageSearch } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";

/**
 * @param {{
 *   products?: Array,
 *   isLoading?: boolean,
 *   isError?: boolean,
 *   error?: {message?: string},
 *   onRetry?: () => void,
 *   skeletonCount?: number,
 *   columns?: string,
 * }} props
 */
export function ProductGrid({
  products,
  isLoading,
  isError,
  error,
  onRetry,
  skeletonCount = 10,
  columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
}) {
  if (isLoading) return <ProductGridSkeleton count={skeletonCount} />;

  if (isError) {
    return <ErrorState message={error?.message} onRetry={onRetry} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-10 w-10" strokeWidth={1.25} />}
        title="No products found"
        description="Try adjusting your filters or search terms to find what you're looking for."
      />
    );
  }

  return (
    <div className={`grid ${columns} gap-x-4 gap-y-8`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
