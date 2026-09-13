import { Check, X, RotateCcw } from "lucide-react";
import { cn } from "../../utils/cn";

const HAPPY_PATH = ["pending", "confirmed", "processing", "shipped", "delivered"];

/**
 * @param {{status: string}} props
 */
export function OrderStatusTimeline({ status }) {
  if (status === "cancelled" || status === "returned") {
    return (
      <div className="flex items-center gap-3 border border-line px-4 py-3">
        {status === "cancelled" ? (
          <X className="h-5 w-5 text-danger" strokeWidth={1.5} />
        ) : (
          <RotateCcw className="h-5 w-5 text-ink-soft" strokeWidth={1.5} />
        )}
        <span className="text-sm capitalize text-ink">
          Order {status}
        </span>
      </div>
    );
  }

  const currentIndex = HAPPY_PATH.indexOf(status);

  return (
    <div className="flex items-center">
      {HAPPY_PATH.map((step, i) => {
        const isDone = i <= currentIndex;
        const isLast = i === HAPPY_PATH.length - 1;
        return (
          <div key={step} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                  isDone ? "border-ink bg-ink text-white" : "border-line text-ink-soft"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-[11px] capitalize", isDone ? "text-ink" : "text-ink-soft")}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className={cn("mx-2 h-px flex-1", i < currentIndex ? "bg-ink" : "bg-line")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
