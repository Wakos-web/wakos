/**
 * E2E regression: the alumni registration writes must never silently succeed
 * into duplicate data.
 *
 * Historical bug class (same as the accept-invite role-attach bug): the
 * existence-check reads in both the Pulse signup (submitJoin) and the
 * business-directory registration (submitForm) DROPPED their read errors. A
 * transient read failure made `existing` null, the flow fell through to
 * INSERT, and — with no unique constraint on alumni_profiles.email — a
 * duplicate profile was created while the UI reported success. The email-link
 * in useAlumniAuth (.maybeSingle()) then errored on the duplicate, pushing the
 * same email back to "register again" and compounding the mess.
 *
 * Fix under test:
 *   1. Migration 025 adds a UNIQUE index on alumni_profiles(lower(email)),
 *      so a duplicate insert fails loudly (23505) instead of silently
 *      creating a second row.
 *   2. Both existence-check reads now surface errors instead of proceeding
 *      as if no profile existed.
 *
 * The walk (live site, real browser):
 *   - Seeds an auth user + an APPROVED alumni profile for the same email.
 *   - Signs into the Pulse with that email/password (gate login path).
 *   - Registers a business with the same email via the business-directory
 *     register page — the signed-in fast path skips OTP and must attach the
 *     business to the EXISTING profile (no duplicate).
 *   - Asserts exactly ONE alumni_profiles row exists for the email after the
 *     walk, the business row exists and references that one profile.
 *   - Asserts the DB backstop: a direct second insert of the same email
 *     errors (23505) instead of creating a duplicate.
 *
 * Needs: SUPABASE_SERVICE_ROLE_KEY (.env.local), E2E_BASE_URL, Chrome/Edge.
 * Run:   npm run test:e2e
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { launchChrome } from "./cdp.mjs";

const BASE_URL = process.env.E2E_BASE_URL || "https://wacos.alerotek.co.ke";

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
if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required (.env.local or env)");

const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const stamp = Date.now();
const EMAIL = "e2e.alumni." + stamp + "@example.com";
const NAME = "E2E Alumni Write Tester";
const PASSWORD = "Alumni!Passw0rd-" + stamp;
const BIZ = "E2E Test Farm";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cleanup(userId, profileId) {
  try {
    // businesses cascade off the profile; profile cascades off the auth user.
    if (userId) await service.auth.admin.deleteUser(userId);
    else if (profileId) await service.from("alumni_profiles").delete().eq("id", profileId);
  } catch (e) {
    console.error("cleanup error (non-fatal):", e.message);
  }
}

/**
 * Click the submit button whose text contains `label`. The gate has TWO
 * elements reading "Log in" — a tab toggle and the real submit — so a naive
 * first-match click hits the toggle and nothing happens.
 */
async function clickSubmitByText(page, label) {
  const clicked = await page.eval(`(() => {
    const el = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => (b.innerText || '').trim().includes(${JSON.stringify(label)}));
    if (!el) return 'not-found';
    el.click();
    return 'clicked';
  })()`);
  if (clicked !== "clicked") throw new Error(`clickSubmitByText("${label}"): submit button not found`);
  await sleep(120);
}

/**
 * Fill an input by its placeholder (index-based fill is fragile here).
 * Polls briefly: during client-side hydration the DOM is torn down and
 * re-created once, so a field can briefly vanish right after it appears.
 */
async function fillByPlaceholder(page, placeholder, value) {
  const set = `(() => {
    const el = Array.from(document.querySelectorAll('input')).find(i => (i.placeholder || '').includes(${JSON.stringify(placeholder)}));
    if (!el) return 'not-found';
    const proto = HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok';
  })()`;
  const deadline = Date.now() + 8000;
  let got = "";
  while (Date.now() < deadline) {
    got = await page.eval(set);
    if (got === "ok") break;
    await sleep(200);
  }
  if (got !== "ok") throw new Error(`fillByPlaceholder("${placeholder}"): input not found`);
  await sleep(60);
}

