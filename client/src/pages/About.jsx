import { SectionHeading } from "../components/ui/SectionHeading";

export default function About() {
  return (
    <div className="container-page py-20">
      <SectionHeading eyebrow="Our Story" title="About LetsPlayPro" />
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-ink-soft">
        LetsPlayPro started with a simple frustration: finding real sports gear, at fair prices,
        without wading through marketplaces full of counterfeits. We work directly with brands
        across badminton, basketball, cricket, fitness, football, and tennis to bring athletes of
        every level the equipment they can actually trust.
      </p>
    </div>
  );
}
