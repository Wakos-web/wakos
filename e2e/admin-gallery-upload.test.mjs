/**
 * E2E: admin image uploads through the service-role proxy carry the file's
 * real MIME type, so the storage bucket policy (jpeg/png/webp only) accepts
 * them instead of failing with
 *   "Upload failed: mime type application/octet-stream is not supported".
 *
 * Regression coverage for: admin-client.ts fell back to application/octet-
 * stream when supabase-js sent the upload as a raw Blob body without a
 * Content-Type header — every admin upload gate (gallery, MWOSA media, hero,
 * club images…) failed.
 *
 * How it works:
 *   - Seeds a pending staff invite with a known OTP code and accepts it in
 *     real headless Chrome to obtain an admin session cookie.
 *   - Opens Page Content → Campus Gallery editor and attaches a real PNG to
 *     the file input via CDP DOM.setFileInputFiles.
 *   - Asserts the upload lands (a caption row appears, no error toast), saves,
 *     and that the stored object is publicly fetchable as image/png.
 *   - Cleans up: resets the gallery section, deletes the storage object and
 *     the seeded auth user.
 *
 * Run:   npm run test:e2e
 * Needs: SUPABASE_SERVICE_ROLE_KEY (env or .env.local), E2E_BASE_URL, Chrome.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
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
if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required (.env.local)");

const EMAIL = "e2e.upload." + Date.now() + "@alerotek.co.ke";
const OTP_CODE = String(Math.floor(100000 + Math.random() * 900000));
const PASSWORD = "E2e!Passw0rd-" + Date.now();
const otpHash = (code, email) =>
  createHash("sha256").update(`${email.toLowerCase()}::${code}`).digest("hex");

const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

/** 1x1 red PNG so the file is a genuine image the bucket will accept. */
const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** Attach a real PNG File to the Nth file input and fire change (React-safe). */
async function attachPng(page, inputIndex) {
  return page.eval(
    `(async () => {
      const inputs = document.querySelectorAll('input[type=file]');
      const el = inputs[${inputIndex}];
      if (!el) return 'no-input';
      const bytes = Uint8Array.from(atob(${JSON.stringify(PNG_B64)}), (c) => c.charCodeAt(0));
      const file = new File([bytes], 'e2e-upload-test.png', { type: 'image/png' });
      const dt = new DataTransfer();
      dt.items.add(file);
      el.files = dt.files;
      // React's delegated listener doesn't pick up JS-dispatched change events
      // reliably in this raw-CDP setup, so invoke the React onChange prop
      // directly with the same DOM event shape a real picker produces.
      const propsKey = Object.keys(el).find((k) => k.startsWith('__reactProps$'));
      if (propsKey && el[propsKey] && typeof el[propsKey].onChange === 'function') {
        el[propsKey].onChange({ target: el, currentTarget: el, bubbles: true });
        return 'attached+handler:' + el.files.length + ':' + el.files[0].type;
      }
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return 'attached:' + el.files.length + ':' + el.files[0].type;
    })()`,
  );
}

