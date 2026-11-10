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
        <div role="tablist" aria-label="Media" className="mb-6 flex gap-6 border-b border-line">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              onClick={() => setActive(key)}
              className={cn(
                "-mb-px border-b pb-3 text-sm font-medium transition-colors",
                active === key ? "border-ink text-ink" : "border-transparent text-stone hover:text-ink",
              )}
            >
              {label} <span className="text-stone tabular-nums">{count}</span>
            </button>
          ))}
        </div>
      )}

      {active === "portfolio" && <Gallery images={model.portfolio} name={name} />}
      {active === "snaps" && <Gallery images={model.snaps} name={`${name} — snaps`} layout="grid" />}
      {active === "videos" && (
        <div className="grid gap-4">
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
