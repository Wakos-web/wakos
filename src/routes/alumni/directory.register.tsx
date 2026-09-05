import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAlumniAuth } from "@/hooks/useAlumniAuth";
import { useOtpResend } from "@/hooks/useOtpResend";
import { notifyAlumniApprover } from "@/lib/alumni-notify";

export const Route = createFileRoute("/alumni/directory/register")({
  head: () => ({
    meta: [{ title: "Register — Alumni Directory" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { user, requestOtp, verifyOtp, refreshProfile } = useAlumniAuth();
  const resend = useOtpResend();
  const [phase, setPhase] = useState<"email" | "code" | "profile">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [programme, setProgramme] = useState("O-Level");
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1952 }, (_, i) => currentYear - i);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!resend.allowSend()) { setError(resend.hint()); return; }
    setLoading(true);
    try {
      await requestOtp(email.trim());
      resend.onSent();
      setPhase("code");
    } catch (err: any) {
      setError(err.message || "Could not send the code");
    }
    setLoading(false);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email.trim(), code.trim());
      // If this email already owns a profile (approved or awaiting review),
      // the Pulse handles the right screen for it — send them there.
      const p = await refreshProfile();
      if (p) {
        navigate({ to: "/alumni" });
        return;
      }
      setPhase("profile");
    } catch (err: any) {
      setError(err.message || "That code didn't work. Try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: created, error: insertError } = await supabase.from("alumni_profiles").insert({
        user_id: user?.id || null,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        graduation_year: parseInt(gradYear),
        programme,
        current_location: location || null,
        profession: profession || null,
        company: company || null,
        bio: bio || null,
        is_public: true,
        approved: false, // every new alumnus is approved by the alumni admin before access
      }).select().single();

      if (insertError) throw insertError;
      // Email alert: ping the alumni admin about every sign-up request.
      if (created?.id) {
        try {
          const { data: s } = await supabase.auth.getSession();
          if (s.session?.access_token) {
            notifyAlumniApprover({ data: { kind: "registration", submissionId: created.id, accessToken: s.session.access_token } })
              .then(() => {}).catch(() => {});
          }
        } catch {
          // never block registration on the notification
        }
      }
      // Signed in and pending — the Pulse shows the "under review" screen.
      navigate({ to: "/alumni" });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

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
            Register once — the alumni admin approves your profile before you appear
          </p>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-8">
          <p className="text-sm text-green-900 font-body">
            Your request goes to the alumni admin for review, and you'll get an email alert the moment you're approved. Until then your profile stays private and the Pulse stays locked.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {phase !== "profile" ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-8">
            {phase === "email" ? (
              <form onSubmit={sendCode} className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-stone-900">Let's start with your email</h2>
                <p className="text-sm text-stone-500 font-body">
                  We'll send a one-time code to confirm you're a WACOS alumnus, then you'll set up your profile.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Email Address *</label>
                  <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading || !email.trim()}
                  className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50">
                  {loading ? "Sending code..." : "Send sign-in code"}
                </button>
                <p className="text-center text-sm text-stone-500">
                  Already registered? <Link to="/alumni" className="text-green-800 font-semibold hover:underline">Open the Pulse</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={verify} className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-stone-900">Check your email</h2>
                <p className="text-sm text-stone-500 font-body">
                  We sent a one-time code to <span className="font-semibold text-stone-800">{email.trim()}</span>. Enter it below.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">One-time code *</label>
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" required autoFocus value={code}
                    onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    placeholder="••••••" />
                </div>
                <button type="submit" disabled={loading || code.trim().length < 6}
                  className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50">
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
                <button type="button" onClick={sendCode} disabled={loading || !resend.allowSend()}
                  className="w-full text-center text-sm text-stone-500 hover:text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  {resend.label()}
                </button>
                <p className="text-center text-[11px] text-stone-400">{resend.sendsLeft} of {resend.maxSends} sends left this session</p>
                <button type="button" onClick={() => { setPhase("email"); setCode(""); setError(""); }}
                  className="w-full text-center text-sm text-stone-500 hover:text-stone-700">
                  Use a different email
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-stone-200 p-8 space-y-5">
            <h2 className="font-display text-2xl font-bold text-stone-900">Your WACOS profile</h2>
            <p className="text-sm text-stone-500 font-body">
              Registering as <span className="font-semibold text-stone-800">{email.trim()}</span>.
            </p>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name *</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="Your full name" />
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
              {loading ? "Submitting..." : "Submit for approval"}
            </button>
            <p className="text-center text-sm text-stone-500">
              Already registered? <Link to="/alumni" className="text-green-800 font-semibold hover:underline">Open the Pulse</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
