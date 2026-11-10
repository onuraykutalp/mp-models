import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "./Icons";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
  tone?: "light" | "dark";
}

export function SectionHeading({ eyebrow, title, href, linkLabel, className, tone = "light" }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        <p className={cn("eyebrow mb-3", tone === "dark" ? "text-paper/60" : "text-stone")}>{eyebrow}</p>
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-3 text-sm font-medium">
          <span className="link-underline">{linkLabel ?? "View all"}</span>
          <span
            className={cn(
              "grid size-10 place-items-center rounded-full border transition-colors",
              tone === "dark"
                ? "border-paper/30 group-hover:bg-paper group-hover:text-ink"
                : "border-ink/20 group-hover:bg-ink group-hover:text-paper",
            )}
          >
            <ArrowRight width={16} height={16} />
          </span>
        </Link>
      )}
    </div>
  );
}
