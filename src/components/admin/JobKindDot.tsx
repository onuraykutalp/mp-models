import { JOB_KINDS, type JobKind } from "@/lib/jobs";
import { cn } from "@/lib/utils";

export function JobKindDot({ kind, className }: { kind: JobKind; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full shadow-sm ring-2 ring-white/80", JOB_KINDS[kind].color, className)}
    />
  );
}

export function JobKindBadge({
  kind,
  label,
  className,
}: {
  kind: JobKind;
  label?: string;
  className?: string;
}) {
  const info = JOB_KINDS[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        info.soft,
        info.text,
        className,
      )}
    >
      <JobKindDot kind={kind} className="size-2 ring-0" />
      {label ?? info.label}
    </span>
  );
}
