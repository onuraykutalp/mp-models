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

  if (tabs.length === 0) {
    return <p className="py-12 text-sm text-stone">No media uploaded yet.</p>;
  }

  return (
    <div>
      {tabs.length > 1 && (
        <div role="tablist" aria-label="Media" className="mb-5 flex flex-wrap gap-x-6 gap-y-2 border-b border-line">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              onClick={() => setActive(key)}
              className={cn(
                "-mb-px border-b-2 pb-3 text-[11px] font-semibold tracking-[0.22em] uppercase transition-colors",
                active === key ? "border-ink text-ink" : "border-transparent text-stone hover:text-ink",
              )}
            >
              {label} <span className="ml-1 tabular-nums text-stone">{count}</span>
            </button>
          ))}
        </div>
      )}

      {active === "portfolio" && <Gallery images={model.portfolio} name={name} />}
      {active === "snaps" && <Gallery images={model.snaps} name={`${name} — snaps`} layout="grid" />}
      {active === "videos" && (
        <div className="grid gap-3 sm:grid-cols-2">
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
