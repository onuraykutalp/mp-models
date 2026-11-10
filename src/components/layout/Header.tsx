"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { Sidebar } from "./Sidebar";
import { Heart } from "@/components/ui/Icons";
import { useShortlist } from "@/store/shortlist";
import { useUI } from "@/store/ui";
import { useHydrated } from "@/hooks/useHydrated";

export function Header() {
  const { menuOpen, toggleMenu } = useUI();
  const count = useShortlist((s) => s.items.length);
  const hydrated = useHydrated();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/85 text-ink backdrop-blur-md">
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-20">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="group -ml-2 flex items-center gap-3 justify-self-start px-2 py-2"
          >
            <span className="flex w-6 flex-col gap-1.5">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-4 bg-current transition-[width] duration-300 group-hover:w-full" />
            </span>
            <span className="hidden text-xs font-semibold tracking-[0.28em] uppercase sm:inline">Menu</span>
          </button>

          <Logo />

          <Link
            href="/shortlist"
            aria-label={`Shortlist (${hydrated ? count : 0})`}
            className="relative grid size-10 place-items-center justify-self-end rounded-full transition-colors hover:bg-current/10"
          >
            <Heart filled={hydrated && count > 0} />
            {hydrated && count > 0 && (
              <span className="absolute top-0.5 right-0.5 grid min-w-4.5 place-items-center rounded-full bg-clay px-1 text-[10px] leading-4.5 font-bold text-paper">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>
      <Sidebar />
    </>
  );
}