test(
  "business registration with an existing approved email attaches, never duplicates; DB blocks duplicate insert",
  { timeout: 120000 },
  async () => {
    let userId = null;
    let profileId = null;
    let chrome = null;
    try {
      // ---- 1. seed auth user + approved profile for the same email ----
      const created = await service.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
      });
      userId = created.data?.user?.id;
      if (!userId) throw new Error("could not create the seeded auth user");

      const { data: profile, error: pErr } = await service
        .from("alumni_profiles")
        .insert({
          user_id: userId,
          full_name: NAME,
          email: EMAIL.toLowerCase(),
          graduation_year: 2015,
          programme: "O-Level",
          is_public: true,
          approved: true,
        })
        .select("id")
        .single();
      if (pErr) throw new Error("seed profile failed: " + pErr.message);
      profileId = profile.id;

      // ---- 2. drive the Pulse gate: password login for that email ----
      chrome = await launchChrome();
      const page = chrome.page;
      await page.enable();
      await page.navigate(`${BASE_URL}/alumni`);
      await page.waitFor(
        "document.body.innerText.includes('The WACOS Pulse') || document.body.innerText.includes('Pulse')",
        { timeout: 30000 },
      );
      // The gate default is the password login form (mode=login, useCode=false).
      // NB: fill by placeholder — the login form may sit beside other inputs,
      // and "Log in" must target the SUBMIT button, not the tab toggle.
      await page.waitFor("document.querySelector('input[type=\"password\"]') !== null", { timeout: 30000 });
      await fillByPlaceholder(page, "you@example.com", EMAIL);
      await fillByPlaceholder(page, "password", PASSWORD);
      await clickSubmitByText(page, "Log in");
      // Gate resolves the approved profile -> the Pulse chat shell renders
      // with the "All Updates" channel and the alumnus's own profile visible.
      await page.waitFor(
        `document.body.innerText.includes('All Updates') && document.body.innerText.includes(${JSON.stringify(NAME)})`,
        { timeout: 30000 },
      );
      const afterLogin = await page.text();
      assert.ok(
        !/Enter the email and password/.test(afterLogin),
        "gate should resolve into the Pulse after password login (no login form left behind)",
      );
      assert.ok(
        /edit profile/.test(afterLogin),
        "Pulse should show the signed-in alumnus's profile identity (edit profile affordance)",
      );

      // ---- 3. register a business with the SAME email (signed-in fast path) ----
      await page.navigate(`${BASE_URL}/alumni/directory/register`);
      await page.waitFor("document.body.innerText.includes('List your business on the alumni directory')", { timeout: 30000 });
      // The form fields hydrate client-side after the SSR heading — wait for
      // the first field so a fast fill can't race hydration.
      await page.waitFor(
        "Array.from(document.querySelectorAll('input')).some(i => (i.placeholder || '').includes('Your full name'))",
        { timeout: 30000 },
      );

      // Signed-in alumnus -> their primary email (and details) prefill from
      // their alumni profile; the business contact fields below are separate.
      const prefillDeadline = Date.now() + 10000;
      let prefilledEmail = "";
      while (Date.now() < prefillDeadline) {
        prefilledEmail = await page.eval(
          "(() => { const el = Array.from(document.querySelectorAll('input')).find(i => (i.placeholder || '').includes('you@example.com')); return el ? el.value : ''; })()",
        );
        if (prefilledEmail.toLowerCase() === EMAIL.toLowerCase()) break;
        await sleep(300);
      }
      assert.equal(
        prefilledEmail.toLowerCase(),
        EMAIL.toLowerCase(),
        "a signed-in alumnus should find their primary email prefilled on the register form",
      );

      // Fill every required field (idempotent — safe to repeat on retry).
      const fillAllFields = async () => {
        await fillByPlaceholder(page, "Your full name", NAME);
        await fillByPlaceholder(page, "you@example.com", EMAIL);
        // graduation year <select>
        const yr = await page.eval(`(() => {
          const el = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === '2015'));
          if (!el) return 'no-select';
          const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
          setter.call(el, '2015');
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return 'ok';
        })()`);
        if (yr !== "ok") throw new Error("graduation-year select not found on the register form");
        await fillByPlaceholder(page, "e.g. Green Valley Farms", BIZ);
        // Business contact email is mandatory on the listing (never shown as text).
        await fillByPlaceholder(page, "orders@yourbusiness.com", "orders." + stamp + "@example.com");
        await fillByPlaceholder(page, "e.g. +256 700 123456", "+256 700 123456");
      };

      await fillAllFields();
      // Signed in on the same email -> no OTP step; business attaches directly.
      // Hydration race safety: if a click lands before React wired the submit
      // handler, nothing visibly happens — refill and retry a bounded number of
      // times; surface validation/runtime errors instead of timing out blind.
      // NB: no bare "already" — the page's static help line ("Already have a
      // Pulse account?…") would false-positive.
      const FORM_ERROR = /Enter your full name\.|Enter a valid email|Pick your graduation year|Enter your business name|session ended|row-level security|null value|violates unique|could not be activated|That code|This email is already/i;
      const submitDeadline = Date.now() + 45000;
      let doneText = "";
      let attempts = 0;
      while (Date.now() < submitDeadline && attempts < 4) {
        attempts += 1;
        if (attempts > 1) await fillAllFields();
        await clickSubmitByText(page, "Verify my email & submit");
        const phaseStart = Date.now();
        while (Date.now() - phaseStart < 9000 && Date.now() < submitDeadline) {
          doneText = await page.text();
          if (/Business submitted/.test(doneText)) break;
          const m = FORM_ERROR.exec(doneText);
          if (m) {
            throw new Error(
              "register form surfaced an error: " + m[0] + " (attempt " + attempts + ")",
            );
          }
          await sleep(400);
        }
        if (/Business submitted/.test(doneText)) break;
      }
      assert.ok(
        /Business submitted/.test(doneText),
        "business should attach without an OTP step for a signed-in same-email user; got: " +
          doneText.slice(0, 220),
      );

      // ---- 4. exactly ONE profile row must exist for the email ----
      const { data: rows } = await service
        .from("alumni_profiles")
        .select("id, user_id, email")
        .ilike("email", EMAIL);
      assert.equal(rows?.length, 1, "exactly one alumni profile must exist for the email (no silent duplicate)");
      assert.equal(rows[0].id, profileId, "the existing profile must be the one kept");

      // ---- 5. the business row exists and references that single profile ----
      const { data: biz } = await service
        .from("alumni_businesses")
        .select("id, owner_id, name, approved, email, whatsapp")
        .eq("owner_id", profileId);
      const mine = (biz || []).filter((b) => b.name === BIZ);
      assert.equal(mine.length, 1, "business should not be duplicated");
      assert.equal(mine[0].owner_id, profileId, "business should attach to the kept profile");
      assert.equal(mine[0].email, "orders." + stamp + "@example.com", "business contact email should persist (lowercased)");
      assert.equal(mine[0].whatsapp, "+256 700 123456", "whatsapp number should persist as typed");

      // ---- 6. DB backstop: a direct second insert of the same email errors ----
      const dup = await service
        .from("alumni_profiles")
        .insert({
          user_id: userId,
          full_name: NAME + " Dup",
          email: EMAIL.toLowerCase(),
          graduation_year: 2016,
          programme: "A-Level",
          approved: true,
        });
      assert.ok(
        dup.error,
        "duplicate email insert must fail loudly (unique index from migration 025)",
      );
      assert.equal(dup.error.code, "23505", "expected a unique-violation code");

      // ---- 7. UI hardening: existence-read failure is surfaced, not silent ----
      // Can't force a network failure deterministically, but the code path is
      // unit-visible: submitJoin/submitForm now throw/setError on lookErr.
      // Here we just confirm the page still renders both surfaces cleanly.
      const consoleErrors = page.consoleErrors().filter((e) => !/download the React DevTools/i.test(e));
      assert.deepEqual(consoleErrors, [], "no uncaught console errors during the walk");
    } finally {
      if (chrome) await chrome.page.close();
      await cleanup(userId, profileId);
    }
  },
);