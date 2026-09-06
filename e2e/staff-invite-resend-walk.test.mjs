/**
 * E2E: the FULL staff invite walk against the live site.
 *
 * Unlike staff-accept-invite.test.mjs (which seeds a known code hash and
 * skips the email), this test drives the real production path:
 *
 *   1. Seed a pending club_patron invite directly in Supabase (NO code hash —
 *      the server mints it).
 *   2. Open /admin in real Chrome, enter the invitee's email, click
 *      "Email me a code" — the server (adminSendLoginCode) generates the
 *      one-time code, stores its hash, and emails it via Resend.
 *   3. Read the code back from Resend's API (GET /emails?to=…), matching the
 *      invitee's email within the test's time window. The code rides in the
 *      email subject: "Your M.M College Wairaka sign-in code: 123456".
 *   4. Enter the code on the portal, get redirected to accept-invite (pending
 *      invite), set a password, accept.
 *   5. Assert the dashboard opens with the Club Patron role and EXACTLY the
 *      role-visible tabs: Overview / Clubs / Club Apps / Events — no Staff &
 *      Roles, no Alumni, no Class Notes.
 *   6. Assert the Clubs tab is row-scoped to the invited club only (Wildlife),
 *      proving the role scope attached during activation.
 *
 * Needs: SUPABASE_SERVICE_ROLE_KEY (read from .env.local), RESEND_API_KEY
 *        (read from .env.local), E2E_BASE_URL (defaults to live site),
 *        Chrome/Edge (CHROME_PATH override).
 * Run:   npm run test:e2e
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { launchChrome } from "./cdp.mjs";

const BASE_URL = process.env.E2E_BASE_URL || "https://wacos.alerotek.co.ke";

// ---- env loading (secrets live in .env.local, never in git) ----
function loadEnvLocal() {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
function env(name, fallback = "") {
  const local = loadEnvLocal();
  return process.env[name] || local[name] || fallback;
}

const SUPABASE_URL = env("SUPABASE_URL", "https://cykaheepeqcgmveckuru.supabase.co");
const SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_KEY = env("RESEND_API_KEY");
if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required (.env.local or env)");
if (!RESEND_KEY) throw new Error("RESEND_API_KEY is required (.env.local or env) — the code is read back from Resend's API");

const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// The invitee email must be unique per run so Resend's list filter is exact.
const stamp = Date.now();
const INVITEE = "e2e.walk." + stamp + "@alerotek.co.ke";
const INVITEE_NAME = "E2E Resend Walk Tester";
const PASSWORD = "Walk!Passw0rd-" + stamp;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Read the freshly-minted code from Resend's API for a given recipient. */
async function readCodeFromResend(toEmail, { timeout = 45000, interval = 2000 } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    // Note: Resend's `to` query param is NOT an exact filter (it can return
    // other recipients' rows), so we fetch a window and filter client-side by
    // exact recipient, then take the newest code email for THIS invitee.
    const res = await fetch(`https://api.resend.com/emails?limit=50`, {
      headers: { Authorization: `Bearer ${RESEND_KEY}` },
    });
    if (!res.ok) {
      // Auth/config failures never resolve themselves — surface them instead
      // of polling silently to a confusing timeout.
      throw new Error("Resend list replied " + res.status + ": " + (await res.text()).slice(0, 160));
    }
    const j = await res.json();
    const want = toEmail.toLowerCase();
    const candidates = (j.data || []).filter((e) =>
      (e.to || []).some((t) => t.toLowerCase() === want) &&
      /sign-in code:/.test(e.subject || ""),
    );
    // Newest first by created_at (Resend returns newest-first, but sort to be safe).
    const row = [...candidates].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
    if (row) {
      const m = /sign-in code:\s*(\d{6})/.exec(row.subject || "");
      if (m) return { code: m[1], subject: row.subject, id: row.id };
    }
    await sleep(interval);
  }
  throw new Error("No Resend sign-in code email observed for " + toEmail + " within " + timeout + "ms");
}

async function cleanup(testUserId) {
  try {
    if (testUserId) await service.auth.admin.deleteUser(testUserId);
    await service.from("staff_invites").delete().ilike("email", INVITEE);
  } catch (e) {
    console.error("cleanup error (non-fatal):", e.message);
  }
}

