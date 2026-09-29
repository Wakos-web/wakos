import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/* In-app replacement for window.confirm(). Native dialogs look alien, */
/* are easily mis-clicked on touch screens and cannot be restyled.     */
/* Used by the admin dashboard and the club editor studio so both      */
/* portals confirm destructive actions the same branded way.           */
/*                                                                     */
/* Usage: mount <ConfirmDialog /> once near the app root, then from     */
/* anywhere: if (await askConfirm("Delete this?", { danger: true }))…  */
/* ------------------------------------------------------------------ */

export type ConfirmRequest = { message: string; confirmLabel?: string; danger?: boolean; resolve: (ok: boolean) => void };

// Module-level bridge: a mounted <ConfirmDialog /> registers its state
// setter here, so any component can `await askConfirm(...)` without
// prop-threading through the tree.
let askConfirmImpl: ((req: ConfirmRequest) => void) | null = null;

export function askConfirm(message: string, opts?: { confirmLabel?: string; danger?: boolean }): Promise<boolean> {
  return new Promise((resolve) => {
    if (askConfirmImpl) askConfirmImpl({ message, resolve, ...opts });
    else resolve(window.confirm(message)); // fallback if dialog not mounted
  });
}

/** Self-registering confirm dialog. Mount once — no props needed. */
export function ConfirmDialog() {
  const [req, setReq] = useState<ConfirmRequest | null>(null);
  useEffect(() => {
    askConfirmImpl = setReq;
    return () => { askConfirmImpl = null; };
  }, []);
  if (!req) return null;
  const finish = (ok: boolean) => { req.resolve(ok); setReq(null); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => finish(false)}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-4 ${req.danger ? "bg-red-50" : "bg-stone-100"}`}>
          <AlertTriangle className={`h-5 w-5 ${req.danger ? "text-red-600" : "text-stone-500"}`} />
        </div>
        <p className="text-sm text-stone-700 mb-5 whitespace-pre-line">{req.message}</p>
        <div className="flex gap-3">
          <button
            onClick={() => finish(true)}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${req.danger ? "bg-red-600 hover:bg-red-700" : "bg-green-800 hover:bg-green-900"}`}
          >
            {req.confirmLabel || "Confirm"}
          </button>
          <button onClick={() => finish(false)} className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
