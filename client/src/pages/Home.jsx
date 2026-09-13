import { lazy, Suspense } from "react";
import { Hero } from "../components/home/Hero";
import { PolicyStrip } from "../components/home/PolicyStrip";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { Skeleton } from "../components/ui/Skeleton";

const LatestArrivals = lazy(() =>
  import("../components/home/LatestArrivals").then((m) => ({ default: m.LatestArrivals }))
);
const ShopBySport = lazy(() =>
  import("../components/home/ShopBySport").then((m) => ({ default: m.ShopBySport }))
);
const BestSellers = lazy(() =>
  import("../components/home/BestSellers").then((m) => ({ default: m.BestSellers }))
);
const FlashSale = lazy(() =>
  import("../components/home/FlashSale").then((m) => ({ default: m.FlashSale }))
);
const BrandStrip = lazy(() =>
  import("../components/home/BrandStrip").then((m) => ({ default: m.BrandStrip }))
);
const WhyChooseUs = lazy(() =>
  import("../components/home/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs }))
);
const Testimonials = lazy(() =>
  import("../components/home/Testimonials").then((m) => ({ default: m.Testimonials }))
);

function SectionFallback() {
  return (
    <div className="container-page py-20">
      <Skeleton className="mx-auto h-8 w-48" />
      <div className="mt-10">
        <ProductGridSkeleton count={5} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <PolicyStrip />

      <Suspense fallback={<SectionFallback />}>
        <LatestArrivals />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ShopBySport />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <BestSellers />
      </Suspense>

      <Suspense fallback={<div className="h-64" />}>
        <FlashSale />
      </Suspense>

      <Suspense fallback={<div className="h-24" />}>
        <BrandStrip />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <WhyChooseUs />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <Testimonials />
      </Suspense>
    </>
  );
}
