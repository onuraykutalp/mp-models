import type { Metadata } from "next";
import Link from "next/link";
import { ModelForm } from "@/components/admin/ModelForm";
import { EMPTY_MODEL } from "@/lib/model-form";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconArrowLeft } from "@/components/admin/icons";
import { getAppearanceSuggestions } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth/session";
import { resolveBoardParams } from "@/lib/utils";

export const metadata: Metadata = { title: "New model" };

export default async function NewModelPage({ searchParams }: PageProps<"/admin/models/new">) {
  await requireAdmin();
  const { category, board: boardSlug } = await searchParams;
  const { division, board } = resolveBoardParams(
    typeof category === "string" ? category : undefined,
    typeof boardSlug === "string" ? boardSlug : undefined,
  );

  return (
    <>
      <Link href="/admin/models" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
        <IconArrowLeft width={16} height={16} /> Models
      </Link>
      <PageHeader
        title={division?.key === "TALENTS" ? "New talent" : "New model"}
        description="Fill in the profile, details and media. You can save it as a draft first."
      />
      <ModelForm
        initial={{
          ...EMPTY_MODEL,
          ...(division && { division: division.key, board: board?.key ?? division.boards[0] ?? "" }),
        }}
        suggestions={await getAppearanceSuggestions()}
      />
    </>
  );
}
