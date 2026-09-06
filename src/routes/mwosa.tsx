import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePageContent } from "@/hooks/usePageContent";
import { SocialLinksRow } from "@/components/social-links";
import {
  MessageCircle, Users, Building2, Sparkles, Briefcase, TrendingUp,
  Landmark, Award, Crown, ArrowRight, Heart, Calendar, ChevronRight,
  HandHeart, Megaphone, GraduationCap, AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/mwosa")({
  head: () => ({
    meta: [
      { title: "MWOSA — Old Students Association | M.M College Wairaka" },
      { name: "description", content: "M.M. College Wairaka Old Students Association (MMCWOSA). Alumni activities, the Wairaka Trust Fund, project milestones, and how to discover your OB and OG by graduation year." },
    ],
    links: [{ rel: "canonical", href: "/mwosa" }],
  }),
  component: MwosaPage,
});

type MwosaStat = { value: string; label: string };
type MwosaLink = { label: string; url: string; description: string | null; icon: string; category: string };
type MwosaUpdate = { id?: string; title: string; body: string; update_date: string | null; image_url?: string | null };

const DEFAULT_STATS: MwosaStat[] = [
  { value: "2020", label: "Wairaka Trust Fund launched by the alumni executive" },
  { value: "UGX 10,000", label: "minimum monthly contribution per old student" },
  { value: "3", label: "major projects completed: Physics Lab, Chemistry Lab and student washrooms" },
  { value: "Oct", label: "every year alumni return to encourage students and share experiences" },
];

const DEFAULT_QUICK_LINKS: MwosaLink[] = [
  { label: "Alumni Pulse", url: "/alumni", description: "A live chat and class-notes feed where WACOS alumni post updates, memories, reunions and achievements. The fastest way to hear what your classmates are doing today.", icon: "message", category: "quick" },
  { label: "Alumni Directory", url: "/alumni/directory", description: "The verified register of old boys and old girls. Register your profile so classmates can find you, and search by graduation year, profession or location.", icon: "users", category: "quick" },
  { label: "Business Directory", url: "/alumni/directory/businesses", description: "The Wairaka Business Directory markets alumni products, services and businesses to one another and the wider public. Support your own — buy from an old student.", icon: "building", category: "quick" },
];

const DEFAULT_CHANNELS: MwosaLink[] = [
  { label: "Class of 2020s", url: "/alumni/directory?year=2020", description: "The newest old boys and old girls — just out of WACOS and building their first careers.", icon: "sparkles", category: "channel" },
  { label: "Class of 2010s", url: "/alumni/directory?year=2010", description: "Professionals and young families — teachers, engineers, medics, entrepreneurs.", icon: "briefcase", category: "channel" },
  { label: "Class of 2000s", url: "/alumni/directory?year=2000", description: "Established careers and growing businesses across Uganda and beyond.", icon: "trending", category: "channel" },
  { label: "Class of 1990s", url: "/alumni/directory?year=1990", description: "Leaders in government, education, agriculture and industry.", icon: "landmark", category: "channel" },
  { label: "Class of 1980s", url: "/alumni/directory?year=1980", description: "The generation that kept Wairaka's name alive through hard times.", icon: "award", category: "channel" },
  { label: "Class of 1970s", url: "/alumni/directory?year=1970", description: "The elders of the association — founders of MMCWOSA and the Trust Fund.", icon: "crown", category: "channel" },
];

const DEFAULT_UPDATES: MwosaUpdate[] = [
  { title: "Wairaka Trust Fund established", body: "The alumni executive founded the Wairaka Trust Fund after rehabilitation projects, including the college library, were put on hold for lack of funds before COVID-19. The agreed minimum contribution is UGX 10,000 per old student per month.", update_date: "September 2020" },
  { title: "Physics Laboratory renovated", body: "Through the Trust Fund, the alumni renovated the Physics Laboratory — a core requirement for science students at WACOS.", update_date: "" },
  { title: "Chemistry Laboratory renovated", body: "The Chemistry Laboratory was renovated and equipped to support practical learning for both O-Level and A-Level students.", update_date: "" },
  { title: "Student washrooms renovated", body: "The Trust Fund renovated the student washrooms, restoring dignity and cleanliness to daily boarding life.", update_date: "" },
];

