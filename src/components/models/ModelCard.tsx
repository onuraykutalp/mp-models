import Image from "next/image";
import Link from "next/link";
import type { Model } from "@/types";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { ShortlistButton } from "./ShortlistButton";
import { boardLabel, categoryLabel, cn, compactNumber, countryName, stayRange } from "@/lib/utils";

interface ModelCardProps {
  model: Model;
  priority?: boolean;
  sizes?: string;
  className?: string;
  showDivision?: boolean;
  showBoard?: boolean;
}

export function ModelCard({
  model,
  priority,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  className,
  showDivision,
  showBoard,
}: ModelCardProps) {
  const measured = model.height != null;
  const stats: [string, string | number][] = measured
    ? [
        ["Height", model.height!],
        [model.division === "MEN" ? "Chest" : "Bust", model.bust ?? "—"],
        ["Waist", model.waist ?? "—"],
        ["Hips", model.hips ?? "—"],
      ]
    : [
        ...(model.board ? [["Board", boardLabel(model.board)] as [string, string]] : []),
        ...(model.followers ? [["Followers", compactNumber(model.followers)] as [string, string]] : []),
        ["Based", model.city],
      ];

  const location = model.location;
  const range = location ? stayRange(location) : null;

  const tag = showDivision
    ? categoryLabel(model)
    : showBoard && model.board
      ? boardLabel(model.board)
      : measured
        ? `${model.height} cm`
        : model.board
          ? boardLabel(model.board)
          : model.city;

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/models/${model.slug}`} className="block" aria-label={`${model.firstName} ${model.lastName}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-paper-dark">
          <Image
            src={model.coverImage}
            alt={`${model.firstName} ${model.lastName}`}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-[transform,filter] duration-[1.2s] ease-out group-hover:scale-[1.04] md:grayscale-[35%] md:group-hover:grayscale-0"
          />
          {location && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/45 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-paper uppercase ring-1 ring-paper/20 backdrop-blur-md md:hidden">
              {countryName(location.country)}
              <PlaneIcon className="size-3 rotate-45" />
            </span>
          )}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/85 via-ink/45 to-transparent px-4 pb-4 text-paper transition-transform duration-500 ease-out group-hover:translate-y-0 max-md:hidden",
              location ? "pt-20" : "pt-10",
            )}
          >
            {location && (
              <div className="mb-4 flex translate-y-2 items-end justify-between gap-3 border-b border-paper/20 pb-3.5 opacity-0 transition duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-150">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] leading-none font-semibold tracking-[0.24em] uppercase">
                    <span className="truncate">{countryName(location.country)}</span>
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-paper/15 ring-1 ring-paper/30 backdrop-blur-md">
                      <PlaneIcon className="size-3 rotate-45" />
                    </span>
                  </p>
                  {range && <p className="mt-2 text-[11px] font-medium tracking-[0.2em] text-paper/75 tabular-nums">{range}</p>}
                </div>
                {location.city && (
                  <span className="shrink-0 pb-px text-[9px] tracking-[0.24em] text-paper/60 uppercase">{location.city}</span>
                )}
              </div>
            )}
            <dl className={cn("grid gap-2 text-center", stats.length === 4 ? "grid-cols-4" : stats.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
              {stats.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-[9px] tracking-[0.2em] text-paper/70 uppercase">{label}</dt>
                  <dd className="mt-1 truncate text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 truncate text-sm font-semibold tracking-wide uppercase sm:text-[15px]">
            {model.firstName} <span className="font-normal text-stone">{model.lastName}</span>
          </h3>
          <span className="shrink-0 text-xs text-stone">{tag}</span>
        </div>
      </Link>
      <ShortlistButton model={model} className="absolute top-3 right-3" />
    </article>
  );
}
