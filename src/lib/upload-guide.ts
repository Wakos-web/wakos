/**
 * Central upload guidance. Every upload field across the project (admin,
 * club editor, alumni registration, business directory) validates against
 * these rules and shows the same friendly, actionable messages — naming the
 * accepted formats and sizes, the offending file, and how to fix it.
 */

// Aligned with the strictest photo buckets (class-notes-photos, club-images):
// JPEG/PNG/WebP at 5 MB. GIF is not accepted by those buckets and TIFF is
// auto-converted to JPEG before upload (see image-convert.ts).
export const IMAGE_TYPES = "JPG, PNG or WebP";
export const IMAGE_MAX_MB = 5;
export const VIDEO_TYPES = "MP4 or WebM";
export const VIDEO_MAX_MB = 5;

/** Accept hints for the file picker (TIFF is listed because it is auto-converted). */
export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.tif,.tiff";
export const VIDEO_ACCEPT = "video/mp4,video/webm,.mp4,.webm";

export function fileSizeMb(bytes: number): string {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${Math.round(mb * 100) / 100} MB` : `${Math.round(mb * 10) / 10} MB`;
}

/** Human-readable extension/MIME description, e.g. "a TIFF photo" / "an AVI video". */
export function fileKind(file: File): string {
  const ext = file.name.split(".").pop()?.toUpperCase();
  const mime = file.type.split("/")[1]?.toUpperCase() || "";
  const label = (mime && mime !== "OCTET-STREAM" ? mime : ext || "file") || "file";
  return file.type.startsWith("video/") || /^video$/i.test(mime) ? `a ${label} video` : `a ${label} photo`;
}

export interface UploadError {
  message: string;
  kind: "image" | "video";
}

/**
 * Type-only check: rejects GIF (photo buckets don't accept it) and non-image
 * files. Size is NOT checked here — oversized photos are auto-compressed
 * instead of rejected (see image-convert.prepareImageForUpload).
 */
export function validateImageType(file: File): string | null {
  // GIF is not accepted by the photo buckets (class-notes-photos, club-images),
  // so reject it here even though its MIME starts with "image/".
  if (/^image\/gif$/i.test(file.type) || /\.gif$/i.test(file.name)) {
    return `"${file.name}" is a GIF animation — we accept ${IMAGE_TYPES} photos. Save it as a JPG, PNG or WebP and try again.`;
  }
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|tiff?)$/i.test(file.name)) {
    return `"${file.name}" is ${fileKind(file)} — we accept ${IMAGE_TYPES} photos (TIFF is converted automatically). Save it as one of those and try again.`;
  }
  return null;
}

/**
 * Image type gate. Oversized photos are NOT rejected here — they are
 * auto-compressed by prepareImageForUpload (image-convert.ts) before upload.
 * Size limits still apply to videos (validateVideo) since they cannot be
 * compressed in the browser.
 */
export function validateImage(file: File): string | null {
  return validateImageType(file);
}

/** Returns a friendly error message, or null when the video is acceptable. */
export function validateVideo(file: File): string | null {
  const okExt = /\.(mp4|webm)$/i.test(file.name);
  if (!file.type.startsWith("video/") && !okExt) {
    return `"${file.name}" is ${fileKind(file)} — we accept ${VIDEO_TYPES} videos. Convert it and try again.`;
  }
  if (!okExt && !/video\/(mp4|webm)/i.test(file.type)) {
    return `"${file.name}" is ${fileKind(file)} — we accept ${VIDEO_TYPES} videos. Convert it (most editors export MP4) and try again.`;
  }
  if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
    return `"${file.name}" is ${fileSizeMb(file.size)} — story videos must be ${VIDEO_MAX_MB}MB or smaller. Trim or compress this clip first.`;
  }
  return null;
}

/** Combined check for a mixed media field (image or video). */
export function validateMedia(file: File): UploadError | null {
  if (file.type.startsWith("video/") || /\.(mp4|webm)$/i.test(file.name)) {
    const err = validateVideo(file);
    return err ? { message: err, kind: "video" } : null;
  }
  const err = validateImage(file);
  return err ? { message: err, kind: "image" } : null;
}