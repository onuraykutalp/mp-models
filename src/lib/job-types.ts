import "server-only";
import { prisma } from "@/lib/prisma";
import { mediaInclude, toModel } from "@/lib/queries";
import type { Model } from "@/types";

export async function getJobTypeByToken(token: string) {
  if (!/^[a-f0-9]{32}$/i.test(token)) return null;

  const row = await prisma.jobType.findUnique({
    where: { token },
    include: {
      models: {
        orderBy: { order: "asc" },
        include: { model: { include: mediaInclude } },
      },
    },
  });

  if (!row || !row.active) return null;

  const models: Model[] = row.models
    .filter((m) => m.model.published)
    .map((m) => toModel(m.model));

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    models,
  };
}
