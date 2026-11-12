"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelImage } from "@/types";
import { ArrowLeft, ArrowRight, Close } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const VISIBLE = 4;

interface GalleryProps {
  images: ModelImage[];
  name: string;
  /** Kept for call-site compatibility; both modes use the same 4-up slider. */
  layout?: "portfolio" | "grid";
}

export function Gallery({ images, name }: GalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  const pageCount = Math.max(1, Math.ceil(images.length / VISIBLE));
  const canSlide = images.length > VISIBLE;

  const goPage = useCallback(
    (dir: 1 | -1) => {
      setPage((p) => (p + dir + pageCount) % pageCount);
    },
    [pageCount],
  );

  const stepModal = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: page * width, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") stepModal(1);
      if (e.key === "ArrowLeft") stepModal(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, stepModal]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="relative">
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (!el.clientWidth) return;
            const next = Math.round(el.scrollLeft / el.clientWidth);
            if (next !== page && next >= 0 && next < pageCount) setPage(next);
          }}
        >
          {Array.from({ length: pageCount }, (_, pageIndex) => {
            const slice = images.slice(pageIndex * VISIBLE, pageIndex * VISIBLE + VISIBLE);
            return (
              <div
                key={pageIndex}
                className="grid w-full shrink-0 snap-start grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
              >
                {slice.map((img, localIndex) => {
                  const index = pageIndex * VISIBLE + localIndex;
                  return (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => setOpen(index)}
                      className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-paper-dark"
                      aria-label={`${img.alt} — enlarge`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        priority={index < 4}
                        sizes="(min-width: 1024px) 22vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {canSlide && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goPage(-1)}
                aria-label="Previous images"
                className="grid size-10 place-items-center border border-ink/20 transition-colors hover:bg-ink hover:text-paper"
              >
                <ArrowLeft width={16} height={16} />
              </button>
              <button
                type="button"
                onClick={() => goPage(1)}
                aria-label="Next images"
                className="grid size-10 place-items-center border border-ink/20 transition-colors hover:bg-ink hover:text-paper"
              >
                <ArrowRight width={16} height={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={page === i}
                  onClick={() => setPage(i)}
                  className={cn(
                    "h-1 transition-all",
                    page === i ? "w-6 bg-ink" : "w-3 bg-ink/20 hover:bg-ink/40",
                  )}
                />
              ))}
              <span className="ml-2 text-[11px] tracking-[0.2em] text-stone uppercase tabular-nums">
                {String(page + 1).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} portfolio`}
          className="fixed inset-0 z-[70] flex flex-col bg-ink/45 text-paper backdrop-blur-[2px]"
          onClick={() => setOpen(null)}
        >
          <div
            className="flex items-center justify-between px-5 py-4 sm:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs tracking-[0.28em] text-paper/80 tabular-nums uppercase drop-shadow">
              {String(open + 1).padStart(2, "0")} — {String(images.length).padStart(2, "0")}
            </span>
            <span className="font-display text-xl drop-shadow sm:text-2xl">{name}</span>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="grid size-10 place-items-center border border-paper/40 bg-ink/30 backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink"
            >
              <Close />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 sm:px-16" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => stepModal(-1)}
              aria-label="Previous"
              className="absolute left-3 z-10 grid size-11 place-items-center border border-paper/40 bg-ink/30 backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink sm:left-6"
            >
              <ArrowLeft />
            </button>

            <div className="relative h-[min(78vh,820px)] w-full max-w-5xl">
              <Image
                key={images[open].url}
                src={images[open].url}
                alt={images[open].alt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="animate-fade-up object-contain drop-shadow-2xl"
              />
            </div>

            <button
              type="button"
              onClick={() => stepModal(1)}
              aria-label="Next"
              className="absolute right-3 z-10 grid size-11 place-items-center border border-paper/40 bg-ink/30 backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink sm:right-6"
            >
              <ArrowRight />
            </button>
          </div>

          <div className="flex justify-center gap-2 pb-6" onClick={(e) => e.stopPropagation()}>
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                aria-label={`Image ${i + 1}`}
                aria-current={open === i}
                onClick={() => setOpen(i)}
                className={cn(
                  "relative size-12 overflow-hidden border transition sm:size-14",
                  open === i ? "border-paper opacity-100" : "border-transparent opacity-50 hover:opacity-90",
                )}
              >
                <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
