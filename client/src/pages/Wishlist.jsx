import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlistStore } from "../store/useWishlistStore";
import { productApi } from "../api/productApi";
import { ProductCard } from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";

export default function Wishlist() {
  const productIds = useWishlistStore((s) => s.productIds);

  const results = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => productApi.getProductById(id),
      staleTime: 60 * 1000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const products = results.map((r) => r.data?.data).filter(Boolean);

  return (
    <div className="container-page py-10">
      <SectionHeading eyebrow="Saved For Later" title="Your Wishlist" align="left" />

      <div className="mt-10">
        {productIds.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-10 w-10" strokeWidth={1.25} />}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here for later."
            action={
              <Link to="/shop" className="btn-primary mt-2">
                Browse Products
              </Link>
            }
          />
        ) : isLoading ? (
          <ProductGridSkeleton count={productIds.length} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
