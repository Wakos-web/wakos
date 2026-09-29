/**
 * Client-side image normalization for admin uploads.
 *
 * The Supabase storage buckets only accept JPEG/PNG/WebP, but staff keep
 * picking TIFF photos straight off cameras. TIFFs are decoded here in the
 * browser (UTIF -> canvas) and re-encoded as JPEG before they ever reach the
 * bucket, so the upload just works instead of failing with a bucket-policy
 * error.
 */
import UTIF from "utif";
import { IMAGE_TYPES, IMAGE_MAX_MB, validateImageType } from "./upload-guide";

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

/** Load an image File into an <img> element (works in every browser). */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`"${file.name}" could not be read as an image.`));
    };
    img.src = url;
  });
}

/**
 * Shrink an image until it fits under maxBytes: progressively smaller
 * dimensions and lower JPEG quality, stopping at the first result that fits.
 * Returns the original file unchanged if nothing fits (caller decides).
 */
async function compressImage(file: File, maxBytes: number): Promise<File> {
  const img = await loadImage(file);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;
  if (!origW || !origH) return file;

  // Try smaller dimensions first, then knock quality down within each size.
  const maxDims = [origW > 1920 ? 1920 : 0, 1600, 1280, 1024, 800, 0].filter(
    (d) => d === 0 || d < Math.max(origW, origH),
  );
  for (const maxDim of maxDims) {
    const scale = maxDim === 0 ? 1 : maxDim / Math.max(origW, origH);
    const w = Math.max(1, Math.round(origW * scale));
    const h = Math.max(1, Math.round(origH * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.drawImage(img, 0, 0, w, h);
    for (const quality of [0.85, 0.75, 0.65, 0.55]) {
      const blob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, "image/jpeg", quality),
      );
      if (blob && blob.size <= maxBytes) {
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
      }
    }
  }
  return file;
}

/**
 * One-stop image preparation for uploads: validates the type (GIF and
 * non-images are rejected with a friendly message), auto-converts TIFF to
 * JPEG / rejects HEIC, and AUTO-COMPRESSES any photo that exceeds the bucket
 * size limit instead of rejecting it. Throws a user-facing message only when
 * the file can't be made acceptable.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const typeErr = validateImageType(file);
  if (typeErr) throw new Error(typeErr);

  let prepared = await normalizeImageFile(file);

  const maxBytes = IMAGE_MAX_MB * 1024 * 1024;
  if (prepared.size > maxBytes) {
    prepared = await compressImage(prepared, maxBytes);
    if (prepared.size > maxBytes) {
      throw new Error(
        `"${file.name}" is ${IMAGE_MAX_MB}MB or larger even after auto-compressing. Please choose a smaller photo.`,
      );
    }
  }
  return prepared;
}
