#!/usr/bin/env node
/**
 * Weekly CMS image audit (run by .github/workflows/image-audit.yml, or by hand):
 *
 *   AUDIT_BASE_URL=https://wacos.mmwosasocials.workers.dev node scripts/audit-cms-images.mjs
 *
 * What it checks
 *   1. Every public page (plus a sample of live club/article pages) returns
 *      200 and its <img> srcs are healthy: no empty src="", no dead URLs.
 *      Bundled /assets/*.jpg images are reported as a warning (the site's
 *      section photos live in Supabase storage now).
 *   2. Every image URL stored in the CMS (page_content rows and clubs.hero)
 *      resolves — catches storage objects deleted out from under the site.
 *   3. Client-fetched content is sampled too (campus-news articles), because
 *      their images never appear in SSR HTML.
 *
 * Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (env or .env.local). Exit
 * code 1 when broken/empty images are found, so CI can alert; exit 0 = clean.
 * Zero dependencies — plain fetch + PostgREST, so CI needs no install step.
 */
import { readFileSync, existsSync } from "node:fs";

// ---- env loading (.env.local for local runs; CI passes env directly) ----
function loadEnvLocal() {
  const file = ".env.local";
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
function env(name, fallback = "") {
  const local = loadEnvLocal();
  return process.env[name] || local[name] || fallback;
}

const BASE = (env("AUDIT_BASE_URL", "https://wacos.mmwosasocials.workers.dev")).replace(/\/$/, "");
const SUPABASE_URL = env("SUPABASE_URL", "https://cykaheepeqcgmveckuru.supabase.co");
const SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const TIMEOUT = 10000;

const PAGES = [
  "/", "/about", "/academics", "/admissions", "/athletics", "/calendar",
  "/campus-news", "/clubs", "/contact", "/giving", "/mwosa", "/student-life",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkImage(url) {
  // Retries absorb transient network blips; definitive statuses (404/403/400)
  // fail immediately — a deleted storage object is a real problem, not noise.
  let last = "unreachable";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT);
      const r = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, signal: ctrl.signal });
      clearTimeout(t);
      // 200 full body or 206 ranged both mean "exists and is readable"
      if (r.status === 200 || r.status === 206) return "ok";
      last = "HTTP " + r.status;
      if (r.status === 404 || r.status === 403 || r.status === 400) return last;
    } catch (e) {
      last = e.name === "AbortError" ? "timeout" : "ERR " + String(e.message).slice(0, 30);
    }
    await sleep(1000 * attempt);
  }
  return last;
}

async function getPage(path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT);
      const r = await fetch(BASE + path, { signal: ctrl.signal });
      clearTimeout(t);
      if (r.ok) return await r.text();
      if (attempt === 3) return null;
    } catch {
      if (attempt === 3) return null;
    }
    await sleep(1500 * attempt);
  }
  return null;
}

/** Extract unique <img src> values from an HTML string. */
function imgSrcs(html) {
  return [...new Set([...html.matchAll(/<img[^>]*?\ssrc=["']([^"']*)["']/g)].map((m) => m[1]))];
}

/** Collect every http(s) URL from an arbitrary JSON structure. */
function collectUrls(v, out) {
  if (typeof v === "string") {
    if (/^https?:\/\//.test(v)) out.push(v);
    return;
  }
  if (Array.isArray(v)) {
    v.forEach((x) => collectUrls(x, out));
    return;
  }
  if (v && typeof v === "object") Object.values(v).forEach((x) => collectUrls(x, out));
}

// ---- PostgREST helper (no supabase-js dependency needed in CI) ----
async function postgrest(table, select, filters = []) {
  const qs = new URLSearchParams({ select, ...Object.fromEntries(filters) });
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Accept: "application/json",
    },
  });
  if (!r.ok) throw new Error(`PostgREST ${table} → ${r.status}: ${(await r.text()).slice(0, 120)}`);
  return r.json();
}

// ============================ RUN THE AUDIT ============================
const problems = []; // { severity: "FAIL"|"WARN", where, detail }
const stats = { pages: 0, pageImages: 0, cmsUrls: 0, broken: 0 };

console.log(`CMS image audit — ${BASE}\n`);

