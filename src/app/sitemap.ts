import type { MetadataRoute } from "next";
import { getModels, getPosts } from "@/lib/queries";
import { BOARDS, DIVISIONS, PLACEMENT, boardHref } from "@/lib/utils";

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://three15management.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/models`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/production`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/become-a-model`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const boardRoutes: MetadataRoute.Sitemap = DIVISIONS.flatMap((d) => {
    const entries: MetadataRoute.Sitemap = [
      {
        url: `${SITE}${boardHref(d)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.85,
      },
      ...d.boards.map((b) => ({
        url: `${SITE}${boardHref(d, BOARDS[b])}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ];
    if (d.placement) {
      entries.push({
        url: `${SITE}${boardHref(d, PLACEMENT)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.75,
      });
    }
    return entries;
  });

  const [models, posts] = await Promise.all([getModels(), getPosts()]);

  const modelRoutes: MetadataRoute.Sitemap = models.map((m) => ({
    url: `${SITE}/models/${m.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE}/news/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.55,
  }));

  return [...staticRoutes, ...boardRoutes, ...modelRoutes, ...postRoutes];
}
