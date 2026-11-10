import type { Metadata } from "next";
import Link from "next/link";
import type { Division } from "@/types";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  IconArrowRight,
  IconCalendar,
  IconEyeOff,
  IconInbox,
  IconMail,
  IconPlus,
  IconStar,
  IconUsers,
} from "@/components/admin/icons";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { BOARDS, DIVISIONS, categoryLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const DIVISION_COLORS: Record<Division, string> = {
  WOMEN: "bg-clay-light",
  MEN: "bg-sky-400",
  KIDS: "bg-amber-300",
  TALENTS: "bg-emerald-400",
};

const timeAgo = (date: Date) => {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days}d ago` : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const greeting = () => {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", timeZone: "Europe/Istanbul" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

export default async function DashboardPage() {
  const admin = await requireAdmin();

  const [total, drafts, featured, groups, pending, bookings, messages, recentModels, applications, recentBookings] =
    await Promise.all([
      prisma.model.count(),
      prisma.model.count({ where: { published: false } }),
      prisma.model.count({ where: { featured: true } }),
      prisma.model.groupBy({ by: ["division", "board"], _count: { _all: true } }),
      prisma.application.count({ where: { status: "PENDING" } }),
      prisma.bookingRequest.count(),
      prisma.contactMessage.count(),
      prisma.model.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, firstName: true, lastName: true, division: true, board: true, coverImage: true, published: true, updatedAt: true },
      }),
      prisma.application.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
      prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, take: 4, include: { _count: { select: { models: true } } } }),
    ]);

  const counts: Record<string, number> = {};
  for (const g of groups) {
    counts[g.division] = (counts[g.division] ?? 0) + g._count._all;
    if (g.board) counts[`${g.division}:${g.board}`] = g._count._all;
  }

  const stats = [
    { label: "Models & talents", value: total, icon: IconUsers, hint: `${total - drafts} live on the website` },
    { label: "Featured", value: featured, icon: IconStar, hint: "Shown on the homepage" },
    { label: "Drafts", value: drafts, icon: IconEyeOff, hint: "Hidden from the website" },
    { label: "New applications", value: pending, icon: IconInbox, hint: `${bookings} booking requests · ${messages} messages` },
  ];

  const inbox = [
    ...applications.map((a) => ({
      id: `a-${a.id}`,
      icon: IconInbox,
      title: `${a.firstName} ${a.lastName}`,
      detail: `Application · ${a.height} cm · ${a.city}`,
      date: a.createdAt,
    })),
    ...recentBookings.map((b) => ({
      id: `b-${b.id}`,
      icon: IconCalendar,
      title: b.company,
      detail: `Booking request · ${b._count.models} model${b._count.models === 1 ? "" : "s"}`,
      date: b.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
        title={`${greeting()}, ${admin.name.split(" ")[0]}`}
        description="Here's what's happening across your boards."
        actions={
          <Link href="/admin/models/new" className="admin-btn-primary">
            <IconPlus width={16} height={16} />
            New model
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="admin-card relative overflow-hidden p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400 sm:text-sm">{label}</p>
              <span className="grid size-8 place-items-center rounded-lg bg-white/[0.05] text-zinc-400">
                <Icon width={16} height={16} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="mt-1 truncate text-xs text-zinc-500">{hint}</p>
          </div>
        ))}
      </div>

      <div className="admin-card mt-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Boards</h2>
          <Link href="/admin/models" className="text-xs font-medium text-zinc-400 hover:text-white">
            Manage models
          </Link>
        </div>
        <div className="mt-5 flex h-2.5 gap-1 overflow-hidden rounded-full">
          {DIVISIONS.map((d) => (
            <span
              key={d.key}
              className={`${DIVISION_COLORS[d.key]} rounded-full`}
              style={{ flexGrow: counts[d.key] ?? 0 }}
            />
          ))}
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {DIVISIONS.map((d) => (
            <li key={d.key} className="rounded-xl border border-white/[0.06] p-3 transition-colors hover:border-white/15">
              <Link href={`/admin/models?category=${d.slug}`} className="group block">
                <span className="flex items-center gap-2 text-xs text-zinc-400 group-hover:text-white">
                  <span className={`size-2 rounded-full ${DIVISION_COLORS[d.key]}`} />
                  {d.label}
                </span>
                <span className="mt-1 block text-xl font-semibold tabular-nums">{counts[d.key] ?? 0}</span>
              </Link>
              {d.boards.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1">
                  {d.boards.map((b) => (
                    <li key={b}>
                      <Link
                        href={`/admin/models?category=${d.slug}&board=${BOARDS[b].slug}`}
                        className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                      >
                        {BOARDS[b].label}
                        <span className="text-zinc-600 tabular-nums">{counts[`${d.key}:${b}`] ?? 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <section className="admin-card p-5 sm:p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recently updated</h2>
            <Link href="/admin/models" className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white">
              All models <IconArrowRight width={14} height={14} />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {recentModels.map((m) => (
              <li key={m.id}>
                <Link href={`/admin/models/${m.id}`} className="group flex items-center gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.coverImage} alt="" className="size-11 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium group-hover:text-clay-light">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {categoryLabel(m)} · {timeAgo(m.updatedAt)}
                    </span>
                  </span>
                  {!m.published && (
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-zinc-400">Draft</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-semibold">Inbox</h2>
          {inbox.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
              <IconMail className="text-zinc-600" width={24} height={24} />
              <p className="mt-3 text-sm text-zinc-400">No applications or booking requests yet.</p>
              <p className="mt-1 text-xs text-zinc-500">New submissions from the website will show up here.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-1">
              {inbox.map(({ id, icon: Icon, title, detail, date }) => (
                <li key={id} className="flex items-center gap-3 rounded-xl py-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-zinc-400">
                    <Icon width={16} height={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{title}</span>
                    <span className="block truncate text-xs text-zinc-500">{detail}</span>
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">{timeAgo(date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
