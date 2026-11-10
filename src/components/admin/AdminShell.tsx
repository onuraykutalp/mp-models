"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import {
  IconBriefcase,
  IconCalendar,
  IconClose,
  IconDashboard,
  IconExternal,
  IconLogout,
  IconMenu,
  IconPlus,
  IconSettings,
  IconUsers,
} from "./icons";
import { Wordmark } from "@/components/layout/Wordmark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: IconDashboard, exact: true },
  { href: "/admin/models", label: "Models", icon: IconUsers },
  { href: "/admin/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/admin/job-types", label: "Job types", icon: IconBriefcase },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
];

interface AdminShellProps {
  admin: { name: string; email: string };
  children: ReactNode;
}

export function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" onClick={() => setOpen(false)} aria-label="MP Admin" className="inline-flex">
          <Wordmark label="Admin" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/5 lg:hidden"
        >
          <IconClose />
        </button>
      </div>

      <div className="px-3 pt-2">
        <Link
          href="/admin/models/new"
          onClick={() => setOpen(false)}
          className="admin-btn-primary h-10 w-full"
        >
          <IconPlus width={16} height={16} />
          New model
        </Link>
      </div>

      <nav aria-label="Admin" className="mt-6 flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[11px] font-medium tracking-wider text-zinc-500 uppercase">Manage</p>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                active ? "bg-white/[0.07] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-clay-light" />}
              <Icon className={active ? "text-clay-light" : "text-zinc-500 group-hover:text-zinc-300"} />
              {label}
            </Link>
          );
        })}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100"
        >
          <IconExternal className="text-zinc-500 group-hover:text-zinc-300" />
          View website
        </a>
      </nav>

      <div className="m-3 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-clay-light to-clay text-sm font-semibold text-[#fff]">
          {admin.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{admin.name}</span>
          <span className="block truncate text-xs text-zinc-500">{admin.email}</span>
        </span>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="grid size-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-100"
          >
            <IconLogout width={16} height={16} />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] admin-surface lg:block">
        {sidebar}
      </aside>

      <div className={cn("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-black/25 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          inert={!open}
          className={cn(
            "absolute inset-y-0 left-0 w-72 border-r border-white/[0.06] admin-surface transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {sidebar}
        </aside>
      </div>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#f4f1ec]/80 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-lg text-zinc-300 hover:bg-white/5"
        >
          <IconMenu />
        </button>
        <Link href="/admin" aria-label="MP Admin" className="inline-flex">
          <Wordmark label="Admin" />
        </Link>
        <Link href="/admin/models/new" aria-label="New model" className="grid size-10 place-items-center rounded-lg text-clay-light hover:bg-white/5">
          <IconPlus />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
