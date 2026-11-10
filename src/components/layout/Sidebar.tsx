"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { boardMenu, secondaryLinks } from "./nav";
import { Close, Instagram } from "@/components/ui/Icons";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen } = useUI();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, setMenuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <div className={cn("fixed inset-0 z-[60]", !menuOpen && "pointer-events-none")} aria-hidden={!menuOpen}>
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-500",
          menuOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!menuOpen}
        className={cn(
          "absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-paper text-ink shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)]",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-6 lg:h-20 lg:px-8">
          <Logo />
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/5"
          >
            <Close />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-6 py-8 lg:px-8">
          <p className="eyebrow mb-4 text-stone">Boards</p>
          <ul className="space-y-4">
            {boardMenu.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="font-display block text-4xl transition-colors hover:text-clay"
                >
                  {item.label}
                </Link>
                {item.children.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 border-l border-line pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={close}
                          className="text-xs font-semibold tracking-[0.2em] text-stone uppercase transition-colors hover:text-ink"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-10 mb-4 text-stone">Agency</p>
          <ul className="space-y-3 text-base font-medium">
            {[...secondaryLinks, { href: "/shortlist", label: "Shortlist" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className={cn("link-underline", pathname.startsWith(link.href) && "after:scale-x-100")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-1 border-t border-line pt-6 text-sm text-stone">
            <a href="mailto:booking@mpmodels.com" className="link-underline text-ink">
              booking@mpmodels.com
            </a>
            <div className="flex items-center justify-between pt-2">
              <span>Istanbul — Milan</span>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-ink">
                <Instagram />
              </a>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
}
