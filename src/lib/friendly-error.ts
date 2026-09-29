/**
 * Friendly, plain-language error messages for non-technical users.
 *
 * Supabase/PostgREST errors are developer-speak ("new row violates row-level
 * security policy for table alumni_businesses", "null value in column
 * \"body\" violates not-null constraint", "22P02 invalid input syntax for
 * type uuid"). Showing those raw to alumni, parents, club editors and donors
 * is confusing and alarming. Every user-facing catch block should route its
 * error through `friendlyError()` so the person sees what went wrong in
 * plain words — and what to do about it — instead of a SQL fragment.
 *
 * `friendlyError(error, fallback)`:
 *   - recognizes the common failure classes (network, validation, duplicate,
 *     RLS/save, session, rate limit, auth) by code/message patterns
 *   - falls back to the caller's human `fallback` (never the raw message)
 *   - in dev, appends the technical detail in parentheses so engineers can
 *     still debug without losing the friendly front half.
 */

type ErrorLike = {
  message?: string;
  code?: string;
  status?: number;
  statusCode?: string | number; // Supabase StorageApiError uses string status codes ("415")
  error?: string; // storage machine code field, e.g. "invalid_mime_type"
  name?: string;
};

const DEV = typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : import.meta.env?.DEV === true;

function unwrap(err: unknown): ErrorLike {
  if (!err) return {};
  if (typeof err === "string") return { message: err };
  if (err instanceof Error) return err as ErrorLike;
  if (typeof err === "object") return err as ErrorLike;
  return { message: String(err) };
}

/** Extract a PostgREST error code like "23505" from a message if it's embedded. */
function extractCode(message: string): string {
  const m = message.match(/\b(2[0-9]{4}|3[0-9]{4}|42[0-9]{2}|PGRST[0-9]+)\b/);
  return m?.[1] || "";
}

