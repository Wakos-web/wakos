import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { IMAGES } from "@/lib/content";
import {
  Send, Calendar, BookOpen, Users, Heart, Award, Building2, Clock, ThumbsUp,
  MessageCircle, ChevronDown, ChevronUp, LogOut, UserCircle2, ImagePlus,
} from "lucide-react";

export const Route = createFileRoute("/alumni")({
  head: () => ({
    meta: [
      { title: "Alumni Pulse — M.M College Wairaka" },
      { name: "description", content: "Class notes, events, reunions, and stories from 73 years of WACOS graduates." },
    ],
  }),
  component: AlumniPage,
});

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type ClassNote = { id: string; author_name: string; graduation_year: number; content: string; photo_url: string | null; author_avatar_url: string | null; category: string; approved: boolean; created_at: string; };
type Event = { id: string; title: string; description: string | null; event_date: string | null; location: string | null; photo_url: string | null; category: string; created_at: string; };
type NoteLike = { id: string; note_id: string; user_name: string; created_at: string; };
type NoteComment = { id: string; note_id: string; author_name: string; graduation_year: number; content: string; created_at: string; };

type Alumnus = {
  id: string;
  user_id: string | null;
  full_name: string;
  graduation_year: number;
  programme: string;
  email: string | null;
  profession: string | null;
  company: string | null;
  current_location: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  is_public: boolean;
  approved: boolean;
};

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

const SESSION_KEY = "wacos_alumnus_session";

function alumniAvatarBucket(file: File): string {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  return `avatars/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
}

async function uploadAvatar(file: File): Promise<string> {
  const path = alumniAvatarBucket(file);
  const { error } = await supabase.storage.from("class-notes-photos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("class-notes-photos").getPublicUrl(path);
  return data.publicUrl;
}

/* ------------------------------------------------------------------ */
/* Lightweight alumni session (device-level, no passwords)             */
/* ------------------------------------------------------------------ */

function useAlumnusSession() {
  const [alumnus, setAlumnus] = useState<Alumnus | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let raw: string | null = null;
    try { raw = localStorage.getItem(SESSION_KEY); } catch { /* noop */ }
    if (!raw) { setReady(true); return; }
    try {
      const { id } = JSON.parse(raw);
      if (!id) { setReady(true); return; }
      supabase.from("alumni_profiles").select("*").eq("id", id).maybeSingle().then(({ data }) => {
        if (data) {
          // A recalled/suspended profile can no longer post or edit.
          if (data.approved) setAlumnus(data as Alumnus);
          try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
        } else {
          try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
        }
        setReady(true);
      });
    } catch {
      try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
      setReady(true);
    }
  }, []);

  const signIn = (p: Alumnus) => {
    setAlumnus(p);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ id: p.id })); } catch { /* noop */ }
  };

  const refresh = async (id?: string) => {
    const pid = id || alumnus?.id;
    if (!pid) return;
    const { data } = await supabase.from("alumni_profiles").select("*").eq("id", pid).maybeSingle();
    if (data) setAlumnus(data as Alumnus);
  };

  const signOut = () => {
    setAlumnus(null);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
  };

  return { alumnus, ready, signIn, refresh, signOut };
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                   */
/* ------------------------------------------------------------------ */

function Avatar({ name, url, size = "w-12 h-12", text = "text-lg" }: { name: string; url?: string | null; size?: string; text?: string }) {
  if (url) {
    return <img src={url} alt={name} loading="lazy" className={`${size} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${size} rounded-full bg-green-100 flex items-center justify-center shrink-0`}>
      <span className={`${text} font-bold text-green-800`}>{name.charAt(0) || "?"}</span>
    </div>
  );
}

function PulseGuidelines({ compact }: { compact?: boolean }) {
  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50 p-4 ${compact ? "" : "mt-2"}`}>
      <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">Pulse Community Guidelines</p>
      <ul className="text-xs text-amber-900/90 space-y-1.5 leading-relaxed">
        <li><span className="font-semibold">Be kind and truthful.</span> No harassment, hate speech, or personal attacks.</li>
        <li><span className="font-semibold">Stay on topic.</span> This is the WACOS alumni community. Business promotion belongs in the Business category, in moderation.</li>
        <li><span className="font-semibold">Respect privacy.</span> Don't post other people's contacts or photos without their consent.</li>
        <li><span className="font-semibold">Be yourself.</span> Always post under your own alumni identity — no impersonation.</li>
        <li><span className="font-semibold">We moderate.</span> Posts that break these rules may be unpublished, and repeat offenders may lose access. Administered by MMCWOSA.</li>
      </ul>
    </div>
  );
}

