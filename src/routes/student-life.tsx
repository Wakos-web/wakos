import { createFileRoute } from "@tanstack/react-router";
import { IMAGES } from "@/lib/content";

export const Route = createFileRoute("/student-life")({
  head: () => ({
    meta: [{ title: "Student Life — M.M College Wairaka" },{ name: "description", content: "Clubs, service, outreach, and traditions: what life looks like between classes at M.M College Wairaka." }],
    links: [{ rel: "canonical", href: "/student-life" }],
  }),
  component: StudentLifePage,
});

const AREAS = [
  { title: "Residential Life", subtitle: "Living & Learning Together", desc: "Boarding students live, study, and grow together in supervised dormitories. House parents mentor and support students through their secondary school years, creating a second family away from home.", img: IMAGES.studentLife, align: "left" as const },
  { title: "Clubs & Societies", subtitle: "Lead, Organise, Do", desc: "Student-run organisations including the Science Club, Girl Guides, Agriculture Club, and Debating Society. Students lead, organise, and learn by doing — the motto in action.", img: IMAGES.campus, align: "right" as const },
  { title: "Community Service", subtitle: "We Do It Ourselves", desc: "Students partner with neighbouring households on reforestation, public health, and agricultural projects. Last year students planted 4,000 tree seedlings in a single Saturday.", img: IMAGES.giving, align: "left" as const },
  { title: "Arts & Culture", subtitle: "Express & Create", desc: "Cultural performances, music, drama, and creative expression. Students showcase talent at school events and inter-school competitions throughout the year.", img: IMAGES.studentLife, align: "right" as const },
  { title: "Wellness & Mentoring", subtitle: "Body, Mind & Character", desc: "Career guidance seminars, medical bootcamps, and peer mentoring help students develop holistically. Every student is known, supported, and challenged.", img: IMAGES.academics, align: "left" as const },
];

const QUICK_NAV = [
  { label: "Residential Life", href: "#residential" },
  { label: "Clubs", href: "#clubs" },
  { label: "Service", href: "#service" },
  { label: "Arts", href: "#arts" },
  { label: "Wellness", href: "#wellness" },
];

function HeroSection() {
  return (
    <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.studentLife} alt="Students at M.M College Wairaka" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4">Student Life</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body">Life beyond the classroom is where character is built. At M.M College Wairaka, every student is encouraged to participate, lead, and grow.</p>
      </div>
    </section>
  );
}

function QuickNav() {
  return (
    <nav className="sticky top-0 z-20 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 flex gap-6 overflow-x-auto py-3 scrollbar-hide">
        {QUICK_NAV.map((item) => (
          <a key={item.href} href={item.href} className="whitespace-nowrap text-sm font-medium text-stone-600 hover:text-green-800 transition-colors uppercase tracking-wider">
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function FeatureCard({ area, index }: { area: typeof AREAS[number]; index: number }) {
  const isRight = area.align === "right";
  const ids = ["residential", "clubs", "service", "arts", "wellness"];
  return (
    <section id={ids[index]} className="scroll-mt-16">
      <div className={`flex flex-col ${isRight ? "md:flex-row-reverse" : "md:flex-row"} min-h-[500px]`}>
        <div className="md:w-1/2 relative overflow-hidden">
          <img src={area.img} alt={area.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="md:w-1/2 flex items-center bg-stone-50">
          <div className="p-8 md:p-12 lg:p-16 max-w-lg">
            <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">{area.subtitle}</p>
            <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold mb-4">{area.title}</h2>
            <p className="text-stone-600 text-lg leading-relaxed font-body">{area.desc}</p>
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
        <h2 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Experience it for yourself</h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">Come see what a day in the life of a WACOS student looks like. We welcome prospective students and families to visit our campus in Wairaka.</p>
        <a href="/admissions" className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors">
          Apply Now
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
        </a>
      </div>
    </section>
  );
}

function StudentLifePage() {
  return (
    <div>
      <HeroSection />
      <QuickNav />
      <main>
        {AREAS.map((area, i) => (
          <FeatureCard key={area.title} area={area} index={i} />
        ))}
      </main>
      <CTASection />
    </div>
  );
}
