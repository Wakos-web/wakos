import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAlumniAuth } from "@/hooks/useAlumniAuth";
import { useOtpResend } from "@/hooks/useOtpResend";

export const Route = createFileRoute("/alumni/directory/login")({
  head: () => ({
    meta: [{ title: "Sign In — Alumni Directory" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { requestOtp, verifyOtp } = useAlumniAuth();
  const resend = useOtpResend();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!resend.allowSend()) { setError(resend.hint()); return; }
    setLoading(true);
    try {
      await requestOtp(email.trim());
      resend.onSent();
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Could not send the code");
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email.trim(), code.trim());
      navigate({ to: "/alumni/directory" });
    } catch (err: any) {
      setError(err.message || "Invalid code. Try again.");
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
            Sign In
          </h1>
          <p className="text-lg text-white/70 mt-2 font-body">
            Access the alumni directory and update your profile
          </p>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-6 py-16">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSendCode} className="space-y-5">
            <h2 className="font-display text-2xl font-bold text-stone-900">Welcome back</h2>
            <p className="text-sm text-stone-500 font-body">
              Enter your email and we'll send you a one-time sign-in code.
            </p>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="your@email.com" />
            </div>
            <button type="submit" disabled={loading || !email.trim()}
              className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50">
              {loading ? "Sending code..." : "Send sign-in code"}
            </button>
            <p className="text-center text-sm text-stone-500">
              New to the directory? <Link to="/alumni/directory/register" className="text-green-800 font-semibold hover:underline">Register here</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <h2 className="font-display text-2xl font-bold text-stone-900">Check your email</h2>
            <p className="text-sm text-stone-500 font-body">
              We sent a one-time code to <span className="font-semibold text-stone-800">{email.trim()}</span>. Enter it below to sign in.
            </p>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">One-time code</label>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={e => setCode(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="••••••" />
            </div>
            <button type="submit" disabled={loading || code.trim().length < 6}
              className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50">
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
            <button type="button" onClick={handleSendCode} disabled={loading || !resend.allowSend()}
              className="w-full text-center text-sm text-stone-500 hover:text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed">
              {resend.label()}
            </button>
            <p className="text-center text-[11px] text-stone-400">{resend.sendsLeft} of {resend.maxSends} sends left this session</p>
            <button type="button" onClick={() => { setSent(false); setCode(""); }}
              className="w-full text-center text-sm text-stone-500 hover:text-stone-700">
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}