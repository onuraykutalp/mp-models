import { cn } from "@/lib/utils";

const SIZES = {
  sm: { mark: "text-[1.6rem]", label: "mt-1 gap-1.5 text-[6.5px] tracking-[0.6em]", rule: "w-2.5" },
  md: { mark: "text-4xl", label: "mt-1.5 gap-2 text-[8px] tracking-[0.6em]", rule: "w-4" },
  lg: {
    mark: "text-6xl sm:text-7xl lg:text-8xl",
    label: "mt-3 gap-3 text-[10px] tracking-[0.7em] sm:text-[11px]",
    rule: "w-6 sm:w-10",
  },
} as const;

interface WordmarkProps {
  size?: keyof typeof SIZES;
  label?: string;
  className?: string;
}

/** MP monogram: upright Didone M interlocked with an italic P, over a ruled small-caps label. */
export function Wordmark({ size = "sm", label = "Models", className }: WordmarkProps) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex flex-col items-center leading-none select-none", className)}>
      <span className={cn("font-display flex items-baseline tracking-tight", s.mark)} aria-hidden>
        <span>M</span>
        <span className="-ml-[0.16em] italic">P</span>
      </span>
      <span className={cn("flex items-center font-sans font-light uppercase", s.label)} aria-hidden>
        <span className={cn("h-px bg-current opacity-50", s.rule)} />
        {/* Left padding matches the trailing letter-spacing so the word sits visually centred. */}
        <span className="pl-[0.6em]">{label}</span>
        <span className={cn("h-px bg-current opacity-50", s.rule)} />
      </span>
    </span>
  );
}
