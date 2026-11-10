"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type { Model } from "@/types";
import { ModelCard } from "./ModelCard";
import { FilterPanel } from "./FilterPanel";
import { Grid2, Grid3, Search, Sliders } from "@/components/ui/Icons";
import { HEIGHT_BOUNDS, SORTS, useActiveFilterCount, useFilters, type SortKey } from "@/store/filters";
import { cn } from "@/lib/utils";

const uniq = (values: (string | null)[]) =>
  [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b, "en"));

/** Talents without a height sort after everyone else in either direction. */
const byHeight = (dir: 1 | -1) => (a: Model, b: Model) =>
  a.height == null ? 1 : b.height == null ? -1 : (a.height - b.height) * dir;

/** Lets "sahin" match "Şahin" and "ipek" match "İpek". */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase();

interface ModelsExplorerProps {
  models: Model[];
  showDivision?: boolean;
  showBoard?: boolean;
}

export function ModelsExplorer({ models, showDivision, showBoard }: ModelsExplorerProps) {
  const { query, hair, eyes, minHeight, maxHeight, sort, density } = useFilters(
    useShallow((s) => ({
      query: s.query,
      hair: s.hair,
      eyes: s.eyes,
      minHeight: s.minHeight,
      maxHeight: s.maxHeight,
      sort: s.sort,
      density: s.density,
    })),
  );
  const { setQuery, setSort, setDensity, setPanelOpen, reset } = useFilters.getState();
  const activeCount = useActiveFilterCount();

  const hairOptions = useMemo(() => uniq(models.map((m) => m.hair)), [models]);
  const eyeOptions = useMemo(() => uniq(models.map((m) => m.eyes)), [models]);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    const list = models.filter(
      (m) =>
        (!q || fold(`${m.firstName} ${m.lastName} ${m.city}`).includes(q)) &&
        (!hair.length || (m.hair != null && hair.includes(m.hair))) &&
        (!eyes.length || (m.eyes != null && eyes.includes(m.eyes))) &&
        (minHeight <= HEIGHT_BOUNDS.min || (m.height != null && m.height >= minHeight)) &&
        (maxHeight >= HEIGHT_BOUNDS.max || (m.height != null && m.height <= maxHeight)),
    );
    switch (sort) {
      case "name":
        return [...list].sort((a, b) => a.firstName.localeCompare(b.firstName, "en"));
      case "height-asc":
        return [...list].sort(byHeight(1));
      case "height-desc":
        return [...list].sort(byHeight(-1));
      default:
        return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }, [models, query, hair, eyes, minHeight, maxHeight, sort]);

  return (
    <>
      <div className="sticky top-16 z-30 border-y border-line bg-paper/90 backdrop-blur-md lg:top-20">
        <div className="container-x flex h-16 items-center gap-3 sm:gap-6">
          <label className="flex flex-1 items-center gap-3">
            <Search className="shrink-0 text-stone" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or city"
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone"
            />
          </label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort by"
            className="hidden cursor-pointer bg-transparent text-sm font-medium outline-none md:block"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="hidden items-center gap-1 border-l border-line pl-6 md:flex">
            {(
              [
                ["comfortable", Grid2, "Large grid"],
                ["compact", Grid3, "Compact grid"],
              ] as const
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDensity(value)}
                aria-label={label}
                aria-pressed={density === value}
                className={cn(
                  "grid size-9 place-items-center rounded-full transition-colors",
                  density === value ? "bg-ink text-paper" : "text-stone hover:text-ink",
                )}
              >
                <Icon width={16} height={16} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/20 px-4 text-sm font-medium transition-colors hover:border-ink"
          >
            <Sliders width={16} height={16} />
            <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-clay text-[10px] font-bold text-paper">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="container-x py-10 lg:py-14">
        <p className="mb-8 text-sm text-stone">
          Showing <span className="font-semibold text-ink">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "model" : "models"}
        </p>

        {filtered.length ? (
          <div
            className={cn(
              "grid gap-x-4 gap-y-10 sm:gap-x-6",
              density === "comfortable"
                ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-2 md:grid-cols-4 xl:grid-cols-6",
            )}
          >
            {filtered.map((model, i) => (
              <ModelCard
                key={model.slug}
                model={model}
                priority={i < 4}
                showDivision={showDivision}
                showBoard={showBoard}
                sizes={
                  density === "comfortable"
                    ? "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                    : "(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw"
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            {models.length === 0 ? (
              <>
                <p className="font-display text-4xl">
                  Coming <em>soon</em>
                </p>
                <p className="max-w-sm text-stone">This board is being curated. Check back shortly or get in touch with our bookers.</p>
              </>
            ) : (
              <>
                <p className="font-display text-4xl">No results</p>
                <p className="max-w-sm text-stone">No models match your filters. Try broadening your search.</p>
                <button
                  type="button"
                  onClick={reset}
                  className="h-12 rounded-full bg-ink px-8 text-sm font-semibold text-paper hover:bg-clay"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <FilterPanel hairOptions={hairOptions} eyeOptions={eyeOptions} resultCount={filtered.length} />
    </>
  );
}
