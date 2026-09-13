import { cn } from "../../utils/cn";

/**
 * @param {{eyebrow: string, title: string, align?: 'left'|'center', className?: string}} props
 */
export function SectionHeading({ eyebrow, title, align = "center", className }) {
  return (
    <div className={cn("flex flex-col gap-2", align === "center" && "items-center text-center", className)}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="font-display text-3xl text-ink sm:text-4xl">{title}</h2>
    </div>
  );
}
