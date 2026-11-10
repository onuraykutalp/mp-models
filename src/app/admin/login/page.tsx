import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Wordmark } from "@/components/layout/Wordmark";
import { getAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

const VIDEO = "https://videos.pexels.com/video-files/9509328/9509328-hd_1366_720_25fps.mp4";
const POSTER = "https://images.pexels.com/videos/9509328/pexels-photo-9509328.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="on-photo relative hidden overflow-hidden lg:block">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER}
          src={VIDEO}
          aria-hidden
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-night via-night/60 to-night/10" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" aria-label="MP Models home" className="inline-flex self-start text-paper">
            <Wordmark size="md" />
          </Link>
          <div className="max-w-md">
            <p className="font-display text-4xl leading-tight text-paper">
              Every board, every face — <em className="text-clay-light">in one place.</em>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Manage models, talents, portfolios, snaps and videos across the Women, Men, Kids and Talents boards.
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-5 py-16 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/4 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-clay/20 blur-[120px]"
        />
        <div className="relative w-full max-w-sm">
          <Link href="/" aria-label="MP Models home" className="mb-12 inline-flex lg:hidden">
            <Wordmark size="md" />
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-400">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400" />
            Admin panel
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in with your agency email and password.</p>
          <LoginForm next={typeof next === "string" ? next : undefined} />
        </div>
      </div>
    </div>
  );
}
