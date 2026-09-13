import { Link } from "react-router-dom";
import { SPORTS } from "../../utils/constants";
import { SectionHeading } from "../ui/SectionHeading";

export function ShopBySport() {
  return (
    <section className="container-page py-20">
      <SectionHeading eyebrow="Pick Your Game" title="Shop by Sport" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {SPORTS.map((sport) => (
          <Link
            key={sport}
            to={`/shop?sport=${encodeURIComponent(sport)}`}
            className="group flex aspect-square flex-col items-center justify-center gap-2 border border-line text-center transition-colors hover:border-ink"
          >
            <span className="font-display text-lg text-ink">{sport}</span>
            <span className="text-[11px] uppercase tracking-wide text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">
              Shop now
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
