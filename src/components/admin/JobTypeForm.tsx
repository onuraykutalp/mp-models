"use client";

import Link from "next/link";
import { startTransition, useActionState, useDeferredValue, useMemo, useState, type FormEvent } from "react";
import type { Board, Division, FormState } from "@/types";
import { saveJobType } from "@/app/admin/actions";
import { Field, FieldMessage, Notice, SubmitButton, Toggle } from "./ui";
import { IconSearch, IconUsers } from "./icons";
import { DIVISIONS, categoryLabel, cn } from "@/lib/utils";

export interface JobTypePickerModel {
  id: string;
  firstName: string;
  lastName: string;
  division: Division;
  board: Board | null;
  coverImage: string;
  city: string;
  published: boolean;
}

interface JobTypeFormProps {
  id?: string;
  initial: {
    title: string;
    description: string;
    clientName: string;
    active: boolean;
    modelIds: string[];
  };
  models: JobTypePickerModel[];
}

const initialState: FormState = { status: "idle" };

export function JobTypeForm({ id, initial, models }: JobTypeFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [clientName, setClientName] = useState(initial.clientName);
  const [active, setActive] = useState(initial.active);
  const [selected, setSelected] = useState(() => new Set(initial.modelIds));
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState<Division | "ALL">("ALL");
  const deferredQuery = useDeferredValue(query);
  const [state, dispatch, pending] = useActionState(saveJobType.bind(null, id ?? null), initialState);

  const visible = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return models.filter((m) => {
      if (division !== "ALL" && m.division !== division) return false;
      if (!q) return true;
      return `${m.firstName} ${m.lastName} ${m.city}`.toLowerCase().includes(q);
    });
  }, [models, division, deferredQuery]);

  const selectedOrder = useMemo(() => {
    const byId = new Map(models.map((m) => [m.id, m]));
    return [...selected].map((mid) => byId.get(mid)).filter(Boolean) as JobTypePickerModel[];
  }, [selected, models]);

  const toggle = (modelId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      return next;
    });
  };

  const selectVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const m of visible) next.add(m.id);
      return next;
    });
  };

  const clearVisible = () => {
    const visibleIds = new Set(visible.map((m) => m.id));
    setSelected((prev) => new Set([...prev].filter((id) => !visibleIds.has(id))));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("clientName", clientName);
    if (active) fd.set("active", "true");
    fd.set("modelIds", JSON.stringify([...selected]));
    startTransition(() => dispatch(fd));
  };

  const errors = state.errors ?? {};

  return (
    <form onSubmit={onSubmit} noValidate className="pb-24 xl:pb-0">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          {state.status === "error" && state.message && <Notice status="error" message={state.message} />}

          <section className="admin-card p-5 sm:p-6">
            <h2 className="font-semibold">Details</h2>
            <p className="mt-1 text-sm text-zinc-500">Name the board and optionally note which client it is for.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nike SS27 — Women runway"
                error={errors.title}
                className="sm:col-span-2"
              />
              <Field
                label="Client"
                name="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nike — internal only"
                hint="Not shown on the public page"
                error={errors.clientName}
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <label htmlFor="f-jt-desc" className="admin-label">
                  Description
                </label>
                <textarea
                  id="f-jt-desc"
                  name="description"
                  rows={3}
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional note for the client — casting brief, dates, city…"
                  className="admin-input h-auto resize-y py-3 leading-relaxed"
                />
                <FieldMessage error={errors.description} hint="Shown above the models on the share page" />
              </div>
            </div>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-semibold">Models</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {selected.size} selected · shown in the order you pick them
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={selectVisible} className="admin-btn-ghost h-9 px-3 text-xs">
                  Select visible
                </button>
                <button type="button" onClick={clearVisible} className="admin-btn-ghost h-9 px-3 text-xs">
                  Clear visible
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-500" width={16} height={16} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or city"
                  className="admin-input pl-10"
                />
              </label>
              <div className="scrollbar-none flex gap-1 overflow-x-auto">
                {([{ key: "ALL" as const, label: "All" }, ...DIVISIONS.map((d) => ({ key: d.key, label: d.label }))]).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setDivision(t.key)}
                    className={cn(
                      "h-11 shrink-0 rounded-xl px-3.5 text-sm font-medium transition-colors",
                      division === t.key ? "bg-white text-paper" : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <FieldMessage error={errors.modelIds} />

            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((m) => {
                const checked = selected.has(m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      aria-pressed={checked}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-xl border text-left transition",
                        checked ? "border-clay-light/70 ring-2 ring-clay/25" : "border-white/[0.08] hover:border-white/20",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.coverImage} alt="" className={cn("aspect-[3/4] w-full object-cover", !m.published && "opacity-50 grayscale")} />
                      <span
                        className={cn(
                          "absolute top-2 right-2 grid size-6 place-items-center rounded-full text-[11px] font-bold transition",
                          checked ? "bg-clay-light text-[#fff]" : "bg-black/45 text-white ring-1 ring-white/30 backdrop-blur",
                        )}
                      >
                        {checked ? "✓" : "+"}
                      </span>
                      <span className="block truncate px-2.5 pt-2 text-xs font-semibold">
                        {m.firstName} {m.lastName}
                      </span>
                      <span className="block truncate px-2.5 pb-2.5 text-[10px] text-zinc-500">
                        {categoryLabel(m)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {visible.length === 0 && (
              <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
                <IconUsers className="text-zinc-600" width={24} height={24} />
                <p className="mt-3 text-sm text-zinc-400">No models match this filter.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="admin-card space-y-4 p-5">
            <Toggle
              checked={active}
              onChange={setActive}
              label="Active"
              description="When off, the share link returns a 404."
            />
            <div className="border-t border-white/[0.06] pt-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Selected</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{selected.size}</p>
              {selectedOrder.length > 0 ? (
                <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                  {selectedOrder.map((m, i) => (
                    <li key={m.id} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-zinc-500 tabular-nums">{i + 1}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.coverImage} alt="" className="size-8 rounded-md object-cover" />
                      <span className="min-w-0 truncate font-medium">
                        {m.firstName} {m.lastName}
                      </span>
                      <button type="button" onClick={() => toggle(m.id)} className="ml-auto text-zinc-500 hover:text-red-400">
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-zinc-500">Pick models from the grid.</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/admin/job-types" className="admin-btn-ghost flex-1">
              Cancel
            </Link>
            <SubmitButton pending={pending} className="flex-1">
              {id ? "Save changes" : "Create board"}
            </SubmitButton>
          </div>
          {selected.size > 0 && (
            <p className="text-center text-[11px] text-zinc-500">
              {DIVISIONS.map((d) => `${selectedOrder.filter((m) => m.division === d.key).length} ${d.label.toLowerCase()}`).join(" · ")}
            </p>
          )}
        </aside>
      </div>
    </form>
  );
}
