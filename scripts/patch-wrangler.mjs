// Nitro's cloudflare-module preset regenerates .output/server/wrangler.json on
// every build and empties `vars` (it warns "main/assets overridden" and drops
// the rest of the runtime config). This script merges the non-secret vars from
// the root wrangler.jsonc back into the generated config so that
// `wrangler deploy` / `wrangler versions upload` ship with correct vars.
// Secrets are never stored here — they live per-worker via `bun run secrets:sync`.
import { readFileSync, writeFileSync } from "node:fs";

// Minimal string-aware stripper for // line comments (URLs like https:// stay
// intact because they live inside JSON strings).
function stripJsoncComments(src) {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    out += ch;
  }
  return out;
}

const source = JSON.parse(stripJsoncComments(readFileSync("wrangler.jsonc", "utf8")));
const targetPath = ".output/server/wrangler.json";
const target = JSON.parse(readFileSync(targetPath, "utf8"));

target.vars = { ...(source.vars || {}), ...(target.vars || {}) };
writeFileSync(targetPath, JSON.stringify(target, null, 2));

// Standalone config for the preview worker (same build output, stg vars).
const stg = {
  ...target,
  name: "wacos-stg",
  vars: {
    SITE_URL: "https://stg.wacos.alerotek.co.ke",
    PORTAL_URL: "https://stg.wacos.alerotek.co.ke",
    SUPABASE_URL: (source.vars && source.vars.SUPABASE_URL) || "",
  },
};
writeFileSync(".output/server/wrangler.stg.json", JSON.stringify(stg, null, 2));

console.log(
  `[patch-wrangler] vars merged: top-level (${Object.keys(target.vars).join(", ")})` +
    ` + wrote .output/server/wrangler.stg.json`,
);
