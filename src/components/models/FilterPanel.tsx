"use client";

import { useEffect } from "react";
import { Close } from "@/components/ui/Icons";
import { HEIGHT_BOUNDS, SORTS, useFilters } from "@/store/filters";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  hairOptions: string[];
  eyeOptions: string[];
  resultCount: number;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

export function FilterPanel({ hairOptions, eyeOptions, resultCount }: FilterPanelProps) {
  const {
    panelOpen,
    setPanelOpen,
    hair,
    eyes,
    toggleHair,
    toggleEyes,
    minHeight,
    maxHeight,
    setHeightRange,
    sort,
    setSort,
    reset,
  } = useFilters();

  useEffect(() => {
    if (!panelOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanelOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [panelOpen, setPanelOpen]);

  return (
    <div className={cn("fixed inset-0 z-[60]", panelOpen ? "visible" : "invisible")} aria-hidden={!panelOpen}>
      <div
        onClick={() => setPanelOpen(false)}
        className={cn("absolute inset-0 bg-ink/40 transition-opacity duration-500", panelOpen ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-label="Filters"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
          panelOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-3xl">Filters</h2>
          <button type="button" onClick={() => setPanelOpen(false)} aria-label="Close" className="grid size-10 place-items-center">
            <Close />
          </button>
        </div>

        <div className="flex-1 space-y-10 overflow-y-auto px-6 py-8">
          <fieldset className="md:hidden">
            <legend className="eyebrow mb-4 text-stone">Sort by</legend>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <Chip key={s.value} active={sort === s.value} onClick={() => setSort(s.value)}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-4 text-stone">Height (cm)</legend>
            <div className="flex items-center justify-between text-sm font-semibold tabular-nums">
              <span>{minHeight}</span>
              <span>{maxHeight}</span>
            </div>
            <div className="relative mt-3 h-6">
              <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-line" />
              <div
                className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink"
                style={{
                  left: `${((minHeight - HEIGHT_BOUNDS.min) / (HEIGHT_BOUNDS.max - HEIGHT_BOUNDS.min)) * 100}%`,
                  right: `${100 - ((maxHeight - HEIGHT_BOUNDS.min) / (HEIGHT_BOUNDS.max - HEIGHT_BOUNDS.min)) * 100}%`,
                }}
              />
              {(["min", "max"] as const).map((edge) => (
                <input
                  key={edge}
                  type="range"
                  aria-label={edge === "min" ? "Minimum height" : "Maximum height"}
                  min={HEIGHT_BOUNDS.min}
                  max={HEIGHT_BOUNDS.max}
                  value={edge === "min" ? minHeight : maxHeight}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (edge === "min") setHeightRange(Math.min(v, maxHeight - 1), maxHeight);
                    else setHeightRange(minHeight, Math.max(v, minHeight + 1));
                  }}
                  className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink"
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-4 text-stone">Hair colour</legend>
            <div className="flex flex-wrap gap-2">
              {hairOptions.map((o) => (
                <Chip key={o} active={hair.includes(o)} onClick={() => toggleHair(o)}>
                  {o}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-4 text-stone">Eye colour</legend>
            <div className="flex flex-wrap gap-2">
              {eyeOptions.map((o) => (
                <Chip key={o} active={eyes.includes(o)} onClick={() => toggleEyes(o)}>
                  {o}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex gap-3 border-t border-line px-6 py-5">
          <button
            type="button"
            onClick={reset}
            className="h-12 flex-1 rounded-full border border-ink/20 text-sm font-medium transition-colors hover:border-ink"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="h-12 flex-[2] rounded-full bg-ink text-sm font-semibold text-paper transition-colors hover:bg-clay"
          >
            Show {resultCount} {resultCount === 1 ? "model" : "models"}
          </button>
        </div>
      </aside>
    </div>
  );
}
