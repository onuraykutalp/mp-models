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

  return (
    <>
      {/* Immersive cover */}
      <section className="relative isolate min-h-[78svh] overflow-hidden bg-ink text-paper lg:min-h-[88svh]">
        <Image
          src={model.coverImage}
          alt={displayName}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-transparent to-transparent" />

        <div className="relative z-10 flex min-h-[78svh] flex-col justify-between px-5 pt-24 pb-10 sm:px-8 lg:min-h-[88svh] lg:px-12 lg:pt-28 lg:pb-14">
          <Link
            href={backHref}
            className="group inline-flex w-fit items-center gap-2 text-xs tracking-[0.28em] text-paper/70 uppercase transition-colors hover:text-paper"
          >
            <ArrowLeft width={14} height={14} className="transition-transform group-hover:-translate-x-1" />
            {categoryLabel(model)}
          </Link>

          <div className="max-w-4xl">
            <p className="animate-fade-up text-[11px] tracking-[0.35em] text-paper/65 uppercase">
              {categoryLabel(model)}
              {model.nationality ? ` · ${model.nationality}` : ""}
            </p>
            <h1
              className="animate-fade-up font-display mt-4 text-[clamp(3.25rem,12vw,8.5rem)] leading-[0.9] tracking-tight"
              style={{ animationDelay: "80ms" }}
            >
              {model.firstName}
              <span className="mt-1 block italic text-paper/75">{model.lastName}</span>
            </h1>

            {model.location && (
              <div
                className="animate-fade-up mt-8 inline-flex items-center gap-3 border border-paper/25 bg-ink/30 py-2 pr-5 pl-2 backdrop-blur-md"
                style={{ animationDelay: "140ms" }}
              >
                <span className="grid size-9 place-items-center bg-paper text-ink">
                  <PlaneIcon className="size-4 rotate-45" />
                </span>
                <span>
                  <span className="block text-[10px] tracking-[0.22em] text-paper/55 uppercase">Currently in</span>
                  <span className="block text-sm font-semibold tracking-[0.14em] uppercase">
                    {[model.location.city, countryName(model.location.country)].filter(Boolean).join(", ")}
                    {stayRange(model.location) && (
                      <span className="ml-2 font-medium tracking-[0.1em] text-paper/55 tabular-nums">
                        {stayRange(model.location)}
                      </span>
                    )}
                  </span>
                </span>
              </div>
            )}

            <div
              className="animate-fade-up mt-10 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "200ms" }}
            >
              <ShortlistButton
                model={model}
                variant="full"
                className="rounded-none border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-ink aria-pressed:border-paper aria-pressed:bg-paper aria-pressed:text-ink"
              />
              <Link
                href={`/contact?model=${model.slug}`}
                className="group inline-flex h-12 items-center gap-2 bg-paper px-6 text-sm font-semibold text-ink transition-colors hover:bg-clay hover:text-paper"
              >
                Book this model
                <ArrowUpRight width={16} height={16} />
              </Link>
              {model.portfolioPdf && (
                <a
                  href={model.portfolioPdf}
                  download={`${slug}-portfolio.pdf`}
                  className="inline-flex h-12 items-center gap-2 border border-paper/35 px-6 text-sm font-semibold text-paper transition-colors hover:bg-paper hover:text-ink"
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
                  className="grid size-12 place-items-center border border-paper/35 transition-colors hover:bg-paper hover:text-ink"
                >
                  <Instagram />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile + portfolio */}
      <section className="container-x grid gap-12 py-16 lg:grid-cols-12 lg:gap-14 lg:py-24">
        <aside className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <Reveal>
            <p className="eyebrow text-stone">Profile</p>
            <div className="mt-6 empty:hidden">
              <Measurements model={model} />
            </div>

            {(talentDetails.length > 0 || model.website) && (
              <dl className="mt-10 grid grid-cols-2 border-t border-line">
                {talentDetails.map(([label, value]) => (
                  <div key={label} className="border-b border-line py-4 pr-3">
                    <dt className="text-[11px] tracking-[0.18em] text-stone uppercase">{label}</dt>
                    <dd className="mt-1 text-base font-semibold">{value}</dd>
                  </div>
                ))}
                {model.website && (
                  <div className="border-b border-line py-4 pr-3">
                    <dt className="text-[11px] tracking-[0.18em] text-stone uppercase">Website</dt>
                    <dd className="mt-1 text-base font-semibold">
                      <a href={model.website} target="_blank" rel="noreferrer" className="link-underline">
                        {model.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {model.bio && (
              <p className="mt-8 text-[15px] leading-relaxed text-ink-soft">{model.bio}</p>
            )}

            {model.nationality && (
              <dl className="mt-8 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="text-[11px] tracking-[0.18em] text-stone uppercase">Country</dt>
                  <dd className="mt-1 font-medium">{model.nationality}</dd>
                </div>
              </dl>
            )}
          </Reveal>
        </aside>

        <div className="lg:col-span-8">
          <Reveal delay={80}>
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="eyebrow text-stone">Lookbook</p>
                <h2 className="font-display mt-2 text-3xl sm:text-4xl">
                  Selected <em>images</em>
                </h2>
              </div>
              <p className="hidden text-xs tracking-[0.22em] text-stone uppercase sm:block">
                {model.portfolio.length + model.snaps.length} frames
              </p>
            </div>
            <ModelMedia model={model} />
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line py-16 lg:py-24">
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
            <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((m, i) => (
                <Reveal key={m.slug} delay={i * 70}>
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
