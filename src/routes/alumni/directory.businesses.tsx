import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Globe, Phone, ArrowLeft, Mail, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/alumni/directory/businesses")({
  head: () => ({
    meta: [
      { title: "Business Directory — M.M College Wairaka" },
      { name: "description", content: "Browse businesses owned by WACOS alumni. Find services, products, and professionals from the Wairaka community." },
    ],
  }),
  component: BusinessesPage,
});

type BusinessWithOwner = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: string;
  website: string | null;
  phone: string | null;
  location: string | null;
  logo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  email: string | null;
  approved: boolean;
  owner_name?: string;
  owner_avatar?: string;
  owner_profession?: string;
};

const CATEGORIES = [
  "All", "Education", "Technology", "Agriculture", "Health", "Finance",
  "Construction", "Transport", "Retail", "Media", "Legal", "Other"
];

function BusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data: bizData } = await supabase
      .from("alumni_businesses")
      .select("*")
      .eq("approved", true)
      .order("name");

    if (!bizData || bizData.length === 0) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    // Fetch owner profiles
    const ownerIds = [...new Set(bizData.map(b => b.owner_id).filter(Boolean))];
    const { data: profiles } = ownerIds.length > 0
      ? await supabase.from("alumni_profiles").select("id, full_name, avatar_url, profession").in("id", ownerIds)
      : { data: null };

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    const enriched = bizData.map(b => ({
      ...b,
      owner_name: profileMap[b.owner_id]?.full_name || null,
      owner_avatar: profileMap[b.owner_id]?.avatar_url || null,
      owner_profession: profileMap[b.owner_id]?.profession || null,
    }));

    setBusinesses(enriched);
    setLoading(false);
  };

  const filtered = businesses.filter(b => {
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase())) ||
      (b.owner_name && b.owner_name.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === "All" || b.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-green-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <Link to="/alumni" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> Alumni
          </Link>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-tight">
            Business Directory
          </h1>
          <p className="text-lg text-white/70 mt-2 font-body">
            {businesses.length} businesses listed by WACOS alumni
          </p>
        </div>
      </section>

      {/* Search and filters */}
      <section className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-300 pl-10 pr-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="Search businesses or owners..."
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone-400 text-lg font-body">No businesses found.</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }}
                className="mt-4 text-green-800 font-semibold hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-500 mb-6">{filtered.length} businesses</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map(biz => (
                  <BusinessCard key={biz.id} biz={biz} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function BusinessCard({ biz }: { biz: BusinessWithOwner }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-6 transition-all cursor-default">
      <div className="flex items-start gap-4">
        {/* Headshot / Logo */}
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
          {biz.owner_avatar ? (
            <img src={biz.owner_avatar} alt={biz.owner_name || biz.name} className="w-16 h-16 rounded-2xl object-cover" />
          ) : biz.logo_url ? (
            <img src={biz.logo_url} alt={biz.name} className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <span className="text-2xl font-bold text-green-800">{biz.name.charAt(0)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Owner name */}
          {biz.owner_name && (
            <p className="text-sm font-semibold text-stone-500">{biz.owner_name}</p>
          )}
          {/* Business name */}
          <h3 className="font-display text-xl font-bold text-stone-900">{biz.name}</h3>
          {/* Category */}
          <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full mt-1">
            {biz.category}
          </span>
        </div>
      </div>

      {/* Description */}
      {biz.description && (
        <p className="text-sm text-stone-600 mt-4 font-body leading-relaxed line-clamp-5">{biz.description}</p>
      )}

      {/* Location and phone */}
      <div className="mt-4 space-y-2">
        {biz.location && (
          <p className="text-sm text-stone-500 flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" /> {biz.location}
          </p>
        )}
        {biz.phone && (
          <p className="text-sm text-stone-500 flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" /> {biz.phone}
          </p>
        )}
      </div>

      {/* Social links and actions */}
      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-3 flex-wrap">
        {biz.website && (
          <a href={biz.website} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
            <Globe className="h-3.5 w-3.5" /> Website
          </a>
        )}
        {biz.linkedin_url && (
          <a href={biz.linkedin_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
          </a>
        )}
        {biz.twitter_url && (
          <a href={biz.twitter_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full hover:bg-sky-100 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> Twitter
          </a>
        )}
        {biz.instagram_url && (
          <a href={biz.instagram_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-700 bg-pink-50 px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> Instagram
          </a>
        )}
        {biz.email && (
          <a href={`mailto:${biz.email}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full hover:bg-stone-200 transition-colors">
            <Mail className="h-3.5 w-3.5" /> Send Email
          </a>
        )}
      </div>
    </div>
  );
}
