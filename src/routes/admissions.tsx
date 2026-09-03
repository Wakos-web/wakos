import { createFileRoute } from "@tanstack/react-router";
import { IMAGES, SCHOOL_NAME } from "@/lib/content";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [{ title: "Admissions — M.M College Wairaka" },{ name: "description", content: "How to apply to M.M College Wairaka. Admission every term. Scholarships for bright students." }],
    links: [{ rel: "canonical", href: "/admissions" }],
  }),
  component: AdmissionsPage,
});

const STEPS = [
  { num: "01", title: "Inquire", desc: "Fill out the inquiry form below or visit the college. Our admissions team will guide you through the process and answer your questions." },
  { num: "02", title: "Apply", desc: "Submit your application with a recommendation or pass slip from your previous school, two plastic folders, and the admission letter from the college." },
  { num: "03", title: "Review", desc: "The college reviews your application and school report. Admission is based on merit and available places. Contact the college to check your status." },
  { num: "04", title: "Enrol", desc: "Successful applicants receive their admission letter and join the college. Bring your uniform: black trousers and white shirt for boys, caribbean black skirt and white shirt for girls." },
];

const SCHOLARSHIPS = [
  { title: "Academic Scholarship", desc: "For students who demonstrate exceptional academic potential. Awarded based on previous school results and interview. Covers tuition and boarding fees.", criteria: ["Strong previous school report", "Demonstrated academic curiosity", "Good conduct and character"] },
  { title: "Sports Scholarship", desc: "For talented athletes who show promise in football, athletics, netball, or other sports. The school has a proven track record of developing athletes like Joshua Cheptegei.", criteria: ["Demonstrated athletic talent", "Coach recommendation", "Commitment to training"] },
  { title: "Need-Based Bursary", desc: "For bright students from families who cannot afford school fees. The college and alumni fund bursaries to ensure no student is turned away for financial reasons.", criteria: ["Financial need demonstrated", "Good academic performance", "Character and determination"] },
];

const FAQ = [
  { q: "When does admission open?", a: "Admission opens every term. Contact the college early to inquire about available places and the application timeline." },
  { q: "What are the school fees?", a: "School fees plus PTA contribution is UGX 709,800 per term. This is payable through Centenary Bank using the school bank slip. Uniform is not included." },
  { q: "What documents do I need?", a: "You need a recommendation, pass slip, or report card from your previous school, two plastic folders, and the admission letter from the college." },
  { q: "Are there scholarships?", a: "Yes. We offer academic scholarships, sports scholarships, and need-based bursaries for bright students. Contact the college to learn more." },
  { q: "What subjects are offered?", a: "O-Level students study both Arts and Science subjects. A-Level students select subject combinations under Arts or Sciences, taking three essential subjects plus two subsidiary subjects." },
  { q: "Is the school a UNEB centre?", a: "Yes. M.M College Wairaka is a UNEB examination centre for both UCE (O-Level) and UACE (A-Level) examinations." },
];function HeroSection() {
  return (
    <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.hero} alt="WACOS admissions" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4">Admissions</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body">Admission every term. Scholarships for bright students. Discipline, hard work, and self-reliance.</p>
      </div>
    </section>
  );
}function HowToApply() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">How to Apply</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Four steps to enrolment</h2>
          <p className="mt-4 text-stone-600 text-lg font-body max-w-2xl mx-auto">Admission opens every term. Contact the college early to secure your place.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div key={step.num} className="relative rounded-2xl bg-stone-50 border border-stone-200 p-8">
              <span className="font-display text-5xl font-bold text-green-100 absolute top-4 right-6">{step.num}</span>
              <h3 className="font-display text-xl font-bold text-stone-900 mb-3 relative z-10">{step.title}</h3>
              <p className="text-stone-600 font-body leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}function ScholarshipsSection() {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Scholarships</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Opportunities for bright students</h2>
          <p className="mt-4 text-stone-600 text-lg font-body max-w-2xl mx-auto">Every term, we identify and support students with exceptional potential. Talent and determination should never be limited by finances.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCHOLARSHIPS.map((s) => (
            <div key={s.title} className="rounded-2xl bg-white border border-stone-200 p-8">
              <h3 className="font-display text-xl font-bold text-stone-900 mb-3">{s.title}</h3>
              <p className="text-stone-600 font-body leading-relaxed mb-4">{s.desc}</p>
              <p className="text-xs font-semibold text-green-800 uppercase tracking-widest mb-2">Criteria</p>
              <ul className="space-y-2">
                {s.criteria.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-800 shrink-0" />
                    <span className="text-sm text-stone-600 font-body">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}function InquiryForm() {
  return (
    <section id="inquire" className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Inquire</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Admission inquiry</h2>
          <p className="mt-4 text-stone-600 text-lg font-body">Fill out the form below and our admissions team will contact you.</p>
        </div>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thank you! Our admissions team will contact you soon."); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Student Name *</label>
              <input type="text" required className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Parent/Guardian Name *</label>
              <input type="text" required className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Full name" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Phone Number *</label>
              <input type="tel" required className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="e.g. 0700 123 456" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
              <input type="email" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Current School</label>
              <input type="text" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="School name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Level Applying For *</label>
              <select required className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
                <option value="">Select level</option>
                <option value="o-level">O-Level (Senior 1)</option>
                <option value="a-level">A-Level (Senior 5)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Message</label>
            <textarea rows={4} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Any questions about admission, scholarships, or fees?" />
          </div>
          <button type="submit" className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors">Submit Inquiry</button>
        </form>
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
}

function CTASection() {
  return (
    <section className="bg-green-900 py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Ready to begin?</h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">Contact the college or fill out the inquiry form above. Our admissions team is ready to guide you.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#inquire" className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors">Inquire Now</a>
          <a href="/contact" className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">Contact Us</a>
        </div>
      </div>
    </section>
  );
}

function AdmissionsPage() {
  return (
    <div>
      <HeroSection />
      <HowToApply />
      <ScholarshipsSection />
      <InquiryForm />
      <FAQSection />
      <CTASection />
    </div>
  );
}