import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * @param {{message?: string, onRetry?: () => void, className?: string}} props
 */
export function ErrorState({ message, onRetry, className }) {
  return (
    <div className={`flex flex-col items-center gap-4 px-6 py-20 text-center ${className ?? ""}`}>
      <AlertTriangle className="h-8 w-8 text-danger" strokeWidth={1.5} />
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl text-ink">Something went wrong</h3>
        <p className="max-w-sm text-sm text-ink-soft">
          {message || "We couldn't load this. Please try again."}
        </p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          <RotateCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}
