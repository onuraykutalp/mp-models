"use client";

import { useState } from "react";
import type { Model } from "@/types";
import { cmToFeet, cn } from "@/lib/utils";

type Unit = "metric" | "imperial";

const inch = (cm: number) => `${Math.round(cm / 2.54)}"`;

export function Measurements({ model }: { model: Model }) {
  const [unit, setUnit] = useState<Unit>("metric");
  const metric = unit === "metric";

  const { height, bust, waist, hips, shoes } = model;
  const rows = (
    [
      ["Height", height != null && (metric ? `${height}` : cmToFeet(height))],
      [model.division === "MEN" ? "Chest" : "Bust", bust != null && (metric ? `${bust}` : inch(bust))],
      ["Waist", waist != null && (metric ? `${waist}` : inch(waist))],
      ["Hips", hips != null && (metric ? `${hips}` : inch(hips))],
      ["Shoes", shoes != null && (metric ? `${shoes} EU` : `${Math.round((shoes - 31) * 10) / 10} US`)],
      ["Hair", model.hair],
      ["Eyes", model.eyes],
    ] as [string, string | false | null][]
  ).filter((row): row is [string, string] => !!row[1]);

  if (rows.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="eyebrow text-stone">Measurements</p>
        <div className="flex rounded-full border border-ink/15 p-0.5 text-xs font-semibold">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={cn("rounded-full px-3 py-1 transition-colors", unit === u ? "bg-ink text-paper" : "text-stone")}
            >
              {u === "metric" ? "CM" : "FT/IN"}
            </button>
          ))}
        </div>
      </div>
      <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {rows.map(([label, value]) => (
          <div key={label} className="border-b border-line py-4 pr-3">
            <dt className="text-[11px] tracking-[0.18em] text-stone uppercase">{label}</dt>
            <dd className="mt-1 text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
