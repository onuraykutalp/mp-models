import type { Metadata } from "next";
import Link from "next/link";
import { JobTypesBoard } from "@/components/admin/JobTypesBoard";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconPlus } from "@/components/admin/icons";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Job types" };

export default async function JobTypesPage({ searchParams }: PageProps<"/admin/job-types">) {
  await requireAdmin();
  const { saved } = await searchParams;

  const rows = await prisma.jobType.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { models: true } } },
  });

  return (
    <>
      <PageHeader
        title="Job types"
        description="Private casting boards you can send to clients — not listed anywhere on the public website."
        actions={
          <Link href="/admin/job-types/new" className="admin-btn-primary">
            <IconPlus width={16} height={16} />
            New job type
          </Link>
        }
      />
      <JobTypesBoard
        savedName={typeof saved === "string" ? saved : undefined}
        items={rows.map((r) => ({
          id: r.id,
          title: r.title,
          clientName: r.clientName,
          token: r.token,
          active: r.active,
          modelCount: r._count.models,
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </>
  );
}
