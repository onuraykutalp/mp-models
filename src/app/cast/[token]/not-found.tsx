import Link from "next/link";

export default function CastNotFound() {
  return (
    <section className="container-x flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow text-stone">Unavailable</p>
      <h1 className="font-display mt-4 text-3xl sm:text-4xl">This casting link is no longer active</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">
        The page may have been turned off or the link was replaced. Please ask your Three15 Management contact for a new link.
      </p>
      <a href="mailto:booking@mpmodels.com" className="mt-8 text-sm font-semibold link-underline">
        booking@mpmodels.com
      </a>
      <Link href="/" className="mt-10 text-xs font-semibold tracking-[0.28em] text-stone uppercase hover:text-ink">
        Three15 Management
      </Link>
    </section>
  );
}
