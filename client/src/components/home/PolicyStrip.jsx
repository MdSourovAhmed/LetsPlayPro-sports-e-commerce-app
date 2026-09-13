import { Repeat, PackageCheck, Headset } from "lucide-react";

const POLICIES = [
  {
    icon: Repeat,
    title: "Easy Exchange Policy",
    description: "We offer hassle-free exchanges on every order.",
  },
  {
    icon: PackageCheck,
    title: "7 Days Return Policy",
    description: "We provide a 7-day free return policy.",
  },
  {
    icon: Headset,
    title: "Best Customer Support",
    description: "We offer 24/7 customer support.",
  },
];

export function PolicyStrip() {
  return (
    <section className="border-b border-line py-14">
      <div className="container-page grid grid-cols-1 gap-10 sm:grid-cols-3">
        {POLICIES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-1.5">
              <span className="accent-bar" />
              <Icon className="h-6 w-6 text-ink" strokeWidth={1.25} />
            </div>
            <h3 className="text-sm font-medium text-ink">{title}</h3>
            <p className="text-xs text-ink-soft">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
