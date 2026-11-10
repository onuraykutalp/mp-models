"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { NavItem } from "@/components/layout/nav";
import { ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const underline =
  "after:absolute after:inset-x-0 after:-bottom-1.5 after:mx-auto after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-500";

export function BoardMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const show = (label: string) => {
    clearTimeout(closeTimer.current);
    setOpen(label);
  };
  // A short grace period lets the pointer travel from the label down into the panel.
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };

  return (
    <ul
      ref={navRef}
      className="grid grid-cols-2 gap-x-8 gap-y-7 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-14 lg:gap-x-20 xl:gap-x-24"
    >
      {items.map((item, i) => {
        const hasMenu = item.children.length > 0;
        const isOpen = open === item.label;

        // Touch screens have no hover: the first tap opens the panel, a second tap follows the link.
        const onClick = (e: MouseEvent) => {
          if (hasMenu && !isOpen && window.matchMedia("(hover: none)").matches) {
            e.preventDefault();
            show(item.label);
          }
        };

        return (
          <li
            key={item.href}
            className={cn("animate-fade-up relative", isOpen && "z-30")}
            style={{ animationDelay: `${150 + i * 70}ms` }}
            onPointerEnter={(e) => hasMenu && e.pointerType === "mouse" && show(item.label)}
            onPointerLeave={(e) => hasMenu && e.pointerType === "mouse" && hide()}
            onFocus={() => hasMenu && show(item.label)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) hide();
            }}
          >
            <Link
              href={item.href}
              onClick={onClick}
              aria-haspopup={hasMenu ? "true" : undefined}
              aria-expanded={hasMenu ? isOpen : undefined}
              className={cn(
                "relative inline-flex items-center gap-2 text-2xl font-medium tracking-[0.26em] uppercase sm:text-3xl sm:tracking-[0.3em] xl:text-[2.5rem]",
                underline,
                isOpen ? "after:w-full" : "hover:after:w-full",
              )}
            >
              {item.label}
            </Link>

            {hasMenu && (
              <div
                className={cn(
                  "absolute top-full left-1/2 z-20 -translate-x-1/2 pt-5 transition-[opacity,translate] duration-300 ease-out",
                  isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                )}
              >
                <div className="w-max min-w-44 overflow-hidden rounded-sm border border-paper/15 bg-ink/75 p-2 shadow-2xl shadow-ink/40 backdrop-blur-xl sm:min-w-64">
                  <ul>
                    {item.children.map((child, j) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          tabIndex={isOpen ? undefined : -1}
                          onClick={() => setOpen(null)}
                          className="group/item flex items-center justify-between gap-6 px-3 py-3 text-xs font-semibold tracking-[0.3em] text-paper/75 uppercase transition-colors hover:bg-paper/[0.07] hover:text-paper focus-visible:bg-paper/[0.07] focus-visible:text-paper focus-visible:outline-none sm:px-4 sm:text-sm"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-[10px] font-medium tracking-normal text-paper/35 tabular-nums">
                              0{j + 1}
                            </span>
                            {child.label}
                          </span>
                          <ArrowRight
                            width={12}
                            height={12}
                            className="-translate-x-1 opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={item.href}
                    tabIndex={isOpen ? undefined : -1}
                    onClick={() => setOpen(null)}
                    className="mt-1 flex items-center justify-between border-t border-paper/10 px-3 pt-3 pb-2 text-[11px] font-semibold tracking-[0.3em] text-paper/50 uppercase transition-colors hover:text-paper sm:px-4"
                  >
                    All {item.label}
                    <ArrowRight width={12} height={12} />
                  </Link>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
