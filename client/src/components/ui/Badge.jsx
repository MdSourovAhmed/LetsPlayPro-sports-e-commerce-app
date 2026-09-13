import { cn } from "../../utils/cn";

const TONES = {
  neutral: "bg-neutral-100 text-ink-soft",
  accent: "bg-accent/15 text-accent-dark",
  danger: "bg-red-50 text-danger",
  success: "bg-green-50 text-success",
};

/**
 * @param {{children: React.ReactNode, tone?: keyof TONES, className?: string}} props
 */
export function Badge({ children, tone = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