const RULES: Array<{ test: (e: ErrorLike, msg: string, code: string) => boolean; say: string }> = [
  // ---- Network / server unreachable -----------------------------------
  {
    test: (e, msg) =>
      /failed to fetch|networkerror|network error|load failed|fetch failed|timed? ?out|aborted/i.test(msg) ||
      e.status === 0 || e.name === "TypeError",
    say: "We couldn't reach the server. Check your internet connection and try again.",
  },
  {
    test: (e) => e.status === 503 || e.status === 502 || e.status === 504,
    say: "The site is a little busy right now. Please wait a moment and try again.",
  },
  {
    test: (e) => e.status === 500,
    say: "Something went wrong on our side. Please try again in a moment.",
  },
  // ---- Email delivery (notification libs: club-notify, alumni-notify) --
  // sendResendEmail throws "Resend replied 422: ..." — that must never reach
  // an admin as-is. The rate-limit rule above already wins for
  // "Email rate limit exceeded", so this is the catch-all for the rest.
  {
    test: (e, msg) => /resend|email service|delivery failed|smtp/i.test(msg),
    say: "The notification email couldn't be sent right now. Please try again in a moment.",
  },
  // ---- Sign-in / auth -------------------------------------------------
  {
    test: (e, msg) =>
      /invalid login credentials|invalid_credentials|email or password is incorrect|wrong password/i.test(msg),
    say: "That email or password isn't right. Double-check and try again, or request a sign-in code.",
  },
  {
    test: (e, msg) => /user already registered|email already in use|already registered/i.test(msg),
    say: "An account with this email already exists. Try signing in instead of registering again.",
  },
  {
    test: (e, msg) => /user not found|no user found|email not found/i.test(msg),
    say: "We couldn't find an account for that email. Check the spelling or register a new one.",
  },
  {
    test: (e, msg) => /email not confirmed|unverified|confirm your email/i.test(msg),
    say: "Your email hasn't been confirmed yet. Check your inbox for the confirmation link, then try again.",
  },
  {
    test: (e, msg) => /otp|one-time code|token has expired|invalid token/i.test(msg) && /expired|invalid|wrong|incorrect/i.test(msg),
    say: "That code has expired or isn't correct. Request a fresh code and try again.",
  },
  // ---- Rate limiting --------------------------------------------------
  {
    test: (e, msg) => /rate limit|too many requests|throttled|slow down|429/i.test(msg),
    say: "You've asked for codes a few too many times. Please wait a minute before trying again.",
  },
  // ---- Uploads: storage bucket rejections -----------------------------
  // Real shapes captured from Supabase Storage:
  //   { statusCode: "415", code: "InvalidMimeType", message: "mime type image/tiff is not supported" }
  //   { statusCode: "413", code: "EntityTooLarge",   message: "The object exceeded the maximum allowed size" }
  {
    test: (e, msg) =>
      /mime type .* not supported|invalid file type|invalid_mime_type|unsupported (file|media|mime)|415/i.test(msg) ||
      String(e.statusCode) === "415" ||
      e.code === "InvalidMimeType",
    say: "That file type isn't supported. Please upload a JPG, PNG or WebP photo, or an MP4/WebM video.",
  },
  {
    test: (e, msg) =>
      /exceeded the maximum allowed size|payload too large|entity too large|file too large|too large|413/i.test(msg) ||
      String(e.statusCode) === "413" ||
      e.code === "EntityTooLarge",
    say: "That file is too large to upload. Photos and videos must be 5MB or smaller — compress or trim the file and try again.",
  },
  // ---- Validation / bad input -----------------------------------------
  {
    test: (e, msg) => /null value in column|not-null constraint|23502/i.test(msg),
    say: "Some required details are missing. Please fill in all the marked fields and try again.",
  },
  {
    test: (e, msg) => /invalid input syntax|22P02|22P03|22P05/i.test(msg),
    say: "One of the details isn't in the right format. Check your entries and try again.",
  },
  {
    test: (e, msg) => /value too long|22001/i.test(msg),
    say: "One of the details is a little too long. Try shortening it and save again.",
  },
  {
    test: (e, msg) => /out of range|22003/i.test(msg),
    say: "One of the numbers you entered is out of range. Check it and try again.",
  },
  // ---- Duplicates -----------------------------------------------------
  {
    test: (e, msg) => /duplicate key|already exists|unique constraint|23505/i.test(msg),
    say: "This has already been submitted — you don't need to send it twice.",
  },
  // ---- Row-level security / saves that didn't take --------------------
  {
    test: (e, msg) => /row.?level security|policy|42501|permission denied/i.test(msg),
    say: "We couldn't save that just now. Please try again — if it keeps happening, contact the school office.",
  },
  {
    test: (e, msg) => /foreign key|23503/i.test(msg),
    say: "We couldn't connect that to your account. Please try again.",
  },
  {
    test: (e, msg) => /could not find the .* column|PGRST204|schema cache/i.test(msg),
    say: "Something went wrong on our side while saving. Please try again.",
  },
  {
    test: (e, msg) => /syntax error|parser|PGRST1\d\d/i.test(msg),
    say: "Something went wrong on our side while saving. Please try again.",
  },
];

/**
 * Turn a raw error into a plain-language message.
 *
 * @param error  the thrown error / supabase error object
 * @param fallback  your own human fallback used when no rule matches
 */
export function friendlyError(error: unknown, fallback: string): string {
  const e = unwrap(error);
  // Storage errors carry the machine code in `.error` (e.g. "invalid_mime_type")
  // alongside `.message` — match against both.
  const msg = [e.message, e.error].filter(Boolean).join(" ") || "";
  const code = e.code || extractCode(msg);

  for (const rule of RULES) {
    if (rule.test(e, msg, code)) return rule.say;
  }

  // If the raw message is already plain (no codes, no SQL keywords, short),
  // it's safe to show — e.g. "Enter your email address." from local checks.
  const looksTechnical =
    /\b(PGRST|SQLSTATE|violates|constraint|column|syntax|postgrest|invalid|row.?level|policy|duplicate|relation|does not exist|exception|error code)\b/i.test(msg) ||
    /\b\d{5}\b/.test(msg) ||
    msg.length > 140;
  if (msg && !looksTechnical) return msg;

  return DEV && msg ? `${fallback} (${msg.slice(0, 120)})` : fallback;
}

export default friendlyError;