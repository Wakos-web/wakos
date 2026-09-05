import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { IMAGES } from "@/lib/content";
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
  { slug: "trust_fund", title: "Trust Fund Contribution", desc: "UGX 10,000 per month ,  less than a mobile phone bill ,  funds laboratory renovation, dormitory repair, and student bursaries. Join the Trust Fund and see exactly where your money goes.", tag: "Monthly" },
  { slug: "bursary", title: "Bursary Support", desc: "Fund a bright student future. Bursaries are awarded competitively at the end of each term based on exam results. Last year, alumni-funded bursaries supported 211 students through fees and boarding.", tag: "Per Student" },
  { slug: "laboratory", title: "Laboratory Renovation", desc: "Help equip and maintain the Physics, Chemistry, and Biology laboratories. The alumni have already renovated two labs through the Trust Fund.", tag: "Project" },
  { slug: "infrastructure", title: "Infrastructure Projects", desc: "Contribute to dormitory rehabilitation, classroom renovation, and the ongoing asbestos removal programme. Your name can be on a laboratory, a classroom, a future.", tag: "Capital" },
  { slug: "scholarship", title: "Scholarships", desc: "Establish a scholarship in your name or class year. Fund a bright student education. Last year, 211 students received alumni-funded bursaries. Your scholarship could be the reason the next generation succeeds.", tag: "Named" },
  { slug: "in_kind", title: "In-Kind Gifts", desc: "Donate books, equipment, furniture, or materials directly to the college. The Resource Centre and laboratories always need updated materials.", tag: "Goods" },
];

type GivingWay = { title: string; desc: string; tag: string; slug?: string };
type GivingStat = { value: string; label: string };
type DonationAccount = { bank_name: string; account_name: string; account_number: string; currency: string; branch: string | null; note: string | null; way_slug?: string | null };
type MobileDonation = { provider: string; number: string; account_name: string | null; note: string | null; way_slug?: string | null };
type GivingContact = { person_name: string; title: string | null; phone: string | null; email: string | null; note: string | null };

// What donors should write in the bank slip / MoMo message per way, so the
// giving team can credit the right cause during reconciliation.
const WAY_REFERENCE: Record<string, string> = {
  trust_fund: "Trust Fund contribution",
  bursary: "Bursary support",
  laboratory: "Laboratory renovation",
  infrastructure: "Infrastructure project",
  scholarship: "Scholarship",
};

const DEFAULT_ACCOUNTS: DonationAccount[] = [
  { bank_name: "Centenary Bank", account_name: "M.M College Wairaka Development Fund", account_number: "XXXXXXXXXX", currency: "UGX", branch: "Jinja Main Branch", note: "Use the school bank slip and reference your name and purpose.", way_slug: "trust_fund" },
];

const DEFAULT_MOBILE: MobileDonation[] = [
  { provider: "MTN MoMo", number: "0700 000 000", account_name: "M.M College Wairaka", note: "Send and confirm with the contact person below.", way_slug: null },
  { provider: "Airtel Money", number: "0700 000 000", account_name: "M.M College Wairaka", note: "Send and confirm with the contact person below.", way_slug: null },
];

const DEFAULT_CONTACT: GivingContact = {
  person_name: "MMCWOSA Giving Coordinator",
  title: "Alumni Giving & Trust Fund",
  phone: "+256 332 277 476",
  email: "info@mmcollegewairaka.sc.ug",
  note: "For scholarships, in-kind gifts, and any other donations, contact us directly.",
};

const FAQ = [
  { q: "How do I contribute to the Trust Fund?", a: "Contact MMCWOSA or the college administration to set up a monthly contribution. The minimum is UGX 10,000 per month. Contributions can be made through Centenary Bank using the school bank slip." },
  { q: "Can I direct my gift to a specific project?", a: "Yes. You can specify whether your contribution goes to laboratory renovation, dormitory rehabilitation, bursaries, or general college development. The Trust Fund reports on project progress regularly." },
  { q: "Is my gift tax-deductible?", a: "Gifts to registered educational institutions in Uganda may qualify for tax benefits. Consult your tax adviser for specifics related to your jurisdiction." },
  { q: "How do I set up a scholarship?", a: "Contact the college administration to discuss scholarship criteria, naming, and funding levels. Scholarships can be need-based, sports-based, or academic." },
  { q: "Can I give in-kind instead of cash?", a: "Yes. The college accepts books, laboratory equipment, furniture, and other materials. Contact the college to discuss what is currently needed." },

];

function HeroSection({ desc }: { desc: string }) {
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
}

