"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ModelImage } from "@/types";
import { ArrowLeft, ArrowRight, Close } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/** Editorial rhythms — tall, wide, and paired frames like a lookbook. */
const LAYOUTS = {
  portfolio: [
    "col-span-2 aspect-[3/4] sm:aspect-[4/5] lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:min-h-[70vh]",
    "aspect-[3/4]",
    "aspect-[3/4]",
    "col-span-2 aspect-[16/10]",
    "aspect-[3/4]",
    "aspect-[4/5]",
    "col-span-2 aspect-[5/4] sm:col-span-1 sm:aspect-[3/4]",
    "aspect-[3/4]",
  ],
  grid: ["aspect-[3/4]"],
};

interface GalleryProps {
  images: ModelImage[];
  name: string;
  layout?: keyof typeof LAYOUTS;
}

export function Gallery({ images, name, layout: variant = "portfolio" }: GalleryProps) {
  const layout = LAYOUTS[variant];
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  return (
    <>
      <div
        className={cn(
          "grid gap-2 sm:gap-3",
          variant === "portfolio" ? "grid-cols-2 lg:auto-rows-[minmax(12rem,auto)]" : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {images.map((img, i) => {
          const cell = layout[i % layout.length];
          const wide = cell.includes("col-span-2");
          return (
            <button
              key={img.url}
              type="button"
              onClick={() => setOpen(i)}
              className={cn(
                "group relative cursor-zoom-in overflow-hidden bg-paper-dark",
                cell,
                i === 0 && variant === "portfolio" && "lg:row-span-2",
              )}
              aria-label={`${img.alt} — enlarge`}
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                priority={i < 2}
                sizes={wide ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
                className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
              />
              <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
              <span className="pointer-events-none absolute right-3 bottom-3 translate-y-1 text-[10px] tracking-[0.28em] text-paper uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                View
              </span>
            </button>
          );
        })}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} portfolio`}
          className="fixed inset-0 z-[70] flex flex-col bg-ink text-paper"
        >
          <div className="flex items-center justify-between px-5 py-5 sm:px-10">
            <span className="text-xs tracking-[0.28em] text-paper/55 tabular-nums uppercase">
              {String(open + 1).padStart(2, "0")} — {String(images.length).padStart(2, "0")}
            </span>
            <span className="font-display text-xl tracking-tight sm:text-2xl">{name}</span>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="grid size-11 place-items-center rounded-full border border-paper/25 transition-colors hover:bg-paper hover:text-ink"
            >
              <Close />
            </button>
          </div>
          <div className="relative flex-1" onClick={() => setOpen(null)}>
            <Image
              key={images[open].url}
              src={images[open].url}
              alt={images[open].alt}
              fill
              sizes="100vw"
              className="animate-fade-up object-contain p-3 sm:p-8 lg:p-12"
            />
          </div>
          <div className="flex items-center justify-center gap-4 pb-8">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => step(dir)}
                aria-label={dir === -1 ? "Previous" : "Next"}
                className="grid size-12 place-items-center rounded-full border border-paper/30 transition-colors hover:bg-paper hover:text-ink"
              >
                {dir === -1 ? <ArrowLeft /> : <ArrowRight />}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
