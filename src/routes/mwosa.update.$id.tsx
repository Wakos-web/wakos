import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Image as ImageIcon, Video as VideoIcon, PlayCircle } from "lucide-react";
import { Lightbox, LightboxHint } from "@/components/lightbox";

export const Route = createFileRoute("/mwosa/update/$id")({
  head: ({ params }) => ({
    meta: [{ title: "Project Story — MWOSA | M.M College Wairaka" }],
  }),
  component: UpdateStoryPage,
});

type MediaItem = {
  id: string;
  media_type: "image" | "video";
  media_url: string;
  caption: string | null;
  sort_order: number;
  poster_url?: string | null;
};

type Story = {
  id: string;
  title: string;
  body: string;
  update_date: string | null;
  image_url: string | null;
};

/* Reveal-on-scroll wrapper: content fades/rises into view as it enters the
 * viewport, one animated container per photo/video. */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]"} ${className}`}
    >
      {children}
    </div>
  );
}

function MediaCard({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  if (item.media_type === "video") {
    return (
      <figure className="group mb-8 break-inside-avoid overflow-hidden rounded-[1.75rem] bg-white border border-stone-200/70 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.10),0_16px_32px_-16px_rgba(0,0,0,0.28)] hover:-translate-y-1.5 hover:shadow-[0_4px_10px_-2px_rgba(0,0,0,0.12),0_28px_56px_-20px_rgba(0,0,0,0.38)] transition-all duration-500">
        <div className="relative overflow-hidden">
          <video
            src={item.media_url}
            poster={item.poster_url || undefined}
            controls
            playsInline
            preload="metadata"
            className="w-full aspect-video object-cover bg-black"
          />
          {/* Glossy bubble highlight */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent" />
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition-all duration-500 group-hover:bg-green-800 group-hover:scale-105">
            <PlayCircle className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-12" /> Video
          </span>
        </div>
        {item.caption && (
          <figcaption className="px-4 py-3.5 text-sm text-stone-600 font-body leading-relaxed border-t border-stone-100 transition-colors duration-500 group-hover:text-stone-800">{item.caption}</figcaption>
        )}
      </figure>
    );
  }
  return (
    <figure
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={item.caption ? `View photo: ${item.caption}` : "View photo"}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group mb-8 break-inside-avoid cursor-zoom-in overflow-hidden rounded-[1.75rem] bg-white border border-stone-200/70 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.10),0_16px_32px_-16px_rgba(0,0,0,0.28)] hover:-translate-y-1.5 hover:shadow-[0_4px_10px_-2px_rgba(0,0,0,0.12),0_28px_56px_-20px_rgba(0,0,0,0.38)] transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700">
      <div className="relative overflow-hidden">
        <img
          src={item.media_url}
          alt={item.caption || ""}
          loading="lazy"
          className="kenburns w-full object-cover"
        />
        {/* Glossy bubble highlight */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent" />
        <LightboxHint />
      </div>
      {item.caption && (
        <figcaption className="px-4 py-3.5 text-sm text-stone-600 font-body leading-relaxed border-t border-stone-100 transition-colors duration-500 group-hover:text-stone-800">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

function UpdateStoryPage() {
  const { id } = Route.useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const [u, m] = await Promise.all([
        supabase.from("mwosa_updates").select("*").eq("id", id).eq("active", true).maybeSingle(),
        supabase.from("mwosa_update_media").select("*").eq("update_id", id).eq("active", true).order("sort_order", { ascending: true }),
      ]);
      if (u.data) setStory(u.data as Story);
      if (m.data) setMedia(m.data as MediaItem[]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-2xl font-bold text-stone-900 mb-2">Story not found</p>
        <p className="text-stone-500 mb-6">This project update may have been unpublished or removed.</p>
        <Link to="/mwosa" className="inline-flex items-center gap-2 rounded-full bg-green-800 px-6 py-3 text-sm font-semibold text-white hover:bg-green-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to MWOSA
        </Link>
      </div>
    );
  }

  const cover = story.image_url || (media.find((m) => m.media_type === "image")?.media_url ?? null);

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Story header */}
      <section className="relative overflow-hidden bg-green-900">
        <div className="absolute inset-0">
          {cover && <img src={cover} alt="" className="h-full w-full object-cover opacity-20" />}
          <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/70 to-green-900/40" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-16">
          <Link to="/mwosa" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to MWOSA
          </Link>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-200">
            <Calendar className="h-3.5 w-3.5" /> {story.update_date || "Completed"}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">{story.title}</h1>
          <p className="text-lg text-white/85 font-body leading-relaxed max-w-3xl">{story.body}</p>
          <p className="mt-6 text-sm text-white/60">
            {media.length} {media.length === 1 ? "photo or video" : "photos & videos"} in this story
          </p>
        </div>
      </section>

      {/* Masonry gallery of animated, captioned media */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {media.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-14 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-stone-300 mb-3" />
            <p className="text-stone-500 font-body">Media for this story is being prepared. Check back soon.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 [column-fill:_balance]">
            {media.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 90}>
                <MediaCard item={item} onOpen={() => setLightboxIndex(i)} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {lightboxIndex !== null && media.length > 0 && (
        <Lightbox
          items={media}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(next) => setLightboxIndex(next)}
        />
      )}

      {/* CTA */}
      <section className="bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-3">Be part of the next milestone</h2>
          <p className="text-stone-600 font-body max-w-2xl mx-auto mb-8">
            The Wairaka Trust Fund keeps these stories coming. Every contribution, however small, becomes a completed project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/giving" className="inline-flex items-center justify-center gap-2 rounded-full bg-green-800 px-8 py-3.5 text-sm font-bold text-white hover:bg-green-900 transition-colors">
              Contribute now
            </Link>
            <Link to="/mwosa" className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-8 py-3.5 text-sm font-bold text-stone-700 hover:border-green-800 hover:text-green-800 transition-colors">
              <ArrowLeft className="h-4 w-4" /> All updates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}