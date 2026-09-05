import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Send, Calendar, BookOpen, Users, Heart, Award, Building2, Clock, ThumbsUp,
  MessageCircle, ChevronDown, ChevronUp, LogOut, UserCircle2, ImagePlus, Home,
  Search, Bell, Settings, Menu, X, Info, Sparkles, Layers, ExternalLink, Gift,
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

type ChannelKey = "all" | "update" | "reunion" | "memoriam" | "achievement" | "business" | "events";

const CATS = [
  { key: "all", label: "All Updates", icon: Layers },
  { key: "update", label: "Updates", icon: BookOpen },
  { key: "reunion", label: "Reunions", icon: Users },
  { key: "memoriam", label: "In Memoriam", icon: Heart },
  { key: "achievement", label: "Achievements", icon: Award },
  { key: "business", label: "Business", icon: Building2 },
] as const;

const CHANNEL_TOPICS: Record<ChannelKey, string> = {
  all: "Every class note shared by WACOS alumni, newest first.",
  update: "What classmates are up to — careers, moves, family, everyday wins.",
  reunion: "Campus gatherings, meet-ups and plans to come home to Wairaka.",
  memoriam: "Remembering old students and teachers we have lost.",
  achievement: "Awards, graduations, business milestones and proud moments.",
  business: "Alumni businesses and services — support your own.",
  events: "Upcoming and past reunions and community events.",
};

const DECADES = ["2020s", "2010s", "2000s", "1990s", "1980s", "1970s"];

const CAT_ICONS: Record<string, typeof Users> = { update: BookOpen, reunion: Users, memoriam: Heart, achievement: Award, business: Building2 };
const SESSION_KEY = "wacos_alumnus_session";

