import { SectionHeading } from "./SectionHeading";

/**
 * @param {{eyebrow: string, title: string, updatedAt?: string, children: React.ReactNode}} props
 */
export function LegalPage({ eyebrow, title, updatedAt, children }) {
  return (
    <div className="container-page py-20">
      <SectionHeading eyebrow={eyebrow} title={title} />
      {updatedAt && <p className="mt-2 text-center text-xs text-ink-soft">Last updated {updatedAt}</p>}
      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-6 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </div>
  );
}
