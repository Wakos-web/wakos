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
import { ARTICLES, HERO_POSTER, HERO_PILLAR, HERO_VIDEO, IMAGES, SCHOOL_TAGLINE, STATS } from "@/lib/content";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

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

  return (
    <section className="relative">
      {/* Desktop hero - WUR.nl style: video fills wide frame + content card on left */}
      <div className="relative hidden lg:block min-h-[85vh]">
        {/* Pillar background */}
        <img src={HERO_PILLAR} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/20" />

        {/* Hero container - rounded, padded from edges */}
        <div className="relative z-10 mx-6 my-20 flex h-[calc(85vh-10rem)] overflow-hidden rounded-[2rem] ring-1 ring-white/10 shadow-2xl">
          {/* Left: content card */}
          <div className="relative z-10 flex w-[32%] min-w-[300px] flex-col justify-between bg-primary p-8 lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Event</p>
              <h2 className="mt-4 font-display text-2xl font-semibold leading-snug text-primary-foreground lg:text-3xl">Discipline, hard work and self-reliance since 1965</h2>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/about" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold text-gold-foreground transition-transform hover:scale-110">
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="flex gap-2">
                <button type="button" aria-label={paused ? "Play video" : "Pause video"} onClick={togglePlay} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                <button type="button" aria-label={muted ? "Unmute video" : "Mute video"} onClick={toggleMute} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right: video fills completely */}
          <div className="relative flex-1 overflow-hidden">
            <video
              ref={videoRef}
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Mobile hero */}
      <div className="relative lg:hidden">
        <div className="relative h-[85vh] overflow-hidden">
          <video src={HERO_VIDEO} poster={HERO_POSTER} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-28 text-center">
            <h1 className="mx-auto max-w-sm font-display text-3xl font-semibold leading-tight text-white drop-shadow-lg">{SCHOOL_TAGLINE}</h1>
            <div className="mt-6 flex items-center justify-center gap-4">
              <button type="button" aria-label={paused ? "Play video" : "Pause video"} onClick={togglePlay} className="inline-flex rounded-full border border-white/40 bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </button>
              <button type="button" aria-label={muted ? "Unmute video" : "Mute video"} onClick={toggleMute} className="inline-flex rounded-full border border-white/40 bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Link to="/admissions" className="absolute bottom-6 left-4 right-4 flex items-end justify-between rounded-3xl bg-gold p-5 text-gold-foreground">
            <span><span className="text-xs font-semibold uppercase tracking-[0.2em]">Admissions open</span><span className="mt-1 block text-lg font-semibold leading-snug">Apply for the Class of 2031</span></span>
            <span className="rounded-full bg-primary p-3 text-primary-foreground"><ArrowRight className="h-5 w-5" /></span>
          </Link>
        </div>
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
