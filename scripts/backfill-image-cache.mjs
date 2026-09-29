#!/usr/bin/env node
/**
 * One-time backfill: gives every CMS-referenced image the long cache lifetime
 * (UPLOAD_CACHE_CONTROL seconds) by copying each object to a new storage path
 * and updating the CMS reference to point at the copy.
 *
 * Why so roundabout: on this Supabase storage version, an object's cacheControl
 * metadata is captured at CREATION and cannot be changed afterwards — not by
 * x-upsert, not by PUT, not even by delete + re-create at the same path
 * (verified empirically; brand-new paths DO honor the header, and the CDN also
 * clamps public objects to at most ~1 hour on free tier... new-path copies with
 * explicit cache-control do serve the longer value, which is what this uses).
 *
 * Safety:
 *   - copies bytes verbatim and verifies the copy serves the right header +
 *     byte size before any DB row is touched;
 *   - only rewrites references in page_content / clubs / articles (what the
 *     site renders), by exact-string replacement of the full URL;
 *   - the ORIGINAL objects are deliberately left in place (a few MB) so any
 *     reference outside these tables keeps working.
 *
 * Usage:
 *   node --env-file=.env.local scripts/backfill-image-cache.mjs            # apply
 *   DRY_RUN=1 node --env-file=.env.local scripts/backfill-image-cache.mjs  # report only
 */
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return {};
  const out = {};
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
function env(name, fallback = "") {
  return process.env[name] || loadEnvLocal()[name] || fallback;
}

const SUPABASE_URL = env("SUPABASE_URL", "https://cykaheepeqcgmveckuru.supabase.co");
const KEY = env("SUPABASE_SERVICE_ROLE_KEY");
if (!KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required (.env.local or env)");
  process.exit(1);
}
const DRY_RUN = !!process.env.DRY_RUN;
const TARGET = Number(env("UPLOAD_CACHE_CONTROL", "604800"));
const BUCKETS = ["uploads", "club-images", "class-notes-photos", "hero-media"];

const supabase = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });
const H = { Authorization: `Bearer ${KEY}`, apikey: KEY };

