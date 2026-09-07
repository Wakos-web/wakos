import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type JournalImage = {
  src: string;
  alt: string;
  caption?: string;
};

/**
 * "Digital journal" gallery: each photo sits on a paper page with a caption,
 * pages are tilted like a spread on a desk, and the row drags/snaps like a
 * seamless carousel. Click a page to view it full-screen with its caption.
 */
export function JournalGallery({
  images,
  title,
}: {
  images: JournalImage[];
  title?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  const lastInteract = useRef(0);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    const kids = [...el.children] as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    kids.forEach((k, i) => {
      const c = k.offsetLeft + k.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  const scrollByCard = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const kid = el.children[Math.min(active, el.children.length - 1)] as HTMLElement | undefined;
    const w = kid ? kid.offsetWidth + 24 : 380;
    el.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
  };

  /* Auto-advance: every few seconds the carousel glides to the next page and
   * loops back to the start at the end. It stays polite — paused while the
   * visitor hovers, drags, scrolls manually, has the lightbox open, is on a
   * hidden tab, or prefers reduced motion. */
  useEffect(() => {
    if (images.length <= 1 || lightbox !== null || hovering) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (document.visibilityState !== "visible") return;
      if (drag.current.down) return;
      if (Date.now() - lastInteract.current < 4000) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (el.scrollLeft >= max - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else scrollByCard("right");
    }, 4500);
    return () => window.clearInterval(t);
    // scrollByCard reads `active` from the latest render.
  }, [images.length, lightbox, hovering, active]);

  // Mouse drag-to-scroll (touch scrolls natively).
  const onPointerDown = (e: React.PointerEvent) => {
    lastInteract.current = Date.now();
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    el.style.scrollSnapType = "none";
    el.style.cursor = "grabbing";
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down || !scrollRef.current) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    scrollRef.current.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    const el = scrollRef.current;
    if (el) {
      el.style.scrollSnapType = "";
      el.style.cursor = "";
    }
  };

  const openLightbox = (i: number) => {
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    setLightbox(i);
  };

  // Lightbox keyboard controls.
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((v) => (v === null ? v : (v + 1) % images.length));
      if (e.key === "ArrowLeft")
        setLightbox((v) => (v === null ? v : (v - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  // Lock body scroll behind the lightbox.
  useEffect(() => {
    if (lightbox === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-6xl px-6">
        {title && (
          <div className="mb-2 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                The Journal
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl">
                {title}
              </h2>
            </div>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => { lastInteract.current = Date.now(); scrollByCard("left"); }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-primary hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next page"
                onClick={() => { lastInteract.current = Date.now(); scrollByCard("right"); }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-primary hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onTouchStart={() => { lastInteract.current = Date.now(); }}
        onWheel={() => { lastInteract.current = Date.now(); }}
        className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-6 pb-8 pt-8"
        style={{ cursor: "grab" }}
      >
        {images.map((img, i) => (
          <article
            key={i}
            className="group w-[80vw] shrink-0 snap-center sm:w-[340px] lg:w-[380px]"
          >
            <button
              type="button"
              onClick={() => openLightbox(i)}
              aria-label={`Open ${img.caption || img.alt} full screen`}
              className={`relative block w-full rounded-sm bg-white p-4 pb-5 text-left shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_28px_50px_-20px_rgba(0,0,0,0.4)] ${
                i % 2 === 0 ? "-rotate-[1.3deg]" : "rotate-[1.1deg]"
              }`}
            >
              {/* washi tape */}
              <span
                aria-hidden
                className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-[1px] bg-primary/20 ring-1 ring-primary/10"
              />
              <span className="relative block overflow-hidden rounded-[2px]">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              </span>
              <span className="mt-4 flex items-start justify-between gap-3">
                <span className="font-display text-lg italic leading-snug text-foreground">
                  {img.caption || img.alt}
                </span>
                <span className="mt-1 shrink-0 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
                Wairaka · Jinja
              </span>
            </button>
          </article>
        ))}
      </div>

      {/* progress */}
      <div className="mx-auto mt-2 max-w-6xl px-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150"
            style={{ width: `${Math.max(10, progress * 100)}%` }}
          />
        </div>
      </div>

      {/* lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={images[lightbox].src}
            alt={images[lightbox].alt}
            className="max-h-[78vh] max-w-full rounded-sm object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-4 max-w-xl text-center font-display text-lg italic text-white/90">
            {images[lightbox].caption || images[lightbox].alt}
          </p>
          <p className="mt-1 text-xs tracking-[0.25em] text-white/50">
            {lightbox + 1} / {images.length}
          </p>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((v) => (v === null ? v : (v - 1 + images.length) % images.length));
                }}
                className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((v) => (v === null ? v : (v + 1) % images.length));
                }}
                className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
