// One-time GitHub repository setup for the Cloudflare deploy pipeline:
//   1. creates the `production` and `preview` deployment environments,
//   2. pins each environment to its branch (master / stg),
//   3. uploads the repo Actions secrets needed by .github/workflows/deploy.yml.
//
// Usage:  GH_TOKEN=ghp_xxx node scripts/setup-github.mjs
// Secret values come from the environment or .env.local (SUPABASE_* style
// secrets are Cloudflare runtime secrets and are NOT stored on GitHub — the
// workflow pushes them to Workers via `bun run secrets:sync` at deploy time).
import { readFileSync, existsSync } from "node:fs";
import sodium from "libsodium-wrappers";

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

const TOKEN = process.env.GH_TOKEN;
const REPO = "Wakos-web/wakos";
if (!TOKEN) {
  console.error("GH_TOKEN is required (the GitHub PAT with repo admin)");
  process.exit(1);
}

const api = async (path, init = {}) => {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`${init.method || "GET"} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return body;
};

await sodium.ready;

// ── 1. Environments with branch policies ──────────────────────────────────────
const environments = [
  { name: "production", branches: ["master"] },
  { name: "preview", branches: ["stg"] },
];
for (const env of environments) {
  await api(`/repos/${REPO}/environments/${env.name}`, {
    method: "PUT",
    body: JSON.stringify({
      deployment_branch_policy: {
        protected_branches: false,
        custom_branch_policies: true,
      },
    }),
  });
  for (const branch of env.branches) {
    await api(
      `/repos/${REPO}/environments/${env.name}/deployment-branch-policies`,
      { method: "POST", body: JSON.stringify({ name: branch }) },
    );
  }
  console.log(`✓ environment "${env.name}" (branches: ${env.branches.join(", ")})`);
}

// ── 2. Repo-level Actions secrets ─────────────────────────────────────────────
const KEY_PATH = `/repos/${REPO}/actions/secrets/public-key`;
const { key_id, key } = await api(KEY_PATH);

const putSecret = async (name, value) => {
  const sealed = sodium.crypto_box_seal(
    Buffer.from(value, "utf8"),
    Buffer.from(key, "base64"),
  );
  await api(`/repos/${REPO}/actions/secrets/${name}`, {
    method: "PUT",
    body: JSON.stringify({
      encrypted_value: Buffer.from(sealed).toString("base64"),
      key_id,
    }),
  });
  console.log(`✓ secret ${name}`);
};

const secrets = {
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || "7848bf441c61078241184be61e7413ae",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  ADMIN_SESSION_KEY: process.env.ADMIN_SESSION_KEY,
};
for (const [name, value] of Object.entries(secrets)) {
  if (!value) {
    console.error(`! skipping ${name} — no value in env/.env.local`);
    continue;
  }
  await putSecret(name, value);
}

console.log("\nGitHub setup complete: environments production/preview + Actions secrets.");
