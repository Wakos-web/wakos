/**
 * Unit tests for the friendly-error mapper. These lock in that raw
 * Supabase/PostgREST error text — the kind that used to flash at users
 * verbatim — comes out as plain language.
 *
 * Run:   node --test e2e/friendly-error.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";

// The mapper is TS; load it by transpiling through esbuild-register is overkill.
// Instead we import the compiled logic via a tiny inline reimplementation guard:
// we exercise the real source with tsx-style require. Simpler: run the source
// through the project's TS via dynamic import is not available in node:test for
// .ts. We therefore test the *behavior contract* against the live file by
// transpiling with the TypeScript compiler API if present, else skip.
import fs from "node:fs";
import path from "node:path";

let friendlyError;
try {
  const ts = await import("typescript");
  const srcPath = path.resolve(process.cwd(), "src/lib/friendly-error.ts");
  const source = fs.readFileSync(srcPath, "utf8");
  const out = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: srcPath,
  }).outputText;
  const dataUrl = "data:text/javascript;base64," + Buffer.from(out).toString("base64");
  const mod = await import(dataUrl);
  friendlyError = mod.friendlyError;
} catch (e) {
  console.warn("could not load friendly-error.ts for testing:", e.message);
}

test("friendly-error.ts compiles and exposes friendlyError", () => {
  assert.equal(typeof friendlyError, "function");
});

const CASES = [
  // [raw error (message or object), fallback, expected fragment]
  [
    { message: 'new row violates row-level security policy for table "alumni_businesses"' },
    "Couldn't save that change. Try again.",
    "We couldn't save that just now.",
  ],
  [
    { message: 'null value in column "body" of relation "mwosa_updates" violates not-null constraint', code: "23502" },
    "Couldn't save that. Try again.",
    "Some required details are missing.",
  ],
  [
    { message: 'duplicate key value violates unique constraint "alumni_profiles_email_key"', code: "23505" },
    "Couldn't register.",
    "already been submitted",
  ],
  [
    { message: 'invalid input syntax for type uuid: "scroll-walk-test"', code: "22P02" },
    "Couldn't save that.",
    "isn't in the right format",
  ],
  [
    { message: "Failed to fetch" },
    "Couldn't reach the server.",
    "We couldn't reach the server.",
  ],
  [
    { message: "invalid login credentials" },
    "Sign in failed.",
    "email or password isn't right",
  ],
  [
    { message: "User already registered" },
    "Sign up failed.",
    "already exists",
  ],
  [
    { message: "Email rate limit exceeded" },
    "Couldn't send the code.",
    "too many times",
  ],
  // notification-lib email delivery failures (club-notify / alumni-notify)
  [
    { message: "Resend replied 422: Validation failed" },
    "Email could not be sent.",
    "notification email couldn't be sent",
  ],
  [
    { message: "RESEND_API_KEY is not configured" },
    "Email could not be sent.",
    "notification email couldn't be sent",
  ],
  [
    { message: "SMTP connection refused" },
    "Email could not be sent.",
    "notification email couldn't be sent",
  ],
  [
    { message: 'relation "public.events" does not exist' },
    "Couldn't save that.",
    "does not exist",
  ],
  [
    { message: "PGRST204 could not find the 'code_hash' column of 'staff_invites'" },
    "Couldn't save that.",
    "Something went wrong on our side",
  ],
  // Storage bucket rejections — exact shapes captured live from Supabase
  // Storage (StorageApiError has a STRING statusCode + status 400):
  [
    {
      message: "mime type image/tiff is not supported",
      statusCode: "415",
      status: 400,
      code: "InvalidMimeType",
      name: "StorageApiError",
    },
    "Couldn't upload your photo.",
    "That file type isn't supported",
  ],
  [
    {
      message: "mime type image/gif is not supported",
      statusCode: "415",
      status: 400,
      code: "InvalidMimeType",
      name: "StorageApiError",
    },
    "Couldn't upload that image.",
    "JPG, PNG or WebP",
  ],
  [
    {
      message: "The object exceeded the maximum allowed size",
      statusCode: "413",
      status: 400,
      code: "EntityTooLarge",
      name: "StorageApiError",
    },
    "Couldn't upload your photo.",
    "That file is too large to upload",
  ],
  [
    { message: "new row violates row-level security policy", statusCode: "403", status: 400, code: "AccessDenied", name: "StorageApiError" },
    "Couldn't upload that.",
    "We couldn't save that just now",
  ],
  // plain-language errors pass through untouched
  [
    { message: "Enter your email address." },
    "Fallback",
    "Enter your email address.",
  ],
];

for (const [err, fallback, expected] of CASES) {
  test(`maps: ${String(err.message).slice(0, 50)}`, () => {
    const got = friendlyError(err, fallback);
    assert.ok(
      got.includes(expected),
      `expected "${got}" to include "${expected}"`,
    );
  });
}