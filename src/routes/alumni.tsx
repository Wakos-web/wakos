import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { IMAGES } from "@/lib/content";
import { Send, Calendar, BookOpen, Users, Heart, Award, Building2, Clock, ThumbsUp, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/alumni")({
  head: () => ({
    meta: [
      { title: "Alumni Pulse — M.M College Wairaka" },
      { name: "description", content: "Class notes, events, reunions, and stories from 73 years of WACOS graduates." },
    ],
  }),
  component: AlumniPage,
});

type ClassNote = { id: string; author_name: string; graduation_year: number; content: string; photo_url: string | null; category: string; created_at: string; };
type Event = { id: string; title: string; description: string | null; event_date: string | null; location: string | null; photo_url: string | null; category: string; created_at: string; };
type NoteLike = { id: string; note_id: string; user_name: string; created_at: string; };
type NoteComment = { id: string; note_id: string; author_name: string; graduation_year: number; content: string; created_at: string; };

const CATS = [
  { key: "all", label: "All", icon: Users },
  { key: "update", label: "Updates", icon: BookOpen },
  { key: "reunion", label: "Reunions", icon: Users },
  { key: "memoriam", label: "In Memoriam", icon: Heart },
  { key: "achievement", label: "Achievements", icon: Award },
  { key: "business", label: "Business", icon: Building2 },
];

const DECADES = ["2020s", "2010s", "2000s", "1990s", "1980s", "1970s"];

const CAT_ICONS: Record<string, typeof Users> = { update: BookOpen, reunion: Users, memoriam: Heart, achievement: Award, business: Building2 };
const CAT_COLORS: Record<string, string> = { update: "bg-blue-100 text-blue-800", reunion: "bg-purple-100 text-purple-800", memoriam: "bg-stone-100 text-stone-600", achievement: "bg-amber-100 text-amber-800", business: "bg-green-100 text-green-800" };

function HeroSection() {
  return (
    <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.giving} alt="WACOS alumni" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4">The WACOS Pulse</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body">73 years of graduates. One community. Your story is part of it.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a href="#submit" className="inline-flex items-center gap-2 bg-white text-green-900 px-6 py-3 rounded-full font-semibold hover:bg-stone-100 transition-colors"><Send className="h-4 w-4" /> Submit a Class Note</a>
          <a href="#events" className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"><Calendar className="h-4 w-4" /> View Events</a>
        </div>
      </div>
    </section>
  );
}

function StatsBar({ notes, events, photos }: { notes: number; events: number; photos: number }) {
  return (
    <section className="bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center gap-8 text-sm font-medium text-stone-600">
        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-green-800" /> {notes} class notes</span>
        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-green-800" /> {events} events</span>
        <span className="flex items-center gap-2"><Users className="h-4 w-4 text-green-800" /> {photos} photos</span>
      </div>
    </section>
  );
}