/** Collect every http(s) URL from an arbitrary JSON structure into a Set. */
function collectUrls(v, out) {
  if (typeof v === "string") {
    if (/^https?:\/\//.test(v)) out.add(v);
    return;
  }
  if (Array.isArray(v)) v.forEach((x) => collectUrls(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => collectUrls(x, out));
}

function newPathFor(path) {
  const i = path.lastIndexOf(".");
  const dir = path.slice(0, i);
  const ext = path.slice(i); // keeps the dot
  return `${dir}-cached${ext}`;
}

async function main() {
  // ---- 1. gather CMS-referenced storage objects ----
  const urls = new Set();
  const pc = await supabase.from("page_content").select("page,section,content");
  for (const row of pc.data || []) collectUrls(row.content, urls);
  const clubs = await supabase.from("clubs").select("slug,hero_image_url");
  for (const c of clubs.data || []) collectUrls(c, urls);
  const arts = await supabase.from("articles").select("slug,image").eq("published", true);
  for (const a of arts.data || []) collectUrls(a, urls);

  const objects = [];
  const esc = SUPABASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const u of urls) {
    const m = u.match(new RegExp(`^${esc}/storage/v1/object/public/([^/]+)/(.+?)(?:\\?.*)?$`));
    if (m && BUCKETS.includes(m[1])) objects.push({ url: u, bucket: m[1], path: decodeURIComponent(m[2]) });
  }
  console.log(`Found ${objects.length} storage objects referenced by the CMS.${DRY_RUN ? " (DRY RUN — no changes)\n" : "\n"}`);

  let fixed = 0, skipped = 0, failed = 0;
  const replacements = []; // { from, to }

  for (const { url, bucket, path } of objects) {
    const newPath = newPathFor(path);
    const newUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${newPath.split("/").map(encodeURIComponent).join("/")}`;

    // already-cached copy exists?
    const exists = await fetch(newUrl + `?probe=${Date.now()}`, { headers: { Range: "bytes=0-0" } });
    if (exists.status === 200 || exists.status === 206) {
      const cc = exists.headers.get("cache-control") || "";
      if (cc.includes(`max-age=${TARGET}`)) {
        replacements.push({ from: url, to: newUrl });
        skipped++;
        continue;
      }
    }

    if (DRY_RUN) {
      console.log(`WOULD COPY ${bucket}/${path} → ${newPath.split("/").pop()}`);
      replacements.push({ from: url, to: newUrl });
      fixed++;
      continue;
    }

    // download original
    const dl = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, { headers: H });
    if (!dl.ok) {
      failed++;
      console.log(`FAIL download ${bucket}/${path}: HTTP ${dl.status}`);
      continue;
    }
    const buf = Buffer.from(await dl.arrayBuffer());
    const type = dl.headers.get("content-type") || "image/jpeg";

    // create the copy (fresh path → metadata is honored). If the copy already
    // exists from an earlier run, that's fine — it gets verified below like
    // any fresh copy, and the DB row is what actually gets finished.
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${newPath}`, {
      method: "POST",
      headers: { ...H, "Content-Type": type, "cache-control": String(TARGET) },
      body: buf,
    });
    if (!up.ok && !/Duplicate/i.test(await up.text())) {
      failed++;
      console.log(`FAIL copy ${bucket}/${newPath}: HTTP ${up.status}`);
      continue;
    }

    // verify the copy: right header AND right size. Storage serves the value
    // back either as the raw seconds ("604800") or as "max-age=604800".
    const check = await fetch(newUrl + `?v=${Date.now()}`, { headers: { Range: "bytes=0-0" } });
    const cc = check.headers.get("cache-control") || "";
    const size = (check.headers.get("content-range") || "").split("/")[1];
    const servedMaxAge = Math.max(0, ...[...cc.matchAll(/(?:max-age=)?(\d+)/g)].map((m) => Number(m[1])));
    if (servedMaxAge < TARGET || Number(size) !== buf.length) {
      failed++;
      console.log(`FAIL verify ${newPath}: header=${cc} size=${size}/${buf.length} — DB not touched`);
      continue;
    }
    replacements.push({ from: url, to: newUrl });
    fixed++;
    console.log(`copied ${bucket}/${path.split("/").pop()} → ${cc}`);
  }

  // ---- 2. rewrite CMS references (exact-string replace) ----
  if (!DRY_RUN && replacements.length > 0) {
    console.log(`\nRewriting ${replacements.length} reference(s) in page_content / clubs / articles…`);
    const replaceIn = (s) => {
      let out = s;
      for (const { from, to } of replacements) out = out.split(from).join(to);
      return out;
    };

    for (const row of pc.data || []) {
      const before = JSON.stringify(row.content);
      const after = replaceIn(before);
      if (after !== before) {
        const { error } = await supabase.from("page_content").update({ content: JSON.parse(after) }).eq("page", row.page).eq("section", row.section);
        if (error) console.log(`FAIL page_content[${row.page}/${row.section}]: ${error.message}`);
      }
    }
    for (const c of clubs.data || []) {
      if (!c.hero_image_url) continue;
      const after = replaceIn(c.hero_image_url);
      if (after !== c.hero_image_url) {
        const { error } = await supabase.from("clubs").update({ hero_image_url: after }).eq("slug", c.slug);
        if (error) console.log(`FAIL clubs[${c.slug}]: ${error.message}`);
      }
    }
    for (const a of arts.data || []) {
      if (!a.image) continue;
      const after = replaceIn(a.image);
      if (after !== a.image) {
        const { error } = await supabase.from("articles").update({ image: after }).eq("slug", a.slug);
        if (error) console.log(`FAIL articles[${a.slug}]: ${error.message}`);
      }
    }
  }

  console.log(`\nDone. copies: ${fixed}, already-done: ${skipped}, failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
