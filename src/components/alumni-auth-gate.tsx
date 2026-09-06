import { useAlumniAuth } from "@/hooks/useAlumniAuth";
import { Link } from "@tanstack/react-router";

/**
 * Shared gate for the alumni surfaces (directory, business directory).
 * Uses the same auth session as the Pulse — one registration, one login,
 * one profile — so members who signed in on the Pulse land straight in here.
 * Rendered with the same dark-glass + pillar treatment as the Pulse gate.
 */
export function AlumniAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAlumniAuth();

  if (loading) {
    return (
      <div className="relative min-h-[60vh] bg-[#0A0D14] flex items-center justify-center">
        <img
          src="/hero-poster.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-[0.14]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0D14]/70 via-[#0A0D14]/60 to-[#0A0D14]/85" />
        <div className="relative h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-[70vh] overflow-hidden bg-[#0A0D14] text-white flex items-center justify-center px-4 py-16">
        {/* Pillar faded behind the dark navy — same as the Pulse gate */}
        <img
          src="/hero-poster.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-[0.14]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0D14]/70 via-[#0A0D14]/60 to-[#0A0D14]/85" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_65%)]" />

        <div className="relative w-full max-w-md">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-2xl">
            <div className="p-8 sm:p-10 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300/90 mb-2">
                Alumni only
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
                Access the Alumni Directory
              </h2>
              <p className="mt-3 text-sm text-white/55 font-body leading-relaxed">
                Sign in to find fellow old students, update your profile, and connect with the WACOS community.
              </p>
              <p className="mt-3 text-sm text-white/40 font-body leading-relaxed">
                The Pulse and the directory share one registration — sign in or register once and both unlock together.
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <Link
                  to="/alumni"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-3.5 rounded-full font-bold text-sm hover:brightness-110 transition-all text-center"
                >
                  Sign in on the Pulse
                </Link>
                <a
                  href="/alumni?signup=1"
                  className="w-full border border-white/15 bg-white/[0.05] text-white/70 px-8 py-3.5 rounded-full font-semibold text-sm hover:text-white hover:border-emerald-400/50 transition-all text-center"
                >
                  Register as an alumnus
                </a>
              </div>
              <p className="mt-5 text-[11px] text-white/30 font-body">
                Sign-ups are automatic — you're in right away. The alumni office may recall access with a reason if your details don't check out.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}