import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModelMedia } from "@/components/models/ModelMedia";
import { Measurements } from "@/components/models/Measurements";
import { ModelCard } from "@/components/models/ModelCard";
import { ShortlistButton } from "@/components/models/ShortlistButton";
import { ArrowLeft, ArrowUpRight, Download, Instagram } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getModelBySlug, getModels, getRelatedModels } from "@/lib/queries";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import { BOARDS, boardHref, categoryLabel, compactNumber, countryName, divisionInfo, fullName, stayRange } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const models = await getModels();
  return models.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/models/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return { title: "Model not found" };
  return {
    title: fullName(model),
    description: model.bio.slice(0, 155),
    openGraph: { images: [model.coverImage] },
  };
}

export default async function ModelPage({ params }: PageProps<"/models/[slug]">) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const related = await getRelatedModels(model, 4);
  const division = divisionInfo(model.division);
  const board = model.board ? BOARDS[model.board] : undefined;
  const backHref = boardHref(division, board);
  const displayName = fullName(model);

  const talentDetails = [
    ["Specialties", model.specialties],
    ["Followers", model.followers ? compactNumber(model.followers) : null],
    ["TikTok", model.tiktok],
  ].filter((row): row is [string, string] => !!row[1]);

  const frameCount = model.portfolio.length + model.snaps.length;

  return (
    <>
      <div className="container-x pt-24 lg:pt-28">
        <Link
          href={backHref}
          className="group inline-flex items-center gap-2 text-xs tracking-[0.28em] text-stone uppercase transition-colors hover:text-ink"
        >
          <ArrowLeft width={14} height={14} className="transition-transform group-hover:-translate-x-1" />
          {categoryLabel(model)}
        </Link>
      </div>

      {/* Split portrait + identity — fits one composition without a giant hero */}
      <section className="container-x grid items-start gap-8 pt-8 pb-12 lg:grid-cols-12 lg:gap-10 lg:pb-16">
        <div className="relative aspect-[3/4] overflow-hidden bg-paper-dark lg:col-span-5 xl:col-span-4">
          <Image
            src={model.coverImage}
            alt={displayName}
            fill
            priority
            sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          {model.location && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 border border-paper/20 bg-ink/55 py-2 pr-4 pl-2 text-paper backdrop-blur-md">
              <span className="grid size-8 place-items-center bg-paper text-ink">
                <PlaneIcon className="size-3.5 rotate-45" />
              </span>
              <span className="min-w-0">
                <span className="block text-[9px] tracking-[0.22em] text-paper/60 uppercase">Currently in</span>
                <span className="block truncate text-xs font-semibold tracking-[0.12em] uppercase">
                  {[model.location.city, countryName(model.location.country)].filter(Boolean).join(", ")}
                  {stayRange(model.location) && (
                    <span className="ml-2 font-medium text-paper/55 tabular-nums">{stayRange(model.location)}</span>
                  )}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:col-span-7 xl:col-span-8 lg:min-h-full lg:justify-between lg:py-2">
          <div>
            <p className="eyebrow text-stone">
              {categoryLabel(model)}
              {model.nationality ? ` · ${model.nationality}` : ""}
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.92] tracking-tight">
              {model.firstName}{" "}
              <em className="text-stone">{model.lastName}</em>
            </h1>

            {model.bio && (
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">{model.bio}</p>
            )}

            <div className="mt-8 empty:hidden">
              <Measurements model={model} />
            </div>

            {(talentDetails.length > 0 || model.website) && (
              <dl className="mt-8 grid max-w-xl grid-cols-2 border-t border-line sm:grid-cols-3">
                {talentDetails.map(([label, value]) => (
                  <div key={label} className="border-b border-line py-3.5 pr-3">
                    <dt className="text-[10px] tracking-[0.18em] text-stone uppercase">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold">{value}</dd>
                  </div>
                ))}
                {model.website && (
                  <div className="border-b border-line py-3.5 pr-3">
                    <dt className="text-[10px] tracking-[0.18em] text-stone uppercase">Website</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      <a href={model.website} target="_blank" rel="noreferrer" className="link-underline">
                        {model.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            <ShortlistButton model={model} variant="full" className="rounded-none" />
            <Link
              href={`/contact?model=${model.slug}`}
              className="group inline-flex h-12 items-center gap-2 bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-clay"
            >
              Book
              <ArrowUpRight width={16} height={16} />
            </Link>
            {model.portfolioPdf && (
              <a
                href={model.portfolioPdf}
                download={`${slug}-portfolio.pdf`}
                className="inline-flex h-12 items-center gap-2 border border-ink/25 px-5 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper"
              >
                <Download width={16} height={16} />
                PDF
              </a>
            )}
            {model.instagram && (
              <a
                href={`https://instagram.com/${model.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`${displayName} Instagram`}
                className="grid size-12 place-items-center border border-ink/25 transition-colors hover:bg-ink hover:text-paper"
              >
                <Instagram />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Dense art-board gallery */}
      <section className="border-t border-line">
        <div className="container-x py-10 lg:py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-stone">Portfolio</p>
              <h2 className="font-display mt-1 text-2xl sm:text-3xl">
                Image <em>board</em>
              </h2>
            </div>
            {frameCount > 0 && (
              <p className="text-[11px] tracking-[0.22em] text-stone uppercase tabular-nums">{frameCount} frames</p>
            )}
          </div>
          <Reveal>
            <ModelMedia model={model} />
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line py-14 lg:py-20">
          <div className="container-x">
            <SectionHeading
              eyebrow="Keep exploring"
              title={
                <>
                  Similar <em>faces</em>
                </>
              }
              href={backHref}
            />
            <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
              {related.map((m, i) => (
                <Reveal key={m.slug} delay={i * 60}>
                  <ModelCard model={m} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