async function uploadFileToBucket(bucket: string, folder: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
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
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Avatar({ name, url, size = "w-9 h-9", text = "text-sm" }: { name: string; url?: string | null; size?: string; text?: string }) {
  if (url) {
    return <img src={url} alt={name} loading="lazy" className={`${size} rounded-full object-cover shrink-0 ring-1 ring-white/15`} />;
  }
  return (
    <div className={`${size} rounded-full bg-emerald-400/15 flex items-center justify-center shrink-0 ring-1 ring-white/10`}>
      <span className={`${text} font-bold text-emerald-300`}>{name.charAt(0) || "?"}</span>
    </div>
  );
}

function PulseGuidelines() {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
      <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-2">Pulse Community Guidelines</p>
      <ul className="text-xs text-white/65 space-y-1.5 leading-relaxed">
        <li><span className="font-semibold text-white/85">Be kind and truthful.</span> No harassment, hate speech, or personal attacks.</li>
        <li><span className="font-semibold text-white/85">Stay on topic.</span> Business promotion belongs in the Business channel.</li>
        <li><span className="font-semibold text-white/85">Respect privacy.</span> Don't post others' contacts or photos without consent.</li>
        <li><span className="font-semibold text-white/85">Be yourself.</span> Always post under your own alumni identity.</li>
        <li><span className="font-semibold text-white/85">We moderate.</span> Posts breaking these rules may be unpublished and repeat offenders removed. Administered by MMCWOSA.</li>
      </ul>
    </div>
  );
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* Registration / profile form (join + edit) — dark glass              */
/* ------------------------------------------------------------------ */

const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:bg-white/[0.03] disabled:text-white/30";
const labelCls = "block text-sm font-semibold text-white/75 mb-2";

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
    const { data: existing } = await supabase
      .from("alumni_profiles")
      .select("*")
      .ilike("email", email.trim())
      .maybeSingle();
    if (existing) {
      if (existing.approved) {
        onDone(existing as Alumnus);
        return;
      }
      throw new Error("This email is registered but access was suspended. Contact MMCWOSA to restore your profile.");
    }
    const uploadedAvatar = avatarFile ? await uploadFileToBucket("class-notes-photos", "avatars", avatarFile) : null;
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
      approved: true,
    }).select().single();
    if (insertError) throw insertError;
    onDone(data as Alumnus);
  };

  const submitEdit = async () => {
    const uploadedAvatar = avatarFile ? await uploadFileToBucket("class-notes-photos", "avatars", avatarFile) : alumnus?.avatar_url;
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-sm text-red-300">{error}</div>}

      {!isEdit && (
        <p className="text-sm text-white/55 font-body">
          Register once with your real details and photo — you're in instantly. Your profile is added to the directory, and admins can review it later. Then post, like and comment as yourself.
        </p>
      )}

      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Avatar name={name} url={avatarUrl} size="w-20 h-20" text="text-2xl" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-emerald-400/15 flex items-center justify-center ring-1 ring-white/10">
            <UserCircle2 className="h-10 w-10 text-emerald-300" />
          </div>
        )}
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-sm font-medium text-white/70 hover:border-emerald-400/60 hover:text-emerald-300 transition-colors">
            <ImagePlus className="h-4 w-4" />
            {isEdit ? "Change photo" : "Upload your photo"}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
          <p className="text-xs text-white/35 mt-2">Your photo appears on your posts and in the directory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Your full name" />
        </div>
        <div>
          <label className={labelCls}>Email Address *</label>
          <input type="email" required disabled={isEdit} value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
          {isEdit && <p className="text-xs text-white/35 mt-1">Email is your identity and cannot be changed here.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Graduation Year *</label>
          <select required value={year} onChange={e => setYear(e.target.value)} className={inputCls}>
            <option value="">Select year</option>
            {years.map(y => <option key={y} value={y} className="bg-[#10141d]">{y}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Programme *</label>
          <select value={programme} onChange={e => setProgramme(e.target.value)} className={inputCls}>
            <option value="O-Level" className="bg-[#10141d]">O-Level</option>
            <option value="A-Level" className="bg-[#10141d]">A-Level</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Profession</label>
          <input type="text" value={profession} onChange={e => setProfession(e.target.value)} className={inputCls} placeholder="e.g. Engineer, Teacher, Doctor" />
        </div>
        <div>
          <label className={labelCls}>Company / Organisation</label>
          <input type="text" value={company} onChange={e => setCompany(e.target.value)} className={inputCls} placeholder="Where do you work?" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Current Location</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={inputCls} placeholder="e.g. Kampala, Uganda" />
      </div>

      <div>
        <label className={labelCls}>Short Bio</label>
        <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className={inputCls} placeholder="Tell fellow alumni what you've been up to since WACOS..." />
      </div>

      <button type="submit" disabled={loading || !name.trim() || !email.trim() || !year}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-4 rounded-full font-bold text-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading
          ? (isEdit ? "Saving..." : "Creating your profile...")
          : (isEdit ? "Save Changes" : "Register & Join the Chat")}
      </button>

      {isEdit && onSignOut && (
        <button type="button" onClick={onSignOut}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white/40 hover:text-red-300 transition-colors">
          <LogOut className="h-4 w-4" /> Sign out of this device
        </button>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Slide panel (dark)                                                  */
/* ------------------------------------------------------------------ */

function SlidePanel({ title, subtitle, onClose, children, showGuidelines = false }: {
  title: string; subtitle: string; onClose: () => void; children: React.ReactNode; showGuidelines?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0C1018] border-l border-white/10 h-full overflow-y-auto shadow-2xl animate-slide-in-right">
        <div className="sticky top-0 z-10 bg-[#0C1018]/90 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-white/45">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Close">
            <X className="h-5 w-5 text-white/50" />
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

/* ------------------------------------------------------------------ */
/* Left rail + channel list                                            */
/* ------------------------------------------------------------------ */

function RailIcon({ to, icon: Icon, label, active, onClick }: { to?: string; icon: typeof Home; label: string; active?: boolean; onClick?: () => void }) {
  const cls = `relative flex items-center justify-center w-11 h-11 rounded-2xl transition-colors ${active ? "bg-emerald-400 text-[#06110d]" : "text-white/40 hover:text-white hover:bg-white/10"}`;
  if (onClick) {
    return <button onClick={onClick} className={cls} title={label}><Icon className="h-5 w-5" /></button>;
  }
  return (
    <Link to={to as any} className={cls} title={label}>
      <Icon className="h-5 w-5" />
      {active && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A0D14]" />}
    </Link>
  );
}

function RailNav() {
  return (
    <aside className="hidden lg:flex flex-col items-center gap-2 w-[76px] py-4 border-r border-white/[0.06] bg-[#0A0D14] shrink-0">
      <Link to="/" className="mb-3 flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-[#06110d] font-display font-black text-lg shadow-lg shadow-emerald-500/20" title="WACOS Home">
        W
      </Link>
      <RailIcon to="/" icon={Home} label="Home" />
      <RailIcon to="/alumni" icon={Layers} label="Alumni Pulse" active />
      <RailIcon to="/alumni/directory" icon={Users} label="Alumni Directory" />
      <RailIcon to="/alumni/directory/businesses" icon={Building2} label="Business Directory" />
      <RailIcon to="/giving" icon={Heart} label="Support Wairaka" />
      <div className="flex-1" />
      <RailIcon to="/" icon={Bell} label="Notifications" />
      <RailIcon to="/admin" icon={Settings} label="Admin" />
    </aside>
  );
}

function ChannelList({ channels, active, counts, onSelect, members, onJoin, alumnus, onEditProfile }: {
  channels: { key: ChannelKey; label: string; icon: typeof Home; badge?: string }[];
  active: ChannelKey;
  counts: Record<string, number>;
  onSelect: (k: ChannelKey) => void;
  members: Alumnus[];
  onJoin: () => void;
  alumnus: Alumnus | null;
  onEditProfile: () => void;
}) {
  const [openGroups, setOpenGroups] = useState({ channels: true, classmates: true });
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-4">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/80">M.M College Wairaka</p>
        <h2 className="font-display text-xl font-bold text-white mt-1">The Pulse Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
        {/* Channels */}
        <div>
          <button onClick={() => setOpenGroups(g => ({ ...g, channels: !g.channels }))}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/35 hover:text-white/60">
            Channels
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openGroups.channels ? "" : "-rotate-90"}`} />
          </button>
          {openGroups.channels && (
            <div className="mt-1 space-y-0.5">
              {channels.map(ch => {
                const Icon = ch.icon;
                const isActive = active === ch.key;
                return (
                  <button key={ch.key} onClick={() => onSelect(ch.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/25" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}>
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg ${isActive ? "bg-emerald-400 text-[#06110d]" : "bg-white/10 text-white/60"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium">{ch.label}</span>
                    {ch.badge && <span className="ml-auto text-[10px] font-bold bg-emerald-400 text-[#06110d] rounded-full px-1.5 py-0.5">{ch.badge}</span>}
                    {!ch.badge && typeof counts[ch.key] === "number" && counts[ch.key] > 0 && (
                      <span className="ml-auto text-[11px] text-white/35">{counts[ch.key]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Classmates */}
        <div>
          <button onClick={() => setOpenGroups(g => ({ ...g, classmates: !g.classmates }))}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/35 hover:text-white/60">
            Classmates
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openGroups.classmates ? "" : "-rotate-90"}`} />
          </button>
          {openGroups.classmates && (
            <div className="mt-1 space-y-0.5">
              {members.slice(0, 6).map(m => (
                <Link key={m.id} to="/alumni/directory" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors">
                  <div className="relative">
                    <Avatar name={m.full_name} url={m.avatar_url} size="w-8 h-8" text="text-xs" />
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0D14]" />
                  </div>
                  <span className="text-sm text-white/65 truncate">{m.full_name.split(" ")[0]}</span>
                  <span className="ml-auto text-[10px] text-white/25">{m.graduation_year}</span>
                </Link>
              ))}
              <Link to="/alumni/directory" className="flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-300/80 hover:text-emerald-300">
                View full directory <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: member chip or join CTA */}
      <div className="p-3 border-t border-white/[0.06]">
        {alumnus ? (
          <button onClick={onEditProfile} className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors text-left">
            <Avatar name={alumnus.full_name} url={alumnus.avatar_url} size="w-9 h-9" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{alumnus.full_name}</p>
              <p className="text-[11px] text-white/40">Class of {alumnus.graduation_year} · edit profile</p>
            </div>
          </button>
        ) : (
          <button onClick={onJoin} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-3 py-3 text-sm font-bold hover:brightness-110 transition-all">
            <Sparkles className="h-4 w-4" /> Join & Start Chatting
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat thread                                                         */
/* ------------------------------------------------------------------ */

function NoteBubble({ note, mine, likes, comments, alumnus, onLike, onComment, onJoin }: {
  note: ClassNote;
  mine: boolean;
  likes: NoteLike[];
  comments: NoteComment[];
  alumnus: Alumnus | null;
  onLike: (noteId: string) => void;
  onComment: (noteId: string, text: string) => void;
  onJoin: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const likedByMe = !!alumnus && likes.some(l => l.user_name === alumnus.full_name);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(note.id, commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
      {!mine && <Avatar name={note.author_name} url={note.author_avatar_url} size="w-9 h-9" text="text-sm" />}
      <div className={`max-w-[78%] md:max-w-[70%] min-w-0 ${mine ? "text-right" : ""}`}>
        <div className={`flex items-center gap-2 mb-1 px-1 ${mine ? "flex-row-reverse" : ""}`}>
          <span className="text-sm font-semibold text-white/85">{mine ? "You" : note.author_name}</span>
          <span className="text-[11px] text-white/30">Class of {note.graduation_year}</span>
          <span className="text-[11px] text-white/30">· {timeLabel(note.created_at)}</span>
        </div>
        <div className={`rounded-2xl px-4 py-3 ${mine
          ? "bg-gradient-to-r from-emerald-500/90 to-teal-500/85 text-[#04110c] rounded-tr-sm"
          : "bg-white/[0.06] border border-white/[0.06] text-white/85 rounded-tl-sm"}`}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{note.content}</p>
          {note.photo_url && (
            <img src={note.photo_url} alt="" loading="lazy" className="mt-3 rounded-xl max-h-72 object-cover w-auto" />
          )}
        </div>

        {/* actions */}
        <div className={`flex items-center gap-3 mt-1.5 px-1 ${mine ? "flex-row-reverse" : ""}`}>
          {alumnus ? (
            <button onClick={() => onLike(note.id)}
              className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${likedByMe ? "text-emerald-300" : "text-white/35 hover:text-white/70"}`}>
              <ThumbsUp className={`h-3.5 w-3.5 ${likedByMe ? "fill-emerald-300" : ""}`} /> {likes.length} Like{likes.length !== 1 ? "s" : ""}
            </button>
          ) : (
            <button onClick={onJoin} className="inline-flex items-center gap-1 text-xs text-white/25 hover:text-white/60" title="Join to like">
              <ThumbsUp className="h-3.5 w-3.5" /> {likes.length} Like{likes.length !== 1 ? "s" : ""}
            </button>
          )}
          <button onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center gap-1 text-xs font-medium text-white/35 hover:text-white/70 transition-colors">
            <MessageCircle className="h-3.5 w-3.5" /> {comments.length} Comment{comments.length !== 1 ? "s" : ""}
            {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showComments && (
          <div className={`mt-2 space-y-2 ${mine ? "items-end" : ""}`}>
            {comments.map(c => (
              <div key={c.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                <Avatar name={c.author_name} url={null} size="w-6 h-6" text="text-[10px]" />
                <div className="bg-white/[0.04] border border-white/[0.05] rounded-xl px-3 py-2 text-left">
                  <p className="text-xs font-semibold text-white/75">{c.author_name} <span className="font-normal text-white/30">· Class of {c.graduation_year}</span></p>
                  <p className="text-sm text-white/70 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
            {alumnus ? (
              <div className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                <input value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleComment()}
                  placeholder="Reply..." className="flex-1 min-w-0 text-sm px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
                <button onClick={handleComment} disabled={submitting || !commentText.trim()}
                  className="px-4 py-2 rounded-full bg-emerald-400 text-[#06110d] text-sm font-bold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed">
                  {submitting ? "..." : "Reply"}
                </button>
              </div>
            ) : (
              <button onClick={onJoin} className="text-xs font-semibold text-emerald-300/90 hover:text-emerald-300">Join the Pulse to reply →</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventBubble({ evt, mine }: { evt: Event; mine?: boolean }) {
  const upcoming = evt.event_date && new Date(evt.event_date) >= new Date();
  return (
    <div className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-400/15 ring-1 ring-white/10 shrink-0">
        <Calendar className="h-4 w-4 text-teal-300" />
      </div>
      <div className="max-w-[78%] md:max-w-[70%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white/85">{evt.title}</span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${upcoming ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/40"}`}>
            {upcoming ? "Upcoming" : "Past"}
          </span>
        </div>
        <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
          {evt.photo_url && <img src={evt.photo_url} alt={evt.title} className="rounded-xl max-h-56 object-cover mb-3 w-auto" loading="lazy" />}
          {evt.event_date && <p className="text-sm text-white/70 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-teal-300" /> {dateLabel(evt.event_date)}</p>}
          {evt.location && <p className="text-sm text-white/55 mt-1 flex items-center gap-2"><Users className="h-3.5 w-3.5 text-teal-300" /> {evt.location}</p>}
          {evt.description && <p className="text-sm text-white/70 leading-relaxed mt-2">{evt.description}</p>}
        </div>
      </div>
    </div>
  );
}

function EmptyThread({ label, hint, onJoin, member }: { label: string; hint: string; onJoin: () => void; member: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-3xl bg-emerald-400/10 ring-1 ring-emerald-400/25 flex items-center justify-center mb-4">
        <Layers className="h-7 w-7 text-emerald-300" />
      </div>
      <h3 className="font-display text-lg font-bold text-white">{label}</h3>
      <p className="text-sm text-white/40 max-w-sm mt-2 font-body">{hint}</p>
      {!member && (
        <button onClick={onJoin} className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-6 py-3 text-sm font-bold hover:brightness-110 transition-all">
          <Sparkles className="h-4 w-4" /> Join & Start Posting
        </button>
      )}
    </div>
  );
}

function ComposerBar({ alumnus, channelKey, sending, text, setText, onSend, onPickPhoto, photoPreview, onClearPhoto, onJoin, onEditProfile }: {
  alumnus: Alumnus | null;
  channelKey: ChannelKey;
  sending: boolean;
  text: string;
  setText: (t: string) => void;
  onSend: () => void;
  onPickPhoto: (f: File | null) => void;
  photoPreview: string | null;
  onClearPhoto: () => void;
  onJoin: () => void;
  onEditProfile: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!alumnus) {
    return (
      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/55 font-body text-center sm:text-left">Posting, liking and commenting is reserved for WACOS alumni. Join free — you're in instantly.</p>
          <button onClick={onJoin} className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-6 py-2.5 text-sm font-bold hover:brightness-110">
            <UserCircle2 className="h-4 w-4" /> Join the Pulse
          </button>
        </div>
      </div>
    );
  }

  const label = channelKey === "events" ? "Chat about events" : CATS.find(c => c.key === channelKey)?.label || "Updates";

  return (
    <div className="border-t border-white/[0.06] p-4">
      <div className="flex items-center gap-2 px-1 pb-2">
        <Avatar name={alumnus.full_name} url={alumnus.avatar_url} size="w-7 h-7" text="text-xs" />
        <p className="text-xs text-white/50">
          Posting as <span className="font-semibold text-white/80">{alumnus.full_name}</span>
          <span className="text-white/30"> · Class of {alumnus.graduation_year}</span> in <span className="text-emerald-300">{label}</span>
        </p>
        <button onClick={onEditProfile} className="ml-auto text-[11px] text-white/35 hover:text-white/70">edit profile</button>
      </div>
      <div className="flex items-end gap-2 bg-white/[0.05] border border-white/10 rounded-2xl p-2 focus-within:border-emerald-400/50 transition-colors">
        <textarea rows={2} value={text} onChange={e => setText(e.target.value)}
          placeholder={channelKey === "events" ? "Suggest an event or chat about gatherings..." : "Send something to the Pulse..."}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-white placeholder-white/30 focus:outline-none" />
        {photoPreview && (
          <div className="relative shrink-0">
            <img src={photoPreview} alt="" className="h-12 w-14 rounded-lg object-cover" />
            <button onClick={onClearPhoto} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center" title="Remove photo">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <input type="file" accept="image/*" ref={fileRef} className="hidden"
          onChange={e => onPickPhoto(e.target.files?.[0] || null)} />
        <button onClick={() => fileRef.current?.click()} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0" title="Attach a photo">
          <ImagePlus className="h-5 w-5" />
        </button>
        <button onClick={onSend} disabled={sending || (!text.trim() && !photoPreview)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0">
          <Send className="h-5 w-5" />
        </button>
      </div>
      <p className="text-[10px] text-white/25 px-1 pt-1.5">Be kind. Stay truthful. Read the community guidelines before you post.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Details panel                                                       */
/* ------------------------------------------------------------------ */

function DetailsPanel({ channel, members, photos, alumnus, onJoin }: {
  channel: ChannelKey;
  members: Alumnus[];
  photos: string[];
  alumnus: Alumnus | null;
  onJoin: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const label = channel === "events" ? "Events" : CATS.find(c => c.key === channel)?.label || "All Updates";

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* noop */ }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-6 pb-4 text-center border-b border-white/[0.06]">
        <div className="flex -space-x-2 justify-center mb-3">
          {members.slice(0, 3).map(m => (
            <div key={m.id} className="ring-2 ring-[#0A0D14] rounded-full">
              <Avatar name={m.full_name} url={m.avatar_url} size="w-9 h-9" text="text-xs" />
            </div>
          ))}
          {members.length > 3 && (
            <div className="w-9 h-9 rounded-full bg-emerald-400 text-[#06110d] flex items-center justify-center ring-2 ring-[#0A0D14] text-xs font-bold">
              +{members.length - 3}
            </div>
          )}
        </div>
        <h2 className="font-display text-lg font-bold text-white">{label}</h2>
        <p className="text-xs text-white/40">{members.length} {members.length === 1 ? "member" : "members"} · {CHANNEL_TOPICS[channel]}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Bell, label: "Notify" },
            { icon: Heart, label: "Giving" },
            { icon: Search, label: "Find" },
            { icon: Settings, label: "Admin" },
          ].map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.label} to={a.label === "Giving" ? "/giving" : a.label === "Admin" ? "/admin" : "/alumni"}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] py-3 hover:bg-white/[0.08] transition-colors">
                <Icon className="h-4 w-4 text-white/70" />
                <span className="text-[10px] text-white/40">{a.label}</span>
              </Link>
            );
          })}
        </div>

        {/* About card */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.05]">
          <Link to="/alumni/directory" className="flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">{members.length} {members.length === 1 ? "member" : "members"}</p>
                <p className="text-[11px] text-white/35">{alumnus ? `${alumnus.full_name.split(" ")[0]}, you are a member` : "Open the directory"}</p>
              </div>
            </div>
            <ChevronRightMini />
          </Link>
          <Link to="/alumni/directory" className="flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">Alumni network</p>
                <p className="text-[11px] text-white/35">mmcollegewairaka.sc.ug · est. 1953</p>
              </div>
            </div>
            <ChevronRightMini />
          </Link>
          <button onClick={copyInvite} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors text-left">
            <div className="flex items-center gap-3">
              <Gift className="h-4 w-4 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">{copied ? "Link copied!" : "Invite a classmate"}</p>
                <p className="text-[11px] text-white/35">Share this page with your year group</p>
              </div>
            </div>
            <ChevronRightMini />
          </button>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Photos & videos</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((p, i) => (
                <a key={i} href={p} target="_blank" rel="noreferrer">
                  <img src={p} alt="" loading="lazy" className="w-full h-16 object-cover rounded-lg ring-1 ring-white/10 hover:ring-emerald-400/50 transition-all" />
                </a>
              ))}
            </div>
          </div>
        )}

        <PulseGuidelines />

        {/* Support card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-400/[0.12] to-teal-500/[0.06] border border-emerald-400/20 p-4">
          <p className="font-display font-bold text-white text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-emerald-300" /> Rebuild Wairaka</p>
          <p className="text-xs text-white/55 mt-1.5 font-body leading-relaxed">Your giving funds bursaries for bright students. The next generation deserves the same chance you were given.</p>
          <Link to="/giving" className="mt-3 inline-flex w-full justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-4 py-2 text-xs font-bold hover:brightness-110">
            Support the Trust Fund
          </Link>
        </div>
      </div>
    </div>
  );
}

function ChevronRightMini() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/25" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" /></svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

function AlumniPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/alumni";
  return isIndex ? <AlumniPulsePage /> : <Outlet />;
}

function AlumniPulsePage() {
  const [channel, setChannel] = useState<ChannelKey>("all");
  const [notes, setNotes] = useState<ClassNote[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Alumnus[]>([]);
  const [loading, setLoading] = useState(true);
  const [decade, setDecade] = useState("");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<"none" | "join" | "edit">("none");
  const [drawer, setDrawer] = useState<"none" | "list" | "info">("none");
  const [notice, setNotice] = useState("");
  const [likesMap, setLikesMap] = useState<Record<string, NoteLike[]>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, NoteComment[]>>({});
  const [composerText, setComposerText] = useState("");
  const [composerPhoto, setComposerPhoto] = useState<File | null>(null);
  const [composerPreview, setComposerPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState(false);
  const { alumnus, ready, signIn, refresh, signOut } = useAlumnusSession();

  const fetchData = async () => {
    setLoading(true);
    const [notesRes, eventsRes, membersRes] = await Promise.all([
      supabase.from("class_notes").select("*").eq("approved", true).order("created_at", { ascending: false }),
      supabase.from("events").select("*").eq("approved", true).order("event_date", { ascending: false }),
      supabase.from("alumni_profiles").select("*").eq("approved", true).eq("is_public", true).order("graduation_year", { ascending: false }).limit(20),
    ]);
    setNotes(notesRes.data || []);
    setEvents(eventsRes.data || []);
    setMembers(membersRes.data || []);
    fetchEngagement(notesRes.data || []);
    setLoading(false);
  };

  const fetchEngagement = async (ns: ClassNote[]) => {
    if (ns.length === 0) return;
    const ids = ns.map(n => n.id);
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
  };

  useEffect(() => { fetchData(); }, []);

  // Live updates: new posts, replies, likes and members stream in without a refresh.
  useEffect(() => {
    const ch = supabase
      .channel("pulse-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "class_notes" }, (p) => {
        const n = p.new as ClassNote;
        if (!n.approved) return;
        setNotes(prev => (prev.some(x => x.id === n.id) ? prev : [n, ...prev]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "class_notes" }, (p) => {
        const n = p.new as ClassNote;
        setNotes(prev =>
          n.approved
            ? prev.some(x => x.id === n.id)
              ? prev.map(x => (x.id === n.id ? n : x))
              : [n, ...prev]
            : prev.filter(x => x.id !== n.id)
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "class_notes" }, (p) => {
        const old = p.old as ClassNote;
        setNotes(prev => prev.filter(x => x.id !== old.id));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "note_comments" }, (p) => {
        const c = p.new as NoteComment;
        setCommentsMap(prev => ({ ...prev, [c.note_id]: [...(prev[c.note_id] || []).filter(x => x.id !== c.id), c] }));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "note_comments" }, (p) => {
        const c = p.old as NoteComment;
        setCommentsMap(prev => ({ ...prev, [c.note_id]: (prev[c.note_id] || []).filter(x => x.id !== c.id) }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "note_likes" }, (p) => {
        const l = p.new as NoteLike;
        setLikesMap(prev => ({ ...prev, [l.note_id]: [...(prev[l.note_id] || []).filter(x => x.id !== l.id), l] }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alumni_profiles" }, (p) => {
        const m = p.new as Alumnus;
        if (!m.approved || !m.is_public) return;
        setMembers(prev => (prev.some(x => x.id === m.id) ? prev : [...prev, m].slice(0, 20)));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (p) => {
        const evt = p.new as Event;
        setEvents(prev => (prev.some(x => x.id === evt.id) ? prev : [evt, ...prev]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "events" }, (p) => {
        const evt = p.new as Event;
        setEvents(prev => (prev.some(x => x.id === evt.id) ? prev.map(x => (x.id === evt.id ? evt : x)) : prev));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "events" }, (p) => {
        const old = p.old as Event;
        setEvents(prev => prev.filter(x => x.id !== old.id));
      })
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
        if (status !== "SUBSCRIBED") console.warn("Pulse realtime status:", status);
      });
    return () => { supabase.removeChannel(ch); };
  }, []);

  const channelNotes = notes.filter(n => {
    if (channel !== "all" && n.category !== channel) return false;
    if (decade) {
      const d = Math.floor(n.graduation_year / 10) * 10;
      if (d.toString() + "s" !== decade) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!n.content.toLowerCase().includes(q) && !n.author_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts: Record<string, number> = { all: notes.length, update: 0, reunion: 0, memoriam: 0, achievement: 0, business: 0 };
  notes.forEach(n => { if (counts[n.category] !== undefined) counts[n.category] += 1; });

  const allPhotos = notes.filter(n => n.photo_url).map(n => n.photo_url as string);

  const openJoin = () => { setPanel("join"); setDrawer("none"); };
  const openEdit = () => { setPanel("edit"); setDrawer("none"); };
  const closePanel = () => { setPanel("none"); setNotice(""); };

  const handleRegistered = (p: Alumnus) => {
    signIn(p);
    setNotice(`Welcome to the Pulse, ${p.full_name.split(" ")[0]}! Your profile is live — post your first update below.`);
    setPanel("none");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleProfileSaved = (p: Alumnus) => {
    refresh(p.id).then(() => {
      setNotice("Your profile has been updated.");
      setPanel("none");
    });
  };

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

  const sendMessage = async () => {
    if (!alumnus) return;
    const content = composerText.trim();
    if (!content && !composerPhoto) return;
    setSending(true);
    try {
      let photoUrl: string | null = null;
      if (composerPhoto) photoUrl = await uploadFileToBucket("class-notes-photos", "notes", composerPhoto);
      const category = channel === "events" ? "reunion" : channel === "all" ? "update" : channel;
      const { error } = await supabase.from("class_notes").insert({
        author_name: alumnus.full_name,
        graduation_year: alumnus.graduation_year,
        author_avatar_url: alumnus.avatar_url,
        category,
        content,
        photo_url: photoUrl,
        approved: true,
      });
      if (error) throw error;
      setComposerText("");
      setComposerPhoto(null);
      setComposerPreview(null);
      await fetchData();
    } catch (e: any) {
      setNotice(e.message || "Could not post. Please try again.");
    }
    setSending(false);
  };

  const channels: { key: ChannelKey; label: string; icon: typeof Home; badge?: string }[] = [
    { key: "all", label: "All Updates", icon: Layers },
    { key: "update", label: "Updates", icon: BookOpen },
    { key: "reunion", label: "Reunions", icon: Users },
    { key: "memoriam", label: "In Memoriam", icon: Heart },
    { key: "achievement", label: "Achievements", icon: Award },
    { key: "business", label: "Business", icon: Building2 },
    ...(events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).length > 0 ? [{ key: "events" as ChannelKey, label: "Events", icon: Calendar, badge: String(events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).length) }] : [{ key: "events" as ChannelKey, label: "Events", icon: Calendar }]),
  ];

  const channelMeta = CATS.find(c => c.key === channel) || { label: "Events", icon: Calendar };
  const ChannelIcon = channel === "events" ? Calendar : (channelMeta as any).icon || Layers;
  const threadTitle = channel === "events" ? "Events" : (channelMeta as any).label;
  const threadCount = channel === "events" ? events.length : channelNotes.length;

  return (
    <main className="h-screen flex bg-[#0A0D14] text-white overflow-hidden relative">
      {/* Top ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_65%)]" />

      <RailNav />

      {/* Chat list panel (desktop) */}
      <aside className="hidden md:flex flex-col w-[290px] border-r border-white/[0.06] bg-[#0C1018] shrink-0 relative">
        <ChannelList channels={channels} active={channel} counts={counts} onSelect={(k) => { setChannel(k); setDecade(""); setDrawer("none"); }}
          members={members} onJoin={openJoin} alumnus={alumnus} onEditProfile={openEdit} />
      </aside>

      {/* Main column */}
      <section className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-white/[0.06] bg-[#0A0D14]/70 backdrop-blur relative z-10">
          <button className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white/60" onClick={() => setDrawer(drawer === "list" ? "none" : "list")} aria-label="Channels">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] text-white/35 hidden sm:block">Chat room <span className="mx-1 text-white/20">/</span> <span className="text-emerald-300/80">{threadTitle}</span></p>
            <h1 className="font-display text-lg font-bold text-white truncate flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-400/15 ring-1 ring-emerald-400/25">
                <ChannelIcon className="h-4 w-4 text-emerald-300" />
              </span>
              {threadTitle}
              {live && (
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 px-2 py-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300">LIVE</span>
                </span>
              )}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2 flex-1 max-w-sm ml-auto focus-within:border-emerald-400/50">
            <Search className="h-4 w-4 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search the Pulse" className="bg-transparent text-sm text-white placeholder-white/25 focus:outline-none w-full" />
          </div>
          <button className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white/60" onClick={() => setDrawer(drawer === "info" ? "none" : "info")} aria-label="Channel info">
            <Info className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <button className="relative p-2 rounded-full bg-white/[0.05] border border-white/10 text-white/50 hover:text-white" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {!alumnus && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />}
            </button>
            {alumnus ? (
              <button onClick={openEdit} className="flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/10 py-1 pl-1 pr-3 hover:bg-white/[0.1]">
                <Avatar name={alumnus.full_name} url={alumnus.avatar_url} size="w-8 h-8" text="text-xs" />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">{alumnus.full_name}</p>
                  <p className="text-[10px] text-white/35 leading-tight">{alumnus.profession || `Class of ${alumnus.graduation_year}`}</p>
                </div>
              </button>
            ) : (
              <button onClick={openJoin} className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-5 py-2.5 text-sm font-bold hover:brightness-110">
                Join & Chat
              </button>
            )}
          </div>
        </header>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative">
          <div className="max-w-3xl mx-auto">
            {channel === "events" ? (
              <>
                {events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).map(evt => <EventBubble key={evt.id} evt={evt} mine={false} />)}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[11px] uppercase tracking-widest text-white/25 font-bold">Earlier events</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                {events.filter(e => !e.event_date || new Date(e.event_date) < new Date()).map(evt => <EventBubble key={evt.id} evt={evt} mine={false} />)}
                {events.length === 0 && (
                  <EmptyThread label="No events yet" hint="Reunions and gatherings will appear here. Watch this channel for the next chance to come home." onJoin={openJoin} member={!!alumnus} />
                )}
              </>
            ) : loading ? (
              <div className="flex justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              </div>
            ) : channelNotes.length === 0 ? (
              <EmptyThread
                label={search || decade ? "Nothing matches" : `No posts in ${threadTitle} yet`}
                hint={search || decade ? "Try a different search or clear the filters." : "Be the first to share an update with this channel — a career move, a memory, a win."}
                onJoin={openJoin} member={!!alumnus} />
            ) : (
              <>
                {/* Decade filter */}
                {!search && (
                  <div className="flex gap-1.5 overflow-x-auto pb-4 mb-1 scrollbar-hide">
                    <button onClick={() => setDecade("")} className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${!decade ? "bg-emerald-400 text-[#06110d]" : "bg-white/[0.05] text-white/45 hover:text-white"}`}>All years</button>
                    {DECADES.map(d => (
                      <button key={d} onClick={() => setDecade(decade === d ? "" : d)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${decade === d ? "bg-emerald-400 text-[#06110d]" : "bg-white/[0.05] text-white/45 hover:text-white"}`}>Class of {d}</button>
                    ))}
                  </div>
                )}
                <div className="space-y-6">
                  {channelNotes.map(note => (
                    <NoteBubble key={note.id} note={note} mine={alumnus?.full_name === note.author_name}
                      likes={likesMap[note.id] || []} comments={commentsMap[note.id] || []}
                      alumnus={alumnus} onLike={handleLike} onComment={handleComment} onJoin={openJoin} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Composer */}
        <ComposerBar alumnus={alumnus} channelKey={channel} sending={sending} text={composerText}
          setText={setComposerText} onSend={sendMessage}
          onPickPhoto={(f) => { setComposerPhoto(f); setComposerPreview(f ? URL.createObjectURL(f) : null); }}
          photoPreview={composerPreview} onClearPhoto={() => { setComposerPhoto(null); setComposerPreview(null); }}
          onJoin={openJoin} onEditProfile={openEdit} />
      </section>

      {/* Details panel (desktop) */}
      <aside className="hidden xl:flex flex-col w-[330px] border-l border-white/[0.06] bg-[#0C1018] shrink-0">
        <DetailsPanel channel={channel} members={members} photos={allPhotos} alumnus={alumnus} onJoin={openJoin} />
      </aside>

      {/* Mobile drawers */}
      {drawer === "list" && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer("none")} />
          <div className="relative w-[300px] bg-[#0C1018] border-r border-white/10 h-full animate-slide-in-left">
            <div className="flex justify-end p-2">
              <button onClick={() => setDrawer("none")} className="p-2 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <ChannelList channels={channels} active={channel} counts={counts} onSelect={(k) => { setChannel(k); setDecade(""); setDrawer("none"); }}
              members={members} onJoin={() => { setDrawer("none"); openJoin(); }} alumnus={alumnus} onEditProfile={() => { setDrawer("none"); openEdit(); }} />
          </div>
        </div>
      )}
      {drawer === "info" && (
        <div className="fixed inset-0 z-40 flex justify-end xl:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer("none")} />
          <div className="relative w-[330px] bg-[#0C1018] border-l border-white/10 h-full animate-slide-in-right">
            <div className="flex justify-end p-2">
              <button onClick={() => setDrawer("none")} className="p-2 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <DetailsPanel channel={channel} members={members} photos={allPhotos} alumnus={alumnus} onJoin={openJoin} />
          </div>
        </div>
      )}

      {/* Join / Edit slide panels */}
      {panel === "join" && (
        <SlidePanel title="Join the WACOS Pulse" subtitle="Register once — you're in instantly" showGuidelines onClose={closePanel}>
          <RegistrationForm alumnus={null} mode="join" onDone={handleRegistered} />
          <p className="text-center text-xs text-white/30 mt-4 font-body">
            Already registered on this email? Submitting again simply signs you back in.
          </p>
        </SlidePanel>
      )}
      {panel === "edit" && alumnus && (
        <SlidePanel title="Edit your alumni profile" subtitle="Your photo appears on your posts and in the directory" onClose={closePanel}>
          <RegistrationForm alumnus={alumnus} mode="edit" onDone={handleProfileSaved} onSignOut={() => { signOut(); closePanel(); }} />
        </SlidePanel>
      )}

      {/* Notice toast */}
      {notice && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white/[0.08] backdrop-blur-xl border border-emerald-400/30 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium animate-slide-in-right">
          {notice}
        </div>
      )}
    </main>
  );
}
