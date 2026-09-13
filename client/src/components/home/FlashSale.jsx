import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function getTimeParts(msRemaining) {
  const clamped = Math.max(msRemaining, 0);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    hours: String(Math.floor(totalSeconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
  };
}

export function FlashSale() {
  // Rolls forward to the next midnight — swap for a real sale end date from the API when available.
  const [target] = useState(() => {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d;
  });
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds } = getTimeParts(target - now);

  return (
    <section className="border-y border-line bg-ink py-16 text-white">
      <div className="container-page flex flex-col items-center gap-5 text-center">
        <span className="eyebrow text-white/60 before:bg-white/60">Today Only</span>
        <h2 className="font-display text-3xl sm:text-4xl">Flash Sale — Up to 40% Off</h2>
        <div className="flex items-center gap-4" aria-label="Time remaining">
          {[
            { value: hours, label: "Hours" },
            { value: minutes, label: "Minutes" },
            { value: seconds, label: "Seconds" },
          ].map((unit) => (
            <div key={unit.label} className="flex flex-col items-center gap-1 border border-white/20 px-5 py-3">
              <span className="font-display text-2xl tabular-nums">{unit.value}</span>
              <span className="text-[10px] uppercase tracking-wide text-white/60">{unit.label}</span>
            </div>
          ))}
        </div>
        <Link to="/shop?onDiscount=true" className="btn-secondary mt-2 border-white text-white hover:bg-white hover:text-ink">
          Shop the Sale
        </Link>
      </div>
    </section>
  );
}
