import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { youtubeId, youtubeThumbUrl, youtubeWatchUrl } from "@/lib/youtube";
import { normalizeImageFile } from "@/lib/image-convert";
import { VIDEO_TYPES, VIDEO_MAX_MB, validateMedia } from "@/lib/upload-guide";
import { YoutubeLinkInput } from "@/components/youtube-link-input";
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
export function ClubPostMediaManager({ postId, notice }: { postId: string; notice: Notice }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, { caption: string; sort: string }>>({});
  const [addCaption, setAddCaption] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
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
    // TIFF photos are converted to JPEG in the browser before upload.
    const uploadable = await normalizeImageFile(file);
    const ext = uploadable.name.split(".").pop();
    const path = "club-posts-media/" + Date.now() + "_" + Math.random().toString(36).substring(7) + "." + ext;
    const { error } = await supabase.storage.from("class-notes-photos").upload(path, uploadable, { contentType: uploadable.type });
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
      notice(e?.message || "Upload failed", "err");
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
      notice(e?.message || "Could not add the YouTube video", "err");
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
    await Promise.all(updates);
    notice("Order saved", "ok");
    load();
  };

  return (
    <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
      <p className="text-sm font-semibold text-stone-700 mb-1">Story media (photos & videos with captions)</p>
      <p className="text-xs text-stone-400 mb-4">
        These appear on the post's detailed page as a captioned gallery: photos bundle into one swipeable carousel under a single caption, and videos play inline (upload a file or paste a YouTube link). Reorder with the order field.
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
              className={`flex items-start gap-3 rounded-lg border p-2.5 cursor-grab active:cursor-grabbing transition-all ${dragId === item.id ? "opacity-40 ring-2 ring-green-800 ring-offset-1" : "bg-white border-stone-200"} ${dragOverId === item.id && dragId !== item.id ? "ring-2 ring-green-600 ring-offset-1 bg-green-50/60" : ""}`}
            >
              <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                <GripVertical className="h-4 w-4 text-stone-400" />
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
