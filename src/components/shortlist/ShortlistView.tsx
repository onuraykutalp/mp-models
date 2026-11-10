"use client";

import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/forms/BookingForm";
import { ArrowRight, Close } from "@/components/ui/Icons";
import { useShortlist } from "@/store/shortlist";
import { useHydrated } from "@/hooks/useHydrated";
import { categoryLabel } from "@/lib/utils";

export function ShortlistView() {
  const hydrated = useHydrated();
  const items = useShortlist((s) => s.items);
  const remove = useShortlist((s) => s.remove);
  const clear = useShortlist((s) => s.clear);

  if (!hydrated) return <div className="min-h-[40vh]" />;

  if (!items.length) {
    return (
      <div className="flex min-h-[40vh] flex-col items-start justify-center gap-6 border-t border-line py-16">
        <p className="font-display text-3xl">Your shortlist is empty.</p>
        <p className="max-w-md text-stone">
          Tap the heart icon on any model card to add them here, then send a single booking request for your whole
          selection.
        </p>
        <Link
          href="/models"
          className="group inline-flex h-12 items-center gap-3 rounded-full bg-ink px-7 text-sm font-semibold text-paper hover:bg-clay"
        >
          Explore models
          <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-16 border-t border-line pt-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-stone">
            <span className="font-semibold text-ink">{items.length}</span>{" "}
            {items.length === 1 ? "model" : "models"} selected
          </p>
          <button type="button" onClick={clear} className="link-underline text-sm text-stone hover:text-ink">
            Remove all
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.slug} className="group relative">
              <Link href={`/models/${item.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-paper-dark">
                  <Image
                    src={item.coverImage}
                    alt={`${item.firstName} ${item.lastName}`}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold uppercase">
                  {item.firstName} <span className="font-normal text-stone">{item.lastName}</span>
                </p>
                <p className="text-xs text-stone">
                  {[categoryLabel(item), item.height != null && `${item.height} cm`, item.city].filter(Boolean).join(" · ")}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => remove(item.slug)}
                aria-label={`Remove ${item.firstName} from shortlist`}
                className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-paper/90 transition-colors hover:bg-ink hover:text-paper"
              >
                <Close width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
        <div className="bg-paper-dark p-6 sm:p-10">
          <p className="eyebrow mb-3 text-stone">Booking</p>
          <h2 className="font-display mb-6 text-2xl leading-tight">Request a quote for your selection</h2>
          <BookingForm />
        </div>
      </aside>
    </div>
  );
}
