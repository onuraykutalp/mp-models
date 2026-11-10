"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import type { Board, Division } from "@/types";
import { deleteModel, setModelFlag } from "@/app/admin/actions";
import { IconEdit, IconEye, IconEyeOff, IconImage, IconSearch, IconStar, IconTrash, IconUsers } from "./icons";
import { Notice } from "./ui";
import { BOARDS, DIVISIONS, categoryLabel, cn, divisionInfo } from "@/lib/utils";

export interface BoardModel {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  division: Division;
  board: Board | null;
  coverImage: string;
  height: number | null;
  city: string;
  featured: boolean;
  published: boolean;
  media: number;
  updatedAt: string;
}

type Status = "all" | "published" | "draft" | "featured";

const STATUSES: { key: Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Live" },
  { key: "draft", label: "Drafts" },
  { key: "featured", label: "Featured" },
];

const fold = (s: string) => s.toLocaleLowerCase("en").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");

interface ModelsBoardProps {
  models: BoardModel[];
  initialCategory?: Division;
  initialBoard?: Board;
  savedName?: string;
}

export function ModelsBoard({ models, initialCategory, initialBoard, savedName }: ModelsBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [category, setCategoryState] = useState<Division | "ALL">(initialCategory ?? "ALL");
  const [board, setBoard] = useState<Board | "ALL">(initialBoard ?? "ALL");
  const setCategory = (next: Division | "ALL") => {
    setCategoryState(next);
    setBoard("ALL");
  };
  const [status, setStatus] = useState<Status>("all");
  const [toast, setToast] = useState(savedName ? `${savedName} saved.` : null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (savedName) router.replace(pathname, { scroll: false });
  }, [savedName, router, pathname]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const m of models) {
      c[m.division] = (c[m.division] ?? 0) + 1;
      if (m.board) c[`${m.division}:${m.board}`] = (c[`${m.division}:${m.board}`] ?? 0) + 1;
    }
    return c;
  }, [models]);

  const visible = useMemo(() => {
    const q = fold(deferredQuery.trim());
    return models.filter(
      (m) =>
        (category === "ALL" || m.division === category) &&
        (board === "ALL" || m.board === board) &&
        (status === "all" ||
          (status === "published" && m.published) ||
          (status === "draft" && !m.published) ||
          (status === "featured" && m.featured)) &&
        (!q || fold(`${m.firstName} ${m.lastName} ${m.city}`).includes(q)),
    );
  }, [models, category, board, status, deferredQuery]);

  const tabs = [{ key: "ALL" as const, label: "All", count: models.length }, ...DIVISIONS.map((d) => ({ key: d.key, label: d.label, count: counts[d.key] ?? 0 }))];
  const activeDivision = category === "ALL" ? undefined : divisionInfo(category);
  const boardTabs = activeDivision?.boards.length
    ? [
        { key: "ALL" as const, label: `All ${activeDivision.label}`, count: counts[activeDivision.key] ?? 0 },
        ...activeDivision.boards.map((b) => ({ key: b, label: BOARDS[b].label, count: counts[`${activeDivision.key}:${b}`] ?? 0 })),
      ]
    : [];

  return (
    <div>
      {toast && (
        <div className="fixed right-4 bottom-4 z-50 animate-fade-up sm:right-6 sm:bottom-6">
          <Notice status="success" message={toast} />
        </div>
      )}

      <div className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setCategory(t.key)}
            aria-pressed={category === t.key}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
              category === t.key ? "bg-white text-paper" : "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            {t.label}
            <span className={cn("text-xs tabular-nums", category === t.key ? "text-zinc-500" : "text-zinc-600")}>{t.count}</span>
          </button>
        ))}
      </div>

      {boardTabs.length > 0 && (
        <div className="scrollbar-none -mx-4 mt-3 flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 sm:mx-0 sm:px-0">
          {boardTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setBoard(t.key)}
              aria-pressed={board === t.key}
              className={cn(
                "relative flex h-10 shrink-0 items-center gap-1.5 px-3 text-xs font-semibold transition-colors",
                "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-clay-light after:transition-opacity",
                board === t.key ? "text-white after:opacity-100" : "text-zinc-500 after:opacity-0 hover:text-zinc-200",
              )}
            >
              {t.label}
              <span className="text-[10px] font-medium text-zinc-600 tabular-nums">{t.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search models</span>
          <IconSearch className="pointer-events-none absolute inset-y-0 left-3.5 my-auto text-zinc-500" width={16} height={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city"
            className="admin-input pl-10"
          />
        </label>
        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatus(s.key)}
              aria-pressed={status === s.key}
              className={cn(
                "h-8 flex-1 rounded-lg px-3 text-xs font-semibold transition-colors sm:flex-none",
                status === s.key ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-200",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="admin-card mt-6 flex flex-col items-center px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.05] text-zinc-500">
            <IconUsers />
          </span>
          <p className="mt-4 font-medium">No models found</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different search or filter, or add a new model.</p>
          <Link href="/admin/models/new" className="admin-btn-ghost mt-5">
            New model
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((m) => (
            <ModelTile key={m.id} model={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ModelTile({ model }: { model: BoardModel }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const name = `${model.firstName} ${model.lastName}`;

  const flag = (key: "featured" | "published") => startTransition(() => setModelFlag(model.id, key, !model[key]));

  return (
    <li className={cn("group relative transition-opacity", pending && "pointer-events-none opacity-50")}>
      <Link
        href={`/admin/models/${model.id}`}
        className="block overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition-colors hover:border-white/20"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.04]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={model.coverImage}
            alt={name}
            loading="lazy"
            className={cn(
              "size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]",
              !model.published && "opacity-50 grayscale",
            )}
          />
          <div className="on-photo absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              {categoryLabel(model)}
            </span>
            {!model.published && (
              <span className="rounded-full bg-amber-300/90 px-2.5 py-1 text-[11px] font-semibold text-night">Draft</span>
            )}
          </div>
          <div className="on-photo absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
            <p className="flex items-center gap-1.5 text-[11px] text-zinc-300">
              <IconImage width={12} height={12} /> {model.media} media
              {model.height != null && ` · ${model.height} cm`}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block truncate text-xs text-zinc-500">{model.city}</span>
          </span>
        </div>
      </Link>

      <div className="on-photo absolute top-10 right-2.5 flex flex-col gap-1.5 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <TileAction label={model.featured ? "Remove from featured" : "Feature on homepage"} onClick={() => flag("featured")} active={model.featured}>
          <IconStar filled={model.featured} width={15} height={15} />
        </TileAction>
        <TileAction label={model.published ? "Hide from website" : "Publish on website"} onClick={() => flag("published")}>
          {model.published ? <IconEye width={15} height={15} /> : <IconEyeOff width={15} height={15} />}
        </TileAction>
        <Link
          href={`/admin/models/${model.id}`}
          aria-label={`Edit ${name}`}
          title="Edit"
          className="grid size-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-night"
        >
          <IconEdit width={15} height={15} />
        </Link>
        <TileAction label={`Delete ${name}`} onClick={() => setConfirming(true)} danger>
          <IconTrash width={15} height={15} />
        </TileAction>
      </div>

      {model.featured && (
        <span className="pointer-events-none absolute top-10 left-2.5 grid size-6 place-items-center rounded-full bg-amber-300 text-night sm:group-hover:opacity-0">
          <IconStar filled width={12} height={12} />
        </span>
      )}

      {confirming && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#fdfcfa]/95 p-4 text-center backdrop-blur-sm">
          <p className="text-sm font-medium">Delete {model.firstName}?</p>
          <p className="text-xs text-zinc-400">This removes the profile and all uploaded media.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirming(false)} className="admin-btn-ghost h-9 px-3">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => startTransition(() => deleteModel(model.id))}
              className="admin-btn h-9 bg-red-500 px-3 text-[#fff] hover:bg-red-400"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function TileAction({
  label,
  onClick,
  children,
  active,
  danger,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-full backdrop-blur-md transition-colors",
        active ? "bg-amber-300 text-night" : "bg-black/55 text-white hover:bg-white hover:text-night",
        danger && "hover:bg-red-500 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
