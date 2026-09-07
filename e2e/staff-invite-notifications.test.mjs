/**
 * E2E: the invite-activation notifications reach the inviting admin.
 *
 * Regression coverage for the notifyInvitingAdmin feature (admin-server.ts):
 * every accept-invite outcome emails the staff member who issued the invite —
 *   • success  -> "Invite accepted: <name> is now <role>"
 *   • failure  -> "Invite activation failed: <name>" (with the reason)
 * The notifications are best-effort (a mail hiccup must never block the
 * accept flow), so an explicit test is the only guard that they actually send.
 *
 * How it works (two browser walks, one test):
 *   1. Seed THREE auth users: a throwaway inviter (real uid so the created_by
 *      FK resolves) plus two invitees.
 *   2. Seed a SUCCESS pending invite (club_patron, created_by = the inviter)
 *      with a known acceptance-code hash, and a FAILURE pending invite whose
 *      created_by is a fake UUID -> the user_roles insert hits the FK and the
 *      accept handler must fail LOUDLY (no phantom "welcome aboard").
 *   3. Drive /admin/accept-invite?email=…&code=… in real Chrome for the
 *      success invite, set a password, accept, and watch the dashboard open.
 *   4. Relaunch a fresh browser (clears the success session) and repeat for the
 *      failure invite — the page must surface the activation error.
 *   5. Read Resend's API (GET /emails) and assert BOTH notification emails —
 *      "Invite accepted: …" and "Invite activation failed: …" — arrived for
 *      the inviter's address.
 *
 * Run:   npm run test:e2e
 * Needs: SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY (read from .env.local),
 *        a reachable E2E_BASE_URL (defaults to live site), Chrome/Edge
 *        (override with CHROME_PATH).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
if (!RESEND_KEY) throw new Error("RESEND_API_KEY is required (.env.local or env) — the notifications are read back from Resend's API");

const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// Unique per run so Resend's list filter is exact and cleanup is precise.
const stamp = Date.now();
const INVITER = "e2e.notify.inviter." + stamp + "@alerotek.co.ke";
const OK_EMAIL = "e2e.notify.ok." + stamp + "@alerotek.co.ke";
const FAIL_EMAIL = "e2e.notify.fail." + stamp + "@alerotek.co.ke";
const OK_NAME = "E2E Notify OK Tester";
const FAIL_NAME = "E2E Notify Fail Tester";
const OK_CODE = String(Math.floor(100000 + Math.random() * 900000));
const FAIL_CODE = String(Math.floor(100000 + Math.random() * 900000));
const PASSWORD = "Notify!Passw0rd-" + stamp;
// A well-formed UUID that does NOT exist in auth.users -> user_roles insert FK
// violation inside the accept handler (the loud-failure path).
const FAKE_CREATED_BY = "00000000-0000-4000-8000-000000000000";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function otpHash(code, email) {
  return createHash("sha256").update(`${email.toLowerCase()}::${code}`).digest("hex");
}

function farFuture() {
  return new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Poll Resend's API for an email to `toEmail` whose subject starts with
 * `subjectPrefix`, returning the newest match. Resend's `to` query param is
 * not an exact filter, so we fetch a window and filter client-side; the
 * recipient address is unique per run, so matches can't bleed across runs.
 * Delivery events (delivered/bounced) are ignored — the subject carries the
 * assertion, and unknown local parts on @alerotek.co.ke bounce by design.
 */
async function waitForNotificationEmail(subjectPrefix, toEmail, { timeout = 45000, interval = 2000 } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const res = await fetch("https://api.resend.com/emails?limit=50", {
      headers: { Authorization: `Bearer ${RESEND_KEY}` },
    });
    if (!res.ok) {
      // Auth/config failures never resolve themselves — surface them instead
      // of polling silently to a confusing timeout.
      throw new Error("Resend list replied " + res.status + ": " + (await res.text()).slice(0, 160));
    }
    const j = await res.json();
    const want = toEmail.toLowerCase();
    const candidates = (j.data || []).filter(
      (e) =>
        (e.to || []).some((t) => String(t).toLowerCase() === want) &&
        String(e.subject || "").startsWith(subjectPrefix),
    );
    const row = [...candidates].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
    if (row) return { subject: row.subject, id: row.id, event: row.last_event };
    await sleep(interval);
  }
  throw new Error(
    `No Resend email "${subjectPrefix}…" observed for ${toEmail} within ${timeout}ms`,
  );
}

