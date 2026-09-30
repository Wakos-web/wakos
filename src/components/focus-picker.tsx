import { useRef, useState } from "react";

export type FocusPoint = { x: number; y: number };

/**
 * Focal-point picker for hero media. The admin drags a dot onto the part of
 * the scene that must stay in view — phones crop the sides of the hero much
 * harder than the desktop frame, so this decides what survives the crop.
 * Returns percentage coordinates; the hero applies them as object-position.
 */
export function FocusPicker({
  media,
  initial,
  onCancel,
  onSave,
}: {
  media: { kind: "video" | "image"; src: string; poster?: string | undefined };
  initial?: FocusPoint | null | undefined;
  onCancel: () => void;
  onSave: (f: FocusPoint) => void;
}) {
  const [pos, setPos] = useState<FocusPoint>(initial ?? { x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromEvent = (e: React.PointerEvent) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)));
    setPos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg font-bold text-stone-900">Choose focal point</p>
        <p className="text-xs text-stone-500 mt-1 mb-3">Drag the dot onto the subject of the shot — the part that must stay in view. Phones crop the sides of the hero heavily; this decides what survives.</p>
        <div
          ref={frameRef}
          className="relative w-full cursor-crosshair touch-none select-none overflow-hidden rounded-xl bg-stone-900"
          style={{ aspectRatio: "16 / 7" }}
          onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); setFromEvent(e); }}
          onPointerMove={(e) => { if (dragging.current) setFromEvent(e); }}
          onPointerUp={() => { dragging.current = false; }}
          onPointerLeave={() => { dragging.current = false; }}
          onPointerCancel={() => { dragging.current = false; }}
        >
          {media.kind === "video" ? (
            <video src={media.src + "#t=0.5"} poster={media.poster} muted playsInline preload="metadata" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          ) : (
            <img src={media.src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          )}
          <span className="pointer-events-none absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.45)]" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
            <span className="absolute inset-2 rounded-full bg-white/90" />
          </span>
        </div>
        <p className="mt-2 text-xs font-medium text-stone-500">Focal point: {pos.x}% · {pos.y}%</p>
        <div className="mt-4 flex gap-3">
          <button onClick={() => onSave(pos)} className="flex-1 rounded-xl bg-green-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-900">
            Save focal point
          </button>
          <button onClick={onCancel} className="rounded-xl bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
