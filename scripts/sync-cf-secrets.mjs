// Pushes server secrets from .env.local to Cloudflare Workers secrets for both
// environments (production worker `wacos` and preview worker `wacos-stg`).
//
// Usage:
//   node scripts/sync-cf-secrets.mjs                # all secrets, both envs
//   node scripts/sync-cf-secrets.mjs RESEND_API_KEY # one secret, both envs
//
// Requires CLOUDFLARE_API_TOKEN (and optionally CLOUDFLARE_ACCOUNT_ID, though
// the account id is also pinned in wrangler.jsonc). Values come from .env.local
// or the process environment — the script never prints secret values.
import { readFileSync, existsSync } from "node:fs";

// Load .env.local without clobbering real env vars.
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    if (!(m[1] in process.env)) {
      let v = m[2].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      )
        v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

const ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID || "7848bf441c61078241184be61e7413ae";
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
if (!TOKEN) {
  console.error("CLOUDFLARE_API_TOKEN is required (env or .env.local)");
  process.exit(1);
}

const SECRETS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "ADMIN_SECRET",
  "ADMIN_SESSION_KEY",
];
const ENVIRONMENTS = [
  { label: "production (wacos)", worker: "wacos" },
  { label: "preview (wacos-stg)", worker: "wacos-stg" },
];

const only = process.argv.slice(2);
const wanted = only.length ? SECRETS.filter((s) => only.includes(s)) : SECRETS;
const missing = wanted.filter((s) => !process.env[s]);
if (missing.length) {
  console.error(`Missing secret values: ${missing.join(", ")}`);
  process.exit(1);
}

const api = async (path, init) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  return res.json();
};

let failures = 0;
for (const { label, worker } of ENVIRONMENTS) {
  console.log(`\n→ ${label}`);
  for (const name of wanted) {
    const res = await api(
      `/accounts/${ACCOUNT_ID}/workers/scripts/${worker}/secrets`,
      {
        method: "PUT",
        body: JSON.stringify({
          name,
          text: process.env[name],
          type: "secret_text",
        }),
      },
    );
    if (res.success) {
      console.log(`  ✓ ${name}`);
    } else {
      failures++;
      console.error(
        `  ✗ ${name}: ${JSON.stringify(res.errors?.map((e) => e.message) || res)}`,
      );
    }
  }
}

process.exit(failures ? 1 : 0);
