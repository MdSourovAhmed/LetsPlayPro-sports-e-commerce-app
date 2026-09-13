import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="container-page grid grid-cols-1 items-stretch gap-0 border-b border-line lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-5 py-16 pr-0 lg:py-24 lg:pr-16">
        <span className="eyebrow">Our Best Sellers</span>
        <h1 className="font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
          Latest
          <br />
          Arrivals
        </h1>
        <p className="max-w-sm text-sm text-ink-soft">
          Gear built for the way you actually play — badminton to basketball, fitness to
          football. Trusted brands, honest prices.
        </p>
        <Link to="/shop" className="eyebrow w-fit text-ink hover:text-ink-soft">
          Shop Now
        </Link>
      </div>

      <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-ink lg:min-h-0">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 32px, rgba(255,255,255,0.6) 32px, rgba(255,255,255,0.6) 33px)",
          }}
        />
        <div className="relative flex flex-col items-center gap-4 px-8 text-center">
          <span className="accent-bar" />
          <p className="font-display text-3xl text-white sm:text-4xl">Gear Up.</p>
          <p className="font-display text-3xl text-accent sm:text-4xl">Play Pro.</p>
          <Link
            to="/shop"
            className="mt-4 inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
          >
            Explore Collection <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
