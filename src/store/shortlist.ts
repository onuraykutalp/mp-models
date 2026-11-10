import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShortlistItem } from "@/types";

interface ShortlistState {
  items: ShortlistItem[];
  toggle: (item: ShortlistItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const useShortlist = create<ShortlistState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item) =>
        set((state) =>
          state.items.some((i) => i.slug === item.slug)
            ? { items: state.items.filter((i) => i.slug !== item.slug) }
            : { items: [...state.items, item] },
        ),
      remove: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "mp-shortlist",
      storage: createJSONStorage(() => localStorage),
      // Older snapshots hold Turkish city names (v0), retired divisions (v1) or no board (v2); drop them rather than show stale data.
      version: 3,
      migrate: () => ({ items: [] }),
    },
  ),
);

export const useIsShortlisted = (slug: string) =>
  useShortlist((state) => state.items.some((i) => i.slug === slug));
