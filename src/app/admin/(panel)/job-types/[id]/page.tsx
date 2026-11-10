import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobTypeForm } from "@/components/admin/JobTypeForm";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconArrowLeft, IconExternal } from "@/components/admin/icons";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { castPath } from "@/lib/utils";

const getJobType = (id: string) =>
  prisma.jobType.findUnique({
    where: { id },
    include: { models: { orderBy: { order: "asc" }, select: { modelId: true } } },
  });

export async function generateMetadata({ params }: PageProps<"/admin/job-types/[id]">): Promise<Metadata> {
  const job = await getJobType((await params).id);
  return { title: job ? job.title : "Job type not found" };
}

export default async function EditJobTypePage({ params }: PageProps<"/admin/job-types/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const [job, models] = await Promise.all([
    getJobType(id),
    prisma.model.findMany({
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
    }),
  ]);

  if (!job) notFound();

  const path = castPath(job.token);

  return (
    <>
      <Link href="/admin/job-types" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
        <IconArrowLeft width={16} height={16} /> Job types
      </Link>
      <PageHeader
        title={job.title}
        description={
          job.clientName
            ? `${job.clientName} · ${job.models.length} models`
            : `${job.models.length} models · private share link`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={path} />
            <a href={path} target="_blank" rel="noreferrer" className="admin-btn-ghost">
              <IconExternal width={16} height={16} />
              Open page
            </a>
          </div>
        }
      />
      <JobTypeForm
        id={job.id}
        models={models}
        initial={{
          title: job.title,
          description: job.description ?? "",
          clientName: job.clientName ?? "",
          active: job.active,
          modelIds: job.models.map((m) => m.modelId),
        }}
      />
    </>
  );
}
