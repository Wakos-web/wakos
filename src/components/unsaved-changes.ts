/**
 * Unsaved-changes guard registry (admin shell + editors).
 *
 * Same bridge pattern as confirm-dialog.tsx: editors register a cheap "is
 * anything dirty?" probe with a module-level registry, and a single
 * capture-phase click interceptor asks the registry before letting any
 * chrome navigation proceed. Dashboards stay generic — they never import
 * editor state, they just ask "dirty?".
 *
 * Scope rules baked into the interceptor:
 *  - clicks inside an open editor (.admin-edit-form) are edits, not escapes —
 *    they keep their own per-action confirms and are never intercepted;
 *  - clicks inside the confirm dialog overlay pass through untouched;
 *  - everything else (tab buttons, "All pages", sign-out, Back to Site,
 *    overview feed rows) is held while dirty and offered "Leave without
 *    saving". Confirming arms a one-shot latch and replays the click once,
 *    so the original handler runs exactly once with no second dialog.
 */

type DirtyProbe = () => boolean;

const probes = new Set<DirtyProbe>();

/** Any editor holding unsaved work? Cheapest possible check — no rendering. */
export function hasUnsavedChanges(): boolean {
  for (const probe of probes) {
    try {
      if (probe()) return true;
    } catch {
      // A broken probe must never brick navigation — treat it as clean.
    }
  }
  return false;
}

/** Register a dirty probe; returns the unregister function. */
export function registerUnsavedProbe(probe: DirtyProbe): () => void {
  probes.add(probe);
  return () => probes.delete(probe);
}

/** One-shot pass for the replayed click after the user confirms leaving. */
let escapeArmed = false;

/** Install the global guard. Returns the uninstall function. */
export function installUnsavedNavGuard(): () => void {
  const onCapture = (e: MouseEvent) => {
    const target = e.target as Element | null;
    if (!target) return;
    // In-editor actions are edits, not navigation — never intercept.
    if (target.closest(".admin-edit-form")) return;
    // The confirm dialog's own buttons must pass through untouched.
    if (target.closest(".fixed.inset-0.z-50")) return;
    const el = target.closest("a[href], button") as HTMLElement | null;
    if (!el || !el.isConnected) return;
    // Replay of an already-confirmed escape: let it through, disarm.
    if (escapeArmed) {
      escapeArmed = false;
      return;
    }
    if (!hasUnsavedChanges()) return;
    e.preventDefault();
    e.stopPropagation();
    void (async () => {
      const { askConfirm } = await import("@/components/confirm-dialog");
      const ok = await askConfirm(
        "You have unsaved changes in this editor. Leave anyway?",
        { confirmLabel: "Leave without saving", danger: true },
      );
      if (!ok) return;
      escapeArmed = true;
      el.click();
    })();
  };
  document.addEventListener("click", onCapture, { capture: true });
  return () => document.removeEventListener("click", onCapture, { capture: true });
}