function HeroSection({ onPost }: { onPost: () => void }) {
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
          <button onClick={onPost} className="inline-flex items-center gap-2 bg-white text-green-900 px-6 py-3 rounded-full font-semibold hover:bg-stone-100 transition-colors">
            <Send className="h-4 w-4" /> Post to the Pulse
          </button>
          <a href="#events" className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
            <Calendar className="h-4 w-4" /> View Events
          </a>
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

function NoteCard({ note, likes, comments, alumnus, onLike, onComment, onJoin }: {
  note: ClassNote;
  likes: NoteLike[];
  comments: NoteComment[];
  alumnus: Alumnus | null;
  onLike: (noteId: string) => void;
  onComment: (noteId: string, text: string) => void;
  onJoin: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const CatIcon = CAT_ICONS[note.category] || BookOpen;
  const catColor = CAT_COLORS[note.category] || "bg-stone-100 text-stone-600";

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(note.id, commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  const likedByMe = !!alumnus && likes.some(l => l.user_name === alumnus.full_name);

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar name={note.author_name} url={note.author_avatar_url} />
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
            {alumnus ? (
              <button onClick={() => onLike(note.id)}
                className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${likedByMe ? "text-green-800" : "text-stone-500 hover:text-green-800"}`}>
                <ThumbsUp className={`h-4 w-4 ${likedByMe ? "fill-green-800" : ""}`} /> {likes.length > 0 ? likes.length : ""} Like{likes.length !== 1 ? "s" : ""}
              </button>
            ) : (
              <button onClick={onJoin} className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-green-800 transition-colors" title="Join to like">
                <ThumbsUp className="h-4 w-4" /> {likes.length > 0 ? likes.length : ""} Like{likes.length !== 1 ? "s" : ""}
              </button>
            )}
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
                    <Avatar name={c.author_name} url={null} size="w-8 h-8" text="text-xs" />
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
              {alumnus ? (
                <div className="flex gap-3 pl-11">
                  <input type="text" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleComment()}
                    className="flex-1 text-sm px-4 py-2 rounded-full border border-stone-200 focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none" />
                  <button onClick={handleComment} disabled={submitting || !commentText.trim()}
                    className="px-4 py-2 rounded-full bg-green-800 text-white text-sm font-medium hover:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {submitting ? "..." : "Post"}
                  </button>
                </div>
              ) : (
                <div className="pl-11">
                  <button onClick={onJoin} className="text-sm font-semibold text-green-800 hover:underline">
                    Join the Pulse as an alumnus to join the conversation →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PulseFeed({ notes, alumnus, onJoin }: { notes: ClassNote[]; alumnus: Alumnus | null; onJoin: () => void }) {
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
    if (!alumnus) return;
    await supabase.from("note_likes").insert({ note_id: noteId, user_name: alumnus.full_name });
    const { data } = await supabase.from("note_likes").select("*").eq("note_id", noteId);
    setLikesMap(prev => ({ ...prev, [noteId]: data || [] }));
  };

  const handleComment = async (noteId: string, text: string) => {
    if (!alumnus) return;
    await supabase.from("note_comments").insert({ note_id: noteId, author_name: alumnus.full_name, graduation_year: alumnus.graduation_year, content: text, approved: true });
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
                alumnus={alumnus}
                onLike={handleLike}
                onComment={handleComment}
                onJoin={onJoin}
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

/* ------------------------------------------------------------------ */
/* Composer — only available to a signed-in alumnus                    */
/* ------------------------------------------------------------------ */

function Composer({ alumnus, onSubmitted, onJoin }: { alumnus: Alumnus | null; onSubmitted: () => void; onJoin: () => void }) {
  const [category, setCategory] = useState("update");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo) return null;
    const ext = (photo.name.split(".").pop() || "jpg").toLowerCase();
    const path = `notes/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from("class-notes-photos").upload(path, photo);
    if (error) throw error;
    const { data } = supabase.storage.from("class-notes-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumnus) return;
    setError("");
    setLoading(true);
    try {
      const photoUrl = await uploadPhoto();
      const { error: insertError } = await supabase.from("class_notes").insert({
        author_name: alumnus.full_name,
        graduation_year: alumnus.graduation_year,
        author_avatar_url: alumnus.avatar_url,
        category,
        content,
        photo_url: photoUrl,
        approved: true, // Posts go live immediately; admins can unpublish if they break the community rules.
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setContent(""); setCategory("update"); setPhoto(null); setPhotoPreview(null);
      onSubmitted();
    } catch (err: any) {
      setError(err.message || "Submission failed");
    }
    setLoading(false);
  };

  if (!alumnus) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center">
        <UserCircle2 className="h-10 w-10 text-green-800 mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-stone-900 mb-2">Members only</h3>
        <p className="text-stone-600 font-body mb-4">Register as an alumnus once, then post updates, like and comment — with your real name and photo.</p>
        <button onClick={onJoin} className="inline-flex items-center gap-2 bg-green-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition-colors">
          Register as an Alumnus
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <Award className="h-10 w-10 text-green-800 mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-stone-900 mb-2">Published to the Pulse!</h3>
        <p className="text-stone-600 font-body">Your update is now live for the WACOS community. It appears instantly and can be reviewed by MMCWOSA at any time.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-stone-200 p-8 space-y-5">
      <div className="flex items-center gap-3">
        <Avatar name={alumnus.full_name} url={alumnus.avatar_url} size="w-11 h-11" />
        <div>
          <p className="font-display font-bold text-stone-900">{alumnus.full_name}</p>
          <p className="text-xs text-stone-500">Class of {alumnus.graduation_year}</p>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

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

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">Add a photo (optional)</label>
        <div className="flex items-center gap-3">
          {photoPreview && <img src={photoPreview} alt="preview" className="w-16 h-16 rounded-xl object-cover" />}
          <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-stone-300 text-sm font-medium text-stone-500 hover:border-green-800 hover:text-green-800 transition-colors ${photo ? "bg-green-50" : ""}`}>
            <ImagePlus className="h-4 w-4" />
            {photo ? "Change photo" : "Upload a photo"}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
          {photo && (
            <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
          )}
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        <Send className="h-5 w-5" /> {loading ? "Publishing..." : "Post to the Pulse"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Registration / profile form (join + edit modes)                     */
/* ------------------------------------------------------------------ */

function RegistrationForm({ alumnus, mode, onDone, onSignOut }: {
  alumnus: Alumnus | null;
  mode: "join" | "edit";
  onDone: (p: Alumnus) => void;
  onSignOut?: () => void;
}) {
  const isEdit = mode === "edit";
  const [name, setName] = useState(alumnus?.full_name || "");
  const [email, setEmail] = useState(alumnus?.email || "");
  const [year, setYear] = useState(alumnus ? String(alumnus.graduation_year) : "");
  const [programme, setProgramme] = useState(alumnus?.programme || "O-Level");
  const [profession, setProfession] = useState(alumnus?.profession || "");
  const [company, setCompany] = useState(alumnus?.company || "");
  const [location, setLocation] = useState(alumnus?.current_location || "");
  const [bio, setBio] = useState(alumnus?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1952 }, (_, i) => currentYear - i);
  const avatarUrl = avatarPreview || alumnus?.avatar_url || null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const submitJoin = async () => {
    // A member should not register twice with the same email.
    const { data: existing } = await supabase
      .from("alumni_profiles")
      .select("*")
      .ilike("email", email.trim())
      .maybeSingle();
    if (existing) {
      if (existing.approved) {
        // Already a member on this email — treat it as signing back in.
        onDone(existing as Alumnus);
        return;
      }
      throw new Error("This email is already registered but access was suspended. Contact MMCWOSA to restore your profile.");
    }

    const uploadedAvatar = avatarFile ? await uploadAvatar(avatarFile) : null;
    const { data, error: insertError } = await supabase.from("alumni_profiles").insert({
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      graduation_year: parseInt(year),
      programme,
      profession: profession || null,
      company: company || null,
      current_location: location || null,
      bio: bio || null,
      avatar_url: uploadedAvatar,
      website: null,
      linkedin_url: null,
      twitter_url: null,
      instagram_url: null,
      is_public: true,
      approved: true, // auto-approved: admins review later and can recall if needed
    }).select().single();
    if (insertError) throw insertError;
    onDone(data as Alumnus);
  };

  const submitEdit = async () => {
    const uploadedAvatar = avatarFile ? await uploadAvatar(avatarFile) : alumnus?.avatar_url;
    const { data, error: updateError } = await supabase.from("alumni_profiles").update({
      full_name: name.trim(),
      profession: profession || null,
      company: company || null,
      current_location: location || null,
      bio: bio || null,
      avatar_url: uploadedAvatar,
      programme,
      approved: true,
    }).eq("id", alumnus!.id).select().single();
    if (updateError) throw updateError;
    onDone(data as Alumnus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) await submitEdit();
      else await submitJoin();
    } catch (err: any) {
      setError(err.message || (isEdit ? "Could not save your profile" : "Registration failed"));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-stone-200 p-8 space-y-5">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {!isEdit && (
        <p className="text-sm text-stone-500 font-body -mt-2">
          Register once with your real details and photo — you're in instantly. Your profile is added to the directory, and admins can review it later. Then post, like and comment as yourself.
        </p>
      )}

      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Avatar name={name} url={avatarUrl} size="w-20 h-20" text="text-2xl" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <UserCircle2 className="h-10 w-10 text-green-700" />
          </div>
        )}
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-600 hover:border-green-800 hover:text-green-800 transition-colors">
            <ImagePlus className="h-4 w-4" />
            {isEdit ? "Change photo" : "Upload your photo"}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
          <p className="text-xs text-stone-400 mt-2">Your photo appears on your posts and in the directory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name *</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" placeholder="Your full name" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Email Address *</label>
          <input type="email" required disabled={isEdit} value={email} onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent disabled:bg-stone-100 disabled:text-stone-400" placeholder="you@example.com" />
          {isEdit && <p className="text-xs text-stone-400 mt-1">Email is your identity and cannot be changed here.</p>}
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
          <select value={programme} onChange={e => setProgramme(e.target.value)}
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

      <button type="submit" disabled={loading || !name.trim() || !email.trim() || !year}
        className="w-full bg-green-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading
          ? (isEdit ? "Saving..." : "Creating your profile...")
          : (isEdit ? "Save Changes" : "Register & Start Posting")}
      </button>

      {isEdit && onSignOut && (
        <button type="button" onClick={onSignOut}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-stone-500 hover:text-red-600 transition-colors">
          <LogOut className="h-4 w-4" /> Sign out of this device
        </button>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Side sections                                                       */
/* ------------------------------------------------------------------ */

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

function CTASection({ onPost }: { onPost: () => void }) {
  return (
    <section className="bg-green-900 py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">Stay Connected</h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto font-body">The school you attended is being rebuilt by alumni who remember what it gave them. Your story belongs here.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={onPost} className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-stone-100 transition-colors">
            <Send className="h-4 w-4" /> Share Your Story
          </button>
          <Link to="/giving" className="inline-flex items-center gap-2 border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">Support Wairaka</Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AlumniPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/alumni";
  return isIndex ? <AlumniPulsePage /> : <Outlet />;
}

function SlidePanel({ title, subtitle, onClose, showGuidelines = true, children }: { title: string; subtitle: string; onClose: () => void; showGuidelines?: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-slide-in-right">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900">{title}</h3>
            <p className="text-xs text-stone-500">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg" aria-label="Close">
            <span className="text-stone-400 text-xl">&times;</span>
          </button>
        </div>
        <div className="p-6">
          {showGuidelines && <PulseGuidelines />}
          <div className={showGuidelines ? "mt-5" : ""}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function AlumniPulsePage() {
  const [notes, setNotes] = useState<ClassNote[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<"none" | "join" | "compose" | "edit">("none");
  const [notice, setNotice] = useState("");
  const { alumnus, ready, signIn, refresh, signOut } = useAlumnusSession();

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

  const openPost = () => {
    setPanel(alumnus ? "compose" : "join");
    setNotice("");
  };

  const handleRegistered = (p: Alumnus) => {
    signIn(p);
    setNotice(`Welcome to the WACOS Pulse, ${p.full_name.split(" ")[0]}! Your profile is live. You can now post your first update.`);
    setPanel("compose");
  };

  const handleProfileSaved = (p: Alumnus) => {
    refresh(p.id).then(() => {
      setNotice("Your profile has been updated.");
      setPanel("none");
    });
  };

  const closePanel = () => { setPanel("none"); setNotice(""); };

  return (
    <main>
      <HeroSection onPost={openPost} />
      <StatsBar notes={notes.length} events={events.length} photos={photoCount} />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
        </div>
      ) : (
        <>
          <PulseFeed notes={notes} alumnus={alumnus} onJoin={openPost} />
          <EventsSection events={events} />
        </>
      )}

      <AlumniLinks />
      <CTASection onPost={openPost} />

      {/* Notice toast */}
      {notice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-slide-in-right">
          {notice}
        </div>
      )}

      {/* Floating actions */}
      {ready && (
        <div className="fixed right-6 top-1/4 z-40 flex flex-col items-end gap-3">
          <button onClick={openPost}
            className="group flex items-center gap-2 bg-green-800 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-green-900 hover:shadow-xl transition-all">
            <Send className="h-5 w-5" />
            <span className="text-sm font-semibold">{alumnus ? "Post to the Pulse" : "Join & Post"}</span>
          </button>
          {alumnus ? (
            <button onClick={() => { setPanel(panel === "edit" ? "none" : "edit"); setNotice(""); }}
              className="group flex items-center gap-2 bg-white text-green-800 border border-green-200 pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-green-50 hover:shadow-xl transition-all">
              <UserCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Edit your profile</span>
            </button>
          ) : (
            <p className="text-xs text-stone-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">Members post, like &amp; comment as themselves</p>
          )}
        </div>
      )}

      {/* Join panel */}
      {panel === "join" && (
        <SlidePanel
          title={alumnus ? "Edit your alumni profile" : "Join the WACOS Pulse"}
          subtitle={alumnus ? "Update your directory profile and photo" : "Register once — you're in instantly"}
          onClose={closePanel}>
          <RegistrationForm
            alumnus={null}
            mode="join"
            onDone={handleRegistered}
          />
          <p className="text-center text-xs text-stone-400 mt-4 font-body">
            Already registered on this email? Submitting again simply signs you back in.
          </p>
        </SlidePanel>
      )}

      {/* Compose panel */}
      {panel === "compose" && (
        <SlidePanel
          title="Post to the Pulse"
          subtitle="Share an update with your fellow alumni"
          onClose={closePanel}>
          <Composer alumnus={alumnus} onSubmitted={() => fetchData()} onJoin={() => setPanel("join")} />
        </SlidePanel>
      )}

      {/* Edit profile panel */}
      {panel === "edit" && alumnus && (
        <SlidePanel
          title="Edit your alumni profile"
          subtitle="Your photo appears on your posts and in the directory"
          showGuidelines={false}
          onClose={closePanel}>
          <RegistrationForm
            alumnus={alumnus}
            mode="edit"
            onDone={handleProfileSaved}
            onSignOut={() => { signOut(); closePanel(); }}
          />
        </SlidePanel>
      )}
    </main>
  );
}
