import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, PlayCircle } from "lucide-react";
import { youtubeEmbedUrl, youtubeId, youtubeThumbUrl } from "@/lib/youtube";

export type LightboxItem = {
  id: string;
  media_type: "image" | "video";
  media_url: string;
  caption: string | null;
  youtube_url?: string | null;
};

/** Overlay badge shown on image cards to hint at the lightbox. */
export function LightboxHint() {
  return (
    <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <ZoomIn className="h-3.5 w-3.5" /> View
    </div>
  );
}

/** In-play YouTube embed: poster frame first, autoplaying iframe on click.
 *  `fill` stretches the embed to its parent (story cards); otherwise it sizes
 *  itself for the full-screen lightbox. */
export function YouTubeEmbed({ id, caption, fill }: { id: string; caption?: string | null; fill?: boolean }) {
  const [playing, setPlaying] = useState(false);
  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={caption ? `Play video: ${caption}` : "Play video"}
        className={`group/yt relative block overflow-hidden bg-black ${fill ? "h-full w-full" : "aspect-video max-h-[72vh] w-[min(90vw,960px)] rounded-xl shadow-2xl"}`}
      >
        <img
          src={youtubeThumbUrl(id)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/yt:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur transition-all duration-300 group-hover/yt:scale-110 group-hover/yt:bg-green-800">
            <PlayCircle className="h-9 w-9 text-white" />
          </span>
        </span>
      </button>
    );
  }
  return (
    <iframe
      src={youtubeEmbedUrl(id, true)}
      title={caption || "YouTube video"}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className={fill ? "absolute inset-0 h-full w-full" : "aspect-video max-h-[72vh] w-[min(90vw,960px)] rounded-xl shadow-2xl"}
    />
  );
}

/** Full-screen media viewer with prev/next navigation and keyboard support. */
export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const count = items.length;
  const item = items[index];

  const prev = useCallback(() => onNavigate((index - 1 + count) % count), [index, count, onNavigate]);
  const next = useCallback(() => onNavigate((index + 1) % count), [index, count, onNavigate]);

  // Keyboard: Esc closes, arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={(e) => {
        // Click on the backdrop (not the media) closes the lightbox
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-full bg-white/10 p-2.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Media */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
        {count > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="absolute left-2 sm:left-4 z-10 rounded-full bg-white/10 p-2.5 text-white/80 transition-colors hover:bg-white/25 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className="flex max-h-full items-center justify-center">
          {item.media_type === "video" && youtubeId(item.youtube_url || item.media_url) ? (
            <YouTubeEmbed key={item.id} id={youtubeId(item.youtube_url || item.media_url)!} caption={item.caption} />
          ) : item.media_type === "video" ? (
            <video
              src={item.media_url}
              controls
              autoPlay
              playsInline
              className="max-h-[72vh] max-w-full rounded-xl shadow-2xl"
            />
          ) : (
            <img
              src={item.media_url}
              alt={item.caption || ""}
              className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          )}
        </div>
        {count > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="absolute right-2 sm:right-4 z-10 rounded-full bg-white/10 p-2.5 text-white/80 transition-colors hover:bg-white/25 hover:text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Caption */}
      {item.caption && (
        <div className="px-6 pb-6 text-center">
          <p className="mx-auto max-w-2xl text-sm text-white/75 font-body leading-relaxed">{item.caption}</p>
        </div>
      )}
    </div>
  );
}