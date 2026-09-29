/**
 * Unit tests locking upload-guide constants to the REAL bucket policy:
 *   class-notes-photos / club-images allow only JPEG/PNG/WebP at 5 MB.
 * GIFs are rejected client-side before they ever hit the bucket; oversized
 * images are NOT rejected — prepareImageForUpload auto-compresses them.
 * Videos still enforce the 5 MB limit (they cannot be compressed in-browser).
 *
 * Run:   node --test e2e/upload-guide.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

let mod;
const ts = await import("typescript");
const srcPath = path.resolve(process.cwd(), "src/lib/upload-guide.ts");
const source = fs.readFileSync(srcPath, "utf8");
const out = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  fileName: srcPath,
}).outputText;
const dataUrl = "data:text/javascript;base64," + Buffer.from(out).toString("base64");
mod = await import(dataUrl);
const { IMAGE_TYPES, IMAGE_MAX_MB, IMAGE_ACCEPT, validateImage, validateMedia, fileSizeMb } = mod;

test("constants match the photo-bucket policy (5 MB, JPG/PNG/WebP, no GIF)", () => {
  assert.equal(IMAGE_MAX_MB, 5);
  assert.equal(IMAGE_TYPES, "JPG, PNG or WebP");
  assert.ok(!/gif/i.test(IMAGE_ACCEPT), "GIF must not be offered in the photo picker");
  assert.ok(/\.tiff?/.test(IMAGE_ACCEPT), "TIFF stays listed because it is auto-converted");
});

test("a 6 MB JPEG passes the type gate (auto-compressed on upload)", () => {
  const file = new File([new Uint8Array(6 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
  assert.equal(validateImage(file), null, "oversized photos are compressed client-side, not rejected");
});

test("a 4 MB JPEG is accepted", () => {
  const file = new File([new Uint8Array(4 * 1024 * 1024)], "ok.jpg", { type: "image/jpeg" });
  assert.equal(validateImage(file), null);
});

test("a GIF is rejected with the friendly type message", () => {
  const file = new File([new Uint8Array(8)], "anim.gif", { type: "image/gif" });
  const err = validateImage(file);
  assert.ok(err, "GIF must be rejected (photo buckets do not accept it)");
  assert.ok(err.includes("JPG, PNG or WebP"), `got: ${err}`);
});

test("a TIFF passes validation (it is auto-converted before upload)", () => {
  const file = new File([new Uint8Array(8)], "photo.tiff", { type: "image/tiff" });
  assert.equal(validateImage(file), null, "TIFF is converted to JPEG, so it must pass client validation");
});

test("an oversized VIDEO is still rejected (cannot be compressed in-browser)", () => {
  const file = new File([new Uint8Array(6 * 1024 * 1024)], "clip.mp4", { type: "video/mp4" });
  const err = validateMedia(file);
  assert.ok(err, "video size limit still enforced");
  assert.equal(err.kind, "video");
  assert.ok(err.message.includes("5MB or smaller"), `got: ${err.message}`);
});

test("an oversized image passes validateMedia (compressed later, not rejected)", () => {
  const file = new File([new Uint8Array(6 * 1024 * 1024)], "big.png", { type: "image/png" });
  assert.equal(validateMedia(file), null, "images flow to auto-compression instead of rejection");
});

test("fileSizeMb formats small and large sizes", () => {
  assert.equal(fileSizeMb(0.5 * 1024 * 1024), "0.5 MB");
  assert.equal(fileSizeMb(5 * 1024 * 1024), "5 MB");
});