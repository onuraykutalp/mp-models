import Link from "next/link";
import { Instagram } from "@/components/ui/Icons";
import { boardMenu } from "@/components/layout/nav";
import { Wordmark } from "@/components/layout/Wordmark";
import { BoardMenu } from "./BoardMenu";
import { cn } from "@/lib/utils";

const VIDEO = "https://videos.pexels.com/video-files/9512045";
const POSTER = "https://images.pexels.com/videos/9512045/pexels-photo-9512045.jpeg?auto=compress&cs=tinysrgb&w=1920";

const agencyLinks = [
  { href: "/news", label: "News" },
  { href: "/production", label: "Production" },
  { href: "/contact", label: "Contact" },
];

const underline =
  "after:absolute after:inset-x-0 after:-bottom-1.5 after:mx-auto after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-500 hover:after:w-full";

export function Hero() {
  return (
    <section className="relative isolate flex h-[100svh] min-h-[600px] flex-col overflow-hidden bg-ink text-paper">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
        aria-hidden
        className="absolute inset-0 -z-10 size-full object-cover"
      >
        <source src={`${VIDEO}/9512045-sd_960_506_25fps.mp4`} type="video/mp4" media="(max-width: 767px)" />
        <source src={`${VIDEO}/9512045-hd_2048_1080_25fps.mp4`} type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-ink/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/60 via-transparent to-ink/60" />

      <Link
        href="/"
        aria-label="MP Models home"
        className="animate-fade-up mx-auto mt-8 flex flex-col items-center sm:mt-12"
      >
        <Wordmark size="lg" />
      </Link>

      <nav aria-label="Main" className="flex flex-1 flex-col items-center justify-center gap-10 px-5 text-center sm:gap-14">
        <BoardMenu items={boardMenu} />

        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 sm:gap-x-16 lg:gap-x-24">
          {agencyLinks.map((link, i) => (
            <li key={link.href} className="animate-fade-up" style={{ animationDelay: `${450 + i * 70}ms` }}>
              <Link
                href={link.href}
                className={cn("relative text-sm font-semibold tracking-[0.35em] text-paper/90 uppercase sm:text-base lg:text-lg", underline)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/become-a-model"
          className={cn("animate-fade-up relative text-sm font-bold tracking-[0.4em] uppercase sm:text-base lg:text-lg", underline)}
          style={{ animationDelay: "700ms" }}
        >
          Get Scouted
        </Link>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="animate-fade-up -mt-2 flex flex-col items-center gap-2 text-paper/85 transition-colors hover:text-paper"
          style={{ animationDelay: "800ms" }}
        >
          <Instagram width={24} height={24} />
          <span className="text-[11px] font-semibold tracking-[0.35em] uppercase sm:text-xs">Instagram</span>
        </a>
      </nav>
    </section>
  );
}
