import "server-only";

import { prisma } from "@/lib/prisma";

const DEFAULT_HAIR = ["Black", "Dark Brown", "Brown", "Light Brown", "Blonde", "Red", "Auburn", "Grey"];
const DEFAULT_EYES = ["Brown", "Hazel", "Green", "Blue", "Grey", "Black"];

/** Most-used hair and eye values, so the form offers the same spelling the website filters use. */
export async function getAppearanceSuggestions() {
  const [hair, eyes] = await Promise.all([
    prisma.model.groupBy({ by: ["hair"], _count: { hair: true }, orderBy: { _count: { hair: "desc" } }, take: 12 }),
    prisma.model.groupBy({ by: ["eyes"], _count: { eyes: true }, orderBy: { _count: { eyes: "desc" } }, take: 12 }),
  ]);
  const hairValues = hair.flatMap((h) => (h.hair ? [h.hair] : []));
  const eyeValues = eyes.flatMap((e) => (e.eyes ? [e.eyes] : []));
  return {
    hair: hairValues.length ? hairValues : DEFAULT_HAIR,
    eyes: eyeValues.length ? eyeValues : DEFAULT_EYES,
  };
}