function FlipCard({
  way,
  accounts,
  mobile,
  contact,
}: {
  way: GivingWay;
  accounts: DonationAccount[];
  mobile: MobileDonation[];
  contact: GivingContact;
}) {
  const [flipped, setFlipped] = useState(false);

  // Each card shows only the accounts the backend linked to its slug.
  // Accounts without a way_slug are general and act as the fallback so a card
  // is never empty, until the admin attaches a dedicated number to that way.
  const inKind = way.slug === "in_kind";
  const specificBank = way.slug ? accounts.filter((a) => a.way_slug === way.slug) : [];
  const generalBank = accounts.filter((a) => !a.way_slug);
  const cardAccounts = inKind ? [] : specificBank.length > 0 ? specificBank : generalBank;
  const specificMobile = way.slug ? mobile.filter((m) => m.way_slug === way.slug) : [];
  const generalMobile = mobile.filter((m) => !m.way_slug);
  const cardMobile = inKind ? [] : specificMobile.length > 0 ? specificMobile : generalMobile;
  const reference = (way.slug && WAY_REFERENCE[way.slug]) || null;

  return (
    <div className="h-full [perspective:1200px]" onClick={() => setFlipped((f) => !f)}>
      <div
        className={`relative h-full min-h-[340px] transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-stone-50 border border-stone-200 p-8 flex flex-col cursor-pointer hover:border-green-800 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-green-800 bg-green-100 px-3 py-1 rounded-full mb-4">{way.tag}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Tap to give</span>
          </div>
          <h3 className="font-display text-xl font-bold text-stone-900 mb-3">{way.title}</h3>
          <p className="text-stone-600 font-body leading-relaxed flex-1">{way.desc}</p>
          <p className="mt-5 text-xs font-semibold text-green-800 inline-flex items-center gap-1.5">
            Tap to see how to give
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" /></svg>
          </p>
        </div>

        {/* Back: donation box */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-green-900 p-8 overflow-y-auto cursor-pointer">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-300 mb-3">How to give · {way.title}</p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-green-300/70">Tap to flip back</span>
          </div>
          <div className="space-y-4">
            {/* Reference hint: tells the donor exactly what to write on the slip / MoMo message */}
            {!inKind && reference && (
              <p className="text-xs text-green-100/90 leading-relaxed rounded-xl bg-white/10 p-4">
                Send to the details below and write <span className="font-semibold text-white">"{reference}"</span> as your reference or MoMo message, so the giving team credits this cause.
              </p>
            )}
            {/* Bank accounts for this way */}
            {cardAccounts.length > 0 && (
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-200 mb-3">Bank Transfer</p>
                <div className="space-y-3">
                  {cardAccounts.map((acc, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-semibold text-white">{acc.bank_name}</p>
                      <p className="text-green-100/80 mt-0.5">{acc.account_name}</p>
                      <p className="text-white font-bold tracking-wider mt-0.5">A/C {acc.account_number} · {acc.currency}</p>
                      {acc.branch && <p className="text-green-100/60 text-xs mt-0.5">{acc.branch}</p>}
                      {acc.note && <p className="text-green-100/60 text-xs mt-1 leading-relaxed">{acc.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Mobile money for this way */}
            {cardMobile.length > 0 && (
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-200 mb-3">Mobile Money</p>
                <div className="space-y-2">
                  {cardMobile.map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-white">{m.provider}</p>
                        {m.account_name && <p className="text-green-100/70 text-xs">{m.account_name}</p>}
                      </div>
                      <span className="text-white font-bold tracking-wider">{m.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* In-kind has no transfer details: arrangements go through the office */}
            {inKind && (
              <div className="rounded-xl bg-white/10 p-4 text-sm">
                <p className="font-semibold text-white">Donating goods or materials</p>
                <p className="text-green-100/80 mt-1 leading-relaxed">Books, lab equipment, furniture and materials are arranged directly with the college. Reach out below and we will coordinate delivery.</p>
              </div>
            )}
            {/* Contact for every way */}
            <div className="rounded-xl bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-200 mb-1">Need help?</p>
              <p className="font-semibold text-white text-sm">{contact.person_name}</p>
              {contact.phone && <p className="text-green-100/80 text-xs mt-0.5">{contact.phone}</p>}
              {contact.email && <p className="text-green-100/80 text-xs break-all">{contact.email}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaysOfGiving({ ways, accounts, mobile, contact }: {
  ways: typeof WAYS;
  accounts: DonationAccount[];
  mobile: MobileDonation[];
  contact: GivingContact;
}) {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Ways of Giving</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">How you can help</h2>
          <p className="mt-4 text-stone-600 text-lg font-body max-w-2xl mx-auto">Every shilling goes directly to students and infrastructure. No middlemen. No overhead. Choose the way that works for you — tap a card to see how to give.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ways.map((way) => (
            <FlipCard key={way.title} way={way} accounts={accounts} mobile={mobile} contact={contact} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ faqs }: { faqs: typeof FAQ }) {
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
}

function ImpactSection({ stats }: { stats: { value: string; label: string }[] }) {
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

/* Thank-you form: donors record what they sent so the giving team can track
 * every donation box, bank transfer and mobile money payment. Name/email are
 * optional — the dropdowns and transaction message are the required bits. */
function ThankYouForm({ ways }: { ways: GivingWay[] }) {
  const [donationType, setDonationType] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [transactionMessage, setTransactionMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!donationType) { setError("Choose what you donated."); return; }
    if (!paymentType) { setError("Choose how you paid."); return; }
    if (!transactionMessage.trim()) { setError("Add the transaction message or reference."); return; }
    setSaving(true);
    const { error: insertError } = await supabase.from("donations").insert({
      donor_name: name.trim() || "Anonymous",
      donor_email: email.trim() || null,
      donation_type: donationType,
      payment_method: paymentType,
      transaction_ref: transactionMessage.trim(),
      status: "received",
    });
    setSaving(false);
    if (insertError) { setError(insertError.message || "Could not record your gift. Try again."); return; }
    setSubmitted(true);
  };

  return (
    <section className="bg-green-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        {!submitted ? (
          <>
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-green-300 uppercase tracking-widest mb-3">Thank you</p>
              <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Tell us about your gift</h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto font-body">You've made a difference. Record your donation below so the giving team can track every shilling that comes in.</p>
            </div>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-2xl p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">What did you donate? *</label>
                <select value={donationType} onChange={(e) => { setDonationType(e.target.value); setError(""); }} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select…</option>
                  <option value="trust_fund">Trust Fund monthly contribution</option>
                  <option value="bursary">Bursary support</option>
                  <option value="laboratory">Laboratory renovation</option>
                  <option value="infrastructure">Infrastructure project</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="in_kind">In-kind gift</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">How did you pay? *</label>
                <select value={paymentType} onChange={(e) => { setPaymentType(e.target.value); setError(""); }} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select…</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="cash">Cash</option>
                  <option value="in_kind">In-kind / goods</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Transaction message / reference *</label>
                <input
                  value={transactionMessage}
                  onChange={(e) => { setTransactionMessage(e.target.value); setError(""); }}
                  className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. MoMo message: XMB-1234-5678 or the bank slip reference"
                />
                <p className="text-xs text-stone-400 mt-1">Copy the exact message you received after sending — this is how we match your gift.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Your name (optional)</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. John Mukasa" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email (optional)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="john@example.com" />
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={saving} className="w-full px-6 py-3 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
                {saving ? "Recording…" : "Record my donation"}
              </button>
              <p className="text-xs text-stone-400 text-center">Want to remain anonymous? Leave the name blank — your gift is still recorded.</p>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Thank you!</h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">Your donation has been recorded. The giving team will confirm it and credit it to the right cause.</p>
            <button onClick={() => { setSubmitted(false); setDonationType(""); setPaymentType(""); setTransactionMessage(""); setName(""); setEmail(""); }} className="text-sm font-semibold text-white/80 hover:text-white">
              Record another donation
            </button>
          </div>
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
    ? content.ways.ways.map((w: any) => ({ title: w.name, desc: w.description, tag: w.impact || "Gift", slug: w.slug }))
    : WAYS;
  const faqs = content.faq?.faqs?.length
    ? content.faq.faqs.map((f: any) => ({ q: f.question, a: f.answer }))
    : FAQ;
  const stats = content.impact?.stats?.length ? content.impact.stats : IMPACT;
  const [liveWays, setLiveWays] = useState<GivingWay[] | null>(null);
  const [liveStats, setLiveStats] = useState<GivingStat[] | null>(null);
  const [accounts, setAccounts] = useState<DonationAccount[]>(DEFAULT_ACCOUNTS);
  const [mobile, setMobile] = useState<MobileDonation[]>(DEFAULT_MOBILE);
  const [contact, setContact] = useState<GivingContact>(DEFAULT_CONTACT);

  useEffect(() => {
    (async () => {
      const [w, s, a, m, c] = await Promise.all([
        supabase.from("giving_ways").select("*").eq("active", true).order("sort_order", { ascending: true }),
        supabase.from("giving_stats").select("*").eq("active", true).order("sort_order", { ascending: true }),
        supabase.from("donation_accounts").select("*").eq("active", true).order("sort_order", { ascending: true }),
        supabase.from("mobile_donations").select("*").eq("active", true).order("sort_order", { ascending: true }),
        supabase.from("giving_contact").select("*").limit(1),
      ]);
      if (w.data?.length) setLiveWays(w.data.map((x: any) => ({ title: x.title, desc: x.description, tag: x.tag, slug: x.slug })));
      if (s.data?.length) setLiveStats(s.data.map((x: any) => ({ value: x.value, label: x.label })));
      if (a.data?.length) setAccounts(a.data);
      if (m.data?.length) setMobile(m.data);
      if (c.data?.[0]) setContact(c.data[0]);
    })();
  }, []);

  const shownWays = liveWays || ways;
  const shownStats = liveStats || stats;
  return (
    <div>
      <HeroSection desc={heroDesc} />
      <WaysOfGiving ways={shownWays} accounts={accounts} mobile={mobile} contact={contact} />
      <ImpactSection stats={shownStats} />
      <ThankYouForm ways={shownWays} />
      <FAQSection faqs={faqs} />
    </div>
  );
}