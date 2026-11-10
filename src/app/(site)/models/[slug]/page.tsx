import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModelMedia } from "@/components/models/ModelMedia";
import { Measurements } from "@/components/models/Measurements";
import { ModelCard } from "@/components/models/ModelCard";
import { ShortlistButton } from "@/components/models/ShortlistButton";
import { ArrowLeft, ArrowUpRight, Download, Instagram } from "@/components/ui/Icons";
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

  const talentDetails = [
    ["Specialties", model.specialties],
    ["Followers", model.followers ? compactNumber(model.followers) : null],
    ["TikTok", model.tiktok],
  ].filter((row): row is [string, string] => !!row[1]);

  return (
    <>
      <div className="container-x pt-24 lg:pt-32">
        <Link
          href={backHref}
          className="group inline-flex items-center gap-2 text-sm text-stone transition-colors hover:text-ink"
        >
          <ArrowLeft width={16} height={16} className="transition-transform group-hover:-translate-x-1" />
          {categoryLabel(model)}
        </Link>
      </div>

      <section className="container-x grid gap-10 pt-8 pb-24 lg:grid-cols-12 lg:gap-12 lg:pb-32">
        <aside className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <p className="eyebrow text-stone">
            {categoryLabel(model)} — {model.city}
          </p>
          <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
            {model.firstName}
            <br />
            <em className="text-stone">{model.lastName}</em>
          </h1>

          {model.location && (
            <div className="mt-6 inline-flex items-center gap-3.5 rounded-full border border-ink/15 py-1.5 pr-5 pl-1.5">
              <span className="grid size-9 place-items-center rounded-full bg-ink text-paper">
                <PlaneIcon className="size-4 rotate-45" />
              </span>
              <span>
                <span className="block text-[10px] tracking-[0.22em] text-stone uppercase">Currently in</span>
                <span className="block text-sm font-semibold tracking-[0.14em] uppercase">
                  {[model.location.city, countryName(model.location.country)].filter(Boolean).join(", ")}
                  {stayRange(model.location) && (
                    <span className="ml-2 font-medium tracking-[0.1em] text-stone tabular-nums">{stayRange(model.location)}</span>
                  )}
                </span>
              </span>
            </div>
          )}

          <div className="mt-10 empty:hidden">
            <Measurements model={model} />
          </div>

          {(talentDetails.length > 0 || model.website) && (
            <dl className="mt-10 grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
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

          <p className="mt-8 leading-relaxed text-ink-soft">{model.bio}</p>

          <dl className="mt-6 flex gap-8 text-sm">
            <div>
              <dt className="text-stone">Nationality</dt>
              <dd className="font-medium">{model.nationality}</dd>
            </div>
            <div>
              <dt className="text-stone">Based in</dt>
              <dd className="font-medium">{model.city}</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <ShortlistButton model={model} variant="full" />
            <Link
              href={`/contact?model=${model.slug}`}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-clay"
            >
              Book this model
              <ArrowUpRight width={16} height={16} />
            </Link>
            {model.portfolioPdf && (
              <a
                href={model.portfolioPdf}
                download={`${slug}-portfolio.pdf`}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/25 px-6 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper"
              >
                <Download width={16} height={16} />
                Portfolio PDF
              </a>
            )}
            {model.instagram && (
              <a
                href={`https://instagram.com/${model.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`${fullName(model)} Instagram`}
                className="grid size-12 place-items-center rounded-full border border-ink/25 transition-colors hover:bg-ink hover:text-paper"
              >
                <Instagram />
              </a>
            )}
          </div>
        </aside>

        <div className="lg:col-span-7">
          <ModelMedia model={model} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line py-16 lg:py-24">
          <div className="container-x">
            <SectionHeading
              eyebrow="Keep exploring"
              title={
                <>
                  Similar <em>models</em>
                </>
              }
              href={backHref}
            />
            <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((m) => (
                <ModelCard key={m.slug} model={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
