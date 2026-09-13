import { Wrench } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-32 text-center">
      <Wrench className="h-10 w-10 text-ink-soft" strokeWidth={1.25} />
      <h1 className="font-display text-3xl text-ink">We'll be right back</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        LetsPlayPro is currently undergoing scheduled maintenance. We're working hard to improve
        your experience and will be back online shortly.
      </p>
    </div>
  );
}
