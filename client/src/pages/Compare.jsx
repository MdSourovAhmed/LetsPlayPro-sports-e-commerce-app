import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { X, Scale } from "lucide-react";
import { useCompareStore } from "../store/useCompareStore";
import { productApi } from "../api/productApi";
import { Price } from "../components/ui/Price";
import { Rating } from "../components/ui/Rating";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { SectionHeading } from "../components/ui/SectionHeading";
import { useCartStore } from "../store/useCartStore";
import toast from "react-hot-toast";

const ROWS = [
  { key: "brand", label: "Brand" },
  { key: "sport", label: "Sport" },
  { key: "type", label: "Type" },
  { key: "stock", label: "Availability", render: (p) => (p.stock > 0 ? `${p.stock} in stock` : "Out of stock") },
  { key: "material", label: "Material", render: (p) => p.specifications?.material || "—" },
  { key: "weight", label: "Weight", render: (p) => p.specifications?.weight || "—" },
  { key: "color", label: "Color", render: (p) => p.specifications?.color || "—" },
  {
    key: "size",
    label: "Sizes",
    render: (p) => (p.specifications?.size?.length ? p.specifications.size.join(", ") : "—"),
  },
];

export default function Compare() {
  const productIds = useCompareStore((s) => s.productIds);
  const removeFromCompare = useCompareStore((s) => s.toggle);
  const addToCart = useCartStore((s) => s.addItem);

  const results = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => productApi.getProductById(id),
      staleTime: 60 * 1000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const products = results.map((r) => r.data?.data).filter(Boolean);

  if (productIds.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState
          icon={<Scale className="h-10 w-10" strokeWidth={1.25} />}
          title="Nothing to compare yet"
          description="Tap the scale icon on any product to add it here — compare up to 4 at once."
          action={
            <Link to="/shop" className="btn-primary mt-2">
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <SectionHeading eyebrow="Side by Side" title="Compare Products" align="left" />

      {isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: productIds.length }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="w-32" />
                {products.map((p) => (
                  <th key={p._id} className="border-b border-line px-3 pb-4 text-left align-bottom">
                    <div className="flex flex-col gap-2">
                      <div className="relative aspect-square w-full bg-paper-dim">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                        )}
                        <button
                          onClick={() => removeFromCompare(p._id)}
                          aria-label="Remove from comparison"
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-paper text-ink shadow-sm hover:bg-ink hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <Link to={`/product/${p._id}`} className="text-sm font-medium text-ink hover:underline">
                        {p.name}
                      </Link>
                      <Price price={p.price} discountPrice={p.discountPrice} size="sm" />
                      <Rating value={4.5} count={128} />
                      <button
                        onClick={() => {
                          if (p.stock <= 0) return;
                          addToCart(p, { quantity: 1 });
                          toast.success("Added to cart");
                        }}
                        disabled={p.stock <= 0}
                        className="btn-secondary py-2 text-xs disabled:opacity-30"
                      >
                        {p.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="border-b border-line">
                  <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-ink">
                    {row.label}
                  </td>
                  {products.map((p) => (
                    <td key={p._id} className="px-3 py-3 text-sm text-ink-soft">
                      {row.render ? row.render(p) : p[row.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-ink">
                  Discount
                </td>
                {products.map((p) => (
                  <td key={p._id} className="px-3 py-3">
                    {p.discountPrice ? <Badge tone="danger">On Sale</Badge> : <span className="text-ink-soft">—</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
