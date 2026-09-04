import { useAlumniAuth } from "@/hooks/useAlumniAuth";
import { Link } from "@tanstack/react-router";

export function AlumniAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAlumniAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-6 text-center">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">
            Sign In Required
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold mb-4">
            Access the Alumni Directory
          </h2>
          <p className="text-stone-600 text-lg font-body mb-8">
            Sign in to find fellow old students, update your profile, and connect with the WACOS community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/alumni/directory/login"
              className="inline-flex items-center gap-2 bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/alumni/directory/register"
              className="inline-flex items-center gap-2 border border-green-900 text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-50 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
