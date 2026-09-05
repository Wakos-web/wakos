import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { notifyAlumniApprover } from "@/lib/alumni-notify";
import { useAlumniAuth } from "@/hooks/useAlumniAuth";

import type { AlumniProfile } from "@/hooks/useAlumniAuth";
import { ArrowLeft, Plus, Trash2, Building2, CheckCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/alumni/directory/claim")({
  head: () => ({
    meta: [{ title: "My Profile — Alumni Directory" }],
  }),
  component: ClaimPage,
});

type Business = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  website: string | null;
  phone: string | null;
  location: string | null;
  approved: boolean;
};

function ClaimContent() {
  const { user, profile, refreshProfile } = useAlumniAuth();
  const [editing, setEditing] = useState(!profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showBusinessForm, setShowBusinessForm] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [gradYear, setGradYear] = useState(profile?.graduation_year?.toString() || "");
  const [programme, setProgramme] = useState(profile?.programme || "O-Level");
  const [location, setLocation] = useState(profile?.current_location || "");
  const [profession, setProfession] = useState(profile?.profession || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Business fields
  const [bizName, setBizName] = useState("");
  const [bizDesc, setBizDesc] = useState("");
  const [bizCategory, setBizCategory] = useState("Other");
  const [bizWebsite, setBizWebsite] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizLocation, setBizLocation] = useState("");
  const [bizLogo, setBizLogo] = useState<File | null>(null);
  const [bizLogoPreview, setBizLogoPreview] = useState<string | null>(null);

  const CATEGORIES = [
    "Education", "Technology", "Agriculture", "Health", "Finance",
    "Construction", "Transport", "Retail", "Media", "Legal", "Other"
  ];

  useEffect(() => {
    if (profile) fetchBusinesses();
  }, [profile]);

  const fetchBusinesses = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("alumni_businesses")
      .select("*")
      .eq("owner_id", profile.id)
      .order("name");
    setBusinesses(data || []);
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = folder + "/" + Date.now() + "_" + Math.random().toString(36).substring(7) + "." + ext;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let avatarUrl = profile?.avatar_url || null;
      if (avatar) avatarUrl = await uploadFile(avatar, "class-notes-photos", "avatars");

      if (profile) {
        const { error: updateError } = await supabase
          .from("alumni_profiles")
          .update({
            full_name: fullName,
            graduation_year: parseInt(gradYear),
            programme,
            current_location: location || null,
            profession: profession || null,
            company: company || null,
            bio: bio || null,
            avatar_url: avatarUrl,
          })
          .eq("id", profile.id);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase.from("alumni_profiles").insert({
          user_id: user!.id,
          full_name: fullName,
          graduation_year: parseInt(gradYear),
          programme,
          current_location: location || null,
          profession: profession || null,
          company: company || null,
          bio: bio || null,
          is_public: true,
          approved: false,
          avatar_url: avatarUrl,
        }).select("id").single();
        if (insertError) throw insertError;
        // Tell the alumni approvers a registration is waiting for review.
        if (inserted?.id) {
          const { data: s } = await supabase.auth.getSession();
          if (s.session?.access_token) {
            notifyAlumniApprover({ data: { kind: "registration", submissionId: inserted.id, accessToken: s.session.access_token } })
              .then(() => {}).catch(() => {});
          }
        }
      }
      await refreshProfile();
      setSuccess("Profile saved! It will appear in the directory after admin approval.");
      setEditing(false);
    } catch (err: any) {
      setError(err.message || "Save failed");
    }
    setLoading(false);
  };

  const handleBusinessAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError("");
    setLoading(true);
    try {
      let logoUrl: string | null = null;
      if (bizLogo) logoUrl = await uploadFile(bizLogo, "class-notes-photos", "logos");
      const { data: insertedBiz, error: insertError } = await supabase.from("alumni_businesses").insert({
        owner_id: profile.id,
        name: bizName,
        description: bizDesc || null,
        category: bizCategory,
        website: bizWebsite || null,
        phone: bizPhone || null,
        location: bizLocation || null,
        logo_url: logoUrl,
        approved: false,
      }).select("id").single();
      if (insertError) throw insertError;
      // Tell the alumni approvers a business listing is waiting for review.
      if (insertedBiz?.id) {
        const { data: s } = await supabase.auth.getSession();
        if (s.session?.access_token) {
          notifyAlumniApprover({ data: { kind: "business", submissionId: insertedBiz.id, accessToken: s.session.access_token } })
            .then(() => {}).catch(() => {});
        }
      }
      setBizName(""); setBizDesc(""); setBizCategory("Other");
      setBizWebsite(""); setBizPhone(""); setBizLocation("");
      setShowBusinessForm(false);
      await fetchBusinesses();
      setSuccess("Business submitted for approval!");
    } catch (err: any) {
      setError(err.message || "Failed to add business");
    }
    setLoading(false);
  };

  const handleBusinessDelete = async (id: string) => {
    if (!confirm("Remove this business listing?")) return;
    const { error } = await supabase.from("alumni_businesses").delete().eq("id", id);
    if (!error) await fetchBusinesses();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1952 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative h-[30vh] min-h-[200px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-green-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <Link to="/alumni/directory" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> Directory
          </Link>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-tight">
            My Profile
          </h1>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 shrink-0" /> {success}
          </div>
        )}

        {/* Profile status */}
        {profile && !editing && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-800">{profile.full_name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-900">{profile.full_name}</h2>
                <p className="text-sm text-stone-500">Class of {profile.graduation_year} · {profile.programme}</p>
              </div>
            </div>

            {!profile.approved && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 shrink-0" /> Your profile is pending admin approval.
              </div>
            )}

            <div className="rounded-2xl border border-stone-200 p-6 space-y-3 text-sm">
              {profile.profession && <p><span className="font-semibold text-stone-700">Profession:</span> {profile.profession}</p>}
              {profile.company && <p><span className="font-semibold text-stone-700">Company:</span> {profile.company}</p>}
              {profile.current_location && <p><span className="font-semibold text-stone-700">Location:</span> {profile.current_location}</p>}
              {profile.bio && <p><span className="font-semibold text-stone-700">Bio:</span> {profile.bio}</p>}
            </div>
            <button onClick={() => setEditing(true)}
              className="mt-4 text-green-800 font-semibold hover:underline text-sm">
              Edit Profile
            </button>
          </div>
        )}

        {/* Profile form */}
        {editing && (
          <form onSubmit={handleProfileSave} className="space-y-5 mb-12">
            <h2 className="font-display text-2xl font-bold text-stone-900">
              {profile ? "Edit Profile" : "Create Your Profile"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name *</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" />
              </div>
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
                  placeholder="e.g. Engineer, Teacher" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Company / Organisation (optional)</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Bio</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  placeholder="Tell fellow alumni about yourself" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 p-4 text-sm text-stone-500 hover:border-green-800 hover:text-green-800 transition-colors cursor-pointer">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                    {avatar ? avatar.name : "Choose a photo"}
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setAvatar(f); setAvatarPreview(URL.createObjectURL(f)); } }} className="hidden" />
                  </label>
                  {avatarPreview && <img src={avatarPreview} alt="" className="h-16 w-16 rounded-full object-cover" />}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-green-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Save Profile"}
              </button>
              {profile && (
                <button type="button" onClick={() => setEditing(false)}
                  className="border border-stone-300 text-stone-700 px-6 py-3 rounded-full font-semibold hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Businesses section */}
        {profile && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-stone-900">My Businesses</h2>
              <button onClick={() => setShowBusinessForm(!showBusinessForm)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:underline">
                <Plus className="h-4 w-4" /> Add Business
              </button>
            </div>

            {showBusinessForm && (
              <form onSubmit={handleBusinessAdd} className="rounded-2xl border border-stone-200 p-6 space-y-4 mb-6 bg-white">
                <h3 className="font-display text-lg font-bold text-stone-900">New Business Listing</h3>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Business Name *</label>
                  <input type="text" required value={bizName} onChange={e => setBizName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Category *</label>
                    <select required value={bizCategory} onChange={e => setBizCategory(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Location</label>
                    <input type="text" value={bizLocation} onChange={e => setBizLocation(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                      placeholder="e.g. Kampala" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Description</label>
                  <textarea rows={2} value={bizDesc} onChange={e => setBizDesc(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    placeholder="What does your business do?" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Phone</label>
                    <input type="tel" value={bizPhone} onChange={e => setBizPhone(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                      placeholder="e.g. 0700 123 456" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Website</label>
                    <input type="url" value={bizWebsite} onChange={e => setBizWebsite(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                      placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Business Logo</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 p-3 text-sm text-stone-500 hover:border-green-800 hover:text-green-800 transition-colors cursor-pointer">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                      {bizLogo ? bizLogo.name : "Logo (optional)"}
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setBizLogo(f); setBizLogoPreview(URL.createObjectURL(f)); } }} className="hidden" />
                    </label>
                    {bizLogoPreview && <img src={bizLogoPreview} alt="" className="h-12 w-12 rounded-xl object-cover" />}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading}
                    className="bg-green-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition-colors disabled:opacity-50">
                    {loading ? "Adding..." : "Add Business"}
                  </button>
                  <button type="button" onClick={() => setShowBusinessForm(false)}
                    className="border border-stone-300 text-stone-700 px-6 py-3 rounded-full font-semibold hover:bg-stone-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {businesses.length === 0 && !showBusinessForm ? (
              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-8 text-center">
                <Building2 className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-400 font-body">No businesses listed yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {businesses.map(biz => (
                  <div key={biz.id} className="rounded-2xl bg-white border border-stone-200 p-6 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-stone-900">{biz.name}</h3>
                      <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full mt-1">
                        {biz.category}
                      </span>
                      {biz.description && (
                        <p className="text-sm text-stone-600 mt-2 font-body">{biz.description}</p>
                      )}
                      {!biz.approved && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending approval
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleBusinessDelete(biz.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors shrink-0">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ClaimPage() {
  return (
    <ClaimContent />
  );
}