test(
  "full invite walk: server-minted code read from Resend API -> accept -> role tabs + club scope",
  { timeout: 180000 },
  async () => {
    let testUserId = null;
    let chrome = null;
    try {
      // ---- 1. seed the pending invite (no code — the /admin flow mints it) ----
      // Pick Wildlife club so the club_patron scope is concrete and checkable.
      const { data: club } = await service
        .from("clubs")
        .select("id, slug, name")
        .ilike("slug", "wildlife")
        .maybeSingle();
      if (!club) throw new Error("wildlife club not found to scope the invite");

      // created_by must reference a REAL auth user (user_roles.created_by FK).
      const { data: users } = await service.auth.admin.listUsers({ perPage: 1000 });
      const superAdmin = (users?.users || []).find(
        (u) => u.email?.toLowerCase() === "kevinalerotek@gmail.com",
      );
      if (!superAdmin) throw new Error("could not resolve the super admin uid for created_by");

      const created = await service.auth.admin.createUser({
        email: INVITEE,
        email_confirm: true,
        password: "Seed-" + stamp + "x",
      });
      testUserId = created.data?.user?.id;
      if (!testUserId) throw new Error("could not create the invitee auth user");

      const { error: inviteErr } = await service.from("staff_invites").insert({
        email: INVITEE,
        name: INVITEE_NAME,
        role: "club_patron",
        status: "pending",
        club_id: club.id,
        created_by: superAdmin.id,
        notes: "Seeded by e2e resend-walk test",
        // NOTE: no otp_code_hash — adminSendLoginCode mints and stores it.
      });
      if (inviteErr) throw new Error("seed invite failed: " + inviteErr.message);

      // ---- 2. drive /admin: request the code through the real UI ----
      chrome = await launchChrome();
      const page = chrome.page;
      await page.enable();
      await page.navigate(`${BASE_URL}/admin`);
      await page.waitFor(
        "document.body.innerText.toUpperCase().includes('STAFF PORTAL') && document.body.innerText.includes('Email me a code')",
        { timeout: 30000 },
      );

      await page.fillInput(0, INVITEE);
      await page.clickByText("Email me a code");

      // ---- 3. read the code back from Resend's API ----
      const { code } = await readCodeFromResend(INVITEE);
      assert.match(code, /^\d{6}$/, "code read from Resend should be 6 digits");

      // ---- 4. enter the code and walk the pending-invite redirect ----
      await page.waitFor("document.querySelectorAll('input').length >= 1 && document.body.innerText.includes('Code sent to')", { timeout: 30000 });
      await page.fillInput(0, code);
      await page.clickByText("Sign in");

      // Pending invite -> redirect to accept-invite with email + code prefilled.
      await page.waitFor(
        "document.body.innerText.includes('Accept your invite') && document.querySelectorAll('input').length >= 4",
        { timeout: 30000 },
      );
      const prefilled = JSON.parse(
        await page.eval("JSON.stringify(Array.from(document.querySelectorAll('input')).map(i => i.value))"),
      );
      assert.equal(prefilled[0], INVITEE, "accept page email should prefill from the walk");
      assert.equal(prefilled[1], code, "accept page code should prefill with the Resend-minted code");

      // ---- 5. set a password and accept ----
      await page.fillInput(2, PASSWORD);
      await page.fillInput(3, PASSWORD);
      await page.clickByText("Accept invite & sign in");

      // ---- 6. assert the dashboard + Club Patron role tabs ----
      const deadline = Date.now() + 60000;
      let body = "";
      while (Date.now() < deadline) {
        body = await page.text();
        if (/Admin Dashboard/i.test(body) && body.includes(INVITEE)) break;
        await sleep(400);
      }
      assert.match(body, /Admin Dashboard/i, "dashboard should open after accepting");
      assert.ok(body.includes(INVITEE), "signed-in identity should be the invitee");
      assert.ok(/·\s*Club Patron/.test(body), "role label should read Club Patron");

      // Exact role-visible tab set (club_patron -> overview/clubs/applications/events).
      for (const must of ["Overview", "Clubs", "Club Apps", "Events"]) {
        assert.ok(body.includes(must), `tab "${must}" should be visible for club_patron`);
      }
      for (const absent of ["Staff & Roles", "Alumni", "Class Notes", "Campus News", "Page Content", "Businesses", "Inquiries", "RSVPs", "MWOSA", "Giving"]) {
        assert.ok(!body.includes(absent), `tab "${absent}" must NOT be visible for club_patron`);
      }

      // ---- 7. assert row-level club scoping (only the invited club) ----
      await page.clickByText("Clubs");
      const clubsTab = await page.waitFor(
        "document.body.innerText.includes('Wildlife') || document.body.innerText.includes('No clubs')",
        { timeout: 30000 },
      );
      assert.ok(
        typeof clubsTab === "string" ? clubsTab.includes("Wildlife") : true,
        "Clubs tab should load",
      );
      const clubsBody = await page.text();
      assert.ok(/Wildlife/i.test(clubsBody), "invited club (Wildlife) should appear in the clubs list");
      assert.ok(!/Agriculture/i.test(clubsBody), "a club outside the patron's scope must not appear");

      const consoleErrors = page.consoleErrors().filter((e) => !/download the React DevTools/i.test(e));
      assert.deepEqual(consoleErrors, [], "no uncaught console errors during the walk");
    } finally {
      if (chrome) await chrome.page.close();
      await cleanup(testUserId);
    }
  },
);