// ---- 1. SSR pages: status + healthy img srcs ----
for (const p of PAGES) {
  const html = await getPage(p);
  if (html === null) {
    problems.push({ severity: "FAIL", where: p, detail: "page did not return 200 after retries" });
    continue;
  }
  stats.pages++;
  const srcs = imgSrcs(html);
  const supabase = srcs.filter((s) => s.includes("supabase.co"));
  const bundled = srcs.filter((s) => s.startsWith("/assets/"));
  const empty = srcs.filter((s) => s === "").length;
  stats.pageImages += srcs.length;

  if (empty > 0) {
    problems.push({ severity: "FAIL", where: p, detail: `${empty} <img> with empty src=""` });
  }
  for (const u of supabase) {
    const st = await checkImage(u);
    if (st !== "ok") {
      stats.broken++;
      problems.push({ severity: "FAIL", where: p, detail: `broken image [${st}]: ${u.slice(0, 120)}` });
    }
  }
  if (bundled.length > 0) {
    problems.push({
      severity: "WARN",
      where: p,
      detail: `${bundled.length} bundled /assets/*.jpg image(s) — section photos should come from the CMS`,
    });
  }
  console.log(`  ${p.padEnd(14)} imgs: ${String(srcs.length).padStart(3)}  cms: ${String(supabase.length).padStart(3)}  bundled: ${bundled.length}  empty: ${empty}`);
}

// ---- 2. CMS source of truth: page_content + clubs heroes ----
if (!SERVICE_KEY) {
  problems.push({ severity: "WARN", where: "config", detail: "SUPABASE_SERVICE_ROLE_KEY not set — skipping CMS stored-URL checks" });
} else {
  // Each table is audited independently so one schema change can't blind the
  // whole stored-URL check.
  const auditRows = async (targets, label) => {
    for (const { where, json } of targets) {
      const urls = [];
      collectUrls(json, urls);
      for (const u of new Set(urls)) {
        stats.cmsUrls++;
        const st = await checkImage(u);
        if (st !== "ok") {
          stats.broken++;
          problems.push({ severity: "FAIL", where, detail: `CMS image dead [${st}]: ${u.slice(0, 120)}` });
        }
      }
    }
  };
  try {
    const rows = await postgrest("page_content", "page,section,content");
    await auditRows(
      rows.map((row) => ({ where: `page_content[${row.page}/${row.section}]`, json: row.content })),
    );
  } catch (e) {
    problems.push({ severity: "WARN", where: "page_content", detail: "could not audit stored URLs: " + e.message });
  }
  try {
    const clubs = await postgrest("clubs", "slug,hero_image_url");
    await auditRows(clubs.map((c) => ({ where: `clubs[${c.slug}]`, json: c })));
  } catch (e) {
    problems.push({ severity: "WARN", where: "clubs", detail: "could not audit stored URLs: " + e.message });
  }
}

// ---- 3. Client-fetched content sample: campus-news articles ----
try {
  const articles = await postgrest("articles", "slug,title,image", [["published", "eq.true"]]);
  for (const a of articles) {
    if (!a.image) {
      problems.push({ severity: "WARN", where: `articles[${a.slug}]`, detail: `published article has no cover image` });
      continue;
    }
    stats.cmsUrls++;
    const st = await checkImage(a.image);
    if (st !== "ok") {
      stats.broken++;
      problems.push({ severity: "FAIL", where: `articles[${a.slug}]`, detail: `cover dead [${st}]: ${a.image.slice(0, 120)}` });
    }
  }
} catch (e) {
  problems.push({ severity: "WARN", where: "articles", detail: "could not audit articles: " + e.message });
}

// ---- report ----
const fails = problems.filter((p) => p.severity === "FAIL");
const warns = problems.filter((p) => p.severity === "WARN");

console.log(`\nChecked ${stats.pages} pages, ${stats.pageImages} page images, ${stats.cmsUrls} CMS-stored URLs.`);
console.log(`FAILs: ${fails.length}   WARNs: ${warns.length}`);

if (problems.length) {
  console.log("\n" + problems.map((p) => `[${p.severity}] ${p.where}\n        ${p.detail}`).join("\n"));
}

if (fails.length > 0) {
  console.log("\nRESULT: BROKEN IMAGES FOUND");
  process.exit(1);
}
console.log("\nRESULT: CLEAN");
