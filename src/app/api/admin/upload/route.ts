import { getAdmin } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/security";
import { MAX_BYTES, UploadError, saveUpload, type UploadKind } from "@/lib/uploads";

export async function POST(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const ip = await clientIp();
  if (rateLimit(`upload:${ip}`, 60, 60 * 1000)) {
    return Response.json({ error: "Too many uploads. Please wait a moment." }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  // Absolute ceiling slightly above the largest allowed file (video) + multipart overhead.
  if (contentLength > MAX_BYTES.video + 1024 * 1024) {
    return Response.json({ error: "File is too large." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof File) || (kind !== "image" && kind !== "video" && kind !== "pdf")) {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  try {
    const url = await saveUpload(file, kind as UploadKind);
    return Response.json({ url });
  } catch (error) {
    if (error instanceof UploadError) return Response.json({ error: error.message }, { status: 422 });
    console.error("[upload]", error);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}
