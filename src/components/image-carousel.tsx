import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselImage = {
  src: string;
  alt: string;
  caption?: string;
};

export function ImageCarousel({
  images,
  title,
}: {
  images: CarouselImage[];
  title?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.offsetWidth;
    scrollRef.current.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        {title && (
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              {title}
            </h2>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scroll("left")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-primary hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scroll("right")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-primary hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="relative shrink-0 w-[85vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] snap-center rounded-2xl overflow-hidden"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              {img.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              )}
              {img.caption && (
                <p className="absolute bottom-0 left-0 p-4 text-sm font-medium text-white">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
