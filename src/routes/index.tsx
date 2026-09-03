import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Globe,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ARTICLES, HERO_POSTER, HERO_VIDEO, IMAGES, STATS } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "M.M College Wairaka — Discipline, Hard Work and Self-Reliance" },
      {
        name: "description",
        content:
          "M.M College Wairaka — Discipline, hard work and self-reliance since 1965.",
      },
      { property: "og:title", content: "M.M College Wairaka" },
      {
        property: "og:description",
        content:
          "Discipline, hard work and self-reliance since 1965.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const STAT_ICONS: Record<string, typeof MapPin> = {
  "map-pin": MapPin,
  globe: Globe,
  award: Award,
  "heart-handshake": HeartHandshake,
  "graduation-cap": GraduationCap,
  "badge-check": BadgeCheck,
};

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPaused(false); }
    else { v.pause(); setPaused(true); }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  // Autoplay with fallback
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => { setPaused(true); });
    const onCanPlay = () => setLoaded(true);
    v.addEventListener("canplay", onCanPlay, { once: true });
    return () => v.removeEventListener("canplay", onCanPlay);
  }, []);

  const scrollToContent = () => {
    const next = sectionRef.current?.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[600px] max-h-[1100px] overflow-hidden bg-foreground">
      {/* Video / Poster */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className={"absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 " + (loaded ? "opacity-100" : "opacity-0")}
        />
        {/* Fallback poster if video has not loaded */}
        {!loaded && (
          <img
            src={HERO_POSTER}
            alt="M.M College Wairaka campus"
            className="absolute inset-0 h-full w-full object-cover object-center"
            width={1920}
            height={1080}
            fetchPriority="high"
          />
        )}
      </div>

      {/* Layered overlays */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Hero content - lower left */}
      <div className="hero-content relative z-10 flex h-full flex-col justify-end px-6 pb-24 sm:px-10 lg:px-16 xl:px-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/70" style={{ animationDelay: "0.2s" }}>Est. 1965</p>
          <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Discipline, hard work<br className="hidden sm:block" /> and self-reliance
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80 sm:text-xl">
            Shaping young people for greater things since 1965. A government-aided secondary school in Wairaka, Jinja, built on merit, service and self-reliance.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/admissions" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-foreground transition-all hover:bg-white/90 hover:shadow-lg">
              Admissions
            </Link>
            <Link to="/about" className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10">
              Explore Wairaka
            </Link>
          </div>
        </div>

        {/* Video controls */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3 lg:bottom-12 lg:right-12">
          <button
            type="button"
            aria-label={paused ? "Play video" : "Pause video"}
            onClick={togglePlay}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label={muted ? "Unmute video" : "Mute video"}
            onClick={toggleMute}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Scroll indicator */}
        <button
          type="button"
          aria-label="Scroll to content"
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 transition-colors hover:text-white lg:bottom-12"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em]">Scroll</span>
          <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </button>
      </div>
    </section>
  );
}
function StatsSection() {
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-14 md:grid-cols-3 lg:grid-cols-6">
        {STATS.map((stat) => {
          const Icon = STAT_ICONS[stat.icon] ?? Award;
          return (
            <div key={stat.label} className="text-center">
              <Icon className="mx-auto h-7 w-7 text-primary" strokeWidth={1.5} />
              <p className="mt-3 font-display text-4xl font-semibold text-primary">
                {stat.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NewsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-4xl font-semibold text-foreground md:text-5xl">
          Recent News
        </h2>
        <Link
          to="/news"
          className="hidden items-center gap-2 text-sm font-semibold text-primary hover:underline hover:underline-offset-4 md:inline-flex"
        >
          All news <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ARTICLES.map((article) => (
          <Link
            key={article.slug}
            to="/news/$slug"
            params={{ slug: article.slug }}
            className="group"
          >
            <div className="overflow-hidden rounded-2xl">
              <img
                src={article.image}
                alt={article.title}
                width={1024}
                height={683}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-foreground group-hover:text-primary">
              {article.title}
            </h3>
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider text-gold">
                {article.category}
              </span>
              {article.date}
            </p>
          </Link>
        ))}
      </div>
      <Link
        to="/news"
        className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground md:hidden"
      >
        All news <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem]">
          <img
            src={IMAGES.campus}
            alt="M.M College Wairaka campus"
            width={1600}
            height={900}
            loading="lazy"
            className="aspect-[16/10] w-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Our Mission
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            An education money cannot buy, earned by merit alone
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Founded in 1965 on a single conviction — that discipline, hard work,
            and self-reliance are the foundations of greatness — M.M College Wairaka
            has grown to serve over 1,800 students from 58 districts across Uganda,
            with a reputation for academic excellence and practical skills development.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Our story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function GivingCta() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={IMAGES.giving}
        alt="Alumni gathered at M.M College Wairaka"
        width={1200}
        height={800}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-primary/85" />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl font-semibold leading-tight text-primary-foreground md:text-5xl">
          Every seat is a scholarship. Every scholarship is a gift.
        </h2>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-primary-foreground/80">
          M.M College Wairaka is sustained entirely by alumni and friends who believe the
          next generation deserves the same chance they were given.
        </p>
        <Link
          to="/giving"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-105"
        >
          Support WACOS <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <NewsSection />
      <MissionSection />
      <GivingCta />
    </main>
  );
}
