import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/alumni/directory/register")({
  head: () => ({
    meta: [{ title: "Register — Alumni Directory" }],
  }),
  component: RegisterRedirectPage,
});

function RegisterRedirectPage() {
  useEffect(() => {
    // The unified registration now lives on the Pulse (one form, one review,
    // one profile used by both the Pulse and the alumni directory).
    window.location.assign("/alumni?signup=1");
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent mb-4" />
        <p className="text-sm text-white/50 font-body">
          Registration now lives on the Pulse — taking you to the sign-up form…
        </p>
      </div>
    </div>
  );
}