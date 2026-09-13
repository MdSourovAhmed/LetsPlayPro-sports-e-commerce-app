const BRANDS = ["Nike", "Adidas", "Yonex", "SS", "Li-Ning", "Puma", "Wilson", "Spalding"];

export function BrandStrip() {
  return (
    <section className="border-y border-line py-10">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
        {BRANDS.map((brand) => (
          <span key={brand} className="font-display text-lg text-ink-soft/60 transition-colors hover:text-ink">
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}
