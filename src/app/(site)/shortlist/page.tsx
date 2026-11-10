import type { Metadata } from "next";
import { ShortlistView } from "@/components/shortlist/ShortlistView";

export const metadata: Metadata = { title: "Shortlist" };

export default function ShortlistPage() {
  return (
    <section className="container-x pt-28 pb-20 lg:pt-36 lg:pb-24">
      <p className="eyebrow mb-5 text-stone">For clients</p>
      <h1 className="font-display mb-10 text-4xl leading-tight sm:text-5xl">
        Your <em>shortlist</em>
      </h1>
      <ShortlistView />
    </section>
  );
}