function NoteCard({ note, likes, comments, onLike, onComment }: { note: ClassNote; likes: NoteLike[]; comments: NoteComment[]; onLike: (noteId: string) => void; onComment: (noteId: string, text: string, name: string, year: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [commenterYear, setCommenterYear] = useState(2020);
  const [submitting, setSubmitting] = useState(false);
  const CatIcon = CAT_ICONS[note.category] || BookOpen;
  const catColor = CAT_COLORS[note.category] || "bg-stone-100 text-stone-600";

  const handleComment = async () => {
    if (!commentText.trim() || !commenterName.trim()) return;
    setSubmitting(true);
    await onComment(note.id, commentText.trim(), commenterName.trim(), commenterYear);
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-green-800">{note.author_name.charAt(0)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-display text-lg font-bold text-stone-900">{note.author_name}</h3>
            <span className="text-sm text-stone-400">Class of {note.graduation_year}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${catColor}`}>
              <CatIcon className="h-3 w-3" /> {note.category}
            </span>
          </div>
          <p className="text-stone-600 font-body leading-relaxed mt-2">{note.content}</p>
          {note.photo_url && (
            <img src={note.photo_url} alt="" className="mt-4 rounded-xl max-h-64 object-cover" loading="lazy" />
          )}
          <p className="text-xs text-stone-400 mt-3 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {new Date(note.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          {/* Like + Comment bar */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100">
            <button onClick={() => onLike(note.id)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-green-800 transition-colors">
              <ThumbsUp className="h-4 w-4" /> {likes.length > 0 ? likes.length : ""} Like{likes.length !== 1 ? "s" : ""}
            </button>
            <button onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-green-800 transition-colors">
              <MessageCircle className="h-4 w-4" /> {comments.length > 0 ? comments.length : ""} Comment{comments.length !== 1 ? "s" : ""}
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Comments section */}
          {expanded && (
            <div className="mt-4 space-y-3">
              {comments.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-green-800">{c.author_name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 bg-stone-50 rounded-xl px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900">{c.author_name}</span>
                        {c.graduation_year && <span className="text-xs text-stone-400">Class of {c.graduation_year}</span>}
                      </div>
                      <p className="text-sm text-stone-600 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-400 pl-11">No comments yet. Be the first to comment!</p>
              )}

              {/* Add comment form */}
              <div className="flex gap-3 pl-11">
                <input type="text" placeholder="Your name" value={commenterName} onChange={e => setCommenterName(e.target.value)}
                  className="w-32 text-sm px-3 py-2 rounded-full border border-stone-200 focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none" />
                <input type="number" placeholder="Year" value={commenterYear} onChange={e => setCommenterYear(Number(e.target.value))}
                  className="w-20 text-sm px-3 py-2 rounded-full border border-stone-200 focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none" />
                <input type="text" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleComment()}
                  className="flex-1 text-sm px-4 py-2 rounded-full border border-stone-200 focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none" />
                <button onClick={handleComment} disabled={submitting || !commentText.trim() || !commenterName.trim()}
                  className="px-4 py-2 rounded-full bg-green-800 text-white text-sm font-medium hover:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {submitting ? "..." : "Post"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PulseFeed({ notes }: { notes: ClassNote[] }) {
  const [cat, setCat] = useState("all");
  const [decade, setDecade] = useState("");
  const [likesMap, setLikesMap] = useState<Record<string, NoteLike[]>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, NoteComment[]>>({});

  const filtered = notes.filter(n => {
    if (cat !== "all" && n.category !== cat) return false;
    if (decade) {
      const d = Math.floor(n.graduation_year / 10) * 10;
      if (d.toString() + "s" !== decade) return false;
    }
    return true;
  });

  // Fetch likes & comments for all visible notes
  useEffect(() => {
    if (notes.length === 0) return;
    const ids = notes.map(n => n.id);
    supabase.from("note_likes").select("*").in("note_id", ids).then(({ data }) => {
      const map: Record<string, NoteLike[]> = {};
      (data || []).forEach(l => { (map[l.note_id] = map[l.note_id] || []).push(l); });
      setLikesMap(map);
    });
    supabase.from("note_comments").select("*").in("note_id", ids).order("created_at", { ascending: true }).then(({ data }) => {
      const map: Record<string, NoteComment[]> = {};
      (data || []).forEach(c => { (map[c.note_id] = map[c.note_id] || []).push(c); });
      setCommentsMap(map);
    });
  }, [notes]);

  const handleLike = async (noteId: string) => {
    await supabase.from("note_likes").insert({ note_id: noteId, user_name: "Anonymous Alumnus" });
    const { data } = await supabase.from("note_likes").select("*").eq("note_id", noteId);
    setLikesMap(prev => ({ ...prev, [noteId]: data || [] }));
  };

  const handleComment = async (noteId: string, text: string, name: string, year: number) => {
    await supabase.from("note_comments").insert({ note_id: noteId, author_name: name, graduation_year: year, content: text });
    const { data } = await supabase.from("note_comments").select("*").eq("note_id", noteId).order("created_at", { ascending: true });
    setCommentsMap(prev => ({ ...prev, [noteId]: data || [] }));
  };

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-2">The Pulse</p>
            <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">What your classmates are up to</h2>
          </div>
          <Link to="/alumni/directory" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-green-800 hover:underline">
            Directory <span className="text-green-800">→</span>
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {CATS.map(c => {
            const Icon = c.icon;
            return (
              <button key={c.key} onClick={() => setCat(c.key)}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat === c.key ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
                <Icon className="h-4 w-4" /> {c.label}
              </button>
            );
          })}
        </div>

        {/* Decade filter */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
          <button onClick={() => setDecade("")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!decade ? "bg-green-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>All Years</button>
          {DECADES.map(d => (
            <button key={d} onClick={() => setDecade(d)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${decade === d ? "bg-green-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
              Class of {d}
            </button>
          ))}
        </div>

        {/* Notes feed */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 text-lg font-body">No class notes in this category yet.</p>
            <p className="text-stone-400 text-sm mt-2">Be the first to share an update.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                likes={likesMap[note.id] || []}
                comments={commentsMap[note.id] || []}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EventsSection({ events }: { events: Event[] }) {
  const upcoming = events.filter(e => e.event_date && new Date(e.event_date) >= new Date());
  const past = events.filter(e => !e.event_date || new Date(e.event_date) < new Date());

  return (
    <section id="events" className="py-16 bg-stone-50 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-2">Events</p>
        <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold mb-8">Come Home to Wairaka</h2>

        {upcoming.length > 0 && (
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Upcoming</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcoming.map(evt => (
                <div key={evt.id} className="rounded-2xl bg-white border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
                  {evt.photo_url && <img src={evt.photo_url} alt={evt.title} className="w-full h-40 object-cover" loading="lazy" />}
                  <div className="p-6">
                    <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full mb-2">{evt.category}</span>
                    <h4 className="font-display text-lg font-bold text-stone-900">{evt.title}</h4>
                    {evt.event_date && <p className="text-sm text-stone-500 mt-1">{new Date(evt.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>}
                    {evt.location && <p className="text-sm text-stone-500">{evt.location}</p>}
                    {evt.description && <p className="text-sm text-stone-600 font-body mt-2">{evt.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Past Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {past.map(evt => (
                <div key={evt.id} className="rounded-2xl bg-white border border-stone-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                  {evt.photo_url && <img src={evt.photo_url} alt={evt.title} className="w-full h-40 object-cover" loading="lazy" />}
                  <div className="p-6">
                    <h4 className="font-display text-lg font-bold text-stone-900">{evt.title}</h4>
                    {evt.event_date && <p className="text-sm text-stone-500 mt-1">{new Date(evt.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>}
                    {evt.location && <p className="text-sm text-stone-500">{evt.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 font-body">No events yet. Check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function SubmitForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("update");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1952 }, (_, i) => currentYear - i);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo) return null;
    const ext = photo.name.split(".").pop();
    const path = "notes/" + Date.now() + "_" + Math.random().toString(36).substring(7) + "." + ext;
    const { error } = await supabase.storage.from("class-notes-photos").upload(path, photo);
    if (error) throw error;
    const { data } = supabase.storage.from("class-notes-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const photoUrl = await uploadPhoto();
      const { error: insertError } = await supabase.from("class_notes").insert({
        author_name: name,
        graduation_year: parseInt(year),
        category,
        content,
        photo_url: photoUrl,
        approved: false,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setName(""); setYear(""); setContent(""); setCategory("update"); setPhoto(null); setPhotoPreview(null);
      onSubmitted();
    } catch (err: any) {
      setError(err.message || "Submission failed");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <Award className="h-10 w-10 text-green-800 mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-stone-900 mb-2">Thank you!</h3>
        <p className="text-stone-600 font-body">Your class note has been submitted for review. It will appear in the Pulse once approved by MMCWOSA.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-green-800 font-semibold hover:underline">Submit another note</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-stone-200 p-8 space-y-5">
      <h3 className="font-display text-xl font-bold text-stone-900">Share your update</h3>
      <p className="text-sm text-stone-500 font-body">Tell the WACOS community what you've been up to. Submissions are reviewed before appearing in the Pulse.</p>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Your Name *</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Full name" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Class Year *</label>
          <select required value={year} onChange={e => setYear(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
            <option value="">Select year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">Category *</label>
        <select required value={category} onChange={e => setCategory(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
          {CATS.filter(c => c.key !== "all").map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">Your Update *</label>
        <textarea rows={4} required value={content} onChange={e => setContent(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
          placeholder="What's happening in your life? Career change, new business, family milestone, memory of WACOS..." />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        <Send className="h-5 w-5" /> {loading ? "Submitting..." : "Submit Class Note"}
      </button>
    </form>
  );
}

function AlumniLinks() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/alumni/directory" className="group rounded-2xl bg-white border border-stone-200 p-8 hover:border-green-800 hover:shadow-md transition-all">
            <Users className="h-8 w-8 text-green-800 mb-4" />
            <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-green-800 transition-colors">Alumni Directory</h3>
            <p className="text-stone-600 mt-2 font-body text-sm">Find fellow old students. Search by name, year, or profession.</p>
          </Link>
          <Link to="/alumni/directory/businesses" className="group rounded-2xl bg-white border border-stone-200 p-8 hover:border-green-800 hover:shadow-md transition-all">
            <Building2 className="h-8 w-8 text-green-800 mb-4" />
            <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-green-800 transition-colors">Business Directory</h3>
            <p className="text-stone-600 mt-2 font-body text-sm">Browse businesses owned by WACOS alumni. No login required.</p>
          </Link>
          <Link to="/giving" className="group rounded-2xl bg-green-50 border border-green-200 p-8 hover:border-green-800 hover:shadow-md transition-all">
            <Heart className="h-8 w-8 text-green-800 mb-4" />
            <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-green-800 transition-colors">Support Wairaka</h3>
            <p className="text-stone-600 mt-2 font-body text-sm">Give to the Trust Fund. Fund bursaries. Rebuild the college.</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-green-900 py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Stay Connected</h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">The school you attended is being rebuilt by alumni who remember what it gave them. Your story belongs here.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#submit" className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors">Share Your Story</a>
          <Link to="/giving" className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">Support Wairaka</Link>
        </div>
      </div>
    </section>
  );
}

function RegistrationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [programme, setProgramme] = useState("O-Level");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1952 }, (_, i) => currentYear - i);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const specials = "@#$%!";
    let pw = "Wacos";
    for (let i = 0; i < 6; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    pw += specials.charAt(Math.floor(Math.random() * specials.length));
    return pw;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tempPassword = generatePassword();

      // 1. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: { data: { full_name: name } },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Create alumni profile linked to the account
      const { error: insertError } = await supabase.from("alumni_profiles").insert({
        user_id: userId || null,
        full_name: name,
        graduation_year: parseInt(year),
        programme,
        profession: profession || null,
        company: company || null,
        current_location: location || null,
        bio: bio || null,
        is_public: true,
        approved: false,
      });
      if (insertError) throw insertError;

      setCredentials({ email, password: tempPassword });
      setSuccess(true);
      setName(""); setEmail(""); setYear(""); setProfession(""); setCompany(""); setLocation(""); setBio("");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  if (success && credentials) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <Award className="h-10 w-10 text-green-800 mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-stone-900 mb-2">Welcome to WACOS!</h3>
        <p className="text-stone-600 font-body mb-4">Your alumni account has been created and your profile is pending review by MMCWOSA.</p>
        <div className="rounded-xl bg-white border border-green-200 p-4 text-left mb-4">
          <p className="text-sm font-semibold text-stone-700 mb-2">Your login credentials:</p>
          <p className="text-sm text-stone-600"><span className="font-semibold">Email:</span> {credentials.email}</p>
          <p className="text-sm text-stone-600 mt-1"><span className="font-semibold">Password:</span> <code className="bg-stone-100 px-2 py-0.5 rounded text-green-900 font-mono">{credentials.password}</code></p>
          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1"><Clock className="h-3 w-3" /> Save these credentials. You can log in at /alumni/directory/login once your profile is approved.</p>
        </div>
        <button onClick={() => { setSuccess(false); setCredentials(null); }} className="text-green-800 font-semibold hover:underline">Register another alumnus</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-stone-200 p-8 space-y-5">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      <p className="text-sm text-stone-500 font-body -mt-2">Registering creates your alumni account and directory profile in one step.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name *</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Your full name" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Email Address *</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="you@example.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Graduation Year *</label>
          <select required value={year} onChange={e => setYear(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
            <option value="">Select year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Programme *</label>
          <select required value={programme} onChange={e => setProgramme(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent">
            <option value="O-Level">O-Level</option>
            <option value="A-Level">A-Level</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Profession</label>
          <input type="text" value={profession} onChange={e => setProfession(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="e.g. Engineer, Teacher, Doctor" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Company / Organisation</label>
          <input type="text" value={company} onChange={e => setCompany(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Where do you work?" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">Current Location</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="e.g. Kampala, Uganda" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">Short Bio</label>
        <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
          placeholder="Tell fellow alumni what you've been up to since WACOS..." />
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? "Creating your account..." : "Register & Join Directory"}
      </button>
    </form>
  );
}

function AlumniPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/alumni";
  return isIndex ? <AlumniPulsePage /> : <Outlet />;
}

function AlumniPulsePage() {
  const [notes, setNotes] = useState<ClassNote[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const fetchData = async () => {
    const [notesRes, eventsRes] = await Promise.all([
      supabase.from("class_notes").select("*").eq("approved", true).order("created_at", { ascending: false }),
      supabase.from("events").select("*").eq("approved", true).order("event_date", { ascending: false }),
    ]);
    setNotes(notesRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const photoCount = notes.filter(n => n.photo_url).length + events.filter(e => e.photo_url).length;

  return (
    <main>
      <HeroSection />
      <StatsBar notes={notes.length} events={events.length} photos={photoCount} />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
        </div>
      ) : (
        <>
          <PulseFeed notes={notes} />
          <EventsSection events={events} />
        </>
      )}

      <AlumniLinks />
      <CTASection />

      {/* Floating Submit CTA */}
      <div className="fixed right-6 top-1/4 z-40 flex flex-col gap-3">
        <button onClick={() => { setShowSubmit(!showSubmit); setShowRegister(false); }}
          className="group flex items-center gap-2 bg-green-800 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-green-900 hover:shadow-xl transition-all">
          <Send className="h-5 w-5" />
          <span className="text-sm font-semibold">Submit</span>
        </button>
        <button onClick={() => { setShowRegister(!showRegister); setShowSubmit(false); }}
          className="group flex items-center gap-2 bg-white text-green-800 border border-green-200 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-green-50 hover:shadow-xl transition-all">
          <Users className="h-5 w-5" />
          <span className="text-sm font-semibold">Register</span>
        </button>
      </div>

      {/* Submit Form Slide Panel */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSubmit(false)} />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">Submit Class Note</h3>
                <p className="text-xs text-stone-500">Share your update with fellow alumni</p>
              </div>
              <button onClick={() => setShowSubmit(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                <span className="text-stone-400 text-xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <SubmitForm onSubmitted={() => { fetchData(); setShowSubmit(false); }} />
            </div>
          </div>
        </div>
      )}

      {/* Register Form Slide Panel */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowRegister(false)} />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">Register as Alumnus</h3>
                <p className="text-xs text-stone-500">Join the alumni directory</p>
              </div>
              <button onClick={() => setShowRegister(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                <span className="text-stone-400 text-xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <RegistrationForm />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
