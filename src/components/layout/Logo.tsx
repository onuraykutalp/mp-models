import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="MP Models home" className={cn("inline-flex", className)}>
      <Wordmark />
    </Link>
  );
}
