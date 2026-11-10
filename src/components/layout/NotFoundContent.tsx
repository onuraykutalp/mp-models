import Link from "next/link";

export function NotFoundContent() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-start justify-center pt-24">
      <p className="eyebrow text-stone">404</p>
      <h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">
        This page is <em>off the runway.</em>
      </h1>
      <Link
        href="/"
        className="mt-10 inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-paper hover:bg-clay"
      >
        Back to home
      </Link>
    </section>
  );
}
