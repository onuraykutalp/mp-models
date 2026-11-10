import type { Metadata } from "next";
import Link from "next/link";
import { JobTypeForm } from "@/components/admin/JobTypeForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconArrowLeft } from "@/components/admin/icons";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "New job type" };

export default async function NewJobTypePage() {
  await requireAdmin();

  const models = await prisma.model.findMany({
    orderBy: [{ division: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      division: true,
      board: true,
      coverImage: true,
      city: true,
      published: true,
    },
  });

  return (
    <>
      <Link href="/admin/job-types" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
        <IconArrowLeft width={16} height={16} /> Job types
      </Link>
      <PageHeader
        title="New job type"
        description="Name the casting, pick the models that fit, then share the private link with your client."
      />
      <JobTypeForm
        models={models}
        initial={{ title: "", description: "", clientName: "", active: true, modelIds: [] }}
      />
    </>
  );
}