/** Drive the accept-invite page for one seeded invite and return { ok, text }. */
async function acceptInviteWalk(email, code, expectError) {
  const chrome = await launchChrome();
  try {
    const page = chrome.page;
    await page.enable();
    const url = `${BASE_URL}/admin/accept-invite?email=${encodeURIComponent(email)}&code=${code}`;
    await page.navigate(url);

    await page.waitFor(
      "document.querySelectorAll('input').length >= 4 && document.body.innerText.includes('Accept your invite')",
      { timeout: 30000 },
    );
    await page.fillInput(2, PASSWORD);
    await page.fillInput(3, PASSWORD);
    await page.clickByText("Accept invite & sign in");

    if (expectError) {
      // Loud failure: the activation error must be shown, NOT a dashboard.
      const errText = await page.waitFor(
        "document.body.innerText.includes('could not be activated')",
        { timeout: 45000, interval: 400 },
      );
      const pathNow = await page.eval("location.pathname");
      return { ok: false, errText, path: pathNow };
    }

    // Success: dashboard opens for the accepted identity.
    const deadline = Date.now() + 60000;
    let body = "";
    while (Date.now() < deadline) {
      body = await page.text();
      if (/Admin Dashboard/i.test(body) && body.includes(email)) break;
      await sleep(400);
    }
    assert.match(body, /Admin Dashboard/i, "dashboard should open after a successful accept");
    assert.ok(body.includes(email), "signed-in identity should be the accepted invitee");
    return { ok: true, body };
  } finally {
    await chrome.page.close();
  }
}

async function cleanup(ids) {
  const { inviterId, okId, failId } = ids;
  const emails = [INVITER, OK_EMAIL, FAIL_EMAIL];
  try {
    await service.from("staff_invites").delete().or(emails.map((e) => `email.ilike.${e}`).join(","));
  } catch (e) {
    console.error("cleanup invites (non-fatal):", e.message);
  }
  // Delete invitee users first (their user_roles cascade), inviter last so the
  // created_by FK on any surviving role row never blocks the delete.
  for (const id of [okId, failId, inviterId]) {
    if (!id) continue;
    try {
      await service.auth.admin.deleteUser(id);
    } catch (e) {
      console.error("cleanup auth user (non-fatal):", e.message);
    }
  }
}

test(
  "accept-invite notifications: accepted + activation-failed emails reach the inviting admin",
  { timeout: 240000 },
  async () => {
    const ids = { inviterId: null, okId: null, failId: null };
    try {
      // ---- 1. seed the inviter + both invitees (real auth users) ----
      const inviter = await service.auth.admin.createUser({
        email: INVITER,
        email_confirm: true,
        password: "Seed-" + stamp + "-inv",
      });
      ids.inviterId = inviter.data?.user?.id;
      const okUser = await service.auth.admin.createUser({
        email: OK_EMAIL,
        email_confirm: true,
        password: "Seed-" + stamp + "-ok",
      });
      ids.okId = okUser.data?.user?.id;
      const failUser = await service.auth.admin.createUser({
        email: FAIL_EMAIL,
        email_confirm: true,
        password: "Seed-" + stamp + "-fail",
      });
      ids.failId = failUser.data?.user?.id;
      for (const [label, id] of [["inviter", ids.inviterId], ["ok invitee", ids.okId], ["fail invitee", ids.failId]]) {
        if (!id) throw new Error("could not create the " + label + " auth user");
      }

      // ---- 2. seed the two pending invites (known code hashes, no email) ----
      const { error: okErr } = await service.from("staff_invites").insert({
        email: OK_EMAIL,
        name: OK_NAME,
        role: "club_patron",
        status: "pending",
        created_by: ids.inviterId,
        notes: "Invited by " + INVITER,
        otp_code_hash: otpHash(OK_CODE, OK_EMAIL),
        otp_expires_at: farFuture(),
        otp_attempts: 0,
      });
      if (okErr) throw new Error("seed success invite failed: " + okErr.message);

      const { error: failErr } = await service.from("staff_invites").insert({
        email: FAIL_EMAIL,
        name: FAIL_NAME,
        role: "club_patron",
        status: "pending",
        // Fake uid -> user_roles FK violation inside the accept handler. The
        // notification resolver falls back to the "Invited by" note.
        created_by: FAKE_CREATED_BY,
        notes: "Invited by " + INVITER,
        otp_code_hash: otpHash(FAIL_CODE, FAIL_EMAIL),
        otp_expires_at: farFuture(),
        otp_attempts: 0,
      });
      if (failErr) throw new Error("seed failure invite failed: " + failErr.message);

      // ---- 3. success walk: accept -> dashboard opens, inviter notified ----
      const okWalk = await acceptInviteWalk(OK_EMAIL, OK_CODE, false);
      assert.equal(okWalk.ok, true, "successful accept should open the dashboard");

      // ---- 4. failure walk: fresh browser -> loud error, inviter notified ----
      const failWalk = await acceptInviteWalk(FAIL_EMAIL, FAIL_CODE, true);
      assert.equal(failWalk.ok, false, "the activation-failure walk should surface an error");
      assert.match(
        failWalk.path,
        /accept-invite/,
        "the failure must NOT navigate to the dashboard",
      );

      // ---- 5. assert BOTH notification emails arrived for the inviter ----
      const accepted = await waitForNotificationEmail("Invite accepted:", INVITER);
      assert.ok(
        accepted.subject.includes(OK_NAME) && accepted.subject.includes("Club Patron"),
        `accepted-email subject should name the invitee + role: "${accepted.subject}"`,
      );

      const failed = await waitForNotificationEmail("Invite activation failed:", INVITER);
      assert.ok(
        failed.subject.includes(FAIL_NAME),
        `failed-email subject should name the invitee: "${failed.subject}"`,
      );
    } finally {
      await cleanup(ids);
    }
  },
);
