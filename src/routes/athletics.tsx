import { createFileRoute } from "@tanstack/react-router";
import { IMAGES } from "@/lib/content";
import { usePageContent } from "@/hooks/usePageContent";

export const Route = createFileRoute("/athletics")({
  head: () => ({
    meta: [{ title: "Athletics ,  M.M College Wairaka" },{ name: "description", content: "Busoga Champions in football. 8 sports across 3 terms. Olympic champion alumni. M.M College Wairaka athletics." }],
    links: [{ rel: "canonical", href: "/athletics" }],
  }),
  component: AthleticsPage,
});

const SPORTS = [
  { name: "Football", term: "Term 1 & 2", badge: "Busoga Champions", img: IMAGES.athletics },
  { name: "Athletics", term: "Term 2", badge: "Regional Competitors", img: IMAGES.athletics },
  { name: "Netball", term: "Term 1", badge: "", img: IMAGES.studentLife },
  { name: "Volleyball", term: "Term 2", badge: "", img: IMAGES.studentLife },
  { name: "Basketball", term: "Term 3", badge: "", img: IMAGES.campus },
  { name: "Cricket", term: "Term 3", badge: "", img: IMAGES.campus },
  { name: "Swimming", term: "Term 1", badge: "", img: IMAGES.academics },
  { name: "Rugby", term: "Term 2", badge: "", img: IMAGES.academics },
];
const QUICK_NAV = [{ l: "Sports", h: "#sports" }, { l: "Highlights", h: "#highlights" }, { l: "Notable Athletes", h: "#athletes" }];

const PHILOSOPHY = [
  "A classroom teaches a child what to know. Sport teaches a child who to become. At Wairaka, every student is expected to find a sport, join a team, and give their best. Not because it is optional. Because it is essential.",
  "Sport at Wairaka is <strong>structured, coached, and serious</strong>. Every team has a teacher coach. Training happens on schedule. Discipline is non-negotiable. A student who learns to wake up early for training, to push through a difficult session, and to accept defeat with grace is learning something no textbook can teach. That is character. And it lasts longer than any exam result.",
  "Our teams compete at the <strong>district, regional, and national levels</strong>. The football team are Busoga Champions. The athletics team sends competitors to national meets. The netball and volleyball teams consistently finish in the top standings. But the trophy is not the point. The point is what the student becomes in the process of earning it.",
  "And the proof is in our alumni. <strong>Joshua Cheptegei</strong> came to Wairaka on a sports scholarship. The school saw his potential and invested in it. He went on to become a world champion and Olympic gold medallist. MMCWOSA honoured him with the Pillar Honour, the highest distinction given to distinguished alumni. His journey started on this campus. Every student who puts on a Wairaka jersey is part of that same tradition.",
  "Former athletes come back. They coach. They mentor. They show current students that <strong>discipline on the field translates to success in life</strong>. The doctors, engineers, teachers, and business owners who once wore these colours are living proof that what happens here matters.",
  "Your child does not need to be the fastest or the strongest. They need to be <strong>willing to try</strong>. Wairaka will do the rest.",
];

const HIGHLIGHTS = [
  { title: "Champions", text: "Busoga Schools Football Champions ,  winning the regional title in front of a packed home crowd." },
  { title: "2nd Place", text: "National Schools Science Fair ,  a solar-powered irrigation prototype built by the Science Club." },
  { title: "4,000", text: "Tree seedlings planted in a single Saturday ,  the motto in action through community outreach." },
];

