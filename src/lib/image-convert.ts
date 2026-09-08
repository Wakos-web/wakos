/**
 * Client-side image normalization for admin uploads.
 *
 * The Supabase storage buckets only accept JPEG/PNG/WebP/GIF, but staff keep
 * picking TIFF photos straight off cameras. TIFFs are decoded here in the
 * browser (UTIF -> canvas) and re-encoded as JPEG before they ever reach the
 * bucket, so the upload just works instead of failing with a bucket-policy
 * error.
 */
import UTIF from "utif";
import { IMAGE_TYPES } from "./upload-guide";

const isTiff = (file: File) =>
  /image\/tiff?/i.test(file.type) || /\.tiff?$/i.test(file.name);

const isHeic = (file: File) =>
  /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

/** Decode a TIFF File and re-encode it as a JPEG File via canvas. */
async function tiffToJpeg(file: File): Promise<File> {
  const buffer = await file.arrayBuffer();
  const ifds = UTIF.decode(buffer);
  if (!ifds.length) throw new Error("empty-tiff");
  UTIF.decodeImage(buffer, ifds[0]!, ifds);
  const rgba = UTIF.toRGBA8(ifds[0]!);
  const width = ifds[0]!.width;
  const height = ifds[0]!.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9),
  );
  if (!blob) throw new Error("encode-failed");
  const name = file.name.replace(/\.(tiff?)$/i, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}

/**
 * Returns an upload-ready File. TIFF in -> JPEG out; everything else passes
 * through untouched. Throws with a user-facing message for formats the bucket
 * can never accept (HEIC/HEIF) so callers can show it directly in a toast.
 */
export async function normalizeImageFile(file: File): Promise<File> {
  if (isTiff(file)) {
    try {
      return await tiffToJpeg(file);
    } catch {
      throw new Error(
        `"${file.name}" could not be converted from TIFF. Open it in a photo app and save as JPG, then upload again.`,
      );
    }
  }
  if (isHeic(file)) {
    throw new Error(
      `"${file.name}" is an iPhone HEIC photo. We accept ${IMAGE_TYPES}. Share it as "Most Compatible" (JPG) from your phone, then upload again.`,
    );
  }
  return file;
}
