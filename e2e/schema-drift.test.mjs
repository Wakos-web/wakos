/**
 * Schema drift — migrations vs live database.
 *
 * Parses every `supabase/migrations/*.sql` for the schema it expects:
 *   - `ALTER TABLE <t> ADD COLUMN [IF NOT EXISTS] <c> <type>;`
 *   - `CREATE TABLE [IF NOT EXISTS] <t> (...)`
 * then asks the live database which of those actually exist (one request:
 * PostgREST's OpenAPI introspection endpoint exposes every table's columns
 * to the service role). A migration whose tables/columns are not all present
 * on the live DB is UNAPPLIED — this checkout has no DDL path to the hosted
 * database, so migrations are applied manually via the Supabase SQL editor.
 *
 * Verdict per migration:
 *   APPLIED                every table/column it expects exists on the live DB
 *   UNAPPLIED              at least one expected table/column is missing
 *   NOT COLUMN-VERIFIABLE  no schema expectations (RLS policies, seeds, inserts)
 *
 * Policy: NEW drift fails. Migrations listed in EXPECTED_PENDING are
 * known-unapplied (awaiting a manual SQL-editor run), so the suite stays
 * green while they wait — but any migration NOT in that list failing to
 * match the live DB is a hard failure. Once a pending migration is applied,
 * the test nags to remove its (now stale) entry.
 *
 *   node --env-file=.env.local --test e2e/schema-drift.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MIGRATIONS_DIR = fileURLToPath(new URL("../supabase/migrations/", import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required — run with: node --env-file=.env.local --test e2e/schema-drift.test.mjs");
  process.exit(1);
}

/** Migrations known to be pending on the hosted DB (awaiting a manual SQL-editor run). */
const EXPECTED_PENDING = ["033", "034"];

/** "033_submission_rejection_notes.sql" → "033" */
function fileNumber(file) {
  return file.slice(0, 3);
}

