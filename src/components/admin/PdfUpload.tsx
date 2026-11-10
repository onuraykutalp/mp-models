"use client";

import { useRef, useState, type DragEvent } from "react";
import { IconClose, IconExternal, IconFile, IconUpload } from "./icons";
import { cn } from "@/lib/utils";

const MAX_MB = 30;

function uploadPdf(file: File, onProgress: (p: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", file);
    body.append("kind", "pdf");
    xhr.open("POST", "/api/admin/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status === 200 && xhr.response?.url ? resolve(xhr.response.url) : reject(new Error(xhr.response?.error ?? "Upload failed."));
    xhr.onerror = () => reject(new Error("Network error — check your connection."));
    xhr.send(body);
  });
}

interface PdfUploadProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

export function PdfUpload({ value, onChange, error }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>();
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string>();
  const [dropping, setDropping] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setUploadError(undefined);
    if (file.type !== "application/pdf") return setUploadError("Only PDF files are supported.");
    if (file.size > MAX_MB * 1024 * 1024) return setUploadError(`Larger than ${MAX_MB} MB.`);

    setProgress(0);
    uploadPdf(file, setProgress)
      .then((url) => {
        setFileName(file.name);
        onChange(url);
      })
      .catch((e: Error) => setUploadError(e.message))
      .finally(() => setProgress(null));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropping(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const message = uploadError ?? error;

  return (
    <section className="admin-card p-5 sm:p-6" aria-labelledby="media-pdf">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-clay-light">
          <IconFile width={16} height={16} />
        </span>
        <div className="flex-1">
          <h2 id="media-pdf" className="font-semibold">
            Portfolio PDF <span className="ml-1 text-xs font-normal text-zinc-500">optional</span>
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            A book or comp card clients can download from the model page.
          </p>
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
        {progress !== null ? (
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.04] p-4">
            <IconFile className="shrink-0 text-zinc-400" />
            <div className="flex-1">
              <p className="text-xs font-semibold tabular-nums">Uploading… {Math.round(progress * 100)}%</p>
              <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-clay-light transition-[width]" style={{ width: `${progress * 100}%` }} />
              </span>
            </div>
          </div>
        ) : value ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-red-500/15 text-[10px] font-bold tracking-wider text-red-300">
              PDF
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{fileName ?? "Portfolio.pdf"}</p>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
              >
                Open <IconExternal width={12} height={12} />
              </a>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="admin-btn-ghost h-9 px-3 text-xs">
                Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  setFileName(undefined);
                  onChange("");
                }}
                aria-label="Remove PDF"
                title="Remove PDF"
                className="grid size-9 place-items-center rounded-xl border border-white/10 text-zinc-400 transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors",
              dropping
                ? "border-clay-light bg-clay/10 text-clay-light"
                : message
                  ? "border-red-400/40 text-zinc-400 hover:border-red-400/70"
                  : "border-white/15 text-zinc-400 hover:border-white/30 hover:bg-white/[0.03] hover:text-zinc-200",
            )}
          >
            <IconUpload />
            <span className="text-xs font-medium">{dropping ? "Drop to upload" : "Upload or drag a PDF"}</span>
            <span className="text-[11px] text-zinc-500">PDF · up to {MAX_MB} MB</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {message && <p className="mt-3 text-xs text-red-400">{message}</p>}
    </section>
  );
}
