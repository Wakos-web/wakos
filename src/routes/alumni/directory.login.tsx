import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAlumniAuth } from "@/hooks/useAlumniAuth";

export const Route = createFileRoute("/alumni/directory/login")({
  head: () => ({
    meta: [{ title: "Sign In — Alumni Directory" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAlumniAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate({ to: "/alumni/directory" });
    } catch (err: any) {
      setError(err.message || "Sign in failed");
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-display text-2xl font-bold text-stone-900">Welcome back</h2>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
              placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
              placeholder="Your password" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-stone-500">
            New to the directory? <Link to="/alumni/directory/register" className="text-green-800 font-semibold hover:underline">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
