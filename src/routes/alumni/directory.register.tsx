import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/alumni/directory/register")({
  head: () => ({
    meta: [{ title: "Register — Alumni Directory" }],
  }),
  component: RegisterPage,
});

const SESSION_KEY = "wacos_alumnus_session";

function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [programme, setProgramme] = useState("O-Level");
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // One profile per email — registering again simply signs that alumnus back in.
      const { data: existing } = await supabase
        .from("alumni_profiles")
        .select("*")
        .ilike("email", email.trim())
        .maybeSingle();
      if (existing) {
        if (!existing.approved) throw new Error("This email is registered but access was suspended. Contact MMCWOSA to restore your profile.");
        try { localStorage.setItem(SESSION_KEY, JSON.stringify({ id: existing.id })); } catch { /* noop */ }
        navigate({ to: "/alumni" });
        return;
      }

      const { data: created, error: insertError } = await supabase.from("alumni_profiles").insert({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        graduation_year: parseInt(gradYear),
        programme,
        current_location: location || null,
        profession: profession || null,
        company: company || null,
        bio: bio || null,
        is_public: true,
        approved: true, // Auto-approved. Admins review later and can recall if needed.
      }).select().single();

      if (insertError) throw insertError;
      if (created) {
        try { localStorage.setItem(SESSION_KEY, JSON.stringify({ id: created.id })); } catch { /* noop */ }
      }
      navigate({ to: "/alumni" });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1952 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative h-[30vh] min-h-[200px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-green-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-tight">
            Join the Directory
          </h1>
          <p className="text-lg text-white/70 mt-2 font-body">
            Register once — your profile is live instantly
          </p>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-8">
          <p className="text-sm text-green-900 font-body">
            Your profile appears in the directory and on the Pulse right away. MMCWOSA may review it later and contact you if anything needs correcting. You can add a profile photo from the <Link to="/alumni" className="font-bold underline">Pulse</Link> afterwards.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-stone-200 p-8 space-y-5">
          <h2 className="font-display text-2xl font-bold text-stone-900">Your WACOS profile</h2>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name *</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Email Address *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
              placeholder="your@email.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Graduation Year *</label>
              <select required value={gradYear} onChange={e => setGradYear(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
                <option value="">Select year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Programme *</label>
              <select required value={programme} onChange={e => setProgramme(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
                <option value="O-Level">O-Level (S1-S4)</option>
                <option value="A-Level">A-Level (S5-S6)</option>
                <option value="Both">Both O-Level and A-Level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Current Location (optional)</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="e.g. Kampala, Uganda" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Profession (optional)</label>
              <input type="text" value={profession} onChange={e => setProfession(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="e.g. Engineer, Teacher, Farmer" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-stone-700 mb-2">Company / Organisation (optional)</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="Where you work" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-stone-700 mb-2">Bio</label>
              <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="Tell fellow alumni about yourself" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50">
            {loading ? "Creating your profile..." : "Register & Take Me to the Pulse"}
          </button>
          <p className="text-center text-sm text-stone-500">
            Already registered? <Link to="/alumni" className="text-green-800 font-semibold hover:underline">Open the Pulse</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
