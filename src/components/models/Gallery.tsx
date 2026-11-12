"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ModelImage } from "@/types";
import { ArrowLeft, ArrowRight, Close } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Compact modular board — mostly equal frames, occasional taller tiles.
 * Keeps the gallery dense so it fits the viewport without oversized heroes.
 */
function cellClass(index: number, variant: "portfolio" | "grid") {
  if (variant === "grid") return "aspect-[3/4]";
  // Every 5th tile spans two columns for rhythm without dominating the page.
  if (index % 5 === 0) return "col-span-2 aspect-[5/4] sm:col-span-1 sm:aspect-[3/4] lg:aspect-[2/3]";
  if (index % 7 === 3) return "aspect-[4/5]";
  return "aspect-[3/4]";
}

interface GalleryProps {
  images: ModelImage[];
  name: string;
  layout?: "portfolio" | "grid";
}

export function Gallery({ images, name, layout: variant = "portfolio" }: GalleryProps) {
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
          "grid gap-1.5 sm:gap-2",
          variant === "portfolio" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        )}
      >
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setOpen(i)}
            className={cn(
              "group relative cursor-zoom-in overflow-hidden bg-paper-dark",
              cellClass(i, variant),
              // Soft staggered offset on the middle column for an art-board feel.
              variant === "portfolio" && i % 3 === 1 && "md:translate-y-4 lg:translate-y-6",
            )}
            aria-label={`${img.alt} — enlarge`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              priority={i < 6}
              sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <span className="pointer-events-none absolute inset-0 ring-inset ring-ink/0 transition duration-500 group-hover:bg-ink/15 group-hover:ring-1 group-hover:ring-ink/20" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${name} portfolio`} className="fixed inset-0 z-[70] flex flex-col bg-ink text-paper">
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <span className="text-xs tracking-[0.28em] text-paper/55 tabular-nums uppercase">
              {String(open + 1).padStart(2, "0")} — {String(images.length).padStart(2, "0")}
            </span>
            <span className="font-display text-xl sm:text-2xl">{name}</span>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="grid size-10 place-items-center rounded-full border border-paper/25 transition-colors hover:bg-paper hover:text-ink"
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
              className="animate-fade-up object-contain p-4 sm:p-10"
            />
          </div>
          <div className="flex justify-center gap-3 pb-7">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => step(dir)}
                aria-label={dir === -1 ? "Previous" : "Next"}
                className="grid size-11 place-items-center rounded-full border border-paper/30 transition-colors hover:bg-paper hover:text-ink"
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
