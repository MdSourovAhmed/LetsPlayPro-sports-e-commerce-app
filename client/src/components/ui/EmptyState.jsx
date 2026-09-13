import { cn } from "../../utils/cn";

/**
 * @param {{icon?: React.ReactNode, title: string, description?: string, action?: React.ReactNode, className?: string}} props
 */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center gap-4 px-6 py-20 text-center", className)}>
      {icon && <div className="text-ink-soft/50">{icon}</div>}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl text-ink">{title}</h3>
        {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
