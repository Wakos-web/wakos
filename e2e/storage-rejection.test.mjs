/**
 * Live integration test for storage-bucket upload rejections.
 *
 * The client-side validators (upload-guide.ts) catch most bad files, but
 * bucket policy still rejects files that slip past them — e.g. a GIF avatar
 * (client allows GIF, class-notes-photos does not) or a 6 MB JPG (client
 * allows 10 MB, the photo buckets cap at 5 MB). When that happens the raw
 * StorageApiError used to flash at the user:
 *
 *   mime type image/tiff is not supported        (statusCode "415")
 *   The object exceeded the maximum allowed size (statusCode "413")
 *
 * This test uploads REAL files (a TIFF with genuine magic bytes, a >5 MB
 * image) to the live bucket and asserts friendlyError() renders the plain
 * message instead of the raw text.
 *
 * Run:   node --test e2e/storage-rejection.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cykaheepeqcgmveckuru.supabase.co";
const ANON_KEY = "sb_publishable_BXQkhnpm3ha7O7ZjGrZlqg_Es95WeON";

// Load friendlyError by transpiling the real source (same trick as
// friendly-error.test.mjs).
let friendlyError;
try {
  const ts = await import("typescript");
  const srcPath = path.resolve(process.cwd(), "src/lib/friendly-error.ts");
  const source = fs.readFileSync(srcPath, "utf8");
  const out = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: srcPath,
  }).outputText;
  const dataUrl = "data:text/javascript;base64," + Buffer.from(out).toString("base64");
  const mod = await import(dataUrl);
  friendlyError = mod.friendlyError;
} catch (e) {
  console.warn("could not load friendly-error.ts:", e.message);
}

// Minimal real TIFF: little-endian header magic bytes "II*\0"
const tiffMagic = Buffer.from("49492a000800000000000000", "hex");
function tiffFile() {
  return new File([new Blob([tiffMagic])], "photo.tiff", { type: "image/tiff" });
}
function oversizeImage() {
  // 6 MB — above the 5 MB photo-bucket limit, below the client 10 MB check
  return new File([new Blob([new Uint8Array(6 * 1024 * 1024)])], "big.jpg", { type: "image/jpeg" });
}
function gifFile() {
  return new File([new Blob([Buffer.from("GIF89a", "utf8")])], "anim.gif", { type: "image/gif" });
}

const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
const stamp = Date.now();

test("real TIFF upload to the photo bucket maps to the friendly MIME message", { timeout: 30000 }, async () => {
  const { error } = await client.storage
    .from("class-notes-photos")
    .upload(`probe/tiff-${stamp}.tiff`, tiffFile(), { contentType: "image/tiff" });
  assert.ok(error, "TIFF must be rejected by the bucket policy");
  assert.equal(error.statusCode, "415", "storage should report invalid mime type");

  const got = friendlyError(error, "Couldn't upload your photo.");
  assert.ok(got.includes("That file type isn't supported"), `got: ${got}`);
  assert.ok(!/mime type|tiff|not supported$/.test(got), `raw text leaked: ${got}`);
});

test("oversize real image upload maps to the friendly size message", { timeout: 30000 }, async () => {
  const { error } = await client.storage
    .from("class-notes-photos")
    .upload(`probe/big-${stamp}.jpg`, oversizeImage(), { contentType: "image/jpeg" });
  assert.ok(error, "6 MB image must be rejected by the 5 MB photo bucket");
  assert.equal(error.statusCode, "413", "storage should report entity too large");

  const got = friendlyError(error, "Couldn't upload your photo.");
  assert.ok(got.includes("That file is too large to upload"), `got: ${got}`);
  assert.ok(!/exceeded the maximum|413/.test(got), `raw text leaked: ${got}`);
});

test("GIF avatar (client-validated but bucket-rejected) maps to the friendly MIME message", { timeout: 30000 }, async () => {
  const { error } = await client.storage
    .from("class-notes-photos")
    .upload(`probe/gif-${stamp}.gif`, gifFile(), { contentType: "image/gif" });
  assert.ok(error, "GIF must be rejected by class-notes-photos (jpeg/png/webp only)");
  assert.equal(error.statusCode, "415");

  const got = friendlyError(error, "Couldn't upload that image.");
  assert.ok(got.includes("That file type isn't supported"), `got: ${got}`);
  assert.ok(got.includes("JPG, PNG or WebP"), `got: ${got}`);
});