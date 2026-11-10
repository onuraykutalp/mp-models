import type { Board, Division, Model, ModelLocation, Post } from "@/types";
import { PLACEMENT, agencyToday } from "./utils";
import { models as dummyModels } from "@/data/models";
import { posts as dummyPosts } from "@/data/posts";

export const hasDatabase = () => Boolean(process.env.DATABASE_URL);

async function withFallback<T>(query: () => Promise<T>, fallback: () => T): Promise<T> {
  if (!hasDatabase()) return fallback();
  try {
    return await query();
  } catch (error) {
    console.warn("[db] Query failed, falling back to dummy data:", (error as Error).message);
    return fallback();
  }
}

const db = async () => (await import("./prisma")).prisma;

type DbModel = Omit<Model, "portfolio" | "snaps" | "videos" | "location"> & {
  images: { url: string; alt: string; kind: "PORTFOLIO" | "SNAP" }[];
  videos: { url: string; poster: string | null }[];
  locationCountry?: string | null;
  locationCity?: string | null;
  locationFrom?: Date | null;
  locationTo?: Date | null;
};

const isoDate = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

/** Stays that have already ended are hidden from the website. */
function currentLocation(m: DbModel): ModelLocation | null {
  if (!m.locationCountry) return null;
  const to = isoDate(m.locationTo);
  if (to && to < agencyToday()) return null;
  return { country: m.locationCountry, city: m.locationCity ?? null, from: isoDate(m.locationFrom), to };
}

/** Models placed in Turkey whose stay hasn't ended (open-ended stays count). */
const placedWhere = () => ({
  locationCountry: PLACEMENT.country,
  OR: [{ locationTo: null }, { locationTo: { gte: new Date(`${agencyToday()}T00:00:00Z`) } }],
});

const isPlaced = (m: Model) => m.location?.country === PLACEMENT.country;

export const toModel = (m: DbModel): Model => ({
  slug: m.slug,
  firstName: m.firstName,
  lastName: m.lastName,
  division: m.division,
  board: m.board,
  height: m.height,
  bust: m.bust,
  waist: m.waist,
  hips: m.hips,
  shoes: m.shoes,
  hair: m.hair,
  eyes: m.eyes,
  city: m.city,
  nationality: m.nationality,
  instagram: m.instagram,
  tiktok: m.tiktok ?? null,
  website: m.website ?? null,
  followers: m.followers ?? null,
  specialties: m.specialties ?? null,
  bio: m.bio,
  coverImage: m.coverImage,
  featured: m.featured,
  portfolio: m.images.filter((i) => i.kind === "PORTFOLIO").map(({ url, alt }) => ({ url, alt })),
  snaps: m.images.filter((i) => i.kind === "SNAP").map(({ url, alt }) => ({ url, alt })),
  videos: m.videos.map(({ url, poster }) => ({ url, poster })),
  portfolioPdf: m.portfolioPdf ?? null,
  location: currentLocation(m),
});

const toPost = (p: Omit<Post, "publishedAt"> & { publishedAt: Date }): Post => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  content: p.content,
  category: p.category,
  coverImage: p.coverImage,
  publishedAt: p.publishedAt.toISOString(),
});

export const mediaInclude = {
  images: { orderBy: { order: "asc" as const } },
  videos: { orderBy: { order: "asc" as const } },
};
export function getModels(division?: Division, board?: Board, placed = false): Promise<Model[]> {
  return withFallback(
    async () => {
      const rows = await (await db()).model.findMany({
        where: { published: true, ...(division && { division }), ...(board && { board }), ...(placed && placedWhere()) },
        include: mediaInclude,
        orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      });
      return rows.map(toModel);
    },
    () =>
      dummyModels.filter(
        (m) => (!division || m.division === division) && (!board || m.board === board) && (!placed || isPlaced(m)),
      ),
  );
}

/**
 * Published counts per division, division+board and division placed in Turkey,
 * keyed "WOMEN", "WOMEN:NEW_FACES" and "WOMEN:PLACED".
 */
export function getBoardCounts(): Promise<Record<string, number>> {
  const tally = (rows: { division: Division; board: Board | null; count: number }[], placed: { division: Division; count: number }[]) => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.division] = (counts[r.division] ?? 0) + r.count;
      if (r.board) counts[`${r.division}:${r.board}`] = (counts[`${r.division}:${r.board}`] ?? 0) + r.count;
    }
    for (const p of placed) counts[`${p.division}:PLACED`] = (counts[`${p.division}:PLACED`] ?? 0) + p.count;
    return counts;
  };
  return withFallback(
    async () => {
      const prisma = await db();
      const [groups, placed] = await Promise.all([
        prisma.model.groupBy({ by: ["division", "board"], where: { published: true }, _count: { _all: true } }),
        prisma.model.groupBy({ by: ["division"], where: { published: true, ...placedWhere() }, _count: { _all: true } }),
      ]);
      return tally(
        groups.map((g) => ({ division: g.division, board: g.board, count: g._count._all })),
        placed.map((g) => ({ division: g.division, count: g._count._all })),
      );
    },
    () =>
      tally(
        dummyModels.map((m) => ({ division: m.division, board: m.board, count: 1 })),
        dummyModels.filter(isPlaced).map((m) => ({ division: m.division, count: 1 })),
      ),
  );
}

export function getFeaturedModels(limit = 10): Promise<Model[]> {
  return withFallback(
    async () => {
      const rows = await (await db()).model.findMany({
        where: { featured: true, published: true },
        include: mediaInclude,
        take: limit,
      });
      return rows.map(toModel);
    },
    () => dummyModels.filter((m) => m.featured).slice(0, limit),
  );
}

export function getModelBySlug(slug: string): Promise<Model | null> {
  return withFallback(
    async () => {
      const row = await (await db()).model.findUnique({ where: { slug }, include: mediaInclude });
      return row?.published ? toModel(row) : null;
    },
    () => dummyModels.find((m) => m.slug === slug) ?? null,
  );
}

export function getRelatedModels(model: Model, limit = 4): Promise<Model[]> {
  return withFallback(
    async () => {
      const rows = await (await db()).model.findMany({
        where: { division: model.division, board: model.board, published: true, NOT: { slug: model.slug } },
        include: mediaInclude,
        take: limit,
      });
      return rows.map(toModel);
    },
    () =>
      dummyModels
        .filter((m) => m.division === model.division && m.board === model.board && m.slug !== model.slug)
        .slice(0, limit),
  );
}

export function getPosts(limit?: number): Promise<Post[]> {
  return withFallback(
    async () => {
      const rows = await (await db()).post.findMany({ orderBy: { publishedAt: "desc" }, take: limit });
      return rows.map(toPost);
    },
    () => dummyPosts.slice(0, limit ?? dummyPosts.length),
  );
}

export function getPostBySlug(slug: string): Promise<Post | null> {
  return withFallback(
    async () => {
      const row = await (await db()).post.findUnique({ where: { slug } });
      return row ? toPost(row) : null;
    },
    () => dummyPosts.find((p) => p.slug === slug) ?? null,
  );
}
