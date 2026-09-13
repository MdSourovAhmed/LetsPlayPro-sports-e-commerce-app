import { FilterSection } from "./FilterSection";
import { SPORTS, PRODUCT_TYPES } from "../../utils/constants";
import { cn } from "../../utils/cn";

const RATINGS = [4, 3, 2, 1];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const GENDERS = ["Men", "Women", "Unisex", "Kids"];

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-ink"
      />
      {label}
    </label>
  );
}

/**
 * @param {{filters: object, onChange: (next: object) => void, brands: string[]}} props
 */
export function ProductFilters({ filters, onChange, brands = [] }) {
  function toggleArrayValue(key, value) {
    const current = filters[key] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  function hasActiveFilters() {
    return (
      (filters.sport?.length ?? 0) +
        (filters.type?.length ?? 0) +
        (filters.brand?.length ?? 0) +
        (filters.size?.length ?? 0) +
        (filters.gender?.length ?? 0) >
        0 || filters.minPrice || filters.maxPrice || filters.minRating || filters.inStockOnly
    );
  }

  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">Filters</h2>
        {hasActiveFilters() && (
          <button
            onClick={() =>
              onChange({
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
              })
            }
            className="text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Sports">
        {SPORTS.map((sport) => (
          <Checkbox
            key={sport}
            label={sport}
            checked={(filters.sport ?? []).includes(sport)}
            onChange={() => toggleArrayValue("sport", sport)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Type">
        {PRODUCT_TYPES.map((type) => (
          <Checkbox
            key={type}
            label={type}
            checked={(filters.type ?? []).includes(type)}
            onChange={() => toggleArrayValue("type", type)}
          />
        ))}
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection title="Brand" defaultOpen={false}>
          {brands.map((brand) => (
            <Checkbox
              key={brand}
              label={brand}
              checked={(filters.brand ?? []).includes(brand)}
              onChange={() => toggleArrayValue("brand", brand)}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Price" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-full border border-line px-2 py-1.5 text-sm"
          />
          <span className="text-ink-soft">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-full border border-line px-2 py-1.5 text-sm"
          />
        </div>
      </FilterSection>

      <FilterSection title="Rating" defaultOpen={false}>
        {RATINGS.map((r) => (
          <button
            key={r}
            onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? null : r })}
            className={cn(
              "flex items-center gap-1 text-sm",
              filters.minRating === r ? "text-ink font-medium" : "text-ink-soft hover:text-ink"
            )}
          >
            {r}+ stars
          </button>
        ))}
      </FilterSection>

      <FilterSection title="Size" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleArrayValue("size", size)}
              className={cn(
                "border px-2.5 py-1 text-xs",
                (filters.size ?? []).includes(size)
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink-soft hover:border-ink hover:text-ink"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Gender" defaultOpen={false}>
        {GENDERS.map((g) => (
          <Checkbox
            key={g}
            label={g}
            checked={(filters.gender ?? []).includes(g)}
            onChange={() => toggleArrayValue("gender", g)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <Checkbox
          label="In stock only"
          checked={Boolean(filters.inStockOnly)}
          onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
        />
        <Checkbox
          label="On discount"
          checked={Boolean(filters.onDiscount)}
          onChange={() => onChange({ ...filters, onDiscount: !filters.onDiscount })}
        />
      </FilterSection>
    </aside>
  );
}
