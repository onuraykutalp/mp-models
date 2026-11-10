import type { Metadata } from "next";
import Link from "next/link";
import { ModelsBoard } from "@/components/admin/ModelsBoard";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconPlus } from "@/components/admin/icons";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { resolveBoardParams } from "@/lib/utils";

export const metadata: Metadata = { title: "Models" };

export default async function AdminModelsPage({ searchParams }: PageProps<"/admin/models">) {
  await requireAdmin();
  const { category, board, saved } = await searchParams;
  const initial = resolveBoardParams(
    typeof category === "string" ? category : undefined,
    typeof board === "string" ? board : undefined,
  );

  const models = await prisma.model.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      division: true,
      board: true,
      coverImage: true,
      height: true,
      city: true,
      featured: true,
      published: true,
      updatedAt: true,
      _count: { select: { images: true, videos: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Models"
        description={`${models.length} models and talents across all boards`}
        actions={
          <Link href="/admin/models/new" className="admin-btn-primary">
            <IconPlus width={16} height={16} />
            New model
          </Link>
        }
      />
      <ModelsBoard
        models={models.map(({ _count, updatedAt, ...m }) => ({
          ...m,
          media: _count.images + _count.videos,
          updatedAt: updatedAt.toISOString(),
        }))}
        initialCategory={initial.division?.key}
        initialBoard={initial.board?.key}
        savedName={typeof saved === "string" ? saved : undefined}
      />
    </>
  );
}
