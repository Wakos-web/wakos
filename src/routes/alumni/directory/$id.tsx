import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import type { AlumniProfile } from "@/hooks/useAlumniAuth";
import type { AlumniBusiness } from "./businesses";
import { MapPin, Briefcase, GraduationCap, Building2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/alumni/directory/$id")({
  head: () => ({
    meta: [{ title: "Alumni Profile — Directory" }],
  }),
  component: ProfilePage,
});

function ProfileContent() {
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [businesses, setBusinesses] = useState<AlumniBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: p } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("id", id)
      .single();
    setProfile(p);

    if (p) {
      const { data: b } = await supabase
        .from("alumni_businesses")
        .select("*")
        .eq("owner_id", p.id)
        .eq("approved", true);
      setBusinesses(b || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone-400 text-lg">Alumni not found.</p>
        <Link to="/alumni/directory" className="mt-4 inline-flex items-center gap-2 text-green-800 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="relative h-[35vh] min-h-[250px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-green-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <Link to="/alumni/directory" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Link>
          <div className="flex items-end gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{profile.full_name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-white font-bold tracking-tight">
                {profile.full_name}
              </h1>
              <p className="text-lg text-white/70 mt-1 font-body">
                Class of {profile.graduation_year} · {profile.programme}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile details */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main info */}
            <div className="md:col-span-2 space-y-6">
              {profile.bio && (
                <div>
                  <h2 className="text-xs font-semibold text-green-800 uppercase tracking-widest mb-3">About</h2>
                  <p className="text-stone-600 text-lg leading-relaxed font-body">{profile.bio}</p>
                </div>
              )}

              {/* Details */}
              <div className="rounded-2xl border border-stone-200 p-6 space-y-4">
                {profile.profession && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-green-800 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Profession</p>
                      <p className="text-sm text-stone-600">{profile.profession}</p>
                    </div>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-green-800 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Company</p>
                      <p className="text-sm text-stone-600">{profile.company}</p>
                    </div>
                  </div>
                )}
                {profile.current_location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-green-800 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-stone-900">Location</p>
                      <p className="text-sm text-stone-600">{profile.current_location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-green-800 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Programme</p>
                    <p className="text-sm text-stone-600">{profile.programme}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - businesses */}
            <div>
              {businesses.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-green-800 uppercase tracking-widest mb-3">Businesses</h2>
                  <div className="space-y-3">
                    {businesses.map(b => (
                      <div key={b.id} className="rounded-xl bg-stone-50 border border-stone-200 p-4">
                        <h3 className="font-display text-sm font-bold text-stone-900">{b.name}</h3>
                        <p className="text-xs text-stone-500 mt-1">{b.category}</p>
                        {b.description && (
                          <p className="text-xs text-stone-600 mt-2 line-clamp-2">{b.description}</p>
                        )}
                        {b.location && (
                          <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {b.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfilePage() {
  return (
    <ProfileContent />
  );
}
