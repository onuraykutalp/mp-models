import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "uploads");
export const UPLOAD_URL_PREFIX = "/uploads/";

export type UploadKind = "image" | "video" | "pdf";

const TYPES: Record<string, { kind: UploadKind; ext: string; sniff: (b: Buffer) => boolean }> = {
  "image/jpeg": { kind: "image", ext: "jpg", sniff: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { kind: "image", ext: "png", sniff: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  "image/webp": { kind: "image", ext: "webp", sniff: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  "image/avif": { kind: "image", ext: "avif", sniff: (b) => b.toString("ascii", 4, 12).startsWith("ftypavi") },
  "video/mp4": { kind: "video", ext: "mp4", sniff: (b) => b.toString("ascii", 4, 8) === "ftyp" },
  "video/quicktime": { kind: "video", ext: "mov", sniff: (b) => b.toString("ascii", 4, 8) === "ftyp" || b.toString("ascii", 4, 8) === "moov" },
  "video/webm": { kind: "video", ext: "webm", sniff: (b) => b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) },
  "application/pdf": { kind: "pdf", ext: "pdf", sniff: (b) => b.toString("ascii", 0, 5) === "%PDF-" },
};

export const MAX_BYTES: Record<UploadKind, number> = {
  image: 15 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  pdf: 30 * 1024 * 1024,
};

const TYPE_HINTS: Record<UploadKind, string> = {
  image: "Use JPG, PNG, WebP or AVIF images.",
  video: "Use MP4, MOV or WebM videos.",
  pdf: "Use a PDF file.",
};

export const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(TYPES).map(([mime, { ext }]) => [ext, mime]),
);

export class UploadError extends Error {}

export async function saveUpload(file: File, kind: UploadKind) {
  const type = TYPES[file.type];
  if (!type || type.kind !== kind) {
    throw new UploadError(TYPE_HINTS[kind]);
  }
  if (file.size > MAX_BYTES[kind]) {
    throw new UploadError(`File is too large (max ${MAX_BYTES[kind] / 1024 / 1024} MB).`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!type.sniff(buffer)) throw new UploadError("The file content doesn't match its type.");

  const now = new Date();
  const segments = [`${kind}s`, String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0")];
  const name = `${randomUUID()}.${type.ext}`;
  const dir = path.join(/* turbopackIgnore: true */ UPLOAD_ROOT, ...segments);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ dir, name), buffer);

  return UPLOAD_URL_PREFIX + [...segments, name].join("/");
}

/** Maps `/uploads/...` URL segments to an absolute path, refusing anything outside the upload root. */
export function resolveUploadPath(segments: string[]) {
  if (segments.some((s) => !s || s === "." || s === ".." || s.includes("\0"))) return null;
  const target = path.resolve(/* turbopackIgnore: true */ UPLOAD_ROOT, ...segments);
  const relative = path.relative(UPLOAD_ROOT, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return target;
}

export async function deleteUploads(urls: string[]) {
  await Promise.all(
    urls
      .filter((url) => url.startsWith(UPLOAD_URL_PREFIX))
      .map((url) => resolveUploadPath(url.slice(UPLOAD_URL_PREFIX.length).split("/")))
      .map((file) => file && unlink(file).catch(() => {})),
  );
}
