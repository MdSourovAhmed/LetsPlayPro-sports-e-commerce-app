import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Rating } from "../ui/Rating";
import { SectionHeading } from "../ui/SectionHeading";

const TESTIMONIALS = [
  {
    name: "Rahim Chowdhury",
    role: "Weekend Footballer",
    quote:
      "Ordered cleats on a Tuesday, had them by Friday. Sizing guide was spot on and the leather quality beats what I paid for at a mall shop.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Club Badminton Player",
    quote:
      "My racket arrived strung and ready to play. Support answered my grip-size question within minutes on chat.",
    rating: 5,
  },
  {
    name: "Tanvir Ahmed",
    role: "Gym Regular",
    quote:
      "The comparison tool saved me from buying the wrong gloves twice. Genuinely useful, not just a gimmick.",
    rating: 4,
  },
];

export function Testimonials() {
  return (
    <section className="bg-paper-dim py-20">
      <div className="container-page">
        <SectionHeading eyebrow="From Our Players" title="What Athletes Say" />
        <Swiper
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="mt-10"
        >
          {TESTIMONIALS.map((t) => (
            <SwiperSlide key={t.name}>
              <div className="flex h-full flex-col gap-4 border border-line bg-paper p-6">
                <Rating value={t.rating} />
                <p className="text-sm leading-relaxed text-ink-soft">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto">
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink-soft">{t.role}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