const LINK_ICONS: Record<string, any> = {
  message: MessageCircle,
  users: Users,
  building: Building2,
  sparkles: Sparkles,
  briefcase: Briefcase,
  trending: TrendingUp,
  landmark: Landmark,
  award: Award,
  crown: Crown,
  heart: Heart,
  calendar: Calendar,
  megaphone: Megaphone,
  hand: HandHeart,
  grad: GraduationCap,
};

function HeroSection({ desc }: { desc: string }) {
  return (
    <section className="relative h-[52vh] min-h-[380px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src="/mwosa-hero.png" alt="MWOSA alumni association" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-800/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">
          <HandHeart className="h-3.5 w-3.5" /> M.M. College Wairaka Old Students Association
        </p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4">MWOSA</h1>
        <p className="text-lg md:text-xl text-white/85 max-w-3xl font-body">{desc}</p>
      </div>
    </section>
  );
}

function OverviewSection({ content }: { content: any }) {
  const overview =
    content.overview?.description ||
    "M.M. College Wairaka Old Students Association (MMCWOSA) is the alumni body of our school. It is not merely a social association — it is actively involved in the school's development. Through alumni activities, fundraising, the Wairaka Trust Fund, student encouragement, rehabilitation projects and networking, old students of every generation stay connected to the school and to each other.";
  const points = [
    "Alumni activities and reunions",
    "Fundraising through the Wairaka Trust Fund",
    "School development and rehabilitation projects",
    "Student encouragement and mentorship",
    "Networking across every graduating class",
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">The Association</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold mb-6">Who we are</h2>
          <p className="text-stone-600 font-body leading-relaxed">{overview}</p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-stone-700">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800">
                  <ChevronRight className="h-3 w-3" />
                </span>
                <span className="font-body">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-green-900 p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <p className="text-sm font-semibold text-green-300 uppercase tracking-widest mb-4">The Wairaka Trust Fund</p>
          <p className="text-lg font-display font-bold leading-snug">
            "The fund's purpose is the continuous rebuilding of the college."
          </p>
          <p className="mt-4 text-white/75 font-body leading-relaxed text-sm">
            Launched in 2020 with a minimum of UGX 10,000 per old student per month, the Trust Fund exists
            because WACOS alumni believe the next generation deserves the same chance they were given.
          </p>
          <Link
            to="/giving"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-bold text-white hover:bg-green-400 transition-colors"
          >
            Contribute to the Trust Fund <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: MwosaStat[] }) {
  return (
    <section className="py-16 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Milestones & Contributions</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">The progress the society has made</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-green-900 p-6 text-center">
              <p className="font-display text-3xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-white/70 mt-1 font-body">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpdatesSection({ updates, loading }: { updates: MwosaUpdate[]; loading?: boolean }) {
  // DEFAULT_UPDATES carry no id — render skeletons while loading and only
  // ever link cards that have a real DB id, so every card leads to its story.
  const linked = updates.filter((u) => u.id);
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Project Updates</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">What your contributions have done</h2>
          <p className="mt-4 max-w-2xl mx-auto text-stone-600 font-body">
            Every update opens into a full story — tap a card to see the photos and videos of the completed work.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && linked.length === 0 && (
            <div className="col-span-full grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 animate-pulse">
                  <div className="aspect-[4/3] bg-stone-200" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-200 rounded w-full" />
                    <div className="h-3 bg-stone-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && linked.length === 0 && (
            <p className="col-span-full text-center text-stone-500 py-8 font-body">
              No updates yet — check back soon.
            </p>
          )}
          {linked.map((u) => {
            const href = ("/mwosa/update/" + u.id) as any;
            const card = (
              <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 hover:border-green-800 hover:shadow-lg transition-all flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-green-900">
                  {u.image_url ? (
                    <img
                      src={u.image_url}
                      alt={u.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-green-800 to-stone-900" />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-black/60 backdrop-blur px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {u.update_date || "Completed"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-base font-bold text-stone-900 mb-1.5 group-hover:text-green-800 transition-colors line-clamp-2">{u.title}</h3>
                  <p className="text-[13px] text-stone-600 font-body leading-relaxed line-clamp-2 flex-1">{u.body}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 group-hover:gap-2.5 transition-all">
                    View full story <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </article>
            );
            return href ? (
              <Link key={u.id || u.title} to={href} className="block h-full">{card}</Link>
            ) : (
              <div key={u.title} className="h-full">{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Renders an admin-editable URL safely. Internal paths are split into
 * to / search / hash so TanStack Router navigates cleanly (a raw `?` inside a
 * `to` string would be treated as part of the path). External URLs (http,
 * mailto, tel) become plain anchors. */
function MwosaLinkCard({ l, card }: { l: MwosaLink; card: "quick" | "channel" }) {
  const Icon = LINK_ICONS[l.icon] || MessageCircle;
  const url = (l.url || "").trim();
  const isExternal = /^(https?:|mailto:|tel:)/.test(url);
  const hashIdx = url.indexOf("#");
  const qIdx = url.indexOf("?");
  const hashAt = hashIdx > -1 ? hashIdx : url.length;
  const qAt = qIdx > -1 && (hashIdx === -1 || qIdx < hashIdx) ? qIdx : hashAt;
  const toPath = url.slice(0, qAt);
  const searchStr = url.slice(qAt, hashAt);
  const hash = url.slice(hashAt + 1);
  // TanStack Router's default serializer JSON-quotes string search values
  // (?year=%222020%22), but numeric values stay clean (?year=2020) and parse
  // back to numbers. Digit-only params are therefore sent as numbers.
  const searchParams: Record<string, string | number> = {};
  if (searchStr.startsWith("?")) {
    new URLSearchParams(searchStr).forEach((v, k) => {
      searchParams[k] = /^\d+$/.test(v) ? parseInt(v, 10) : v;
    });
  }
  const content = card === "quick" ? (
    <>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-800 group-hover:bg-green-800 group-hover:text-white transition-colors">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-display text-lg font-bold text-stone-900 mb-2">{l.label}</h3>
      <p className="text-sm text-stone-600 font-body leading-relaxed flex-1">{l.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-800 group-hover:gap-2.5 transition-all">
        Explore <ArrowRight className="h-4 w-4" />
      </span>
    </>
  ) : (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-800 text-white group-hover:bg-white group-hover:text-green-800 transition-colors">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-white transition-colors">{l.label}</h3>
        <p className="text-xs text-stone-500 group-hover:text-white/70 transition-colors mt-0.5">{l.description}</p>
      </div>
      <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-stone-300 group-hover:text-white transition-colors" />
    </>
  );

  const quickCard = "flex flex-col";
  const channelCard = "flex items-center gap-5 rounded-2xl border border-stone-200 bg-stone-50 p-6 hover:border-green-800 hover:bg-green-800 hover:shadow-lg transition-all";
  const cls = card === "quick"
    ? `group rounded-2xl bg-white border border-stone-200 p-7 hover:border-green-800 hover:shadow-lg transition-all ${quickCard}`
    : channelCard;

  if (!url) {
    // No link set (or blank) — never reroute. Show an error state instead.
    return (
      <div key={l.label} title="This link has not been set up yet." className={cls + " cursor-not-allowed"}>
        {content}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5" /> Link not available yet
        </span>
      </div>
    );
  }

  if (isExternal || toPath.startsWith("//")) {
    return <a key={l.label} href={url} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} className={cls}>{content}</a>;
  }
  const hasSearch = Object.keys(searchParams).length > 0;
  const linkProps: Record<string, any> = { key: l.label, to: toPath, className: cls };
  if (hasSearch) linkProps.search = searchParams;
  if (hash) linkProps.hash = hash;
  const L = Link as any;
  return <L {...linkProps}>{content}</L>;
}

function QuickLinksSection({ links }: { links: MwosaLink[] }) {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Get Involved</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Connect with WACOS alumni</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {links.map((l) => <MwosaLinkCard key={l.label} l={l} card="quick" />)}
        </div>
      </div>
    </section>
  );
}

function ChannelsSection({ channels }: { channels: MwosaLink[] }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">WhatsApp Channels</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Discover your OB and OG by graduation year</h2>
          <p className="mt-4 max-w-2xl mx-auto text-stone-600 font-body">
            Old Boys (OB) and Old Girls (OG) of every decade are in the alumni directory. Pick your class channel
            and reconnect with the people you grew up with at Wairaka.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {channels.map((c) => <MwosaLinkCard key={c.label} l={c} card="channel" />)}
        </div>
      </div>
    </section>
  );
}

function JoinCta() {
  return (
    <section className="py-20 bg-green-900 relative overflow-hidden">
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/5" />
      <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
        <GraduationCap className="mx-auto mb-5 h-10 w-10 text-green-300" />
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Once a Wairakan, always a Wairakan</h2>
        <p className="text-lg text-white/80 font-body max-w-2xl mx-auto mb-8">
          Join the Pulse, register in the directory, and stand with the next generation of students —
          the same way old students stood with you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/alumni"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-8 py-3.5 text-sm font-bold text-white hover:bg-green-400 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Enter the Pulse
          </Link>
          <Link
            to="/alumni/directory/register"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            <Users className="h-4 w-4" /> Register as an Alumnus
          </Link>
        </div>
      </div>
    </section>
  );
}

function MwosaPage() {
  // The story detail route (/mwosa/update/$id) is a child of this route.
  // All hooks below must run unconditionally (React hook-order rule), so
  // the story check happens only AFTER every hook has run.
  const isStoryRoute = useMatch({ from: "/mwosa/update/$id", shouldThrow: false });
  const { content } = usePageContent("mwosa");
  const heroDesc =
    content.hero?.description ||
    "We Do It Ourselves. The bond between WACOS old boys and old girls lasts long after graduation — and together we are rebuilding our school.";
  const [stats, setStats] = useState<MwosaStat[]>(DEFAULT_STATS);
  const [quickLinks, setQuickLinks] = useState<MwosaLink[]>(DEFAULT_QUICK_LINKS);
  const [channels, setChannels] = useState<MwosaLink[]>(DEFAULT_CHANNELS);
  const [updates, setUpdates] = useState<MwosaUpdate[]>(DEFAULT_UPDATES);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [socials, setSocials] = useState<any[]>([]);

  // Browsers can restore a stale page from the back/forward cache without
  // re-fetching, which shows old cards with dead links after a deploy.
  // Reload when that happens so the page always reflects the latest build.
  useEffect(() => {
    const onPageshow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageshow);
    return () => window.removeEventListener("pageshow", onPageshow);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [s, l, u] = await Promise.all([
          supabase.from("mwosa_stats").select("*").eq("active", true).order("sort_order", { ascending: true }),
          supabase.from("mwosa_links").select("*").eq("active", true).order("sort_order", { ascending: true }),
          supabase.from("mwosa_updates").select("*").eq("active", true).order("sort_order", { ascending: true }),
        ]);
        if (s.data?.length) setStats(s.data.map((x: any) => ({ value: x.value, label: x.label })));
        if (l.data?.length) {
          const mapped = l.data.map((x: any) => ({ label: x.label, url: x.url, description: x.description, icon: x.icon, category: x.category }));
          const quick = mapped.filter((m: any) => m.category !== "channel");
          const chan = mapped.filter((m: any) => m.category === "channel");
          if (quick.length) setQuickLinks(quick);
          if (chan.length) setChannels(chan);
        }
        if (u.data?.length) setUpdates(u.data.map((x: any) => ({ id: x.id, title: x.title, body: x.body, update_date: x.update_date, image_url: x.image_url })));
        const s2 = await supabase.from("social_links").select("*").eq("entity_type", "mwosa").eq("active", true).order("sort_order", { ascending: true });
        if (s2.data?.length) setSocials(s2.data);
      } finally {
        setUpdatesLoading(false);
      }
    })();
  }, []);

  // The story detail route is a child of this route. When it is active,
  // render ONLY the story — this page's own content is for /mwosa itself.
  if (isStoryRoute) return <Outlet />;

  return (
    <div>
      <HeroSection desc={heroDesc} />
      {socials.length > 0 && (
        <section className="bg-green-900 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-semibold text-white/90 uppercase tracking-widest">Follow MWOSA</p>
            <SocialLinksRow links={socials} tone="dark" />
          </div>
        </section>
      )}
      <OverviewSection content={content} />
      <StatsSection stats={stats} />
      <UpdatesSection updates={updates} loading={updatesLoading} />
      <QuickLinksSection links={quickLinks} />
      <ChannelsSection channels={channels} />
      <JoinCta />
    </div>
  );
}