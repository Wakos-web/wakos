import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/alumni/directory/login")({
  head: () => ({
    meta: [{ title: "Sign In — Alumni Directory" }],
  }),
  component: LoginRedirectPage,
});

function LoginRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/alumni" });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent mb-4" />
        <p className="text-sm text-white/50 font-body">
          Alumni sign-in now lives on the Pulse — redirecting…
        </p>
      </div>
    </div>
  );
}