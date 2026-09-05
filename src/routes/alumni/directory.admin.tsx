import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { adminSupabase as supabase } from "@/lib/supabase";
import { useAlumniAuth } from "@/hooks/useAlumniAuth";

import { ArrowLeft, CheckCircle, XCircle, Clock, Users, Building2 } from "lucide-react";

export const Route = createFileRoute("/alumni/directory/admin")({
  head: () => ({
    meta: [{ title: "Admin — Alumni Directory" }],
  }),
  component: AdminPage,
});

type PendingProfile = {
  id: string;
  full_name: string;
  graduation_year: number;
  programme: string;
  profession: string | null;
  company: string | null;
  current_location: string | null;
  user_id: string;
  created_at: string;
};

type PendingBusiness = {
  id: string;
  name: string;
  category: string;
  owner_id: string;
  created_at: string;
  alumni_profiles?: { full_name: string } | null;
};

function AdminContent() {
  const { user } = useAlumniAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profiles" | "businesses">("profiles");

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase.auth.getUser();
    const role = data.user?.user_metadata?.role;
    setIsAdmin(role === "admin");
    if (role === "admin") {
      await fetchPending();
    }
    setLoading(false);
  };

  const fetchPending = async () => {
    const { data: profiles } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("approved", false)
      .order("created_at", { ascending: true });

    const { data: businesses } = await supabase
      .from("alumni_businesses")
      .select("*, alumni_profiles(full_name)")
      .eq("approved", false)
      .order("created_at", { ascending: true });

    setPendingProfiles(profiles || []);
    setPendingBusinesses(businesses || []);
  };

  const approveProfile = async (id: string) => {
    await supabase.from("alumni_profiles").update({ approved: true }).eq("id", id);
    await fetchPending();
  };

  const rejectProfile = async (id: string) => {
    if (!confirm("Reject and delete this profile?")) return;
    await supabase.from("alumni_profiles").delete().eq("id", id);
    await fetchPending();
  };

  const approveBusiness = async (id: string) => {
    await supabase.from("alumni_businesses").update({ approved: true }).eq("id", id);
    await fetchPending();
  };

  const rejectBusiness = async (id: string) => {
    if (!confirm("Reject and delete this business?")) return;
    await supabase.from("alumni_businesses").delete().eq("id", id);
    await fetchPending();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-20 text-center">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-stone-600 text-lg">You do not have admin access.</p>
        <Link to="/alumni/directory" className="mt-4 inline-flex items-center gap-1 text-green-800 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="relative h-[30vh] min-h-[200px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-green-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <Link to="/alumni/directory" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> Directory
          </Link>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-lg text-white/70 mt-2 font-body">
            {pendingProfiles.length} profiles and {pendingBusinesses.length} businesses pending approval
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setTab("profiles")}
            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
              tab === "profiles" ? "border-green-800 text-green-800" : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Profiles ({pendingProfiles.length})
          </button>
          <button
            onClick={() => setTab("businesses")}
            className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
              tab === "businesses" ? "border-green-800 text-green-800" : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            Businesses ({pendingBusinesses.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          {tab === "profiles" ? (
            pendingProfiles.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-stone-400 text-lg font-body">All profiles approved.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProfiles.map(p => (
                  <div key={p.id} className="rounded-2xl bg-white border border-stone-200 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-stone-900">{p.full_name}</h3>
                        <p className="text-sm text-stone-500">Class of {p.graduation_year} · {p.programme}</p>
                        {p.profession && <p className="text-sm text-stone-600 mt-1">{p.profession}{p.company ? ` at ${p.company}` : ""}</p>}
                        {p.current_location && <p className="text-sm text-stone-500 mt-1">{p.current_location}</p>}
                        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Submitted {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => approveProfile(p.id)}
                          className="inline-flex items-center gap-1 bg-green-800 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors">
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button onClick={() => rejectProfile(p.id)}
                          className="inline-flex items-center gap-1 border border-red-300 text-red-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors">
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            pendingBusinesses.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-stone-400 text-lg font-body">All businesses approved.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBusinesses.map(b => (
                  <div key={b.id} className="rounded-2xl bg-white border border-stone-200 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-stone-900">{b.name}</h3>
                        <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full mt-1">
                          {b.category}
                        </span>
                        {b.alumni_profiles && (
                          <p className="text-sm text-stone-500 mt-2">Owner: {b.alumni_profiles.full_name}</p>
                        )}
                        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Submitted {new Date(b.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => approveBusiness(b.id)}
                          className="inline-flex items-center gap-1 bg-green-800 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors">
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button onClick={() => rejectBusiness(b.id)}
                          className="inline-flex items-center gap-1 border border-red-300 text-red-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors">
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

function AdminPage() {
  return (
    <AdminContent />
  );
}