/** Unquoted postgres identifiers fold to lowercase; quote chars are optional in our SQL. */
function unquoteIdent(raw) {
  return raw.replace(/^["'`]|["'`]$/g, "").toLowerCase();
}

/**
 * Extract schema expectations from one migration's SQL. Line comments are
 * stripped first so prose in the header can never fake a statement, then
 * whitespace (including newlines between ALTER TABLE and ADD COLUMN) is
 * collapsed before matching. CREATE TABLE gives table names; ALTER TABLE …
 * ADD COLUMN gives table.column pairs. Non-public schemas are ignored
 * (PostgREST only exposes public, and every migration here targets public).
 */
function parseExpectations(sql) {
  const flat = sql
    .replace(/--[^\n]*/g, " ") // line comments
    .replace(/\s+/g, " "); // collapse newlines inside statements

  const tables = [];
  const createRe = /create\s+(?:or\s+replace\s+)?table\s+(?:if\s+not\s+exists\s+)?(?:["'`]?(\w+)["'`]?\.)?["'`]?(\w+)["'`]?\s*\(/gi;
  for (let m; (m = createRe.exec(flat)); ) {
    const schema = unquoteIdent(m[1] || "public");
    if (schema === "public") tables.push(unquoteIdent(m[2]));
  }

  const columns = [];
  const alterRe = /alter\s+table\s+(?:only\s+)?(?:if\s+exists\s+)?(?:["'`]?(\w+)["'`]?\.)?["'`]?(\w+)["'`]?\s+add\s+column\s+(?:if\s+not\s+exists\s+)?["'`]?(\w+)["'`]?/gi;
  for (let m; (m = alterRe.exec(flat)); ) {
    const schema = unquoteIdent(m[1] || "public");
    if (schema === "public") columns.push({ table: unquoteIdent(m[2]), column: unquoteIdent(m[3]) });
  }

  return { tables, columns };
}

function readMigrations() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((file) => ({ file, number: fileNumber(file), ...parseExpectations(readFileSync(MIGRATIONS_DIR + file, "utf8")) }));
}

/** table → Set(column), from PostgREST's OpenAPI introspection (service role). */
async function fetchLiveSchema() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  assert.equal(res.ok, true, `OpenAPI introspection failed: HTTP ${res.status} — cannot verify drift`);
  const spec = await res.json();
  const schema = {};
  for (const [table, def] of Object.entries(spec.definitions ?? {})) {
    schema[table.toLowerCase()] = new Set(Object.keys(def.properties ?? {}).map(unquoteIdent));
  }
  return schema;
}

test("parser extracts CREATE TABLE and ALTER TABLE ADD COLUMN expectations", () => {
  const { tables, columns } = parseExpectations(`
    -- prose mentioning ALTER TABLE clubs ADD COLUMN fake_col must be ignored
    CREATE TABLE IF NOT EXISTS alumni_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid()
    );
    CREATE TABLE IF NOT EXISTS public.social_links (
      id UUID PRIMARY KEY
    );
    ALTER TABLE public.club_applications
      ADD COLUMN IF NOT EXISTS rejected_notes TEXT;
    ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_method TEXT;
    alter table club_post_media add column if not exists youtube_url text;
    ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "Quoted" ADD COLUMN "Col" TEXT;
  `);
  assert.deepEqual(tables, ["alumni_profiles", "social_links"]);
  assert.deepEqual(columns, [
    { table: "club_applications", column: "rejected_notes" },
    { table: "donations", column: "payment_method" },
    { table: "club_post_media", column: "youtube_url" },
    { table: "quoted", column: "col" },
  ]);
});

test("migrations match the live database (no unapplied drift beyond EXPECTED_PENDING)", { timeout: 30000 }, async () => {
  const migrations = readMigrations();
  assert.ok(migrations.length >= 30, `expected the full migration set, found ${migrations.length}`);
  const live = await fetchLiveSchema();

  const report = [];
  const unapplied = [];
  const applied = [];
  const unverifiable = [];

  for (const mig of migrations) {
    const missingTables = mig.tables.filter((t) => !live[t]);
    const missingColumns = mig.columns.filter(({ table, column }) => !live[table]?.has(column));
    if (mig.tables.length === 0 && mig.columns.length === 0) {
      unverifiable.push(mig.file);
    } else if (missingTables.length || missingColumns.length) {
      unapplied.push(mig);
      report.push(`  UNAPPLIED   ${mig.file}`);
      for (const t of missingTables) report.push(`                table ${t} missing entirely`);
      for (const { table, column } of missingColumns) report.push(`                ${table}.${column} missing`);
    } else {
      applied.push(mig.file);
    }
  }

  console.log(`\nSchema drift — ${migrations.length} migrations vs live DB (${Object.keys(live).length} tables)`);
  console.log(`  applied ${applied.length} · unapplied ${unapplied.length} · not column-verifiable ${unverifiable.length}`);
  if (report.length) console.log(report.join("\n"));
  if (unverifiable.length) console.log(`  no CREATE TABLE / ADD COLUMN to check: ${unverifiable.join(", ")}`);

  const pending = unapplied.filter((m) => EXPECTED_PENDING.includes(m.number));
  const unexpected = unapplied.filter((m) => !EXPECTED_PENDING.includes(m.number));
  const stale = EXPECTED_PENDING.filter((n) => !unapplied.some((m) => m.number === n));
  if (stale.length) {
    console.log(`  note: migration(s) ${stale.join(", ")} now applied on live DB — remove from EXPECTED_PENDING.`);
  }

  assert.deepEqual(
    unexpected.map((m) => m.file),
    [],
    `unapplied migration(s) not listed in EXPECTED_PENDING — apply them via the Supabase SQL editor, ` +
      `then remove them from EXPECTED_PENDING in this file:\n${report.join("\n") || "(see log)"}`
  );
  console.log(pending.length ? `  known-pending (EXPECTED_PENDING): ${pending.map((m) => m.file).join(", ")}` : "  no known-pending migrations.");
});
