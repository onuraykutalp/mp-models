import { create } from "zustand";

export type SortKey = "featured" | "name" | "height-asc" | "height-desc";
export type GridDensity = "comfortable" | "compact";

interface FilterState {
  query: string;
  hair: string[];
  eyes: string[];
  minHeight: number;
  maxHeight: number;
  sort: SortKey;
  density: GridDensity;
  panelOpen: boolean;
  setQuery: (query: string) => void;
  toggleHair: (value: string) => void;
  toggleEyes: (value: string) => void;
  setHeightRange: (min: number, max: number) => void;
  setSort: (sort: SortKey) => void;
  setDensity: (density: GridDensity) => void;
  setPanelOpen: (open: boolean) => void;
  reset: () => void;
}

/** Slider edges mean "no limit", so models outside the range still show until the user narrows it. */
export const HEIGHT_BOUNDS = { min: 100, max: 200 } as const;

export const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name (A-Z)" },
  { value: "height-desc", label: "Height (tallest first)" },
  { value: "height-asc", label: "Height (shortest first)" },
];

const initial = {
  query: "",
  hair: [] as string[],
  eyes: [] as string[],
  minHeight: HEIGHT_BOUNDS.min,
  maxHeight: HEIGHT_BOUNDS.max,
  sort: "featured" as SortKey,
};

const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export const useFilters = create<FilterState>()((set) => ({
  ...initial,
  density: "comfortable",
  panelOpen: false,
  setQuery: (query) => set({ query }),
  toggleHair: (value) => set((s) => ({ hair: toggleIn(s.hair, value) })),
  toggleEyes: (value) => set((s) => ({ eyes: toggleIn(s.eyes, value) })),
  setHeightRange: (minHeight, maxHeight) => set({ minHeight, maxHeight }),
  setSort: (sort) => set({ sort }),
  setDensity: (density) => set({ density }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  reset: () => set(initial),
}));

export const useActiveFilterCount = () =>
  useFilters(
    (s) =>
      s.hair.length +
      s.eyes.length +
      (s.minHeight !== HEIGHT_BOUNDS.min || s.maxHeight !== HEIGHT_BOUNDS.max ? 1 : 0) +
      (s.query ? 1 : 0),
  );
