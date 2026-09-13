import { useBestSellers } from "../../hooks/useProducts";
import { ProductGrid } from "../product/ProductGrid";
import { SectionHeading } from "../ui/SectionHeading";

export function BestSellers() {
  const { data, isLoading, isError, error, refetch } = useBestSellers(10);

  return (
    <section className="bg-paper-dim py-20">
      <div className="container-page">
        <SectionHeading eyebrow="Fan Favorites" title="Best Sellers" />
        <div className="mt-10">
          <ProductGrid
            products={data?.data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={refetch}
            skeletonCount={10}
          />
        </div>
      </div>
    </section>
  );
}
