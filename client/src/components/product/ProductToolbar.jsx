import { LayoutGrid, List } from "lucide-react";
import { SORT_OPTIONS } from "../../utils/constants";
import { cn } from "../../utils/cn";

/**
 * @param {{
 *   sort: string, onSortChange: (v: string) => void,
 *   view: 'grid'|'list', onViewChange: (v: 'grid'|'list') => void,
 *   resultCount?: number,
 * }} props
 */
export function ProductToolbar({ sort, onSortChange, view, onViewChange, resultCount }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
      <p className="text-sm text-ink-soft">
        {typeof resultCount === "number" ? `${resultCount} products` : ""}
      </p>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1 sm:flex" role="group" aria-label="View mode">
          <button
            onClick={() => onViewChange("grid")}
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            className={cn("p-1.5", view === "grid" ? "text-ink" : "text-ink-soft/50 hover:text-ink-soft")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
            aria-label="List view"
            className={cn("p-1.5", view === "list" ? "text-ink" : "text-ink-soft/50 hover:text-ink-soft")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <span className="hidden sm:inline">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-line bg-paper px-3 py-1.5 text-sm text-ink"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
