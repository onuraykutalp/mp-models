"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import type { JobKind } from "@/types";
import { deleteModelJob } from "@/app/admin/actions";
import { JobKindBadge, JobKindDot } from "./JobKindDot";
import { emptyJobValues, ModelJobForm } from "./ModelJobForm";
import { IconArrowLeft, IconArrowRight, IconPlus, IconTrash } from "./icons";
import { JOB_KIND_LIST, formatFee, isoDay, jobDays, jobKindLabel, monthLabel } from "@/lib/jobs";
import { countryName, cn } from "@/lib/utils";

export interface CalendarJob {
  id: string;
  kind: JobKind;
  customTitle: string | null;
  date: string;
  endDate: string | null;
  agencyFee: number;
  modelFee: number;
  currency: string;
  country: string | null;
  city: string | null;
  notes: string | null;
  model: {
    id: string;
    firstName: string;
    lastName: string;
    coverImage: string;
  };
}

interface CalendarViewProps {
  year: number;
  month: number;
  jobs: CalendarJob[];
  models: { id: string; firstName: string; lastName: string; coverImage: string }[];
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({ year, month, jobs, models }: CalendarViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<JobKind | "ALL">("ALL");
  const [selected, setSelected] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filter === "ALL" ? jobs : jobs.filter((j) => j.kind === filter)),
    [jobs, filter],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarJob[]>();
    for (const job of filtered) {
      for (const day of jobDays(job.date, job.endDate)) {
        const list = map.get(day) ?? [];
        list.push(job);
        map.set(day, list);
      }
    }
    return map;
  }, [filtered]);

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const today = localIsoDay(new Date());
  const selectedJobs = selected ? (byDay.get(selected) ?? []) : [];

  const go = (y: number, m: number) => {
    const url = m < 1 ? `/admin/calendar?y=${y - 1}&m=12` : m > 12 ? `/admin/calendar?y=${y + 1}&m=1` : `/admin/calendar?y=${y}&m=${m}`;
    router.push(url);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <div className="admin-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(year, month - 1)} className="admin-btn-ghost size-10 px-0" aria-label="Previous month">
              <IconArrowLeft width={16} height={16} />
            </button>
            <h2 className="min-w-[10rem] text-center text-lg font-semibold tracking-tight sm:text-xl">{monthLabel(year, month)}</h2>
            <button type="button" onClick={() => go(year, month + 1)} className="admin-btn-ghost size-10 px-0" aria-label="Next month">
              <IconArrowRight width={16} height={16} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                router.push(`/admin/calendar?y=${now.getFullYear()}&m=${now.getMonth() + 1}`);
                setSelected(localIsoDay(now));
              }}
              className="admin-btn-ghost h-9 px-3 text-xs"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setAssigning(true)}
              className="admin-btn-primary h-9 px-3 text-xs"
            >
              <IconPlus width={14} height={14} />
              Assign job
            </button>
          </div>
        </div>

        <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1">
          <FilterChip active={filter === "ALL"} onClick={() => setFilter("ALL")}>
            All
          </FilterChip>
          {JOB_KIND_LIST.map((k) => (
            <FilterChip key={k.key} active={filter === k.key} onClick={() => setFilter(k.key)}>
              <JobKindDot kind={k.key} className="size-2" />
              {k.label}
            </FilterChip>
          ))}
        </div>

        <div className="admin-card overflow-hidden p-2 sm:p-3">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                {d}
              </div>
            ))}
            {cells.map((cell, i) => {
              if (!cell) return <div key={`pad-${i}`} className="min-h-20 sm:min-h-24" />;
              const dayJobs = byDay.get(cell) ?? [];
              const isSelected = selected === cell;
              const isToday = cell === today;
              const inMonth = Number(cell.slice(5, 7)) === month;
              return (
                <button
                  key={cell}
                  type="button"
                  onClick={() => setSelected(cell)}
                  className={cn(
                    "relative flex min-h-20 flex-col rounded-xl p-1.5 text-left transition sm:min-h-24 sm:p-2",
                    inMonth ? "hover:bg-white/[0.05]" : "opacity-35",
                    isSelected && "bg-white/[0.08] ring-1 ring-clay-light/40",
                    isToday && !isSelected && "ring-1 ring-white/15",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-xs font-semibold tabular-nums",
                      isToday && "bg-clay text-[#fff]",
                    )}
                  >
                    {Number(cell.slice(8))}
                  </span>
                  <div className="mt-1 flex flex-1 flex-col gap-0.5 overflow-hidden">
                    {dayJobs.slice(0, 3).map((job) => (
                      <span
                        key={job.id}
                        className="flex items-center gap-1 truncate rounded-md px-1 py-0.5 text-[9px] font-semibold leading-tight sm:text-[10px]"
                        title={jobKindLabel(job.kind, job.customTitle)}
                      >
                        <JobKindDot kind={job.kind} className="size-1.5" />
                        <span className="truncate">{job.model.firstName}</span>
                      </span>
                    ))}
                    {dayJobs.length > 3 && (
                      <span className="px-1 text-[9px] font-medium text-zinc-500">+{dayJobs.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <ul className="flex flex-wrap gap-3 text-xs text-zinc-500">
          {JOB_KIND_LIST.map((k) => (
            <li key={k.key} className="inline-flex items-center gap-1.5">
              <JobKindDot kind={k.key} />
              {k.label}
            </li>
          ))}
        </ul>
      </div>

      <aside className="admin-card flex max-h-[80dvh] flex-col overflow-hidden xl:sticky xl:top-6">
        <div className="border-b border-white/[0.06] p-5">
          <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
            {selected
              ? new Date(`${selected}T12:00:00Z`).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Pick a day"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {selected
              ? selectedJobs.length === 0
                ? "No jobs on this day"
                : `${selectedJobs.length} job${selectedJobs.length === 1 ? "" : "s"}`
              : "Select a date on the calendar to see details"}
          </p>
          {selected && (
            <button
              type="button"
              className="admin-btn-ghost mt-3 h-9 w-full text-xs"
              onClick={() => setAssigning(true)}
            >
              <IconPlus width={14} height={14} />
              Assign on this day
            </button>
          )}
        </div>

        <div className={cn("flex-1 space-y-3 overflow-y-auto p-4", pending && "opacity-60")}>
          {!selected && (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              Month overview · {filtered.length} job{filtered.length === 1 ? "" : "s"} shown
            </div>
          )}
          {selected && selectedJobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              Free day — assign a job when you’re ready.
            </div>
          )}
          {selectedJobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5">
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={job.model.coverImage} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/models/${job.model.id}`} className="block truncate text-sm font-semibold hover:text-clay-light">
                    {job.model.firstName} {job.model.lastName}
                  </Link>
                  <div className="mt-1.5">
                    <JobKindBadge kind={job.kind} label={jobKindLabel(job.kind, job.customTitle)} />
                  </div>
                </div>
              </div>
              <dl className="mt-3 space-y-1.5 text-xs text-zinc-500">
                {(job.city || job.country) && (
                  <div className="flex justify-between gap-3">
                    <dt>Location</dt>
                    <dd className="text-right font-medium text-zinc-200">
                      {[job.city, job.country ? countryName(job.country) : null].filter(Boolean).join(", ")}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt>Agency</dt>
                  <dd className="font-medium text-zinc-200 tabular-nums">{formatFee(job.agencyFee, job.currency)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Model</dt>
                  <dd className="font-medium text-zinc-200 tabular-nums">{formatFee(job.modelFee, job.currency)}</dd>
                </div>
                {job.endDate && isoDay(job.endDate) !== isoDay(job.date) && (
                  <div className="flex justify-between gap-3">
                    <dt>Until</dt>
                    <dd className="tabular-nums text-zinc-200">
                      {new Date(`${isoDay(job.endDate)}T12:00:00Z`).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </dd>
                  </div>
                )}
                {job.notes && <p className="pt-1 leading-relaxed text-zinc-400">{job.notes}</p>}
              </dl>
              <div className="mt-3 flex gap-2">
                <Link href={`/admin/models/${job.model.id}`} className="admin-btn-ghost h-8 flex-1 text-xs">
                  Model
                </Link>
                <button
                  type="button"
                  className="admin-btn-ghost h-8 px-3 text-xs text-red-400 hover:text-red-300"
                  onClick={() => {
                    if (!confirm("Delete this job?")) return;
                    startTransition(() => deleteModelJob(job.id));
                  }}
                >
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </aside>

      {assigning && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
          <div className="admin-card max-h-[90dvh] w-full max-w-lg overflow-y-auto p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Assign job</h3>
                <p className="mt-0.5 text-sm text-zinc-500">Pick a model, type, fees and location.</p>
              </div>
              <button type="button" onClick={() => setAssigning(false)} className="text-zinc-400 hover:text-zinc-100">
                ✕
              </button>
            </div>
            <ModelJobForm
              models={models}
              initial={emptyJobValues("", selected ?? "")}
              onCancel={() => setAssigning(false)}
              onDone={() => {
                setAssigning(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function localIsoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition",
        active ? "bg-white text-paper" : "bg-white/[0.04] text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200",
      )}
    >
      {children}
    </button>
  );
}

/** Monday-first month grid of ISO dates (null = padding). */
function buildMonthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startPad = (first.getUTCDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: startPad }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
