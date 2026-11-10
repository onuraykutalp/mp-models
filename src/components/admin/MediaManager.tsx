"use client";

import { useRef, useState, type Dispatch, type DragEvent, type ReactNode, type SetStateAction } from "react";
import { IconArrowLeft, IconArrowRight, IconClose, IconLink, IconUpload, IconVideo } from "./icons";
import { cn, videoEmbedUrl } from "@/lib/utils";

type Kind = "image" | "video";

const ACCEPT: Record<Kind, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/quicktime,video/webm",
};
const MAX_MB: Record<Kind, number> = { image: 15, video: 200 };

interface Upload {
  id: string;
  name: string;
  progress: number;
  preview?: string;
  error?: string;
}

interface MediaManagerProps {
  kind: Kind;
  items: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
  title: string;
  description: string;
  icon: ReactNode;
  coverLabel?: string;
  error?: string;
}

function uploadFile(file: File, kind: Kind, onProgress: (p: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    xhr.open("POST", "/api/admin/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status === 200 && xhr.response?.url ? resolve(xhr.response.url) : reject(new Error(xhr.response?.error ?? "Upload failed."));
    xhr.onerror = () => reject(new Error("Network error — check your connection."));
    xhr.send(body);
  });
}

const youtubeThumb = (url: string) => {
  const id = videoEmbedUrl(url)?.match(/embed\/([\w-]{11})/)?.[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

export function MediaManager({ kind, items, onChange, title, description, icon, coverLabel, error }: MediaManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dropping, setDropping] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState<string>();

  const patch = (id: string, change: Partial<Upload>) =>
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...change } : u)));

  const handleFiles = (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      const preview = kind === "image" ? URL.createObjectURL(file) : undefined;
      const tooBig = file.size > MAX_MB[kind] * 1024 * 1024;
      const wrongType = !ACCEPT[kind].split(",").includes(file.type);
      setUploads((list) => [
        ...list,
        {
          id,
          name: file.name,
          progress: 0,
          preview,
          error: wrongType ? "Unsupported file type." : tooBig ? `Larger than ${MAX_MB[kind]} MB.` : undefined,
        },
      ]);
      if (tooBig || wrongType) continue;

      uploadFile(file, kind, (progress) => patch(id, { progress }))
        .then((url) => {
          onChange((list) => [...list, url]);
          setUploads((list) => list.filter((u) => u.id !== id));
          if (preview) URL.revokeObjectURL(preview);
        })
        .catch((e: Error) => patch(id, { error: e.message }));
    }
  };

  const move = (from: number, to: number) =>
    onChange((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });

  const addLink = () => {
    const url = link.trim();
    if (!/^https:\/\//.test(url)) return setLinkError("Paste a full https:// link.");
    if (items.includes(url)) return setLinkError("This video is already added.");
    onChange((list) => [...list, url]);
    setLink("");
    setLinkError(undefined);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropping(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <section className="admin-card p-5 sm:p-6" aria-labelledby={`media-${title}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-clay-light">{icon}</span>
        <div className="flex-1">
          <h2 id={`media-${title}`} className="flex items-center gap-2 font-semibold">
            {title}
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-zinc-400 tabular-nums">
              {items.length}
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDropping(true);
          }
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={onDrop}
        className="mt-5"
      >
        <ul className={cn("grid gap-3", kind === "image" ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-1 sm:grid-cols-2")}>
          {items.map((url, i) => (
            <li
              key={url}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (dragIndex === null || dragIndex === i) return;
                e.preventDefault();
                move(dragIndex, i);
                setDragIndex(i);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "group relative cursor-grab overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04] active:cursor-grabbing",
                kind === "image" ? "aspect-[3/4]" : "aspect-video",
                dragIndex === i && "opacity-40 ring-2 ring-clay-light",
              )}
            >
              <MediaPreview kind={kind} url={url} />
              {coverLabel && i === 0 && (
                <span className="absolute top-2 left-2 rounded-full bg-clay-light px-2 py-0.5 text-[10px] font-semibold text-[#fff] shadow">
                  {coverLabel}
                </span>
              )}
              <div className="on-photo absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-6 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <span className="flex gap-1">
                  <TileButton label="Move left" onClick={() => move(i, i - 1)} disabled={i === 0}>
                    <IconArrowLeft width={14} height={14} />
                  </TileButton>
                  <TileButton label="Move right" onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>
                    <IconArrowRight width={14} height={14} />
                  </TileButton>
                </span>
                <TileButton label="Remove" onClick={() => onChange((list) => list.filter((u) => u !== url))} danger>
                  <IconClose width={14} height={14} />
                </TileButton>
              </div>
            </li>
          ))}

          {uploads.map((u) => (
            <li
              key={u.id}
              className={cn(
                "relative overflow-hidden rounded-xl border bg-white/[0.04]",
                kind === "image" ? "aspect-[3/4]" : "aspect-video",
                u.error ? "border-red-400/40" : "border-white/[0.07]",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {u.preview && <img src={u.preview} alt="" className="size-full object-cover opacity-40" />}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
                {u.error ? (
                  <>
                    <p className="text-xs font-medium text-red-300">{u.error}</p>
                    <p className="line-clamp-1 text-[11px] text-zinc-500">{u.name}</p>
                    <button
                      type="button"
                      onClick={() => setUploads((list) => list.filter((x) => x.id !== u.id))}
                      className="text-[11px] font-semibold text-zinc-300 underline underline-offset-2"
                    >
                      Dismiss
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold tabular-nums">{Math.round(u.progress * 100)}%</p>
                    <span className="h-1 w-3/4 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-clay-light transition-[width]" style={{ width: `${u.progress * 100}%` }} />
                    </span>
                  </>
                )}
              </div>
            </li>
          ))}

          <li className={cn(kind === "image" ? "aspect-[3/4]" : "aspect-video", items.length + uploads.length === 0 && "col-span-full aspect-auto")}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex size-full min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center transition-colors",
                dropping
                  ? "border-clay-light bg-clay/10 text-clay-light"
                  : error
                    ? "border-red-400/40 text-zinc-400 hover:border-red-400/70"
                    : "border-white/15 text-zinc-400 hover:border-white/30 hover:bg-white/[0.03] hover:text-zinc-200",
              )}
            >
              <IconUpload />
              <span className="text-xs font-medium">{dropping ? "Drop to upload" : "Upload or drag files"}</span>
              <span className="text-[11px] text-zinc-500">
                {kind === "image" ? "JPG, PNG, WebP · up to 15 MB" : "MP4, MOV, WebM · up to 200 MB"}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {kind === "video" && (
        <div className="mt-4">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Video link</span>
              <IconLink className="pointer-events-none absolute inset-y-0 left-3.5 my-auto text-zinc-500" width={16} height={16} />
              <input
                type="url"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  setLinkError(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
                placeholder="Or paste a YouTube, Vimeo or .mp4 link"
                aria-invalid={!!linkError || undefined}
                className="admin-input pl-10"
              />
            </label>
            <button type="button" onClick={addLink} disabled={!link.trim()} className="admin-btn-ghost h-11">
              Add
            </button>
          </div>
          {linkError && <p className="mt-1.5 text-xs text-red-400">{linkError}</p>}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </section>
  );
}

function MediaPreview({ kind, url }: { kind: Kind; url: string }) {
  if (kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" draggable={false} className="size-full object-cover" />;
  }
  const thumb = youtubeThumb(url);
  if (thumb) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={thumb} alt="" draggable={false} className="size-full object-cover" />;
  }
  if (videoEmbedUrl(url)) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-2 text-zinc-400">
        <IconVideo width={24} height={24} />
        <span className="max-w-[80%] truncate text-[11px]">{url.replace(/^https:\/\/(www\.)?/, "")}</span>
      </div>
    );
  }
  return <video src={`${url}#t=0.5`} muted playsInline preload="metadata" className="pointer-events-none size-full object-cover" />;
}

function TileButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "on-photo grid size-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors disabled:opacity-30",
        danger ? "hover:bg-red-500" : "hover:bg-white hover:text-night",
      )}
    >
      {children}
    </button>
  );
}
