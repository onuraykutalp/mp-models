import type { Metadata } from "next";
import Image from "next/image";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { unsplash } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Become a Model",
  description: "Apply to MP Models. No experience needed — just send us a few natural photos.",
};

const requirements = [
  { title: "Women", body: "Aged 16-24, 172 cm and taller." },
  { title: "Men", body: "Aged 17-26, 183 cm and taller." },
  { title: "Plus Sizes", body: "Aged 18+, 168 cm and taller, UK size 14 and up." },
  { title: "Kids", body: "Aged 3-15. Applications must be sent by a parent or legal guardian." },
  { title: "Talents", body: "Any age, no height requirement. Character and expression matter most." },
];

const tips = [
  "Natural photos with no makeup, or very light makeup.",
  "Shot in daylight against a plain background.",
  "One close-up headshot, one profile and one full-length shot.",
  "Simple, fitted clothing that shows your silhouette.",
];

export default function BecomeAModelPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="container-x grid min-h-[60svh] gap-10 pt-28 pb-12 lg:grid-cols-12 lg:items-end lg:pt-36">
          <div className="relative z-10 lg:col-span-7">
            <p className="eyebrow mb-6 text-paper/60">Scouting — Applications open</p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              Step in front
              <br />
              of the <em className="text-clay">lens.</em>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-paper/75">
              Every year we review thousands of applications, one by one. No experience needed — what we look for is
              character, confidence and potential.
            </p>
          </div>
          <div className="relative aspect-[4/5] lg:col-span-4 lg:col-start-9">
            <Image
              src={unsplash("1483985988355-763728e1935b", "portrait", 900)}
              alt="Scouting shoot"
              fill
              priority
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-x py-20 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <aside className="space-y-14 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <div>
              <p className="eyebrow mb-6 text-stone">Requirements</p>
              <ul className="divide-y divide-line border-y border-line">
                {requirements.map((r) => (
                  <li key={r.title} className="py-5">
                    <p className="font-display text-3xl">{r.title}</p>
                    <p className="mt-1 text-sm text-stone">{r.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-6 text-stone">Photo tips</p>
              <ol className="space-y-4">
                {tips.map((tip, i) => (
                  <li key={tip} className="flex gap-4 text-sm leading-relaxed">
                    <span className="font-display text-xl leading-none text-clay">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6">
            <ApplicationForm />
          </div>
        </div>
      </section>
    </>
  );
}
