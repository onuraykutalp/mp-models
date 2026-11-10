import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModelForm } from "@/components/admin/ModelForm";
import { ModelJobsPanel } from "@/components/admin/ModelJobsPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconArrowLeft } from "@/components/admin/icons";
import { getAppearanceSuggestions } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { mediaInclude } from "@/lib/queries";
import { categoryLabel } from "@/lib/utils";

const getModel = (id: string) =>
  prisma.model.findUnique({
    where: { id },
    include: {
      ...mediaInclude,
      jobs: { orderBy: [{ date: "desc" }, { createdAt: "desc" }] },
    },
  });
const str = (n: number | null) => (n == null ? "" : String(n));

export async function generateMetadata({ params }: PageProps<"/admin/models/[id]">): Promise<Metadata> {
  const model = await getModel((await params).id);
  return { title: model ? `${model.firstName} ${model.lastName}` : "Model not found" };
}

export default async function EditModelPage({ params }: PageProps<"/admin/models/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [model, suggestions] = await Promise.all([getModel(id), getAppearanceSuggestions()]);
  if (!model) notFound();

  const images = (kind: "PORTFOLIO" | "SNAP") => model.images.filter((i) => i.kind === kind).map((i) => i.url);

  return (
    <>
      <Link href="/admin/models" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
        <IconArrowLeft width={16} height={16} /> Models
      </Link>
      <PageHeader
        title={`${model.firstName} ${model.lastName}`}
        description={`${categoryLabel(model)} · last updated ${model.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
      />
      <ModelJobsPanel
        modelId={model.id}
        jobs={model.jobs.map((j) => ({
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
        }))}
      />
      <ModelForm
        id={model.id}
        slug={model.slug}
        suggestions={suggestions}
        initial={{
          firstName: model.firstName,
          lastName: model.lastName,
          division: model.division,
          board: model.board ?? "",
          height: str(model.height),
          bust: str(model.bust),
          waist: str(model.waist),
          hips: str(model.hips),
          shoes: str(model.shoes),
          hair: model.hair ?? "",
          eyes: model.eyes ?? "",
          city: model.city,
          nationality: model.nationality,
          instagram: model.instagram?.replace(/^@/, "") ?? "",
          tiktok: model.tiktok?.replace(/^@/, "") ?? "",
          website: model.website ?? "",
          followers: str(model.followers),
          specialties: model.specialties ?? "",
          locationCountry: model.locationCountry ?? "",
          locationCity: model.locationCity ?? "",
          locationFrom: model.locationFrom?.toISOString().slice(0, 10) ?? "",
          locationTo: model.locationTo?.toISOString().slice(0, 10) ?? "",
          bio: model.bio,
          featured: model.featured,
          published: model.published,
          portfolio: images("PORTFOLIO"),
          snaps: images("SNAP"),
          videos: model.videos.map((v) => v.url),
          portfolioPdf: model.portfolioPdf ?? "",
        }}
      />
    </>
  );
}
