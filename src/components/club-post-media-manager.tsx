import { useState, useEffect, useRef } from "react";
import { supabase as publicSupabase } from "@/lib/supabase";
import { adminSupabase } from "@/lib/supabase";
import { youtubeId, youtubeThumbUrl, youtubeWatchUrl } from "@/lib/youtube";
import { prepareImageForUpload } from "@/lib/image-convert";
import { VIDEO_TYPES, VIDEO_MAX_MB, validateMedia, UPLOAD_CACHE_CONTROL } from "@/lib/upload-guide";
import { YoutubeLinkInput } from "@/components/youtube-link-input";
import { friendlyError } from "@/lib/friendly-error";
import { askConfirm } from "@/components/confirm-dialog";
import { Image as ImageIcon, Video as VideoIcon, PlayCircle, GripVertical, Trash2 } from "lucide-react";

type Notice = (text: string, kind: "ok" | "err") => void;

/**
 * Story media manager for a club post's detail page. Photos and videos are
 * uploaded straight to Supabase Storage (never a URL). Each card leads to a
 * page full of captioned media in animated containers.
 *
 * Shared by:
 *  - the club editor studio (/clubs/editor) for co-editors, and
 *  - the admin dashboard Clubs tab, so admins can edit any post's story page.
 */
export function ClubPostMediaManager({ postId, notice, db }: { postId: string; notice: Notice; db?: typeof publicSupabase }) {
  // Calls from the admin dashboard must go through the service-role proxy:
  // RLS lets the public client read published posts' media but silently
  // no-ops its writes (0-row updates report as success), which made reorders
  // and caption saves fake-success there. Authenticated callers (club editor
  // studio) keep the public client.
  const supabase = db || publicSupabase;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, { caption: string; sort: string }>>({});
  const [addCaption, setAddCaption] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  // First row's grip handle — refocused after keyboard reorders so ↑/↓ keeps working.
  const handleRef = useRef<HTMLButtonElement>(null);
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
    // TIFF is converted to JPEG in the browser; oversized photos are
    // auto-compressed to fit the bucket limit.
    const uploadable = await prepareImageForUpload(file);
    const ext = uploadable.name.split(".").pop();
    const path = "club-posts-media/" + Date.now() + "_" + Math.random().toString(36).substring(7) + "." + ext;
    const { error } = await supabase.storage.from("class-notes-photos").upload(path, uploadable, { contentType: uploadable.type, cacheControl: UPLOAD_CACHE_CONTROL });
    if (error) throw error;
    const { data } = supabase.storage.from("class-notes-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const addMedia = async (file: File | undefined, type: "image" | "video") => {
    if (!file) return;
    // Friendly format + size guidance before anything touches storage.
    const mediaErr = validateMedia(file);
    if (mediaErr) {
      notice(mediaErr.message, "err");
      if (videoRef.current) videoRef.current.value = "";
      if (photoRef.current) photoRef.current.value = "";
      return;
    }
    const videoCount = items.filter((m: any) => m.media_type === "video").length;
    const imageCount = items.filter((m: any) => m.media_type === "image").length;
    if (type === "video" && videoCount >= 2) {
      notice(`Stories allow a maximum of 2 videos (${VIDEO_TYPES}, ${VIDEO_MAX_MB}MB each). Remove one before adding another.`, "err");
      if (videoRef.current) videoRef.current.value = "";
      return;
    }
    if (type === "image" && imageCount >= 5) {
      notice("Stories allow a maximum of 5 photos. Remove one before adding another.", "err");
      if (photoRef.current) photoRef.current.value = "";
      return;
    }
    if (items.length >= 6) {
      notice("Stories hold a maximum of 6 media items (5 photos + 2 videos).", "err");
      if (photoRef.current) photoRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
      return;
    }
    if (type === "video" && file.size > 5 * 1024 * 1024) {
      notice("Videos must be 5MB or smaller. Compress or trim this clip first.", "err");
      if (videoRef.current) videoRef.current.value = "";
      return;
    }
    const captionWords = addCaption.trim().split(/\s+/).filter(Boolean).length;
    if (captionWords > 55) {
      notice("Captions are limited to 55 words. Shorten this caption before uploading.", "err");
      return;
    }
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
      notice(friendlyError(e, "Couldn't upload that photo. Try a different one."), "err");
    } finally {
      setUploading(false);
      if (photoRef.current) photoRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
    }
  };

  /* YouTube in-play videos: paste a link, it renders as an inline embed on
   * the story page. Counts against the 2-video cap just like uploads. */
  const addYouTube = async () => {
    const id = youtubeId(ytUrl.trim());
    if (!id) {
      notice("Paste a valid YouTube link (watch, youtu.be or shorts URL).", "err");
      return;
    }
    const videoCount = items.filter((m: any) => m.media_type === "video").length;
    if (videoCount >= 2) {
      notice("Stories allow a maximum of 2 videos. Remove one before adding another.", "err");
      return;
    }
    if (items.length >= 6) {
      notice("Stories hold a maximum of 6 media items (5 photos + 2 videos).", "err");
      return;
    }
    const captionWords = addCaption.trim().split(/\s+/).filter(Boolean).length;
    if (captionWords > 55) {
      notice("Captions are limited to 55 words. Shorten this caption first.", "err");
      return;
    }
    setUploading(true);
    try {
      const { error } = await supabase.from("club_post_media").insert({
        post_id: postId,
        media_type: "video",
        media_url: youtubeWatchUrl(id),
        youtube_url: youtubeWatchUrl(id),
        caption: addCaption.trim() || null,
        sort_order: items.length + 1,
      });
      if (error) throw error;
      setYtUrl("");
      setAddCaption("");
      notice("YouTube video added — it plays inline on the story page", "ok");
      load();
    } catch (e: any) {
      notice(friendlyError(e, "Couldn't add that YouTube video. Check the link and try again."), "err");
    } finally {
      setUploading(false);
    }
  };

  const saveRow = async (id: string) => {
    const e = edits[id];
    if (!e) return;
    const captionWords = (e.caption || "").trim().split(/\s+/).filter(Boolean).length;
    if (captionWords > 55) {
      notice("Captions are limited to 55 words. Shorten this caption before saving.", "err");
      return;
    }
    const { error } = await supabase.from("club_post_media").update({
      caption: e.caption.trim() || null,
      sort_order: parseInt(e.sort) || 0,
    }).eq("id", id);
    if (error) {      notice(friendlyError(error, "Couldn't save that change. Try again."), "err"); return; }
    notice("Saved", "ok");
    load();
  };

  const removeRow = async (id: string) => {
    // Previously unguarded: a single mis-tap on this small icon permanently
    // deleted a captioned photo/video from the story page.
    if (!(await askConfirm("Remove this media from the story page? This cannot be undone.", { confirmLabel: "Remove", danger: true }))) return;
    const { error } = await supabase.from("club_post_media").delete().eq("id", id);
    if (error) {      notice(friendlyError(error, "Couldn't remove that. Try again."), "err"); return; }
    notice("Media removed", "ok");
    load();
  };

  /* Silent resync after a reorder: refreshes rows + renumbers the sort
   * fields WITHOUT the loading spinner — the spinner early-return unmounts
   * the list and would drop keyboard focus mid-reorder — and merges DB state
   * over local edits so unsaved caption drafts survive. */
  const reloadSilently = async () => {
    const { data } = await supabase.from("club_post_media").select("*").eq("post_id", postId).order("sort_order", { ascending: true });
    setItems(data || []);
    setEdits((prev) => {
      const upd = { ...prev };
      (data || []).forEach((m: any) => {
        const cur = upd[m.id];
        upd[m.id] = { caption: cur ? cur.caption : (m.caption || ""), sort: String(m.sort_order ?? 0) };
      });
      return upd;
    });
  };

  /* Keyboard reorder: ↑/↓ on a row's grip handle swaps with the neighbor and
   * persists the whole list's sort_order in one batch (same write as drag). */
  const moveRow = async (id: string, dir: -1 | 1) => {
    const from = items.findIndex((m) => m.id === id);
    const to = from + dir;
    if (from === -1 || to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    setItems(next);
    setEdits((prev) => {
      const upd = { ...prev };
      next.forEach((m, i) => { const cur = upd[m.id]; if (cur) upd[m.id] = { ...cur, sort: String(i + 1) }; });
      return upd;
    });
    const updates = next.map((m, i) =>
      supabase.from("club_post_media").update({ sort_order: i + 1 }).eq("id", m.id),
    );
    const results = await Promise.allSettled(updates);
    const failed = results.find((r) => r.status === "fulfilled" && r.value.error);
    if (failed) {
      // Surface the failure instead of pretending the order saved.
      const err = (failed as PromiseFulfilledResult<any>).value.error;
      notice(friendlyError(err, "Couldn't save the new order. Try again."), "err");
      await reloadSilently(); // resync UI with what the DB actually has
      return;
    }
    notice("Order saved", "ok");
    await reloadSilently();
  };

  /* Drag-to-reorder (same pattern as the MWOSA media manager): on drop the
   * whole list's sort_order is rewritten in one batch, then reloaded so the
   * UI matches the DB — a stray click can't lose the new order. */
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDragId(id);
  };
  const onDragOverRow = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragId) setDragOverId(id);
  };
  const onDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null); setDragOverId(null);
      return;
    }
    const next = [...items];
    const from = next.findIndex((m) => m.id === dragId);
    const to = next.findIndex((m) => m.id === targetId);
    if (from === -1 || to === -1) {
      setDragId(null); setDragOverId(null);
      return;
    }
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setEdits((prev) => {
      const upd = { ...prev };
      next.forEach((m, i) => { const cur = upd[m.id]; if (cur) upd[m.id] = { ...cur, sort: String(i + 1) }; });
      return upd;
    });
    setDragId(null); setDragOverId(null);
    const updates = next.map((m, i) =>
      supabase.from("club_post_media").update({ sort_order: i + 1 }).eq("id", m.id),
    );
    const results = await Promise.allSettled(updates);
    const failed = results.find((r) => r.status === "fulfilled" && r.value.error);
    if (failed) {
      const err = (failed as PromiseFulfilledResult<any>).value.error;
      notice(friendlyError(err, "Couldn't save the new order. Try again."), "err");
      load();
      return;
    }
    notice("Order saved", "ok");
    load();
  };

  return (
    <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
      <p className="text-sm font-semibold text-stone-700 mb-1">Story media (photos & videos with captions)</p>
      <p className="text-xs text-stone-400 mb-4">
        These appear on the post's detailed page as a captioned gallery: photos bundle into one swipeable carousel under a single caption, and videos play inline (upload a file or paste a YouTube link). Reorder by dragging a row onto another — or focus a row's handle and press ↑/↓.
      </p>

      <div className="rounded-xl bg-white border border-stone-200 p-3 mb-4 space-y-3">
        <div className="relative">
          <input
            value={addCaption}
            onChange={(e) => setAddCaption(e.target.value)}
            placeholder="Caption for the new photo / video (max 55 words)"
            className="w-full p-2.5 pr-16 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
          />
          <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold ${addCaption.trim().split(/\s+/).filter(Boolean).length > 55 ? "text-red-600" : "text-stone-400"}`}>
            {addCaption.trim().split(/\s+/).filter(Boolean).length}/55
          </span>
        </div>
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
        <YoutubeLinkInput
          value={ytUrl}
          onChange={setYtUrl}
          onSave={addYouTube}
          disabled={uploading}
          placeholder="…or paste a YouTube link (watch / youtu.be / shorts) — plays inline on the story page"
        />
      </div>

      {loading ? (
        <div className="py-4 text-center text-xs text-stone-400">Loading media…</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-5 text-center text-xs text-stone-400">
          No media yet. Add a photo or video to build the post's story page.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, item.id)}
              onDragOver={(e) => onDragOverRow(e, item.id)}
              onDrop={(e) => onDrop(e, item.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              className={`flex flex-col md:flex-row md:items-start gap-3 rounded-lg border p-2.5 cursor-grab active:cursor-grabbing transition-all ${dragId === item.id ? "opacity-40 ring-2 ring-green-800 ring-offset-1" : "bg-white border-stone-200"} ${dragOverId === item.id && dragId !== item.id ? "ring-2 ring-green-600 ring-offset-1 bg-green-50/60" : ""}`}
            >
              <div className="flex md:flex-col items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRef.current?.focus()}
                  onKeyDown={(e) => {
                    // Never disabled while saving: disabling a focused button
                    // blurs it and strands keyboard users mid-reorder. moveRow
                    // re-syncs with the DB after every persist anyway.
                    if (e.key === "ArrowUp") { e.preventDefault(); moveRow(item.id, -1); }
                    else if (e.key === "ArrowDown") { e.preventDefault(); moveRow(item.id, 1); }
                  }}
                  className="p-1 -m-1 rounded-md text-stone-300 hover:text-stone-500 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 transition-colors cursor-grab active:cursor-grabbing"
                  title={`Reorder: press ↑/↓, or drag (item ${idx + 1})`}
                  aria-label={`Reorder item ${idx + 1}. Press ArrowUp or ArrowDown to move it.`}
                  ref={idx === 0 ? handleRef : undefined}
                >
                  <GripVertical className="h-4 w-4 pointer-events-none" aria-hidden />
                </button>
                <span className="text-[10px] font-bold text-stone-400">{idx + 1}</span>
              </div>
              {item.media_type === "video" ? (
                youtubeId(item.youtube_url || item.media_url) ? (
                  <img
                    src={youtubeThumbUrl(youtubeId(item.youtube_url || item.media_url)!)}
                    alt=""
                    className="w-16 h-12 shrink-0 rounded-md object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-16 h-12 shrink-0 rounded-md bg-black flex items-center justify-center">
                    <PlayCircle className="h-5 w-5 text-white/80" />
                  </div>
                )
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
                {/* Live preview of how this caption appears on the story page */}
                <div className="flex items-baseline gap-1.5 rounded-md bg-stone-50 border border-stone-200 px-2 py-1">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-stone-400 shrink-0">On the page</span>
                  {(edits[item.id]?.caption ?? "").trim() ? (
                    <span className="font-display italic text-[11px] text-stone-700 truncate">{edits[item.id]?.caption.trim()}</span>
                  ) : (
                    <span className="font-display italic text-[11px] text-stone-400 truncate">no caption yet — shown untitled</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
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
