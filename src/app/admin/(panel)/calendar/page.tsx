import type { Metadata } from "next";
import { CalendarView } from "@/components/admin/CalendarView";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  await requireAdmin();
  const sp = await searchParams;
  const now = new Date();
  const year = clampInt(sp.y, now.getFullYear(), 2020, 2100);
  const month = clampInt(sp.m, now.getMonth() + 1, 1, 12);

  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 0));

  const [jobs, models] = await Promise.all([
    prisma.modelJob.findMany({
      where: {
        OR: [
          { date: { gte: from, lte: to } },
          { endDate: { gte: from, lte: to } },
          { AND: [{ date: { lte: from } }, { endDate: { gte: to } }] },
        ],
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      include: {
        model: { select: { id: true, firstName: true, lastName: true, coverImage: true } },
      },
    }),
    prisma.model.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true, coverImage: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Every assigned job — Basic Event, Work, Fitting and Zoom Call — with fees and location."
      />
      <CalendarView
        year={year}
        month={month}
        models={models}
        jobs={jobs.map((j) => ({
          id: j.id,
          kind: j.kind,
          customTitle: j.customTitle,
          date: j.date.toISOString().slice(0, 10),
          endDate: j.endDate?.toISOString().slice(0, 10) ?? null,
          agencyFee: Number(j.agencyFee),
          modelFee: Number(j.modelFee),
          currency: j.currency,
          country: j.country,
          city: j.city,
          notes: j.notes,
          model: j.model,
        }))}
      />
    </>
  );
}

function clampInt(raw: string | string[] | undefined, fallback: number, min: number, max: number) {
  const n = Number(typeof raw === "string" ? raw : fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
