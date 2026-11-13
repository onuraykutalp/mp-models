"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelImage } from "@/types";
import { ArrowLeft, ArrowRight, Close } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

interface GalleryProps {
  images: ModelImage[];
  name: string;
  layout?: "portfolio" | "grid";
}

/** ~4 cards in view + a slice of the next one so sliding is obvious. */
const CARD =
  "w-[min(46%,11.5rem)] sm:w-[min(32%,14rem)] lg:w-[calc((100%-2.25rem)/4.35)] xl:w-[calc((100%-2.75rem)/4.35)]";

export function Gallery({ images, name }: GalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-gallery-card]");
    const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.22;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  const stepModal = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncEdges();
    el.addEventListener("scroll", syncEdges, { passive: true });
    const ro = new ResizeObserver(syncEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", syncEdges);
      ro.disconnect();
    };
  }, [syncEdges, images.length]);

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

  const canSlide = images.length > 4;

  return (
    <>
      <div className="relative">
        {/* Fade hint on the right edge — next frame peeks underneath */}
        {canNext && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-paper via-paper/70 to-transparent sm:w-16"
          />
        )}

        <div
          ref={trackRef}
          className="scrollbar-none flex gap-3 overflow-x-auto scroll-smooth pb-1 pr-8 sm:pr-12 lg:gap-3.5"
        >
          {images.map((img, index) => (
            <button
              key={img.url}
              type="button"
              data-gallery-card
              onClick={() => setOpen(index)}
              className={cn(
                "group relative aspect-[3/4] shrink-0 cursor-zoom-in overflow-hidden bg-paper-dark snap-start",
                CARD,
              )}
              aria-label={`${img.alt} — enlarge`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                priority={index < 5}
                sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 20vw, 40vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                draggable={false}
              />
              <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
            </button>
          ))}
        </div>

        {canSlide && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-[11px] tracking-[0.2em] text-stone uppercase">Slide to explore</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canPrev}
                aria-label="Previous images"
                className="grid size-10 place-items-center border border-ink/20 transition-colors hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowLeft width={16} height={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canNext}
                aria-label="Next images"
                className="grid size-10 place-items-center border border-ink/20 transition-colors hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowRight width={16} height={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} portfolio`}
          className="fixed inset-0 z-[70] flex flex-col bg-ink/40 text-paper backdrop-blur-[2px]"
          onClick={() => setOpen(null)}
        >
          <div className="flex items-center justify-between px-5 py-4 sm:px-8" onClick={(e) => e.stopPropagation()}>
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

          <div
            className="relative flex flex-1 items-center justify-center px-4 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
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

          <div className="scrollbar-none flex justify-center gap-2 overflow-x-auto px-5 pb-6" onClick={(e) => e.stopPropagation()}>
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                aria-label={`Image ${i + 1}`}
                aria-current={open === i}
                onClick={() => setOpen(i)}
                className={cn(
                  "relative size-12 shrink-0 overflow-hidden border transition sm:size-14",
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
