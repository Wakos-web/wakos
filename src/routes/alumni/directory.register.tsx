import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAlumniAuth } from "@/hooks/useAlumniAuth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/alumni/directory/register")({
  head: () => ({
    meta: [{ title: "Register — Alumni Directory" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { signUp } = useAlumniAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"account" | "profile">("account");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [programme, setProgramme] = useState("O-Level");
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      setStep("profile");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase.from("alumni_profiles").insert({
        user_id: user.id,
        full_name: fullName,
        graduation_year: parseInt(gradYear),
        programme,
        current_location: location || null,
        profession: profession || null,
        company: company || null,
        bio: bio || null,
        is_public: true,
        approved: false,
      });

      if (insertError) throw insertError;
      navigate({ to: "/alumni/directory" });
    } catch (err: any) {
      setError(err.message || "Profile creation failed");
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
            Create your account and claim your WACOS profile
          </p>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-6 py-16">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-10">
          <div className={`flex items-center gap-2 ${step === "account" ? "text-green-800 font-bold" : "text-green-800"}`}>
            <span className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center text-sm">1</span>
            <span className="text-sm">Account</span>
          </div>
          <div className="flex-1 h-px bg-stone-200" />
          <div className={`flex items-center gap-2 ${step === "profile" ? "text-green-800 font-bold" : "text-stone-400"}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === "profile" ? "bg-green-800 text-white" : "bg-stone-200 text-stone-500"}`}>2</span>
            <span className="text-sm">Profile</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === "account" ? (
          <form onSubmit={handleAccountSubmit} className="space-y-5">
            <h2 className="font-display text-2xl font-bold text-stone-900">Create your account</h2>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Email *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Password *</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Confirm Password *</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50">
              {loading ? "Creating account..." : "Continue to Profile"}
            </button>
            <p className="text-center text-sm text-stone-500">
              Already have an account? <Link to="/alumni/directory/login" className="text-green-800 font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <h2 className="font-display text-2xl font-bold text-stone-900">Your WACOS profile</h2>
            <p className="text-stone-600 font-body">Your profile will be reviewed by MMCWOSA before appearing in the directory.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name *</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  placeholder="Your full name" />
              </div>
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
                <label className="block text-sm font-semibold text-stone-700 mb-2">Current Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  placeholder="e.g. Kampala, Uganda" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Profession</label>
                <input type="text" value={profession} onChange={e => setProfession(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  placeholder="e.g. Engineer, Teacher, Farmer" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Company / Organisation</label>
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
              {loading ? "Submitting..." : "Submit Profile for Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