test("admin gallery upload keeps its real MIME type through the proxy", { timeout: 120000 }, async () => {
  let testUserId = null;
  let chrome = null;
  let uploadedPath = null;
  try {
    // ---- seed a pending admin invite with a known code ----
    const created = await service.auth.admin.createUser({
      email: EMAIL,
      email_confirm: true,
      password: "Seed-" + Date.now() + "x",
    });
    testUserId = created.data?.user?.id;
    if (!testUserId) throw new Error("could not create the seeded auth user");

    const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
    const { error: inviteErr } = await service.from("staff_invites").insert({
      email: EMAIL,
      name: "E2E Upload Tester",
      role: "admin",
      status: "pending",
      created_by: testUserId,
      notes: "Seeded by e2e admin-gallery-upload test",
      otp_code_hash: otpHash(OTP_CODE, EMAIL),
      otp_expires_at: farFuture,
      otp_attempts: 0,
    });
    if (inviteErr) throw new Error("seed invite failed: " + inviteErr.message);

    // ---- accept the invite to obtain the admin session ----
    chrome = await launchChrome();
    const page = chrome.page;
    await page.enable();
    await page.navigate(
      `${BASE_URL}/admin/accept-invite?email=${encodeURIComponent(EMAIL)}&code=${OTP_CODE}`,
    );
    await page.waitFor(
      "document.querySelectorAll('input').length >= 4 && document.body.innerText.includes('Accept your invite')",
      { timeout: 30000 },
    );
    await page.fillInput(2, PASSWORD);
    await page.fillInput(3, PASSWORD);
    await page.clickByText("Accept invite & sign in");
    await page.waitFor(
      "location.pathname === '/admin' && /admin dashboard/i.test(document.body.innerText)",
      { timeout: 45000 },
    );

    // ---- open the Campus Gallery editor ----
    await page.clickByText("Page Content");
    await page.waitFor("document.body.innerText.toLowerCase().includes('page content (')", { timeout: 30000 });
    const opened = await page.eval(`(() => {
      // The row's Edit affordance is an icon-only button (lucide-settings)
      // inside the section card whose text names the gallery.
      const cards = Array.from(document.querySelectorAll('div')).filter(
        (el) => el.className && String(el.className).includes('rounded-xl') && /gallery/i.test(el.textContent || '') && (el.textContent || '').length < 200,
      );
      const card = cards[0];
      if (!card) return 'no-card';
      const btn = Array.from(card.querySelectorAll('button')).find((b) =>
        Array.from(b.querySelectorAll('svg')).some((s) => (s.getAttribute('class') || '').includes('lucide-settings')),
      );
      if (!btn) return 'no-edit-btn';
      btn.click();
      return 'clicked';
    })()`);
    assert.equal(opened, "clicked", "gallery row edit button not found");
    await page.waitFor("document.body.innerText.includes('Upload photos')", { timeout: 15000 });

    // ---- attach a real PNG to the upload input ----
    const fileInputs = await page.eval("document.querySelectorAll('input[type=file]').length");
    assert.ok(fileInputs >= 1, "no file input in the gallery editor");
    const attached = await attachPng(page, 0);
    assert.match(String(attached), /^attached\+handler:1:image\/png$/, "file attach failed: " + attached);

    // ---- upload must succeed: a caption row appears, no error toast ----
    // Success signal: each uploaded photo gets a caption + alt input row.
    await page.waitFor("document.querySelectorAll('input').length >= 3", {
      timeout: 45000,
    });
    assert.ok(!/Upload failed/i.test(await page.text()), "upload failed toast shown");
    const body = await page.text();
    assert.ok(!/Upload failed/i.test(body), "upload failed toast shown: " + body.slice(-200));

    // ---- save and read back the stored object's content-type ----
    await page.clickByText("Save gallery");
    await page.waitFor("document.body.innerText.includes('Gallery saved') || !document.body.innerText.includes('Upload photos')", { timeout: 30000 });

    const { data: row } = await service
      .from("page_content")
      .select("content")
      .eq("page", "about")
      .eq("section", "gallery")
      .single();
    const images = row?.content?.images || [];
    assert.ok(images.length >= 1, "gallery images not persisted");
    const srcUrl = images[images.length - 1].src;
    const marker = "/storage/v1/object/public/";
    assert.ok(srcUrl.includes(marker), "src is not a storage public URL: " + srcUrl);
    uploadedPath = srcUrl.split(marker)[1]; // "uploads/gallery/<file>.png"

    // Storage can briefly 400 on a brand-new public object before the CDN
    // picks it up — retry a few times and surface the error body on failure.
    let pub = null;
    let ctype = "";
    let lastBody = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      pub = await fetch(srcUrl);
      lastBody = (await pub.text()).slice(0, 200);
      ctype = pub.headers.get("content-type") || "";
      if (pub.ok) break;
      await new Promise((r) => setTimeout(r, 2000));
    }
    assert.equal(pub.status, 200, `uploaded object is not publicly readable: ${lastBody}`);
    assert.match(ctype, /^image\/(png|jpeg|webp)/, `stored content-type is ${ctype} — MIME was lost`);

    // reset the section back to empty (bundled defaults return on the page)
    await service
      .from("page_content")
      .update({ content: { images: [] } })
      .eq("page", "about")
      .eq("section", "gallery");
  } finally {
    if (chrome) await chrome.page.close();
    try {
      if (uploadedPath) {
        await service.storage.from(uploadedPath.split("/")[0]).remove([uploadedPath.split("/").slice(1).join("/")]);
      }
    } catch (e) {
      console.error("storage cleanup error (non-fatal):", e.message);
    }
    try {
      if (testUserId) await service.auth.admin.deleteUser(testUserId);
      await service.from("staff_invites").delete().ilike("email", EMAIL);
    } catch (e) {
      console.error("cleanup error (non-fatal):", e.message);
    }
  }
});
