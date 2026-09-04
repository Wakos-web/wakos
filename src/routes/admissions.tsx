import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { IMAGES, SCHOOL_NAME } from "@/lib/content";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [{ title: "Admissions ,  M.M College Wairaka" },{ name: "description", content: "Admission opens every term at M.M College Wairaka. Bursaries for bright students. No entrance exams. Government-aided boarding school in Jinja." }],
    links: [{ rel: "canonical", href: "/admissions" }],
  }),
  component: AdmissionsPage,
});

const STEPS = [
  { num: "01", title: "Inquire", desc: "Fill out the inquiry form below or visit the college. Our admissions team will guide you through every step. No entrance exams ,  just a conversation about your child future." },
  { num: "02", title: "Apply", desc: "Submit your application with a recommendation or pass slip from your previous school, two plastic folders, and the admission letter from the college." },
  { num: "03", title: "Review", desc: "The college reviews your application and school report. Admission is based on merit and available places. We look at character, not just marks." },
  { num: "04", title: "Enrol", desc: "Welcome to WACOS. Your child receives their admission letter and joins a community of 1,840 students who chose to earn their future. Bring your uniform: black trousers and white shirt for boys, caribbean black skirt and white shirt for girls." },
];

const SCHOLARSHIPS = [
  { title: "Academic Scholarship", desc: "For students who demonstrate exceptional academic potential. Awarded based on previous school results and interview. Covers tuition and boarding fees.", criteria: ["Strong previous school report", "Demonstrated academic curiosity", "Good conduct and character"] },
  { title: "Sports Scholarship", desc: "Competitive award for talented athletes who show promise in football, athletics, netball, or other sports. The school has a proven track record of developing athletes like Joshua Cheptegei. Awarded based on athletic performance and coach recommendation.", criteria: ["Demonstrated athletic talent", "Coach recommendation", "Commitment to training"] },
  { title: "Need-Based Bursary", desc: "Competitive bursary awarded to bright students based on end-of-term examination results. Funded primarily by alumni through the Wairaka Trust Fund. Bursaries cover tuition and boarding fees for the following term.", criteria: ["Strong end-of-term exam results", "Demonstrated academic potential", "Competitive selection each term"] },
];

const FAQ = [
  { q: "When does admission open?", a: "Admission opens every term. Contact the college early to inquire about available places and the application timeline." },
  { q: "What are the school fees?", a: "School fees plus PTA contribution total UGX 709,800 per term (approximately UGX 236,600 per month over a 3-month term). Payment is made through Centenary Bank using the school bank slip. Uniform, books, and personal effects are not included in this amount." },
  { q: "What documents do I need?", a: "You need a recommendation, pass slip, or report card from your previous school, two plastic folders, and the admission letter from the college." },
  { q: "Are there bursaries?", a: "Yes. Bursaries are awarded competitively at the end of each term based on examination results. They are funded primarily by alumni through the Wairaka Trust Fund. Top-performing students in financial need are selected for fee and boarding support the following term. Contact the college for details." },
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
        <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body">Admission opens every term. Bursaries for bright students. Your child deserves a school that builds character, not just grades.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a href="/WACOS-Prospectus.pdf" download className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Download Prospectus
          </a>
        </div>
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
          <p className="mt-4 text-stone-600 text-lg font-body max-w-2xl mx-auto">Places fill quickly each term. Contact the college early to secure your child place. The process is simple ,  four steps to a transformed future.</p>
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
          <p className="mt-4 text-stone-600 text-lg font-body max-w-2xl mx-auto">Every term, we identify the brightest students and fund their education through alumni-backed bursaries. Last year, 211 students received support. Your child could be next.</p>
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
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [level, setLevel] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: insertError } = await supabase.from("inquiries").insert({
        student_name: studentName,
        parent_name: parentName,
        phone,
        email: email || null,
        current_school: currentSchool || null,
        level,
        message: message || null,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setStudentName(""); setParentName(""); setPhone(""); setEmail(""); setCurrentSchool(""); setLevel(""); setMessage("");
    } catch (err: any) {
      setError(err.message || "Submission failed");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <section id="inquire" className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-2xl bg-green-50 border border-green-200 p-12 text-center">
            <h3 className="font-display text-2xl font-bold text-stone-900 mb-3">Thank you!</h3>
            <p className="text-stone-600 font-body mb-6">Your inquiry has been received. Our admissions team will contact you soon.</p>
            <button onClick={() => setSuccess(false)} className="text-green-800 font-semibold hover:underline">Submit another inquiry</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inquire" className="py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">Inquire</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Admission inquiry</h2>
          <p className="mt-4 text-stone-600 text-lg font-body">Fill out the form below and our admissions team will contact you.</p>
        </div>
        {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Student Name *</label>
              <input type="text" required value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Parent/Guardian Name *</label>
              <input type="text" required value={parentName} onChange={e => setParentName(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Full name" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Phone Number *</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="e.g. 0700 123 456" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Current School</label>
              <input type="text" value={currentSchool} onChange={e => setCurrentSchool(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="School name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Level Applying For *</label>
              <select required value={level} onChange={e => setLevel(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
                <option value="">Select level</option>
                <option value="O-Level">O-Level (Senior 1)</option>
                <option value="A-Level">A-Level (Senior 5)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Message</label>
            <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Any questions about admission, scholarships, or fees?" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>
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
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">Every term, more families choose WACOS. Places are limited. Contact the college or fill out the inquiry form above ,  your child future starts here.</p>
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