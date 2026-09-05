import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { adminAcceptInvite, adminSession } from "@/lib/supabase";
import { ShieldCheck, KeyRound, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/accept-invite")({
  head: () => ({
    meta: [{ title: "Accept Staff Invite — M.M College Wairaka" }],
  }),
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const navigate = useNavigate();
  const params = Route.useSearch() as { email?: string; code?: string };
  const prefilledEmail = typeof params.email === "string" ? params.email : "";
  const prefilledCode = typeof params.code === "string" ? params.code : "";

  const [email, setEmail] = useState(prefilledEmail);
  const [code, setCode] = useState(prefilledCode);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);

  // If the visitor already holds a valid staff session, go straight in.
  useEffect(() => {
    (async () => {
      try {
        const res = await adminSession();
        if (res.authed) {
          setDone(true);
          setTimeout(() => navigate({ to: "/admin" }), 800);
        }
      } catch {
        // no session — show the form
      }
      setChecking(false);
    })();
  }, [navigate]);

  const accept = async () => {
    setError("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError("Enter the email the invite was sent to."); return; }
    if (!/^\d{6}$/.test(code.trim())) { setError("Enter the 6-digit code from your email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setBusy(true);
    try {
      const res = await adminAcceptInvite({
        data: { email: email.trim().toLowerCase(), code: code.trim(), password },
      });
      if (!res.ok) throw new Error(res.reason || "That code did not work.");
      setEmail(""); setCode(""); setPassword(""); setConfirm("");
      setDone(true);
      setTimeout(() => navigate({ to: "/admin" }), 900);
    } catch (e: any) {
      setError(e?.message || "That did not work. Ask your super admin to resend the invite.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white border border-stone-200 p-8 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-green-900 text-white mb-5 mx-auto">
            {done ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>

          {checking ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-800" />
            </div>
          ) : done ? (
            <>
              <p className="text-center text-sm font-semibold text-green-800 uppercase tracking-widest mb-2">Welcome aboard</p>
              <h1 className="text-center font-display text-2xl font-bold text-stone-900 mb-2">Your password is set</h1>
              <p className="text-center text-sm text-stone-500 mb-6">
                You are signed in to your staff dashboard. Taking you there…
              </p>
              <Link to="/admin" className="block w-full text-center px-6 py-3 bg-green-900 hover:bg-green-800 text-white rounded-xl text-sm font-semibold transition-colors">
                Open the dashboard
              </Link>
            </>
          ) : (
            <>
              <p className="text-center text-sm font-semibold text-green-800 uppercase tracking-widest mb-2">Staff Invite</p>
              <h1 className="text-center font-display text-2xl font-bold text-stone-900 mb-2">Accept your invite</h1>
              <p className="text-center text-sm text-stone-500 mb-6">
                Enter the email and 6-digit code from your invite email, then choose a password.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Email</label>
                  <input
                    type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="staff@email.com"
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">6-digit code from email</label>
                  <input
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && accept()}
                    placeholder="••••••"
                    inputMode="numeric"
                    autoFocus
                    className="w-full p-3 border rounded-xl text-sm text-center tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-green-500 border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">New password</label>
                  <input
                    type="password" value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && accept()}
                    placeholder="At least 8 characters"
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Confirm password</label>
                  <input
                    type="password" value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && accept()}
                    placeholder="Repeat your password"
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border-stone-300"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={accept} disabled={busy}
                  className="w-full px-6 py-3 bg-green-900 hover:bg-green-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <KeyRound className="h-4 w-4" /> {busy ? "Setting up…" : "Accept invite & sign in"}
                </button>
                <p className="text-xs text-stone-400 text-center">
                  Didn't get a code? Ask your super admin to resend it from Staff &amp; Roles.
                </p>
              </div>
            </>
          )}

          <Link to="/" className="block text-center mt-5 text-sm font-medium text-stone-400 hover:text-stone-600">← Back to site</Link>
        </div>
      </div>
    </div>
  );
}