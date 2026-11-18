import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { mark: "h-6", label: "mt-1.5 gap-2 text-[7px] tracking-[0.5em]", rule: "w-4" },
  md: { mark: "h-9", label: "mt-2 gap-2.5 text-[9px] tracking-[0.55em]", rule: "w-6" },
  lg: {
    mark: "h-12 sm:h-16 lg:h-20",
    label: "mt-5 gap-3 text-[10px] tracking-[0.7em] sm:text-[11px]",
    rule: "w-8 sm:w-14",
  },
} as const;

interface WordmarkProps {
  size?: keyof typeof SIZES;
  label?: string;
  className?: string;
}

/** Aspect ratio of public/brand/three15-wordmark.png (1612 × 326). */
const RATIO = 1612 / 326;

/** The wordmark PNG is an alpha mask, so it takes on the surrounding text colour (light or dark). */
const MASK: CSSProperties = {
  aspectRatio: RATIO,
  WebkitMaskImage: "url(/brand/three15-wordmark.png)",
  maskImage: "url(/brand/three15-wordmark.png)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

/** High-contrast Didone THREE15 with a thin-ruled MANAGEMENT line — editorial fashion-house lock-up. */
export function Wordmark({ size = "sm", label = "Management", className }: WordmarkProps) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex flex-col items-center leading-none select-none", className)}>
      <span role="img" aria-label="Three15" className={cn("block bg-current", s.mark)} style={MASK} />
      <span className={cn("flex items-center font-sans font-light uppercase", s.label)} aria-hidden>
        <span className={cn("h-px bg-current opacity-45", s.rule)} />
        <span className="pl-[0.55em]">{label}</span>
        <span className={cn("h-px bg-current opacity-45", s.rule)} />
      </span>
    </span>
  );
}
