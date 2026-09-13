import { useState } from "react";
import { cn } from "../../utils/cn";

/**
 * @param {{images: string[], name: string}} props
 */
export function ProductGallery({ images = [], name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});
  const activeImage = images[activeIndex];

  function handleMouseMove(e) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(1.6)" });
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center bg-paper-dim text-sm text-ink-soft">
        No image available
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className="flex shrink-0 gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
        {images.map((img, i) => (
          <button
            key={img + i}
            onClick={() => setActiveIndex(i)}
            aria-label={`View image ${i + 1}`}
            aria-pressed={activeIndex === i}
            className={cn(
              "h-16 w-16 shrink-0 overflow-hidden border transition-colors",
              activeIndex === i ? "border-ink" : "border-line hover:border-ink-soft"
            )}
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <div
        className="relative flex-1 overflow-hidden bg-paper-dim"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomStyle({})}
      >
        <img
          src={activeImage}
          alt={name}
          className="aspect-square w-full object-cover transition-transform duration-200 ease-out"
          style={zoomStyle}
        />
      </div>
    </div>
  );
}
