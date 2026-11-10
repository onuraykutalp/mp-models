import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Production",
  description: "Casting, creative direction and full production support with MP Models.",
};

const services = [
  {
    title: "Casting",
    text: "Board selections tailored to the brief — runway, editorial, commercial and campaign.",
  },
  {
    title: "Creative direction",
    text: "Look development, mood and talent pairing with our in-house creative desk.",
  },
  {
    title: "On-set support",
    text: "Bookers on call from fitting through wrap, across Istanbul and Milan.",
  },
];

export default function ProductionPage() {
  return (
    <div className="pt-28 pb-24 lg:pt-36 lg:pb-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Agency"
          title={
            <>
              Production <em>desk</em>
            </>
          }
        />
        <p className="mt-6 max-w-xl text-ink-soft leading-relaxed">
          From first casting call to final delivery — we produce with the same standards we manage our boards.
        </p>

        <ul className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-3 sm:gap-8">
          {services.map((s) => (
            <li key={s.title}>
              <h2 className="font-display text-2xl">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-20 flex flex-wrap items-center gap-4 border-t border-line pt-10">
          <Link
            href="/contact"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-clay"
          >
            Start a project
            <ArrowUpRight width={16} height={16} />
          </Link>
          <Link href="/models" className="text-sm font-medium link-underline">
            Browse the boards
          </Link>
        </div>
      </div>
    </div>
  );
}
