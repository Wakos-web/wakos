import { youtubeId, youtubeThumbUrl } from "@/lib/youtube";
import { CheckCircle2, XCircle } from "lucide-react";

/**
 * YouTube link field with live validation and a thumbnail preview BEFORE the
 * link is saved: the border turns green/red as you type, a "Valid video"
 * message with the video's real thumbnail appears once the link parses, and
 * an explanatory error shows when it doesn't. Enter triggers `onSave` when
 * provided (add flows); without it, it's a plain edit field.
 */
export function YoutubeLinkInput({
  value,
  onChange,
  onSave,
  disabled,
  placeholder = "Paste a YouTube link (watch, youtu.be, or shorts)",
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  onSave?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const trimmed = value.trim();
  const id = youtubeId(trimmed);
  const invalid = trimmed.length > 0 && !id;

  return (
    <div className={className}>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSave) {
              e.preventDefault();
              onSave();
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={`flex-1 min-w-0 p-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 ${
            invalid
              ? "border-red-400 bg-red-50/40 focus:ring-red-400"
              : id
                ? "border-green-600 bg-green-50/40 focus:ring-green-700"
                : "border-stone-300 focus:ring-green-800 focus:border-transparent"
          }`}
        />
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || !id}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors shrink-0"
          >
            Add YouTube video
          </button>
        )}
      </div>
      {id && (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/60 p-2">
          <img
            src={youtubeThumbUrl(id)}
            alt="Video thumbnail preview"
            className="h-14 w-24 rounded-lg object-cover border border-stone-200 bg-black shrink-0"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-green-800">
              <CheckCircle2 className="h-3.5 w-3.5" /> Valid YouTube video
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              This thumbnail will be the play button poster on the story page.
            </p>
          </div>
        </div>
      )}
      {invalid && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <XCircle className="h-3.5 w-3.5" />
          That doesn't look like a YouTube link. Use a youtube.com/watch, youtu.be, or /shorts URL.
        </p>
      )}
    </div>
  );
}
