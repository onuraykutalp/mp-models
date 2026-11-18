"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconClose, IconImage, IconSpinner } from "./icons";
import { cn } from "@/lib/utils";

const SLOTS = 5;

export interface CompositeCardModel {
  slug: string;
  name: string;
  /** Label / value pairs shown under the name, e.g. ["Height", "178"]. */
  stats: [string, string][];
}

interface Props {
  model: CompositeCardModel;
  /** Every portfolio and snap photo of the model. */
  photos: string[];
}

// ── Card geometry (px) ──────────────────────────────────────────────────────
// One large 3:4 photo on the left; four 3:4 photos in a 2×2 grid on the right.
// The grid is exactly as tall as the large photo, so all edges line up.
const W = 2400;
const MARGIN = 80;
const GAP = 24;
const COL_GAP = 40;
const CONTENT_W = W - MARGIN * 2;
const SMALL_W = (CONTENT_W - COL_GAP - GAP * 1.75) / 4;
const SMALL_H = (SMALL_W * 4) / 3;
const GRID_H = SMALL_H * 2 + GAP;
const BIG_W = (GRID_H * 3) / 4;
const FOOTER_GAP = 56;
const FOOTER_H = 230;
const H = Math.round(MARGIN + GRID_H + FOOTER_GAP + FOOTER_H + MARGIN * 0.5);

const PAPER = "#f3efe8";
const INK = "#121110";
const STONE = "#857f75";

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("A photo could not be loaded."));
    img.src = url;
  });
}

