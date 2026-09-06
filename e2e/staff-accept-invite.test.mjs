/**
 * E2E: accepting a staff invite lands the user on the admin dashboard
 * WITHOUT a full page reload and WITHOUT seeing the login screen again.
 *
 * Regression coverage for two historical bugs:
 *   1. Accepting an invite set the staff cookie AFTER AdminPage had already
 *      booted, so SPA-navigating to /admin showed the login screen until a
 *      manual reload (fixed by re-running boot() when leaving accept-invite).
 *   2. `?code=123456` arrived from the emailed link as a NUMBER (TanStack
 *      search coercion), so the code field was never prefilled.
 *
 * How it works:
 *   - Seeds a pending staff_invites row directly in Supabase with a known
 *     one-time code (same sha256(email::code) hash the server uses) — no
 *     email round-trip needed.
 *   - Drives real headless Chrome to /admin/accept-invite?email=…&code=…,
 *     accepts the invite, and waits for the dashboard.
 *   - Asserts exactly ONE document load happened (the initial accept page).
 *     A dashboard that needed a hard reload (or that forced a second page
 *     load) would register two Page.loadEventFired events.
 *   - Cleans up the test invite + auth user afterwards.
 *
 * Run:   npm run test:e2e
 * Needs: SUPABASE_SERVICE_ROLE_KEY + SUPABASE_URL (read from .env.local if
 *        present), a reachable E2E_BASE_URL (defaults to the live site), and
 *        Chrome/Edge (override with CHROME_PATH).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { launchChrome } from "./cdp.mjs";

const BASE_URL = process.env.E2E_BASE_URL || "https://wacos.alerotek.co.ke";

// ---- env loading (service role key lives in .env.local, never in git) ----
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
if (!SERVICE_KEY) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required (set it in the environment or .env.local)",
  );
}

const ADMIN_EMAIL = "e2e.accept." + Date.now() + "@alerotek.co.ke";
const ADMIN_NAME = "E2E Accept Tester";
const ADMIN_ROLE = "admin"; // broad, but NOT super_admin (staff tab must be hidden)
const OTP_CODE = String(Math.floor(100000 + Math.random() * 900000));
const PASSWORD = "E2e!Passw0rd-" + Date.now();

function otpHash(code, email) {
  return createHash("sha256")
    .update(`${email.toLowerCase()}::${code}`)
    .digest("hex");
}

const service = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function cleanup(testUserId) {
  try {
    if (testUserId) {
      // user_roles cascades to role_scopes; deleting the auth user removes both.
      await service.auth.admin.deleteUser(testUserId);
    }
    await service
      .from("staff_invites")
      .delete()
      .ilike("email", ADMIN_EMAIL);
  } catch (e) {
    console.error("cleanup error (non-fatal):", e.message);
  }
}

test(
  "accept staff invite -> admin dashboard opens without reload or re-login",
  { timeout: 90000 },
  async () => {
    let testUserId = null;
    let chrome = null;
    try {
      // ---- 1. seed the pending invite with a known acceptance code ----
      const created = await service.auth.admin.createUser({
        email: ADMIN_EMAIL,
        email_confirm: true,
        password: "Seed-" + Date.now() + "x",
      });
      testUserId = created.data?.user?.id;
      if (!testUserId) throw new Error("could not create the seeded auth user");

      const farFuture = new Date(
        Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const { error: inviteErr } = await service.from("staff_invites").insert({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: ADMIN_ROLE,
        status: "pending",
        created_by: testUserId,
        notes: "Seeded by e2e accept-invite test",
        otp_code_hash: otpHash(OTP_CODE, ADMIN_EMAIL),
        otp_expires_at: farFuture,
        otp_attempts: 0,
      });
      if (inviteErr) throw new Error("seed invite failed: " + inviteErr.message);

      // ---- 2. drive the browser ----
      chrome = await launchChrome();
      const page = chrome.page;
      await page.enable();

      const acceptUrl = `${BASE_URL}/admin/accept-invite?email=${encodeURIComponent(
        ADMIN_EMAIL,
      )}&code=${OTP_CODE}`;
      await page.navigate(acceptUrl);

      // ---- 3. form appears with email + code prefilled (bug #2 regression) ----
      await page.waitFor(
        "document.querySelectorAll('input').length >= 4 && document.body.innerText.includes('Accept your invite')",
        { timeout: 30000 },
      );
      // The accept page finished its own load (its SSR + hydration) exactly once.
      assert.equal(
        page.countLoads(),
        1,
        "accept page should be the first & only load so far",
      );
      const prefill = await page.eval(
        "JSON.stringify(Array.from(document.querySelectorAll('input')).map(i => i.value))",
      );
      const vals = JSON.parse(prefill);
      assert.equal(vals[0], ADMIN_EMAIL, "email should prefill from the link");
      assert.equal(vals[1], OTP_CODE, "code should prefill from the link (numeric coercion bug)");

      // ---- 4. set a password and accept ----
      await page.fillInput(2, PASSWORD);
      await page.fillInput(3, PASSWORD);
      await page.clickByText("Accept invite & sign in");

      // ---- 5. land on /admin WITHOUT a reload or the login screen ----
      // Watch which screen appears first after the SPA transition. The whole
      // point of the boot()-on-leave fix is that the freshly issued cookie is
      // picked up without a reload AND without flashing the login screen.
      const deadline = Date.now() + 60000;
      let sawLogin = false;
      let landed = false;
      let lastText = "";
      let clickedOnce = false;
      const pollStart = Date.now();
      while (Date.now() < deadline) {
        lastText = await page.text();
        const path = (await page.eval("location.pathname")) || "";
        if (path === "/admin" && /Admin Dashboard/i.test(lastText) && lastText.includes(ADMIN_EMAIL)) {
          landed = true;
          break;
        }
        if (/Staff Portal/.test(lastText) && /Email me a code/.test(lastText)) {
          sawLogin = true;
          break;
        }
        // Resilience: if the accept form is still idle well after the click
        // (transient network hiccup), submit once more.
        const elapsed = Date.now() - pollStart;
        if (!clickedOnce && elapsed > 6000 && path === "/admin/accept-invite") {
          const hasSubmitBtn = await page.eval(
            "Array.from(document.querySelectorAll('button')).some(b => (b.innerText||'').includes('Accept invite & sign in'))",
          );
          if (hasSubmitBtn) {
            clickedOnce = true;
            await page.clickByText("Accept invite & sign in");
          }
        }
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!landed) {
        // Diagnostic: capture exactly what the page showed when the wait gave
        // up, so a failure is debuggable instead of a bare boolean.
        const diag = {
          path: await page.eval("location.pathname").catch(() => "?"),
          loads: page.countLoads(),
          text: lastText.slice(0, 400),
          consoleErrors: page.consoleErrors().slice(0, 3),
        };
        console.error("\n[diag] final state:", JSON.stringify(diag, null, 2));
      }
      assert.equal(
        sawLogin,
        false,
        "the login screen appeared after accepting — re-login should not be required",
      );
      assert.equal(landed, true, "dashboard never opened after accepting the invite");

      // Dashboard chrome visible with the fresh identity + role.
      assert.match(lastText, /Admin Dashboard/i, "dashboard header should render");
      assert.ok(
        lastText.includes(ADMIN_EMAIL),
        "signed-in email should be the accepted staff member",
      );
      assert.ok(
        /·\s*Admin/.test(lastText),
        "role label from the fresh session should read Admin",
      );

      // ---- 6. THE core assertion: no second document load happened ----
      // The whole point of the boot()-on-leave fix is that SPA navigation to
      // /admin picks up the cookie set during accept. A hard reload (the old
      // workaround) or a server redirect would fire another load event. Give
      // the dashboard a beat to finish its own data fetches, then check that
      // the document never reloaded.
      await new Promise((r) => setTimeout(r, 1500));
      assert.equal(
        (await page.eval("location.pathname")),
        "/admin",
        "final URL should be /admin",
      );
      const loadsAtEnd = page.countLoads();
      assert.equal(
        loadsAtEnd,
        1,
        `expected exactly one document load (initial accept page); got ${loadsAtEnd} — the dashboard required a reload`,
      );

      const consoleErrors = page.consoleErrors().filter(
        (e) => !/download the React DevTools/i.test(e),
      );
      assert.deepEqual(
        consoleErrors,
        [],
        "page should have no uncaught console errors",
      );
    } finally {
      if (chrome) await chrome.page.close();
      await cleanup(testUserId);
    }
  },
);
