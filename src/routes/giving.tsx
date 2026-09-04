import { createFileRoute } from "@tanstack/react-router";
import { IMAGES, SCHOOL_NAME } from "@/lib/content";

export const Route = createFileRoute("/giving")({
  head: () => ({
    meta: [{ title: "Giving ,  M.M College Wairaka" },{ name: "description", content: "Support M.M College Wairaka. From UGX 10,000/month. Fund bursaries, laboratories, and student futures." }],
    links: [{ rel: "canonical", href: "/giving" }],
  }),
  component: GivingPage,
});

const WAYS = [
  { title: "Trust Fund Contribution", desc: "UGX 10,000 per month ,  less than a mobile phone bill ,  funds laboratory renovation, dormitory repair, and student bursaries. Join the Trust Fund and see exactly where your money goes.", tag: "Monthly" },
  { title: "Bursary Support", desc: "Fund a bright student future. Bursaries are awarded competitively at the end of each term based on exam results. Last year, alumni-funded bursaries supported 211 students through fees and boarding.", tag: "Per Student" },
  { title: "Laboratory Renovation", desc: "Help equip and maintain the Physics, Chemistry, and Biology laboratories. The alumni have already renovated two labs through the Trust Fund.", tag: "Project" },
  { title: "Infrastructure Projects", desc: "Contribute to dormitory rehabilitation, classroom renovation, and the ongoing asbestos removal programme. Your name can be on a laboratory, a classroom, a future.", tag: "Capital" },
  { title: "Scholarships", desc: "Establish a scholarship in your name or class year. Fund a bright student education. Last year, 211 students received alumni-funded bursaries. Your scholarship could be the reason the next generation succeeds.", tag: "Named" },
  { title: "In-Kind Gifts", desc: "Donate books, equipment, furniture, or materials directly to the college. The Resource Centre and laboratories always need updated materials.", tag: "Goods" },
];

const FAQ = [
  { q: "How do I contribute to the Trust Fund?", a: "Contact MMCWOSA or the college administration to set up a monthly contribution. The minimum is UGX 10,000 per month. Contributions can be made through Centenary Bank using the school bank slip." },
  { q: "Can I direct my gift to a specific project?", a: "Yes. You can specify whether your contribution goes to laboratory renovation, dormitory rehabilitation, bursaries, or general college development. The Trust Fund reports on project progress regularly." },
  { q: "Is my gift tax-deductible?", a: "Gifts to registered educational institutions in Uganda may qualify for tax benefits. Consult your tax adviser for specifics related to your jurisdiction." },
  { q: "How do I set up a scholarship?", a: "Contact the college administration to discuss scholarship criteria, naming, and funding levels. Scholarships can be need-based, sports-based, or academic." },
  { q: "Can I give in-kind instead of cash?", a: "Yes. The college accepts books, laboratory equipment, furniture, and other materials. Contact the college to discuss what is currently needed." },
  { q: "How are bursaries awarded?", a: "Bursaries are competitive. At the end of each term, the college identifies top-performing students in financial need based on examination results. Alumni through the Trust Fund then finance their fees and boarding for the following term. Contact the college or MMCWOSA for details." },
];function HeroSection() {
  return (
    <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.giving} alt="Giving to WACOS" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4">Giving</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body">Last year, alumni funded bursaries for 211 students. This year, more are waiting. Your gift changes a life.</p>
      </div>
    </section>
  );
}function WaysOfGiving() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Ways of Giving</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">How you can help</h2>
          <p className="mt-4 text-stone-600 text-lg font-body max-w-2xl mx-auto">Every shilling goes directly to students and infrastructure. No middlemen. No overhead. Choose the way that works for you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WAYS.map((way) => (
            <div key={way.title} className="rounded-2xl bg-stone-50 border border-stone-200 p-8 hover:border-green-800 hover:shadow-md transition-all">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-green-800 bg-green-100 px-3 py-1 rounded-full mb-4">{way.tag}</span>
              <h3 className="font-display text-xl font-bold text-stone-900 mb-3">{way.title}</h3>
              <p className="text-stone-600 font-body leading-relaxed">{way.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}function FAQSection() {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Frequently asked questions</h2>
        </div>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <details key={i} className="group rounded-2xl bg-white border border-stone-200 overflow-hidden">
              <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer font-display text-lg font-bold text-stone-900 list-none">
                {item.q}
                <span className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 group-open:bg-green-800 group-open:text-white transition-colors">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </span>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-stone-600 font-body leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}function ImpactSection() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Your Impact</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">What gifts have achieved</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-2xl bg-green-900 p-6 text-center">
            <p className="font-display text-3xl font-bold text-white">211</p>
            <p className="text-sm text-white/70 mt-1 font-body">Students on bursary last year</p>
          </div>
          <div className="rounded-2xl bg-green-900 p-6 text-center">
            <p className="font-display text-3xl font-bold text-white">2</p>
            <p className="text-sm text-white/70 mt-1 font-body">Labs renovated by Trust Fund</p>
          </div>
          <div className="rounded-2xl bg-green-900 p-6 text-center">
            <p className="font-display text-3xl font-bold text-white">4,000</p>
            <p className="text-sm text-white/70 mt-1 font-body">Seedlings planted by students</p>
          </div>
          <div className="rounded-2xl bg-green-900 p-6 text-center">
            <p className="font-display text-3xl font-bold text-white">73</p>
            <p className="text-sm text-white/70 mt-1 font-body">Years of continuous service</p>
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
        <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Make a gift</h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">Every contribution goes directly to students and infrastructure. To arrange a gift or pledge, contact the college or MMCWOSA. Your gift today builds the school your grandchildren will attend.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/contact" className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors">Contact the College</a>
          <a href="/alumni#trust" className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">Trust Fund</a>
        </div>
      </div>
    </section>
  );
}

function GivingPage() {
  return (
    <div>
      <HeroSection />
      <WaysOfGiving />
      <ImpactSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}