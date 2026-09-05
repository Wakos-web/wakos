import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IMAGES, SCHOOL_NAME } from "@/lib/content";
import { supabase } from "@/lib/supabase";
import { usePageContent } from "@/hooks/usePageContent";

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

];function HeroSection({ desc }: { desc: string }) {
  return (
    <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.giving} alt="Giving to WACOS" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4">Giving</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body">{desc}</p>
      </div>
    </section>
  );
}function WaysOfGiving({ ways }: { ways: typeof WAYS }) {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Ways of Giving</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">How you can help</h2>
          <p className="mt-4 text-stone-600 text-lg font-body max-w-2xl mx-auto">Every shilling goes directly to students and infrastructure. No middlemen. No overhead. Choose the way that works for you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ways.map((way) => (
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
}function FAQSection({ faqs }: { faqs: typeof FAQ }) {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Frequently asked questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((item, i) => (
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
}function ImpactSection({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Your Impact</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">What gifts have achieved</h2>
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

function DonationForm() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("trust_fund");
  const [purpose, setPurpose] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("donations").insert({
      donor_name: anonymous ? "Anonymous" : name.trim(),
      donor_email: email.trim() || null,
      donor_phone: phone.trim() || null,
      amount: amount ? parseFloat(amount) : null,
      donation_type: type,
      purpose: purpose.trim() || null,
      anonymous,
      status: "received"
    });
    setSaving(false);
    if (!error) {
      setSubmitted(true);
    }
  };

  return (
    <section className="bg-green-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        {!showForm && !submitted && (
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Make a gift</h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">Every contribution goes directly to students and infrastructure. Your gift today builds the school your grandchildren will attend.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors">Donate Now</button>
              <a href="/contact" className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">Contact the College</a>
            </div>
          </div>
        )}
        {submitted && (
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Thank you!</h2>
            <p className="text-white/70 text-lg mb-8">Your pledge has been recorded. The Trust Fund Coordinator will contact you with payment details.</p>
            <button onClick={() => { setSubmitted(false); setShowForm(false); }} className="text-sm font-semibold text-white/80 hover:text-white">Submit another pledge</button>
          </div>
        )}
        {showForm && !submitted && (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-2xl p-8 space-y-5">
            <h3 className="font-display text-xl font-bold text-stone-900">Make a Pledge</h3>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Your Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. John Mukasa" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email (optional)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone (optional)</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="+256 700 000000" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Amount (UGX, optional)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 50000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Donation Type *</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="trust_fund">Trust Fund Monthly</option>
                  <option value="bursary">Bursary Support</option>
                  <option value="project">Specific Project</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="in_kind">In-Kind Gift</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Purpose (optional)</label>
              <input value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Laboratory renovation" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="rounded border-stone-300 text-green-800 focus:ring-green-500" />
              <span className="text-sm text-stone-600">Make my donation anonymous</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">{saving ? "Submitting..." : "Submit Pledge"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

const IMPACT = [
  { value: "211", label: "Students on bursary last year" },
  { value: "2", label: "Labs renovated by Trust Fund" },
  { value: "4,000", label: "Seedlings planted by students" },
  { value: "73", label: "Years of continuous service" },
];

function GivingPage() {
  const { content } = usePageContent("giving");
  const heroDesc = content.hero?.description || "Last year, alumni funded bursaries for 211 students. This year, more are waiting. Your gift changes a life.";
  const ways = content.ways?.ways?.length
    ? content.ways.ways.map((w: any) => ({ title: w.name, desc: w.description, tag: w.impact || "Gift" }))
    : WAYS;
  const faqs = content.faq?.faqs?.length
    ? content.faq.faqs.map((f: any) => ({ q: f.question, a: f.answer }))
    : FAQ;
  const stats = content.impact?.stats?.length ? content.impact.stats : IMPACT;
  return (
    <div>
      <HeroSection desc={heroDesc} />
      <WaysOfGiving ways={ways} />
      <ImpactSection stats={stats} />
      <FAQSection faqs={faqs} />
      <DonationForm />
    </div>
  );
}