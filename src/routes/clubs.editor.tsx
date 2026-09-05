import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { notifyClubPatron } from "@/lib/club-notify";
import { useOtpResend } from "@/hooks/useOtpResend";
import {
  LogOut, Send, ImagePlus, Trash2, PenLine, X, ArrowLeft, Mail, Clock, Eye,
  Image as ImageIcon, Video as VideoIcon, PlayCircle, GripVertical,
} from "lucide-react";

export const Route = createFileRoute("/clubs/editor")({
  head: () => ({
    meta: [
      { title: "Club Editor Studio — M.M College Wairaka" },
      { name: "description", content: "Write and submit club news for your patron's approval." },
    ],
  }),
  component: ClubEditorPage,
});

type EditorRow = {
  id: string;
  club_id: string;
  user_id: string | null;
  name: string;
  role_title: string;
  email: string;
  status: string;
  clubs?: { id: string; name: string; slug: string } | null;
};

type PostRow = {
  id: string;
  club_id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  status: string;
  published: boolean;
  editor_name: string | null;
  editor_role: string | null;
  review_note: string | null;
  created_at: string;
};

const STATUS_META = {
  pending: { label: "Awaiting approval", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  published: { label: "Live on the club page", cls: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Needs changes", cls: "bg-red-100 text-red-700 border-red-200" },
};

function statusMeta(status: string) {
  return STATUS_META[status as keyof typeof STATUS_META] ?? STATUS_META.pending;
}

function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = "club-posts/" + Date.now() + "_" + Math.random().toString(36).substring(7) + "." + ext;
  return supabase.storage
    .from("class-notes-photos")
    .upload(path, file)
    .then(({ error }) => {
      if (error) throw error;
      const { data } = supabase.storage.from("class-notes-photos").getPublicUrl(path);
      return data.publicUrl;
    });
}

/* Media manager for one club post: photos and videos with captions, uploaded
 * straight to Supabase Storage (never a URL). This is the backend for the
 * post's detail/story page — each card leads to a page full of captioned
 * media in animated containers. */
function PostMediaManager({ postId, notice }: { postId: string; notice: (text: string, kind: "ok" | "err") => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, { caption: string; sort: string }>>({});
  const [addCaption, setAddCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("club_post_media").select("*").eq("post_id", postId).order("sort_order", { ascending: true });
    setItems(data || []);
    const e: Record<string, { caption: string; sort: string }> = {};
    (data || []).forEach((m: any) => { e[m.id] = { caption: m.caption || "", sort: String(m.sort_order ?? 0) }; });
    setEdits(e);
    setLoading(false);
  };

  useEffect(() => { load(); }, [postId]);

  const uploadMediaFile = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = "club-posts-media/" + Date.now() + "_" + Math.random().toString(36).substring(7) + "." + ext;
    const { error } = await supabase.storage.from("class-notes-photos").upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from("class-notes-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const addMedia = async (file: File | undefined, type: "image" | "video") => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMediaFile(file);
      const { error } = await supabase.from("club_post_media").insert({
        post_id: postId,
        media_type: type,
        media_url: url,
        caption: addCaption.trim() || null,
        sort_order: items.length + 1,
      });
      if (error) throw error;
      setAddCaption("");
      notice("Media added", "ok");
      load();
    } catch (e: any) {
      notice(e?.message || "Upload failed", "err");
    } finally {
      setUploading(false);
      if (photoRef.current) photoRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
    }
  };

  const saveRow = async (id: string) => {
    const e = edits[id];
    if (!e) return;
    const { error } = await supabase.from("club_post_media").update({
      caption: e.caption.trim() || null,
      sort_order: parseInt(e.sort) || 0,
    }).eq("id", id);
    if (error) { notice(error.message || "Save failed", "err"); return; }
    notice("Saved", "ok");
    load();
  };

  const removeRow = async (id: string) => {
    const { error } = await supabase.from("club_post_media").delete().eq("id", id);
    if (error) { notice(error.message || "Delete failed", "err"); return; }
    notice("Media removed", "ok");
    load();
  };

  return (
    <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
      <p className="text-sm font-semibold text-stone-700 mb-1">Story media (photos & videos with captions)</p>
      <p className="text-xs text-stone-400 mb-4">
        These appear on the post's detailed page as a captioned gallery. Upload a photo or video, give it a caption, and reorder.
      </p>

      <div className="rounded-xl bg-white border border-stone-200 p-3 mb-4 space-y-3">
        <input
          value={addCaption}
          onChange={(e) => setAddCaption(e.target.value)}
          placeholder="Caption for the new photo / video"
          className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
        />
        <div className="flex gap-2">
          <button
            onClick={() => photoRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Add photo"}
          </button>
          <button
            onClick={() => videoRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-stone-300 hover:border-green-800 text-stone-700 text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            <VideoIcon className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Add video"}
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => addMedia(e.target.files?.[0], "image")} />
          <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => addMedia(e.target.files?.[0], "video")} />
        </div>
      </div>

      {loading ? (
        <div className="py-4 text-center text-xs text-stone-400">Loading media…</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-5 text-center text-xs text-stone-400">
          No media yet. Add a photo or video to build the post's story page.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white border border-stone-200 p-2.5">
              {item.media_type === "video" ? (
                <div className="w-16 h-12 shrink-0 rounded-md bg-black flex items-center justify-center">
                  <PlayCircle className="h-5 w-5 text-white/80" />
                </div>
              ) : (
                <img src={item.media_url} alt="" className="w-16 h-12 shrink-0 rounded-md object-cover border border-stone-200" />
              )}
              <div className="min-w-0 flex-1 space-y-1.5">
                <input
                  value={edits[item.id]?.caption ?? ""}
                  onChange={(e) => setEdits({ ...edits, [item.id]: { ...edits[item.id], caption: e.target.value } })}
                  placeholder="Caption"
                  className="w-full p-1.5 border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-800"
                />
                <div className="flex items-center gap-2">
                  <GripVertical className="h-3 w-3 text-stone-300" />
                  <input
                    type="number"
                    value={edits[item.id]?.sort ?? "0"}
                    onChange={(e) => setEdits({ ...edits, [item.id]: { ...edits[item.id], sort: e.target.value } })}
                    className="w-14 p-1 border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-800"
                    title="Order (1 = first)"
                  />
                  <span className="text-[10px] text-stone-400">{item.media_type === "video" ? "Video" : "Photo"} · order</span>
                  <button onClick={() => saveRow(item.id)} className="ml-auto px-2 py-1 rounded-md bg-green-800 text-white text-[10px] font-semibold hover:bg-green-900">Save</button>
                  <button onClick={() => removeRow(item.id)} className="p-1 rounded-md hover:bg-red-50 text-red-400"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OtpPanel({ onSignedIn }: { onSignedIn: (email: string) => void }) {
  const resend = useOtpResend();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async () => {
    setError("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    if (!resend.allowSend()) { setError(resend.hint()); return; }
    setBusy(true);
    try {
      await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/clubs/editor` },
      });
      resend.onSent();
      setSent(true);
    } catch (e: any) {
      setError(e?.message || "Could not send the code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError("");
    if (!code.trim()) { setError("Enter the code you received by email."); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(), token: code.trim(), type: "email",
      });
      if (error) throw error;
      if (!data.user) throw new Error("Sign-in did not complete.");
      onSignedIn(data.user.email || "");
    } catch (e: any) {
      setError(e?.message || "That code did not work. Check it and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-8">
        <div className="w-12 h-12 rounded-xl bg-green-800 flex items-center justify-center mb-5">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-stone-900">Club Editor Studio</h2>
        <p className="text-sm text-stone-500 mt-1 mb-6">
          Sign in with the email your club patron invited. You will get a one-time code — no passwords.
        </p>

        {!sent ? (
          <>
            <label className="block text-xs font-semibold text-stone-600 mb-1">School / personal email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm mb-4"
            />
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <button
              onClick={sendCode} disabled={busy || resend.sendsLeft <= 0}
              className="w-full rounded-xl bg-green-800 text-white py-2.5 text-sm font-semibold hover:bg-green-900 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" /> {busy ? "Sending…" : "Email me a code"}
            </button>
            {resend.sendsLeft < resend.maxSends && (
              <p className="text-center text-[11px] text-stone-400 mt-2">{resend.sendsLeft} of {resend.maxSends} sends left this session</p>
            )}
          </>
        ) : (
          <>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Code sent to {email.trim().toLowerCase()}
            </label>
            <input
              value={code} onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              placeholder="6-digit code"
              inputMode="numeric"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm tracking-[0.3em] mb-4 text-center"
            />
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <button
              onClick={verify} disabled={busy}
              className="w-full rounded-xl bg-green-800 text-white py-2.5 text-sm font-semibold hover:bg-green-900 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <button
              onClick={sendCode} disabled={busy || !resend.allowSend()}
              className="w-full text-center text-xs text-stone-500 hover:underline mt-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resend.label()}
            </button>
            <p className="text-center text-[11px] text-stone-400 mt-1">{resend.sendsLeft} of {resend.maxSends} sends left this session</p>
            <button
              onClick={() => { setSent(false); setCode(""); }}
              className="w-full text-center text-xs text-stone-500 hover:underline mt-3"
            >
              Wrong email? Start over
            </button>
          </>
        )}
      </div>
      <p className="text-center text-xs text-stone-400 mt-4">
        Not invited yet? Ask your club patron to add you as chairperson or secretary co-editor.
      </p>
    </div>
  );
}

function Composer({
  editor, post, onCancel, onSaved, onCreated,
}: {
  editor: EditorRow; post: PostRow | null; onCancel: () => void; onSaved: () => void;
  onCreated?: (post: PostRow) => void;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(post?.image_url || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const pickFile = (f: File | null) => {
    setImage(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setError(""); setNotice("");
    if (!title.trim()) { setError("Give your post a title."); return; }
    if (!content.trim()) { setError("Write some content before submitting."); return; }
    setBusy(true);
    try {
      let imageUrl = post?.image_url || null;
      if (image) {
        try { imageUrl = await uploadImage(image); }
        catch { setNotice("Cover image could not be uploaded — your post will be submitted without one."); }
      }
      const body = {
        club_id: editor.club_id,
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        image_url: imageUrl,
        published: false,
        status: "pending",
        author: editor.name,
        editor_name: editor.name,
        editor_role: editor.role_title,
        author_user_id: undefined as string | undefined,
      };
      if (post) {
        // Editors may revise their own pending / rejected posts.
        const { error } = await supabase
          .from("club_posts")
          .update({ title: body.title, excerpt: body.excerpt, content: body.content, image_url: body.image_url })
          .eq("id", post.id);
        if (error) throw error;
        setNotice("Changes saved. The post is back with your patron for approval.");
      } else {
        const { data: session } = await supabase.auth.getSession();
        body.author_user_id = session.session?.user.id;
        const { data: inserted, error } = await supabase
          .from("club_posts")
          .insert(body)
          .select("id")
          .single();
        if (error) throw error;
        setNotice("Submitted for your patron's approval. It will appear on the club page once approved.");
        // Tell the patron a post is waiting (fire-and-forget; a failed email
        // must never block the submission itself).
        if (inserted?.id && session.session?.access_token) {
          notifyClubPatron({ data: { postId: inserted.id, accessToken: session.session.access_token } })
            .then(() => {})
            .catch(() => {});
        }
        // Keep the composer open in edit mode so the writer can immediately
        // add photos and videos to the post's story page.
        if (onCreated && inserted?.id) {
          onCreated({ ...body, review_note: null, id: inserted.id, created_at: new Date().toISOString() } as PostRow);
          return;
        }
      }
      onSaved();
    } catch (e: any) {
      setError(e?.message || "Could not save the post. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="font-display text-lg font-bold text-stone-900">
          {post ? "Edit post" : "Write a club post"}
        </p>
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400"><X className="h-4 w-4" /></button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="e.g. Nature walk reveals rare butterfly on campus" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Short summary (shown on the club page)</label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="One or two sentences that make people want to read on" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Story</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={7} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="Tell the story of what your club did, learnt or achieved…" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Cover image (optional)</label>
          <div className="flex items-center gap-3">
            {preview ? (
              <img src={preview} alt="cover preview" className="h-20 w-32 object-cover rounded-lg border border-stone-200" />
            ) : (
              <div className="h-20 w-32 rounded-lg bg-stone-100 border border-dashed border-stone-300 flex items-center justify-center text-stone-400">
                <ImagePlus className="h-5 w-5" />
              </div>
            )}
            <label className="text-xs font-medium text-green-800 hover:underline cursor-pointer">
              {image || preview ? "Change image" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] || null)} />
            </label>
            {(image || preview) && (
              <button onClick={() => { setImage(null); setPreview(post?.image_url || null); }} className="text-xs text-stone-400 hover:text-red-500 underline">Remove</button>
            )}
          </div>
        </div>

        {notice && <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{notice}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}

        {post?.id && (
          <div className="border-t border-stone-100 pt-4">
            <PostMediaManager
              postId={post.id}
              notice={(text, kind) => {
                if (kind === "ok") setNotice(text);
                else setError(text);
              }}
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={submit} disabled={busy}
            className="px-5 py-2.5 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 disabled:opacity-60"
          >
            {busy ? "Saving…" : post ? "Save changes" : "Submit for approval"}
          </button>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-sm font-semibold">Cancel</button>
        </div>
        {!post && (
          <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Your post goes to the club patron for approval before it appears publicly.
          </p>
        )}
      </div>
    </div>
  );
}

function EditorWorkspace({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [editors, setEditors] = useState<EditorRow[]>([]);
  const [state, setState] = useState<"loading" | "none" | "ready">("loading");
  const [clubId, setClubId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<PostRow | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEditorships = async () => {
    setState("loading");
    const { data: session } = await supabase.auth.getSession();
    const u = session.session?.user;
    if (!u) { setState("none"); return; }
    // First visit with an invite: link this auth user to the pending invite (email was verified by the OTP).
    if (u.email) {
      await supabase
        .from("club_editors")
        .update({ user_id: u.id, status: "active", updated_at: new Date().toISOString() })
        .eq("email", u.email.toLowerCase())
        .eq("status", "pending");
    }
    const { data, error: err } = await supabase
      .from("club_editors")
      .select("*, clubs(id, name, slug)")
      .eq("user_id", u.id)
      .eq("status", "active");
    if (err) { setError(err.message || "Could not load your clubs."); setState("none"); return; }
    const rows = (data || []) as EditorRow[];
    setEditors(rows);
    if (rows.length > 0) {
      const first = rows[0];
      if (first) {
        setClubId((prev) => (prev && rows.some((r) => r.club_id === prev) ? prev : first.club_id));
        setState("ready");
        return;
      }
    }
    setState("none");
  };

  useEffect(() => { loadEditorships(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (!clubId) { setPosts([]); return; }
    setPostsLoading(true);
    supabase
      .from("club_posts")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message || "Could not load posts.");
        setPosts((data || []) as PostRow[]);
        setPostsLoading(false);
      });
  }, [clubId]);

  const activeEditor = editors.find((e) => e.club_id === clubId) || null;

  const removePost = async (post: PostRow) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    const { error: err } = await supabase.from("club_posts").delete().eq("id", post.id);
    if (err) { setError(err.message || "Could not delete the post."); return; }
    setPosts((p) => p.filter((x) => x.id !== post.id));
  };

  if (state === "loading") {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
      </div>
    );
  }

  if (state === "none") {
    return (
      <div className="w-full max-w-md mx-auto mt-10">
        <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-8 text-center">
          <p className="font-display text-xl font-bold text-stone-900 mb-2">No club editorship yet</p>
          <p className="text-sm text-stone-500 mb-6">
            Signed in as <span className="font-medium text-stone-700">{email}</span>. Your patron has not invited
            this email to write for a club — ask them to add you as a chairperson or secretary co-editor first.
          </p>
          {error && <p className="text-xs text-red-600 mb-4">{error}</p>}
          <button onClick={onSignOut} className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 inline-flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-900">Your club studio</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Signed in as <span className="font-medium text-stone-700">{email}</span> · posts need patron approval before going live
          </p>
        </div>
        <button onClick={onSignOut} className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 inline-flex items-center gap-2">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {editors.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {editors.map((ed) => (
            <button
              key={ed.id}
              onClick={() => { setClubId(ed.club_id); setComposing(false); setEditing(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                clubId === ed.club_id ? "bg-green-800 text-white border-green-800" : "bg-white text-stone-600 border-stone-200 hover:border-green-800"
              }`}
            >
              {ed.clubs?.name || "Club"} <span className="opacity-70">· {ed.role_title}</span>
            </button>
          ))}
        </div>
      )}

      {composing || editing ? (
        <Composer
          editor={activeEditor!}
          post={editing}
          onCancel={() => { setComposing(false); setEditing(null); }}
          onCreated={(created) => { setComposing(true); setEditing(created); }}
          onSaved={() => {
            setComposing(false); setEditing(null);
            if (clubId) {
              supabase
                .from("club_posts")
                .select("*")
                .eq("club_id", clubId)
                .order("created_at", { ascending: false })
                .then(({ data }) => setPosts((data || []) as PostRow[]));
            }
          }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-stone-500">
              {activeEditor?.clubs?.name} — write news for your club page below.
            </p>
            <button
              onClick={() => setComposing(true)}
              className="px-4 py-2 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900"
            >
              + New post
            </button>
          </div>

          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

          {postsLoading ? (
            <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-green-800 border-t-transparent" /></div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl bg-white border border-stone-200 p-10 text-center">
              <PenLine className="h-8 w-8 text-stone-300 mx-auto mb-3" />
              <p className="font-display text-lg font-bold text-stone-800">No posts yet</p>
              <p className="text-sm text-stone-500 mt-1 mb-5">Share your club's first story of the term.</p>
              <button onClick={() => setComposing(true)} className="px-5 py-2.5 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900">Write your first post</button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const chip = statusMeta(post.status);
                return (
                  <div key={post.id} className="rounded-2xl bg-white border border-stone-200 p-5 flex items-start gap-4">
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="h-16 w-24 object-cover rounded-lg border border-stone-200 shrink-0" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${chip.cls}`}>{chip.label}</span>
                        <span className="text-[10px] text-stone-400">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-stone-900">{post.title}</p>
                      {post.excerpt && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{post.excerpt}</p>}
                      {post.status === "rejected" && post.review_note && (
                        <p className="text-xs text-red-600 mt-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1">Patron: {post.review_note}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {(post.status === "pending" || post.status === "rejected") && (
                        <>
                          <button onClick={() => setEditing(post)} className="p-2 rounded-lg hover:bg-stone-100 border border-stone-200" title="Edit"><PenLine className="h-3.5 w-3.5 text-stone-500" /></button>
                          <button onClick={() => removePost(post)} className="p-2 rounded-lg hover:bg-red-50 border border-red-100" title="Delete"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                        </>
                      )}
                      {post.status === "published" && activeEditor?.clubs?.slug && (
                        <a href={`/clubs/${activeEditor.clubs.slug}/posts/${post.id}`} className="p-2 rounded-lg hover:bg-stone-100 border border-stone-200" title="View live"><Eye className="h-3.5 w-3.5 text-stone-500" /></a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ClubEditorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-green-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-200 mb-1">Club Editor Studio</p>
            <p className="font-display text-xl font-bold">M.M College Wairaka</p>
          </div>
          <Link to="/clubs" className="text-sm text-green-100 hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Clubs
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {user ? (
          <EditorWorkspace key={user.id} email={user.email || ""} onSignOut={signOut} />
        ) : (
          <div className="flex justify-center">
            <OtpPanel onSignedIn={() => { supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null)); }} />
          </div>
        )}
      </main>
    </div>
  );
}
