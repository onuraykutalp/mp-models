import type { Metadata } from "next";
import Link from "next/link";
import { ModelsExplorer } from "@/components/models/ModelsExplorer";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { getBoardCounts, getModels } from "@/lib/queries";
import { BOARDS, DIVISIONS, PLACEMENT, boardHref, cn, resolveBoardParams } from "@/lib/utils";

const param = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export async function generateMetadata({ searchParams }: PageProps<"/models">): Promise<Metadata> {
  const sp = await searchParams;
  const { division, board, placed } = resolveBoardParams(param(sp.division), param(sp.board));
  if (!division) return { title: "Models" };
  const sub = placed ? PLACEMENT : board;
  return { title: sub ? `${sub.label} — ${division.label}` : division.label };
}

export default async function ModelsPage({ searchParams }: PageProps<"/models">) {
  const sp = await searchParams;
  const { division, board, placed } = resolveBoardParams(param(sp.division), param(sp.board));
  const [models, counts] = await Promise.all([getModels(division?.key, board?.key, placed), getBoardCounts()]);
  const sub = placed ? PLACEMENT : board;

  const tabs = [{ href: "/models", label: "All", key: undefined }, ...DIVISIONS.map((d) => ({ href: boardHref(d), label: d.label, key: d.key }))];
  const noun = (division?.key === "TALENTS" ? "talent" : "model") + (models.length === 1 ? "" : "s");

  const subTabs = division
    ? [
        { key: "all", label: "All", slug: undefined, count: counts[division.key] ?? 0 },
        ...division.boards.map((b) => ({ key: b, label: BOARDS[b].label, slug: BOARDS[b].slug, count: counts[`${division.key}:${b}`] ?? 0 })),
        ...(division.placement
          ? [{ key: "placed", label: PLACEMENT.label, slug: PLACEMENT.slug, count: counts[`${division.key}:PLACED`] ?? 0 }]
          : []),
      ]
    : [];
  const activeSub = placed ? "placed" : (board?.key ?? "all");

  return (
    <>
      <section className="container-x pt-28 pb-8 lg:pt-36 lg:pb-10">
        <p className="eyebrow mb-5 text-stone">
          {division ? division.label : "Board"}
          {sub && <> — {sub.label}</>} · {models.length} {noun}
        </p>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            {sub ? (
              <>
                {sub.label} <em className="text-stone">{division!.label.toLowerCase()}</em>
              </>
            ) : division ? (
              division.label
            ) : (
              "Models"
            )}
          </h1>
          <p className="max-w-md leading-relaxed text-stone">
            {sub?.description ??
              division?.description ??
              "Discover every face across our Women, Men, Kids and Talents boards. Add your favourites to the shortlist and send one booking request."}
          </p>
        </div>

        <nav aria-label="Filter by division" className="scrollbar-none -mx-5 mt-12 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {tabs.map((t) => {
            const isActive = t.key === division?.key;
            return (
              <Link
                key={t.label}
                href={t.href}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors",
                  isActive ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        {division && subTabs.length > 1 && (
          <nav
            aria-label={`${division.label} boards`}
            className="scrollbar-none -mx-5 mt-6 flex gap-7 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0"
          >
            {subTabs.map((t) => {
              const isActive = t.key === activeSub;
              return (
                <Link
                  key={t.key}
                  href={boardHref(division, t.slug ? { slug: t.slug } : undefined)}
                  scroll={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex shrink-0 items-baseline gap-1.5 pb-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors",
                    "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:bg-ink after:transition-transform after:duration-500",
                    isActive ? "text-ink after:scale-x-100" : "text-stone after:scale-x-0 hover:text-ink",
                  )}
                >
                  {t.key === "placed" && <PlaneIcon className="size-3 rotate-45 self-center" />}
                  {t.label}
                  <span className="text-[10px] font-medium tracking-normal tabular-nums opacity-60">{t.count}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </section>

      <ModelsExplorer models={models} showDivision={!division} showBoard={!!division && !sub} />
    </>
  );
}