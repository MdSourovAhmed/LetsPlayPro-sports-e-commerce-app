import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Scale, Minus, Plus, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useProduct, useRelatedProducts } from "../hooks/useProducts";
import { ProductGallery } from "../components/product/ProductGallery";
import { ProductGrid } from "../components/product/ProductGrid";
import { Price } from "../components/ui/Price";
import { Rating } from "../components/ui/Rating";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { SectionHeading } from "../components/ui/SectionHeading";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCompareStore } from "../store/useCompareStore";
import { useUIStore } from "../store/useUIStore";
import { cn } from "../utils/cn";

const TABS = ["Description", "Specifications", "Reviews"];

export default function ProductDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useProduct(id);
  const product = data?.data;

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");

  const addToCart = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) => (product ? s.isWishlisted(product._id) : false));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isComparing = useCompareStore((s) => (product ? s.isComparing(product._id) : false));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const addRecentlyViewed = useUIStore((s) => s.addRecentlyViewed);

  const { data: relatedData, isLoading: relatedLoading } = useRelatedProducts({
    sport: product?.sport,
    type: product?.type,
    excludeId: product?._id,
  });

  useEffect(() => {
    if (product?._id) addRecentlyViewed(product._id);
  }, [product?._id, addRecentlyViewed]);

  useEffect(() => {
    if (product?.specifications?.size?.length) setSelectedSize(product.specifications.size[0]);
  }, [product]);

  if (isLoading) {
    return (
      <div className="container-page grid grid-cols-1 gap-10 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return <ErrorState message={error?.message || "This product couldn't be found."} onRetry={refetch} />;
  }

  const stock = selectedVariant?.stock ?? product.stock;
  const outOfStock = stock <= 0;
  const effectivePrice = product.price + (selectedVariant?.priceModifier ?? 0);

  function handleAddToCart() {
    if (outOfStock) return;
    addToCart(
      { ...product, price: effectivePrice },
      { size: selectedSize, quantity }
    );
    toast.success("Added to cart");
  }

  // Group variants by their `name` field (e.g. "Color" -> ["Red", "Blue"])
  const variantGroups = (product.variants ?? []).reduce((acc, v) => {
    acc[v.name] = acc[v.name] ? [...acc[v.name], v] : [v];
    return acc;
  }, {});

  return (
    <div className="container-page py-10">
      <nav className="mb-6 flex items-center gap-2 text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-ink">Collection</Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div className="flex flex-col gap-5">
          {product.brand && (
            <span className="text-xs uppercase tracking-wide text-ink-soft">{product.brand}</span>
          )}
          <h1 className="font-display text-3xl text-ink">{product.name}</h1>

          <div className="flex items-center gap-3">
            <Rating value={4.5} count={128} />
            <span className="text-xs text-ink-soft">SKU: {product.sku || "—"}</span>
          </div>

          <Price price={product.price} discountPrice={product.discountPrice} size="lg" />

          {product.shortDescription && (
            <p className="text-sm leading-relaxed text-ink-soft">{product.shortDescription}</p>
          )}

          <div className="flex items-center gap-2">
            {outOfStock ? (
              <Badge tone="danger">Out of stock</Badge>
            ) : stock <= 5 ? (
              <Badge tone="accent">Only {stock} left</Badge>
            ) : (
              <Badge tone="success">In stock</Badge>
            )}
          </div>

          {product.specifications?.size?.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink">Size</span>
              <div className="flex flex-wrap gap-2">
                {product.specifications.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "border px-4 py-2 text-sm",
                      selectedSize === size
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink-soft hover:border-ink hover:text-ink"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {Object.entries(variantGroups).map(([groupName, options]) => (
            <div key={groupName} className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink">{groupName}</span>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedVariant(opt)}
                    disabled={opt.stock <= 0}
                    className={cn(
                      "border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-30",
                      selectedVariant?.value === opt.value
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink-soft hover:border-ink hover:text-ink"
                    )}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-line">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-3 text-ink-soft hover:text-ink"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                aria-label="Increase quantity"
                className="p-3 text-ink-soft hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button onClick={handleAddToCart} disabled={outOfStock} className="btn-primary flex-1">
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              onClick={() => toggleWishlist(product._id)}
              aria-pressed={isWishlisted}
              aria-label="Toggle wishlist"
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center border border-line transition-colors hover:border-ink",
                isWishlisted && "border-ink bg-ink text-white"
              )}
            >
              <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => toggleCompare(product._id)}
              aria-pressed={isComparing}
              aria-label="Toggle compare"
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center border border-line transition-colors hover:border-ink",
                isComparing && "border-ink bg-ink text-white"
              )}
            >
              <Scale className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex flex-col gap-3 border-t border-line pt-5">
            <div className="flex items-center gap-3 text-xs text-ink-soft">
              <Truck className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              Free delivery on orders over $75 — arrives in 3–5 business days.
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-soft">
              <RotateCcw className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              7-day free returns on unused items in original packaging.
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-soft">
              <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              100% authentic, sourced directly from the brand.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-line">
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 py-4 text-sm transition-colors",
                activeTab === tab ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-w-3xl py-8 text-sm leading-relaxed text-ink-soft">
          {activeTab === "Description" && (
            <p>{product.description || "No description available for this product yet."}</p>
          )}

          {activeTab === "Specifications" && (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {Object.entries(product.specifications ?? {})
                .filter(([, value]) => value && (Array.isArray(value) ? value.length : true))
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-line py-2">
                    <dt className="capitalize text-ink">{key}</dt>
                    <dd>{Array.isArray(value) ? value.join(", ") : value}</dd>
                  </div>
                ))}
              {Object.keys(product.specifications ?? {}).length === 0 && (
                <p>No specifications listed for this product.</p>
              )}
            </dl>
          )}

          {activeTab === "Reviews" && (
            <p>No reviews yet — be the first to review this product after your purchase.</p>
          )}
        </div>
      </div>

      <div className="mt-16">
        <SectionHeading eyebrow="You Might Also Like" title="Related Products" align="left" />
        <div className="mt-8">
          <ProductGrid
            products={relatedData?.data}
            isLoading={relatedLoading}
            skeletonCount={5}
            columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          />
        </div>
      </div>
    </div>
  );
}
