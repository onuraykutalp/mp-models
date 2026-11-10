import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModelCard } from "@/components/models/ModelCard";
import { getJobTypeByToken } from "@/lib/job-types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/cast/[token]">): Promise<Metadata> {
  const job = await getJobTypeByToken((await params).token);
  if (!job) return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: job.title,
    description: job.description ?? undefined,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function CastPage({ params }: PageProps<"/cast/[token]">) {
  const job = await getJobTypeByToken((await params).token);
  if (!job) notFound();

  return (
    <section className="container-x pt-12 pb-20 sm:pt-16 sm:pb-28">
      <p className="eyebrow mb-4 text-stone">Casting selection</p>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="font-display max-w-3xl text-4xl leading-tight sm:text-5xl">{job.title}</h1>
        <p className="text-sm text-stone tabular-nums">
          {job.models.length} model{job.models.length === 1 ? "" : "s"}
        </p>
      </div>
      {job.description && <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">{job.description}</p>}

      {job.models.length === 0 ? (
        <p className="mt-16 text-sm text-stone">No published models on this board yet.</p>
      ) : (
        <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {job.models.map((model, i) => (
            <li key={model.slug}>
              <ModelCard model={model} priority={i < 8} showDivision showBoard={false} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
