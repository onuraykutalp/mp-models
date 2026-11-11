import { cn } from "@/lib/utils";

const SIZES = {
  sm: { mark: "h-7", label: "mt-1 gap-1.5 text-[6.5px] tracking-[0.55em]", rule: "w-2.5" },
  md: { mark: "h-11", label: "mt-1.5 gap-2 text-[8px] tracking-[0.55em]", rule: "w-4" },
  lg: {
    mark: "h-16 sm:h-20 lg:h-24",
    label: "mt-4 gap-3 text-[10px] tracking-[0.7em] sm:text-[11px]",
    rule: "w-8 sm:w-12",
  },
} as const;

interface WordmarkProps {
  size?: keyof typeof SIZES;
  label?: string;
  className?: string;
}

/** Thin digital-clock wordmark: 3:15 — fashion-house restraint, not gadget chrome. */
export function Wordmark({ size = "sm", label = "Management", className }: WordmarkProps) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex flex-col items-center leading-none select-none", className)}>
      <ClockFace className={cn("w-auto text-current", s.mark)} pulse={size === "lg"} />
      <span className={cn("flex items-center font-sans font-light uppercase", s.label)} aria-hidden>
        <span className={cn("h-px bg-current opacity-45", s.rule)} />
        <span className="pl-[0.55em]">{label}</span>
        <span className={cn("h-px bg-current opacity-45", s.rule)} />
      </span>
    </span>
  );
}

function ClockFace({ className, pulse }: { className?: string; pulse?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 3 */}
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M18 14 H52" />
        <path d="M52 14 V40" />
        <path d="M26 44 H52" />
        <path d="M52 44 V74" />
        <path d="M18 74 H52" />
      </g>

      {/* colon */}
      <g className={pulse ? "animate-clock-colon" : undefined}>
        <rect x="72" y="30" width="5.5" height="5.5" fill="currentColor" />
        <rect x="72" y="52" width="5.5" height="5.5" fill="currentColor" />
      </g>

      {/* 1 */}
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="square">
        <path d="M108 18 L120 14" />
        <path d="M120 14 V74" />
        <path d="M108 74 H132" />
      </g>

      {/* 5 — bottom aligned to the same right edge as the middle bar (182) */}
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M182 14 H152" />
        <path d="M152 14 V44" />
        <path d="M152 44 H182" />
        <path d="M182 44 V74" />
        <path d="M182 74 H152" />
      </g>
    </svg>
  );
}
