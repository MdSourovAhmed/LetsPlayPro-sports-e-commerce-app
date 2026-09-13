import { ShieldCheck, Truck, BadgePercent, Trophy } from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";

const REASONS = [
  { icon: ShieldCheck, title: "Authentic Gear", description: "100% genuine products, sourced directly from trusted brands." },
  { icon: Truck, title: "Fast Delivery", description: "Nationwide shipping with real-time order tracking." },
  { icon: BadgePercent, title: "Fair Pricing", description: "Competitive prices with regular seasonal discounts." },
  { icon: Trophy, title: "Pro Approved", description: "Curated by athletes who actually use this equipment." },
];

export function WhyChooseUs() {
  return (
    <section className="container-page py-20">
      <SectionHeading eyebrow="The Difference" title="Why Choose LetsPlayPro" />
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-start gap-3 border-t-2 border-ink pt-4">
            <Icon className="h-6 w-6 text-ink" strokeWidth={1.25} />
            <h3 className="text-sm font-medium text-ink">{title}</h3>
            <p className="text-xs text-ink-soft">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
