import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * @param {{question: string, answer: string}} props
 */
export function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-medium text-ink">{question}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-soft transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{answer}</p>}
    </div>
  );
}
