import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";


import type { AlumniProfile } from "@/hooks/useAlumniAuth";
import { Search, MapPin, Briefcase, Plus, Building2, Globe, Mail, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/alumni/directory")({
  head: () => ({
    meta: [
      { title: "Alumni Directory — M.M College Wairaka" },
      { name: "description", content: "Find fellow WACOS alumni. Search by name, graduation year, profession, or location." },
    ],
  }),
  component: DirectoryPage,
});

const BUSINESS_CATEGORIES = [
  "All", "Education", "Technology", "Agriculture", "Health", "Finance",
  "Construction", "Transport", "Retail", "Media", "Legal", "Other"
];

function DirectoryContent() {
  
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [professionFilter, setProfessionFilter] = useState("");

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("approved", true)
      .eq("is_public", true)
      .order("graduation_year", { ascending: false });
    setAlumni(data || []);
    setLoading(false);
  };

  const filtered = alumni.filter(a => {
    const matchSearch = !search ||
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.profession && a.profession.toLowerCase().includes(search.toLowerCase())) ||
      (a.company && a.company.toLowerCase().includes(search.toLowerCase()));
    const matchYear = !yearFilter || a.graduation_year === parseInt(yearFilter);
    const matchProfession = !professionFilter ||
      (a.profession && a.profession.toLowerCase().includes(professionFilter.toLowerCase()));
    return matchSearch && matchYear && matchProfession;
  });

  const uniqueYears = [...new Set(alumni.map(a => a.graduation_year))].sort((a, b) => b - a);

  return (
    <div>
      {/* Header bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/alumni" className="text-sm font-medium text-stone-500 hover:text-green-800">
              Alumni
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-sm font-semibold text-green-800">Directory</span>
          </div>
          </div></div>

      {/* Hero */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-green-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-tight">
            Alumni Directory
          </h1>
          <p className="text-lg text-white/70 mt-2 font-body">
            {alumni.length} alumni connected. Find your classmates.
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
                placeholder="Search by name, profession, or company..."
              />
            </div>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
            >
              <option value="">All Years</option>
              {uniqueYears.map(y => (
                <option key={y} value={y}>Class of {y}</option>
              ))}
            </select>
            <select
              value={professionFilter}
              onChange={e => setProfessionFilter(e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
            >
              <option value="">All Professions</option>
              {BUSINESS_CATEGORIES.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
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
              <p className="text-stone-400 text-lg font-body">No alumni found matching your search.</p>
              <button onClick={() => { setSearch(""); setYearFilter(""); setProfessionFilter(""); }}
                className="mt-4 text-green-800 font-semibold hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-500 mb-6">{filtered.length} alumni found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(person => (
                  <Link
                    key={person.id}
                    to="/alumni/directory/$id"
                    params={{ id: person.id }}
                    className="group rounded-2xl bg-white border border-stone-200 p-6 hover:border-green-800 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {person.avatar_url ? (
                          <img src={person.avatar_url} alt={person.full_name} className="w-16 h-16 rounded-2xl object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-green-800">{person.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-green-800 transition-colors truncate">
                          {person.full_name}
                        </h3>
                        <p className="text-sm text-stone-500">Class of {person.graduation_year} · {person.programme}</p>
                        {person.profession && (
                          <p className="text-sm text-stone-600 mt-1 flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{person.profession}{person.company ? ` at ${person.company}` : ""}</span>
                          </p>
                        )}
                        {person.current_location && (
                          <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{person.current_location}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {person.bio && (
                      <p className="text-sm text-stone-600 mt-4 font-body leading-relaxed line-clamp-2">{person.bio}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                      {person.website && (
                        <a href={person.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 bg-green-50 px-2 py-1 rounded-full hover:bg-green-100 transition-colors">
                          <Globe className="h-3 w-3" /> Website
                        </a>
                      )}
                      {person.linkedin_url && (
                        <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors">
                          <ExternalLink className="h-3 w-3" /> LinkedIn
                        </a>
                      )}
                      {person.twitter_url && (
                        <a href={person.twitter_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-full hover:bg-sky-100 transition-colors">
                          <ExternalLink className="h-3 w-3" /> Twitter
                        </a>
                      )}
                      {person.email && (
                        <a href={`mailto:${person.email}`} onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-1 rounded-full hover:bg-stone-200 transition-colors">
                          <Mail className="h-3 w-3" /> Email
                        </a>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Quick links */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/alumni/directory/businesses"
              className="group rounded-2xl bg-green-50 border border-green-200 p-8 hover:border-green-800 hover:shadow-md transition-all"
            >
              <Building2 className="h-8 w-8 text-green-800 mb-4" />
              <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-green-800 transition-colors">
                Business Directory
              </h3>
              <p className="text-stone-600 mt-2 font-body">
                Browse businesses owned by WACOS alumni. No login required.
              </p>
            </Link>
            <Link
              to="/alumni/directory/claim"
              className="group rounded-2xl bg-stone-50 border border-stone-200 p-8 hover:border-green-800 hover:shadow-md transition-all"
            >
              <Plus className="h-8 w-8 text-green-800 mb-4" />
              <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-green-800 transition-colors">
                Add Your Business
              </h3>
              <p className="text-stone-600 mt-2 font-body">
                List your business in the directory. Connect with fellow alumni.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function DirectoryPage() {
  return (
    <DirectoryContent />
  );
}
