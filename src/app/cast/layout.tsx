import type { Metadata, Viewport } from "next";
import { Wordmark } from "@/components/layout/Wordmark";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#f3efe8",
};

export default function CastLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="border-b border-line/70">
        <div className="container-x flex h-16 items-center justify-between sm:h-20">
          <Wordmark />
          <p className="text-[10px] font-semibold tracking-[0.28em] text-stone uppercase sm:text-[11px]">Private casting</p>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line/70">
        <div className="container-x flex flex-col gap-1 py-8 text-xs text-stone sm:flex-row sm:items-center sm:justify-between">
          <span>Three15 Management · Confidential selection</span>
          <a href="mailto:booking@mpmodels.com" className="link-underline text-ink">
            booking@mpmodels.com
          </a>
        </div>
      </footer>
    </div>
  );
}
