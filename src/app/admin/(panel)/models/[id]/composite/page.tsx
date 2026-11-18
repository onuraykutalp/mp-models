import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompositeCardBuilder } from "@/components/admin/CompositeCardBuilder";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconArrowLeft } from "@/components/admin/icons";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { mediaInclude } from "@/lib/queries";
import { fullName } from "@/lib/utils";

const getModel = (id: string) => prisma.model.findUnique({ where: { id }, include: mediaInclude });

export async function generateMetadata({ params }: PageProps<"/admin/models/[id]/composite">): Promise<Metadata> {
  const model = await getModel((await params).id);
  return { title: model ? `Composite card — ${fullName(model)}` : "Model not found" };
}

export default async function CompositeCardPage({ params }: PageProps<"/admin/models/[id]/composite">) {
  await requireAdmin();
  const model = await getModel((await params).id);
  if (!model) notFound();

  const { height, bust, waist, hips, shoes } = model;
  const stats = (
    [
      ["Height", height != null && `${height}`],
      [model.division === "MEN" ? "Chest" : "Bust", bust != null && `${bust}`],
      ["Waist", waist != null && `${waist}`],
      ["Hips", hips != null && `${hips}`],
      ["Shoes", shoes != null && `${shoes} EU`],
      ["Hair", model.hair],
      ["Eyes", model.eyes],
    ] as [string, string | false | null][]
  ).filter((row): row is [string, string] => !!row[1]);

  // Portfolio first, then snaps — both in the order set in the model editor.
  const photos = [...model.images.filter((i) => i.kind === "PORTFOLIO"), ...model.images.filter((i) => i.kind === "SNAP")].map((i) => i.url);

  return (
    <>
      <Link href={`/admin/models/${model.id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
        <IconArrowLeft width={16} height={16} /> {fullName(model)}
      </Link>
      <PageHeader
        title="Composite card"
        description={`Pick five photos for ${fullName(model)} and download a ready-to-send card with name and measurements.`}
      />
      <CompositeCardBuilder model={{ slug: model.slug, name: fullName(model), stats }} photos={photos} />
    </>
  );
}