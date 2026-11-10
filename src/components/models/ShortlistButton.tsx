"use client";

import type { ShortlistItem } from "@/types";
import { Check, Heart, Plus } from "@/components/ui/Icons";
import { useIsShortlisted, useShortlist } from "@/store/shortlist";
import { useHydrated } from "@/hooks/useHydrated";
import { cn, fullName } from "@/lib/utils";

type Props = {
  model: ShortlistItem;
  variant?: "icon" | "full";
  className?: string;
};

export function ShortlistButton({ model, variant = "icon", className }: Props) {
  const hydrated = useHydrated();
  const toggle = useShortlist((s) => s.toggle);
  const selected = useIsShortlisted(model.slug) && hydrated;
  const { slug, firstName, lastName, division, board, coverImage, height, city, nationality } = model;
  const onClick = () => toggle({ slug, firstName, lastName, division, board, coverImage, height, city, nationality });
  const label = selected
    ? `Remove ${fullName(model)} from shortlist`
    : `Add ${fullName(model)} to shortlist`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-3 rounded-full border px-6 text-sm font-medium transition-colors",
          selected ? "border-ink bg-ink text-paper" : "border-ink/25 hover:border-ink hover:bg-ink hover:text-paper",
          className,
        )}
      >
        {selected ? <Check width={18} height={18} /> : <Plus width={18} height={18} />}
        {selected ? "Shortlisted" : "Add to shortlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-10 place-items-center rounded-full backdrop-blur-md transition-all duration-300",
        selected ? "bg-clay text-paper" : "bg-paper/80 text-ink hover:bg-paper",
        className,
      )}
    >
      <Heart filled={selected} width={18} height={18} />
    </button>
  );
}
