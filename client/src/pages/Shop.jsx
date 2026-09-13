import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductFilters } from "../components/product/ProductFilters";
import { ProductToolbar } from "../components/product/ProductToolbar";
import { ProductGrid } from "../components/product/ProductGrid";
import { useFilteredProducts } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import { PAGE_SIZE } from "../utils/constants";

const DEFAULT_FILTERS = {
  sport: [],
  type: [],
  brand: [],
  size: [],
  gender: [],
  minPrice: "",
  maxPrice: "",
  minRating: null,
  inStockOnly: false,
  onDiscount: false,
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    sport: searchParams.get("sport") ? [searchParams.get("sport")] : [],
  }));
  const [sort, setSort] = useState("relevant");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  // Reset to page 1 whenever the effective query changes
  useEffect(() => setPage(1), [filters, sort, debouncedSearch]);

  // Keep the URL shareable/bookmarkable for the search term
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("search", debouncedSearch);
    else next.delete("search");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      sort,
      search: debouncedSearch || undefined,
      sport: filters.sport.length ? filters.sport.join(",") : undefined,
      type: filters.type.length ? filters.type.join(",") : undefined,
      brand: filters.brand.length ? filters.brand.join(",") : undefined,
      size: filters.size.length ? filters.size.join(",") : undefined,
      gender: filters.gender.length ? filters.gender.join(",") : undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minRating: filters.minRating || undefined,
      inStock: filters.inStockOnly || undefined,
      onDiscount: filters.onDiscount || undefined,
    }),
    [page, sort, debouncedSearch, filters]
  );

  const { data, isLoading, isError, error, refetch, isPlaceholderData } =
    useFilteredProducts(queryParams);

  const totalPages = data?.totalPages ?? 1;
  const brands = useMemo(
    () => Array.from(new Set((data?.data ?? []).map((p) => p.brand).filter(Boolean))).sort(),
    [data]
  );
  const products = data?.data ?? [];

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="eyebrow">All Collections</span>
        </div>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-sm text-ink lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3 lg:hidden">
        <input
          type="search"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Desktop filters */}
        <div className="hidden lg:block">
          <ProductFilters filters={filters} onChange={setFilters} brands={brands} />
        </div>

        {/* Mobile filters drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="relative ml-auto h-full w-80 overflow-y-auto bg-paper p-6">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="mb-4 self-end text-ink"
              >
                <X className="h-5 w-5" />
              </button>
              <ProductFilters filters={filters} onChange={setFilters} brands={brands} />
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="mb-4 hidden lg:flex">
            <input
              type="search"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field max-w-sm"
            />
          </div>

          <ProductToolbar
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
            resultCount={data?.total}
          />

          <div className="mt-6" style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: "opacity 150ms" }}>
            <ProductGrid
              products={products}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onRetry={refetch}
              columns={
                view === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }
            />
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost disabled:opacity-30"
              >
                ← Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`flex h-8 w-8 items-center justify-center text-sm ${
                    page === i + 1 ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