function HeroSection({ desc }: { desc: string }) {
  return (
    <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.athletics} alt="WACOS athletes in action" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4">Athletics</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body">{desc}</p>
      </div>
    </section>
  );
}
function QuickNav() {
  return (
    <nav className="sticky top-0 z-20 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 flex gap-6 overflow-x-auto py-3 scrollbar-hide">
        {QUICK_NAV.map((item) => (
          <a key={item.h} href={item.h} className="whitespace-nowrap text-sm font-medium text-stone-600 hover:text-green-800 transition-colors uppercase tracking-wider">
            {item.l}
          </a>
        ))}
      </div>
    </nav>
  );
}
function PhilosophySection({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Why Sport Matters</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Sport builds what classrooms cannot</h2>
        </div>
        <div className="prose prose-lg prose-stone max-w-none font-body text-stone-700 leading-relaxed space-y-6">
          {paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
      </div>
    </section>
  );
}
function SportsGrid({ sports }: { sports: typeof SPORTS }) {
  return (
    <section id="sports" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Our Sports</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">When we take part, we win</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sports.map((sport) => (
            <div key={sport.name} className="group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer">
              <img src={sport.img} alt={sport.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-xl text-white font-bold">{sport.name}</h3>
                <p className="text-sm text-white/60 mt-1">{sport.term}</p>
                {sport.badge && (
                  <span className="inline-block mt-2 rounded-full bg-green-600/80 px-3 py-1 text-xs font-semibold text-white">{sport.badge}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function HighlightsSection({ highlights }: { highlights: typeof HIGHLIGHTS }) {
  return (
    <section id="highlights" className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Season Highlights</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">What your child could be part of</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((h) => (
            <div key={h.title} className="rounded-2xl bg-white p-8 border border-stone-200">
              <p className="font-display text-4xl font-bold text-green-800">{h.title}</p>
              <p className="text-stone-600 mt-2 font-body">{h.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function AthleteSection() {
  return (
    <section id="athletes" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Notable Athlete</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">From Wairaka to the World</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
            <img src={IMAGES.athletics} alt="Joshua Cheptegei" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">A-Level Student</p>
              <p className="mt-1 font-display text-lg font-semibold text-white">Sports Scholarship Recipient</p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-display text-2xl md:text-3xl text-stone-900 font-bold mb-4">Joshua Cheptegei</h3>
            <p className="text-stone-600 text-lg leading-relaxed font-body">Joshua Cheptegei came to WACOS on a sports scholarship. The school recognised his potential early. He went on to become a world champion and Olympic gold medallist. This is what happens when a school invests in a young person.</p>
            <p className="text-stone-600 text-lg leading-relaxed font-body mt-4">MMCWOSA honoured him with the Pillar Honour ,  the highest distinction given to distinguished alumni. His journey started on this campus. Your child journey could start here too.</p>
            <div className="mt-6 inline-block self-start rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-800">Pillar Honour Recipient</div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-center">
                <p className="font-display text-2xl font-bold text-green-800">Olympic</p>
                <p className="text-xs text-stone-500">Gold Medallist</p>
              </div>
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-center">
                <p className="font-display text-2xl font-bold text-green-800">World</p>
                <p className="text-xs text-stone-500">Champion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function CTASection() {
  return (
    <section className="bg-green-900 py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Join the team</h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">Every champion started with a first step. Begin your child journey at WACOS today.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/admissions" className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors">Apply Now</a>
          <a href="/student-life" className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">Student Life</a>
        </div>
      </div>
    </section>
  );
}
function AthleticsPage() {
  const { content } = usePageContent("athletics");
  const heroDesc = content.hero?.description || "Busoga Champions. Regional competitors. Olympic alumni. Your child will compete here.";
  const paragraphs = content.overview?.paragraphs?.length ? content.overview.paragraphs : PHILOSOPHY;
  const sports = content.sports?.items?.length
    ? content.sports.items.map((s: any) => ({ name: s.name, term: s.description || "", badge: "", img: IMAGES.athletics }))
    : SPORTS;
  const highlights = content.achievements?.achievements?.length
    ? content.achievements.achievements.map((a: any) => ({ title: a.year, text: a.achievement }))
    : HIGHLIGHTS;
  return (
    <div>
      <HeroSection desc={heroDesc} />
      <QuickNav />
      <PhilosophySection paragraphs={paragraphs} />
      <SportsGrid sports={sports} />
      <HighlightsSection highlights={highlights} />
      <AthleteSection />
      <CTASection />
    </div>
  );
}