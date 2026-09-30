import { useEffect, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

/**
 * Truthful hero preview: renders the REAL hero chrome — gradient overlays,
 * the school's configured title/subtitle and the Admissions / Explore CTAs —
 * over the media with the chosen focal point applied, in a phone and a
 * desktop frame side by side. Used before publishing a clip/poster so the
 * framing decision is made against what visitors will actually see.
 */
export function HeroPreviewModal({
  media,
  focus,
  onClose,
}: {
  media: { kind: "video" | "image"; src: string; poster?: string | undefined };
  focus?: { x: number; y: number } | null | undefined;
  onClose: () => void;
}) {
  const [heroTitle, setHeroTitle] = useState("Where your child becomes someone");
  const [heroSubtitle, setHeroSubtitle] = useState("Est. 1953");

  useEffect(() => {
    // Live chrome: pull the same site_settings the homepage hero uses.
    import("@/lib/content").then(({ getSettings }) =>
      getSettings().then((s) => {
        if (s.hero_title) setHeroTitle(s.hero_title);
        if (s.hero_subtitle) setHeroSubtitle(s.hero_subtitle);
      }),
    );
  }, []);

  const objectPosition = `${focus?.x ?? 50}% ${focus?.y ?? 50}%`;

  const HeroChrome = ({ compact }: { compact: boolean }) => (
    <>
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 ${compact ? "px-3 pb-6" : "px-8 pb-12"}`}>
        <p className={`${compact ? "text-[9px] mb-1 tracking-[0.2em]" : "text-xs mb-2 tracking-[0.3em]"} font-semibold uppercase text-white/70`}>{heroSubtitle}</p>
        <h3 className={`font-display font-semibold leading-[0.95] tracking-tight text-white ${compact ? "text-xl" : "text-4xl"}`}>{heroTitle}</h3>
        <div className={`flex flex-wrap gap-2 ${compact ? "mt-3" : "mt-6"}`}>
          <span className={`rounded-full bg-white font-semibold text-stone-900 ${compact ? "px-3 py-1 text-[9px]" : "px-6 py-2.5 text-sm"}`}>Admissions</span>
          <span className={`rounded-full border border-white/40 font-semibold text-white ${compact ? "px-3 py-1 text-[9px]" : "px-6 py-2.5 text-sm"}`}>Explore Wairaka</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-bold text-stone-900">Preview in the hero</p>
            <p className="text-xs text-stone-500 mt-0.5">The real homepage chrome — title, CTAs and overlays — with your focal point applied.</p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-200">Close</button>
        </div>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-stretch sm:justify-center">
          {/* Phone frame — the hardest crop */}
          <div className="w-full max-w-[220px] shrink-0">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-500">
              <Smartphone className="h-3.5 w-3.5" /> Phone (tallest crop)
            </div>
            <div className="relative overflow-hidden rounded-2xl border-4 border-stone-800 bg-black" style={{ aspectRatio: "9 / 16" }}>
              {media.kind === "video" ? (
                <video src={media.src + "#t=0.5"} poster={media.poster} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition }} />
              ) : (
                <img src={media.src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition }} />
              )}
              <HeroChrome compact />
            </div>
          </div>
          {/* Desktop frame — the design target */}
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-500">
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </div>
            <div className="relative overflow-hidden rounded-xl border border-stone-300 bg-black" style={{ aspectRatio: "16 / 7" }}>
              {media.kind === "video" ? (
                <video src={media.src + "#t=0.5"} poster={media.poster} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition }} />
              ) : (
                <img src={media.src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition }} />
              )}
              <HeroChrome compact={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
