"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ModelImage } from "@/types";
import { ArrowLeft, ArrowRight, Close } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const LAYOUTS = {
  portfolio: ["col-span-2 aspect-[4/5]", "aspect-[3/4]", "aspect-[3/4]", "aspect-square", "col-span-2 aspect-[16/10]"],
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setOpen(i)}
            className={cn("group relative cursor-zoom-in overflow-hidden bg-paper-dark", layout[i % layout.length])}
            aria-label={`${img.alt} — enlarge`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes={layout[i % layout.length].includes("col-span-2") ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 29vw, 50vw"}
              className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${name} portfolio`} className="fixed inset-0 z-[70] flex flex-col bg-ink/[0.97] text-paper backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <span className="text-sm tabular-nums text-paper/70">
              {String(open + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
            <span className="font-display text-2xl">{name}</span>
            <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="grid size-10 place-items-center">
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
          <div className="flex justify-center gap-3 pb-6">
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
