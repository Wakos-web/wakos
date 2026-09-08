/**
 * Central upload guidance. Every upload field across the project (admin,
 * club editor, alumni registration, business directory) validates against
 * these rules and shows the same friendly, actionable messages — naming the
 * accepted formats and sizes, the offending file, and how to fix it.
 */

export const IMAGE_TYPES = "JPG, PNG, WebP or GIF";
export const IMAGE_MAX_MB = 10;
export const VIDEO_TYPES = "MP4 or WebM";
export const VIDEO_MAX_MB = 5;

/** Accept hints for the file picker (TIFF is listed because it is auto-converted). */
export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif,.tif,.tiff";
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

/** Returns a friendly error message, or null when the file is acceptable. */
export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|tiff?)$/i.test(file.name)) {
    return `"${file.name}" is ${fileKind(file)} — we accept ${IMAGE_TYPES} photos (TIFF is converted automatically). Save it as one of those and try again.`;
  }
  if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
    return `"${file.name}" is ${fileSizeMb(file.size)} — photos must be ${IMAGE_MAX_MB}MB or smaller. Compress or resize it first.`;
  }
  return null;
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