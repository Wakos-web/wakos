import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Drag-and-zoom crop dialog for hero imagery.
 *
 * The admin pans and zooms the photo inside a fixed hero-aspect frame; on
 * confirm we cut exactly those pixels out of the source with canvas — no
 * upscaling beyond the source resolution — and hand the caller a JPEG File.
 * Accepts a File (fresh pick) or a URL (re-crop from a stored original);
 * URL sources are fetched to a blob first so the canvas is never tainted.
 *
 * The frame is 16:7 to match the desktop hero; phones crop in a little
 * closer automatically (object-cover), which the hint text mentions.
 */
export function ImageCropDialog({
  image,
  aspect = 16 / 7,
  title = "Crop image",
  onCancel,
  onCropped,
}: {
  image: File | string;
  aspect?: number;
  title?: string;
  onCancel: () => void;
  onCropped: (file: File) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  // Resolve the source to a blob URL and preload it (never taints canvas).
  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;
    setLoading(true);
    setImgEl(null);
    setSrc(null);
    (async () => {
      try {
        if (typeof image === "string") {
          const r = await fetch(image, { mode: "cors" });
          if (!r.ok) throw new Error("fetch failed");
          const b = await r.blob();
          revoke = URL.createObjectURL(b);
        } else {
          revoke = URL.createObjectURL(image);
        }
        if (cancelled) { URL.revokeObjectURL(revoke); return; }
        const img = new Image();
        img.onload = () => {
          if (cancelled) { URL.revokeObjectURL(revoke!); return; }
          setSrc(revoke);
          setImgEl(img);
          setLoading(false);
        };
        img.onerror = () => { URL.revokeObjectURL(revoke!); setLoading(false); };
        img.src = revoke;
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; if (revoke) URL.revokeObjectURL(revoke); };
  }, [image]);

  // Track the viewport box; refit the image whenever it changes.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const upd = () => setVp({ w: el.clientWidth, h: el.clientHeight });
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, [src]);

  // Center the photo (cover) whenever the image or frame changes.
  useEffect(() => {
    if (!imgEl || !vp.w || !vp.h) return;
    const s = Math.max(vp.w / imgEl.naturalWidth, vp.h / imgEl.naturalHeight);
    setZoom(1);
    setPos({ x: (vp.w - imgEl.naturalWidth * s) / 2, y: (vp.h - imgEl.naturalHeight * s) / 2 });
  }, [imgEl, vp.w, vp.h]);

  const base = imgEl && vp.w ? Math.max(vp.w / imgEl.naturalWidth, vp.h / imgEl.naturalHeight) : 1;
  const scale = base * zoom;
  const dispW = imgEl ? imgEl.naturalWidth * scale : 0;
  const dispH = imgEl ? imgEl.naturalHeight * scale : 0;
  // The photo must always cover the frame.
  const clamp = (p: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(vp.w - dispW, p.x)),
    y: Math.min(0, Math.max(vp.h - dispH, p.y)),
  });

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setPos(clamp({ x: d.x + (e.clientX - d.px), y: d.y + (e.clientY - d.py) }));
  };
  const endDrag = () => { dragRef.current = null; };

  const crop = async () => {
    if (!imgEl || !vp.w || busy) return;
    setBusy(true);
    try {
      // Map the visible frame back to source pixels; output at the crop's
      // natural resolution (capped at 2000px wide, never upscaled).
      const sx = -pos.x / scale;
      const sy = -pos.y / scale;
      const sw = vp.w / scale;
      const sh = vp.h / scale;
      const cw = Math.max(1, Math.min(2000, Math.round(sw)));
      const ch = Math.max(1, Math.round(cw * (vp.h / vp.w)));
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, cw, ch);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
      if (!blob) return;
      const stem = typeof image === "string" ? "hero-poster" : image.name.replace(/\.[^.]+$/, "");
      onCropped(new File([blob], `${stem}-cropped.jpg`, { type: "image/jpeg" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg font-bold text-stone-900">{title}</p>
        <p className="text-xs text-stone-500 mt-1 mb-3">Drag to reposition and zoom. This frame matches the desktop hero — phones crop in a little closer automatically.</p>
        {loading && (
          <div className="flex h-56 items-center justify-center rounded-xl bg-stone-100">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
          </div>
        )}
        {!loading && imgEl && src && (
          <>
            <div
              ref={viewportRef}
              className="relative w-full touch-none select-none overflow-hidden rounded-xl bg-stone-900"
              style={{ aspectRatio: String(aspect) }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onPointerCancel={endDrag}
            >
              <img
                src={src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute max-w-none"
                style={{ left: pos.x, top: pos.y, width: dispW }}
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-500 shrink-0">Zoom</span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={zoom}
                onChange={(e) => {
                  const z = Number(e.target.value);
                  setZoom(z);
                  // re-clamp against the new scale on the next render tick
                  requestAnimationFrame(() => setPos(p => {
                    const s = base * z;
                    return {
                      x: Math.min(0, Math.max(vp.w - imgEl.naturalWidth * s, p.x)),
                      y: Math.min(0, Math.max(vp.h - imgEl.naturalHeight * s, p.y)),
                    };
                  }));
                }}
                className="flex-1 accent-green-800"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={crop}
                disabled={busy}
                className="flex-1 rounded-xl bg-green-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-900 disabled:opacity-50"
              >
                {busy ? "Cropping..." : "Crop & use"}
              </button>
              <button onClick={onCancel} className="rounded-xl bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