/** Draws `img` filling the box (like object-fit: cover), keeping faces in frame by favouring the top. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) * 0.2;
  ctx.drawImage(img, sx, sy, sw, sh, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

async function renderCard(canvas: HTMLCanvasElement, urls: string[], model: CompositeCardModel, cache: Map<string, HTMLImageElement>) {
  const images = await Promise.all(
    urls.map(async (url) => {
      const cached = cache.get(url);
      if (cached) return cached;
      const img = await loadImage(url);
      cache.set(url, img);
      return img;
    }),
  );

  const display = cssVar("--font-italiana", "serif");
  const sans = cssVar("--font-jost", "sans-serif");
  await Promise.all([document.fonts.load(`120px ${display}`), document.fonts.load(`500 30px ${sans}`), document.fonts.load(`400 30px ${sans}`)]).catch(
    () => undefined,
  );

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const placeholder = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = "#e8e2d8";
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  // Left: large photo.
  const top = MARGIN;
  if (images[0]) drawCover(ctx, images[0], MARGIN, top, BIG_W, GRID_H);
  else placeholder(MARGIN, top, BIG_W, GRID_H);

  // Right: 2 × 2 grid, filled row by row.
  const gridX = MARGIN + BIG_W + COL_GAP;
  for (let i = 0; i < 4; i++) {
    const x = gridX + (i % 2) * (SMALL_W + GAP);
    const y = top + Math.floor(i / 2) * (SMALL_H + GAP);
    const img = images[i + 1];
    if (img) drawCover(ctx, img, x, y, SMALL_W, SMALL_H);
    else placeholder(x, y, SMALL_W, SMALL_H);
  }

  // Footer: name and measurements on the left, agency on the right.
  const footerTop = top + GRID_H + FOOTER_GAP;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `124px ${display}`;
  ctx.fillText(model.name, MARGIN, footerTop + 104);

  const brandW = 520;
  const maxStatsW = CONTENT_W - brandW - 60;
  ctx.letterSpacing = "3px";
  const items = model.stats.map(([label, value]) => {
    ctx.font = `400 25px ${sans}`;
    const l = ctx.measureText(label.toUpperCase()).width;
    ctx.font = `500 31px ${sans}`;
    const v = ctx.measureText(value).width;
    return { label: label.toUpperCase(), value, l, w: l + 14 + v };
  });
  let x = MARGIN;
  let y = footerTop + 172;
  for (const item of items) {
    if (x > MARGIN && x + item.w > MARGIN + maxStatsW) {
      x = MARGIN;
      y += 48;
    }
    ctx.font = `400 25px ${sans}`;
    ctx.fillStyle = STONE;
    ctx.fillText(item.label, x, y);
    ctx.font = `500 31px ${sans}`;
    ctx.fillStyle = INK;
    ctx.fillText(item.value, x + item.l + 14, y);
    x += item.w + 52;
  }

  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.font = `500 34px ${sans}`;
  ctx.letterSpacing = "9px";
  ctx.fillText("THREE15", W - MARGIN + 9, footerTop + 104);
  ctx.fillStyle = STONE;
  ctx.font = `400 25px ${sans}`;
  ctx.letterSpacing = "6px";
  ctx.fillText("MANAGEMENT", W - MARGIN + 6, footerTop + 146);
  ctx.letterSpacing = "2px";
  ctx.fillText("three15management.com", W - MARGIN + 2, footerTop + 184);
  ctx.letterSpacing = "0px";
}

export function CompositeCardBuilder({ model, photos }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cache = useRef(new Map<string, HTMLImageElement>());
  const [selected, setSelected] = useState<string[]>(() => photos.slice(0, SLOTS));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const ready = selected.length === SLOTS;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    setBusy(true);
    renderCard(canvas, selected, model, cache.current)
      .then(() => !cancelled && setError(undefined))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
    };
  }, [selected, model]);

  const toggle = (url: string) =>
    setSelected((list) => (list.includes(url) ? list.filter((u) => u !== url) : list.length < SLOTS ? [...list, url] : list));

  const download = () => {
    canvasRef.current?.toBlob(
      (blob) => {
        if (!blob) return setError("Could not export the card — a photo may come from a site that blocks downloads.");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${model.slug}-composite-card.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      },
      "image/jpeg",
      0.93,
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <section className="admin-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-clay-light">
            <IconImage width={18} height={18} />
          </span>
          <div className="flex-1">
            <h2 className="flex items-center gap-2 font-semibold">
              Choose {SLOTS} photos
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-zinc-400 tabular-nums">
                {selected.length}/{SLOTS}
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              The first photo becomes the large one on the left, the next four fill the grid on the right, row by row. Click a selected photo to remove it.
            </p>
          </div>
        </div>

        <ol className="mt-5 grid grid-cols-5 gap-2" aria-label="Selected photos in card order">
          {Array.from({ length: SLOTS }, (_, i) => {
            const url = selected[i];
            return (
              <li key={i} className="relative aspect-[3/4] overflow-hidden rounded-lg border border-dashed border-white/15 bg-white/[0.03]">
                {url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => toggle(url)}
                      aria-label={`Remove photo ${i + 1}`}
                      className="on-photo absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/65 text-white hover:bg-red-500"
                    >
                      <IconClose width={11} height={11} />
                    </button>
                  </>
                ) : null}
                <span className="on-photo absolute bottom-1 left-1 grid size-5 place-items-center rounded-full bg-black/65 text-[10px] font-semibold text-white">
                  {i === 0 ? "L" : i}
                </span>
              </li>
            );
          })}
        </ol>

        {photos.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-zinc-500">
            This model has no photos yet. Upload some in the model editor first.
          </p>
        ) : (
          <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((url) => {
              const index = selected.indexOf(url);
              const isSelected = index !== -1;
              return (
                <li key={url}>
                  <button
                    type="button"
                    onClick={() => toggle(url)}
                    aria-pressed={isSelected}
                    disabled={!isSelected && selected.length >= SLOTS}
                    className={cn(
                      "relative block aspect-[3/4] w-full overflow-hidden rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40",
                      isSelected ? "border-clay-light ring-2 ring-clay-light" : "border-white/[0.07] hover:border-white/30",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" loading="lazy" className="size-full object-cover" />
                    {isSelected && (
                      <span className="on-photo absolute top-1.5 left-1.5 grid size-6 place-items-center rounded-full bg-clay-light text-[11px] font-semibold text-white shadow">
                        {index === 0 ? <IconCheck width={13} height={13} /> : index}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="admin-card self-start p-5 sm:p-6 xl:sticky xl:top-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Preview</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {W} × {H} px · JPG
            </p>
          </div>
          <button type="button" onClick={download} disabled={!ready || busy || !!error} className="admin-btn-primary h-10">
            {busy ? <IconSpinner width={16} height={16} /> : null}
            Download card
          </button>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#f3efe8]">
          <canvas ref={canvasRef} className="block h-auto w-full" aria-label={`Composite card for ${model.name}`} />
          {!ready && (
            <p className="absolute inset-x-0 bottom-3 text-center text-xs font-medium text-stone-600">
              Select {SLOTS - selected.length} more photo{SLOTS - selected.length === 1 ? "" : "s"} to complete the card
            </p>
          )}
        </div>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>
    </div>
  );
}
