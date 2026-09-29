// One-off verification (not committed): proves on the LIVE worker that
//   1. super-admin passcode fallback login works (ADMIN_SECRET),
//   2. the Staff & Roles "Resend code" button (adminResendInviteCode) mints a
//      new code, stores its hash, and emails it via Resend,
//   3. the emailed code matches the stored hash sha256(email::code).
// Cleans up every row/user it creates.
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { launchChrome } from "../e2e/cdp.mjs";

// ---- env loading (same pattern as the e2e tests) ----
function loadEnvLocal() {
  const file = process.cwd() + "/.env.local";
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

const BASE_URL = env("E2E_BASE_URL", "https://wacos.mmwosasocials.workers.dev");
const SUPABASE_URL = env("SUPABASE_URL", "https://cykaheepeqcgmveckuru.supabase.co");
const SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_KEY = env("RESEND_API_KEY");
const ADMIN_SECRET = env("ADMIN_SECRET");
const SUPER_ADMIN_EMAIL = env("SUPER_ADMIN_EMAIL", "kevinalerotek@gmail.com");
if (!SERVICE_KEY || !RESEND_KEY || !ADMIN_SECRET) {
  console.error("Need SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ADMIN_SECRET in .env.local");
  process.exit(1);
}

const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const stamp = Date.now();
const INVITEE = `e2e.resend.verify.${stamp}@alerotek.co.ke`;

const otpHash = (code, email) =>
  createHash("sha256").update(`${email.toLowerCase()}::${code}`).digest("hex");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Newest Resend email to `toEmail` whose subject matches `subjectRe`. */
async function readEmailFromResend(toEmail, subjectRe, { timeout = 60000, since = new Date(0) } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const res = await fetch("https://api.resend.com/emails?limit=50", {
      headers: { Authorization: `Bearer ${RESEND_KEY}` },
    });
    if (!res.ok) throw new Error("Resend list " + res.status + ": " + (await res.text()).slice(0, 120));
    const j = await res.json();
    const want = toEmail.toLowerCase();
    const rows = (j.data || [])
      .filter(
        (e) =>
          (e.to || []).some((t) => t.toLowerCase() === want) &&
          subjectRe.test(e.subject || "") &&
          new Date(e.created_at + "Z") > since,
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (rows[0]) {
      const full = await (await fetch(`https://api.resend.com/emails/${rows[0].id}`, {
        headers: { Authorization: `Bearer ${RESEND_KEY}` },
      })).json();
      // Prefer the subject ("… code: 123456") — the body embeds the invitee's
      // email address, which can contain 6-digit runs of its own.
      const m = /code:\s*(\d{6})/.exec(rows[0].subject || "") || /\b(\d{6})\b/.exec(full.text || full.html || "");
      return { code: m ? m[1] : null, id: rows[0].id, subject: rows[0].subject };
    }
    await sleep(3000);
  }
  return null;
}

let chrome = null;
let testUserId = null;
let inviteId = null;
try {
  // ---- resolve the real super admin user for created_by ----
  const { data: users } = await service.auth.admin.listUsers({ perPage: 1000 });
  const superAdmin = (users?.users || []).find(
    (u) => u.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase(),
  );
  if (!superAdmin) throw new Error("super admin user not found: " + SUPER_ADMIN_EMAIL);

  // ---- seed a pending invite with NO code (so only the resend mints one) ----
  testUserId = (await service.auth.admin.createUser({
    email: INVITEE,
    email_confirm: true,
    password: "Seed-" + stamp + "x",
  })).data?.user?.id;
  const { data: invite, error: invErr } = await service.from("staff_invites").insert({
    email: INVITEE,
    name: "OTP Resend Verify",
    role: "alumni_patron",
    status: "pending",
    club_id: null,
    created_by: superAdmin.id,
    notes: "verify-otp-resend one-off",
  }).select("id").single();
  if (invErr) throw new Error("seed invite failed: " + invErr.message);
  inviteId = invite.id;
  console.log("seeded pending invite:", INVITEE, inviteId);

  const t0 = new Date();

  // ---- 1. super admin passcode fallback login on the LIVE worker ----
  chrome = await launchChrome();
  const page = chrome.page;
  await page.enable();
  await page.navigate(`${BASE_URL}/admin`);
  await page.waitFor(
    "document.body.innerText.toUpperCase().includes('STAFF PORTAL') && document.body.innerText.includes('Email me a code')",
    { timeout: 30000 },
  );
  // open the passcode fallback panel
  await page.clickByText("Email unavailable? Use the super admin passcode");
  await page.waitFor("document.body.innerText.includes('Sign in with passcode')", { timeout: 15000 });
  const inputs = JSON.parse(await page.eval("JSON.stringify(Array.from(document.querySelectorAll('input')).map(i => i.id))"));
  console.log("passcode panel inputs:", JSON.stringify(inputs));
  await page.fillInput(0, SUPER_ADMIN_EMAIL);
  await page.fillInput(1, ADMIN_SECRET);
  await page.clickByText("Sign in with passcode");
  await page.waitFor("document.body.innerText.toUpperCase().includes('ADMIN DASHBOARD')", { timeout: 30000 });
  console.log("✓ 1. super-admin passcode login works on", BASE_URL);

  // ---- 2. go to Staff & Roles, find the seeded invite, click Resend code ----
  await page.clickByText("Staff & Roles");
  await page.waitFor(`document.body.innerText.includes('${INVITEE}')`, { timeout: 30000 });
  const before = await readEmailFromResend(INVITEE, /invite/i, { timeout: 1500, since: t0 });
  if (before) throw new Error("unexpected pre-resend invite email");
  await page.eval(`
    (() => {
      const email = "${INVITEE}";
      const btns = Array.from(document.querySelectorAll('button[title="Email a fresh invite code"]'));
      const hit = btns.find((b) => {
        let el = b;
        for (let i = 0; i < 6 && el; i++) {
          if ((el.innerText || "").includes(email)) return true;
          el = el.parentElement;
        }
        return false;
      });
      if (!hit) {
        const all = Array.from(document.querySelectorAll("button")).map((b) => b.title || b.innerText.slice(0, 30));
        throw new Error("resend button not found; buttons: " + JSON.stringify(all).slice(0, 600));
      }
      hit.click();
    })()
  `);
  await page.waitFor(`document.body.innerText.includes('A fresh invite code was emailed to ${INVITEE}')`, { timeout: 20000 });
  console.log("✓ 2. adminResendInviteCode accepted (toast shown)");

  // ---- 3. catch the fresh code email and verify the stored hash ----
  const mail = await readEmailFromResend(INVITEE, /invite|code|wacos|wairaka/i, { timeout: 60000, since: t0 });
  if (!mail) throw new Error("no invite-code email arrived via Resend after clicking Resend");
  console.log("✓ 3a. resend email arrived:", JSON.stringify(mail.subject), "code:", mail.code);
  if (!/^\d{6}$/.test(mail.code || "")) throw new Error("could not read 6-digit code from email body");
  const { data: after } = await service.from("staff_invites").select("otp_code_hash").eq("id", inviteId).single();
  const expect = otpHash(mail.code, INVITEE);
  if (after?.otp_code_hash !== expect) {
    throw new Error(`hash mismatch!\n  stored:  ${after?.otp_code_hash}\n  sha256(email::code): ${expect}`);
  }
  console.log("✓ 3b. stored hash matches sha256(email::code) for the emailed code");
  console.log("\nALL CHECKS PASSED — email OTP + invite-code resend verified on", BASE_URL);
} catch (e) {
  console.error("VERIFY FAILED:", e.message);
  process.exitCode = 1;
} finally {
  try { if (chrome) await chrome.page.close(); } catch {}
  try {
    if (testUserId) await service.auth.admin.deleteUser(testUserId);
    if (inviteId) await service.from("staff_invites").delete().eq("id", inviteId);
    console.log("cleanup done (invite + auth user removed)");
  } catch (e) {
    console.error("cleanup error:", e.message);
  }
}
