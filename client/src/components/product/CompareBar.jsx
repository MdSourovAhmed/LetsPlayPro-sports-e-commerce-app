import { Link } from "react-router-dom";
import { X, Scale } from "lucide-react";
import { useCompareStore } from "../../store/useCompareStore";

export function CompareBar() {
  const productIds = useCompareStore((s) => s.productIds);
  const clear = useCompareStore((s) => s.clear);

  if (productIds.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2 text-sm text-ink">
          <Scale className="h-4 w-4" strokeWidth={1.5} />
          {productIds.length} product{productIds.length === 1 ? "" : "s"} selected to compare
        </div>
        <div className="flex items-center gap-4">
          <button onClick={clear} className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
          <Link to="/compare" className="btn-primary px-6 py-2 text-xs">
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}
