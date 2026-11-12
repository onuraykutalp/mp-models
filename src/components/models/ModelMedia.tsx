"use client";

import { useState } from "react";
import type { Model } from "@/types";
import { Gallery } from "./Gallery";
import { cn, fullName, videoEmbedUrl } from "@/lib/utils";

type Tab = "portfolio" | "snaps" | "videos";

export function ModelMedia({ model }: { model: Model }) {
  const name = fullName(model);
  const tabs = (
    [
      ["portfolio", "Portfolio", model.portfolio.length],
      ["snaps", "Snaps", model.snaps.length],
      ["videos", "Videos", model.videos.length],
    ] as const
  ).filter(([, , count]) => count > 0);
  const [active, setActive] = useState<Tab>(tabs[0]?.[0] ?? "portfolio");

  if (tabs.length === 0) return null;

  return (
    <div>
      {tabs.length > 1 && (
        <div role="tablist" aria-label="Media" className="mb-8 flex flex-wrap items-center gap-2">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              onClick={() => setActive(key)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-semibold tracking-[0.22em] uppercase transition-colors",
                active === key
                  ? "bg-ink text-paper"
                  : "border border-ink/15 text-stone hover:border-ink/40 hover:text-ink",
              )}
            >
              {label}
              <span className={cn("tabular-nums", active === key ? "text-paper/60" : "text-stone")}>{count}</span>
            </button>
          ))}
        </div>
      )}

      {active === "portfolio" && <Gallery images={model.portfolio} name={name} />}
      {active === "snaps" && <Gallery images={model.snaps} name={`${name} — snaps`} layout="grid" />}
      {active === "videos" && (
        <div className="grid gap-3 sm:gap-4">
          {model.videos.map((video) => {
            const embed = videoEmbedUrl(video.url);
            return (
              <div key={video.url} className="relative aspect-video overflow-hidden bg-ink">
                {embed ? (
                  <iframe
                    src={embed}
                    title={`${name} video`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                  />
                ) : (
                  <video
                    src={video.url}
                    poster={video.poster ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
