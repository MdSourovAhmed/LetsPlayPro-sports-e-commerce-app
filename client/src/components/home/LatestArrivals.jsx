import { useLatestProducts } from "../../hooks/useProducts";
import { ProductGrid } from "../product/ProductGrid";
import { SectionHeading } from "../ui/SectionHeading";

export function LatestArrivals() {
  const { data, isLoading, isError, error, refetch } = useLatestProducts(10);

  return (
    <section className="container-page py-20">
      <SectionHeading eyebrow="Fresh In" title="New Arrivals" />
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
    </section>
  );
}
