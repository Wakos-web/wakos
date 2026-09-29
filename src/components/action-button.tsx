/** Small labeled action button — replaces icon-only buttons so touch users and
 *  newcomers can see what each action does without guessing from tooltips.
 *  Full label shows on large screens; icon + tooltip on small ones. */
export function ActionBtn({ onClick, icon: Icon, label, tone = "default", disabled }: {
  onClick: () => void; icon: any; label: string; tone?: "default" | "edit" | "danger" | "publish" | "unpublish"; disabled?: boolean;
}) {
  const tones: Record<string, string> = {
    default: "border-stone-200 text-stone-600 hover:bg-stone-50",
    edit: "border-blue-200 text-blue-700 hover:bg-blue-50",
    danger: "border-red-200 text-red-600 hover:bg-red-50",
    publish: "border-green-200 text-green-700 hover:bg-green-50",
    unpublish: "border-amber-200 text-amber-700 hover:bg-amber-50",
  };
  return (
    <button onClick={onClick} disabled={disabled} title={label} aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${tones[tone]}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}
