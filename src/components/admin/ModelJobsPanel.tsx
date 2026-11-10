"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { JobKind } from "@/types";
import { deleteModelJob } from "@/app/admin/actions";
import { JobKindBadge, JobKindDot } from "./JobKindDot";
import { emptyJobValues, ModelJobForm, type ModelJobFormValues } from "./ModelJobForm";
import { IconCalendar, IconPlus, IconTrash } from "./icons";
import { formatFee, isJobCurrency, isoDay, jobKindLabel } from "@/lib/jobs";
import { countryName, cn } from "@/lib/utils";

export interface ModelJobRow {
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
}

export function ModelJobsPanel({ modelId, jobs }: { modelId: string; jobs: ModelJobRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModelJobFormValues | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setEditing(null);
    router.refresh();
  };

  return (
    <section className="admin-card mt-6 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-9 place-items-center rounded-xl bg-white/[0.05] text-zinc-400">
            <IconCalendar width={18} height={18} />
          </span>
          <div>
            <h2 className="font-semibold">Assigned jobs</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {jobs.length === 0 ? "No jobs yet — assign Basic Event, Work, Fitting or Zoom Call." : `${jobs.length} job${jobs.length === 1 ? "" : "s"} on the calendar`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="admin-btn-primary h-10"
        >
          <IconPlus width={16} height={16} />
          Assign job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <p className="text-sm text-zinc-500">Jobs you assign here appear on the Calendar page.</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {jobs.map((job) => (
            <li key={job.id} className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6", pending && "opacity-60")}>
              <div className="min-w-0 flex items-start gap-3">
                <JobKindDot kind={job.kind} className="mt-1.5 size-3" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{jobKindLabel(job.kind, job.customTitle)}</p>
                    <JobKindBadge kind={job.kind} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 tabular-nums">
                    {formatRange(job.date, job.endDate)}
                    {(job.city || job.country) && (
                      <>
                        {" · "}
                        {[job.city, job.country ? countryName(job.country) : null].filter(Boolean).join(", ")}
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Agency {formatFee(job.agencyFee, job.currency)} · Model {formatFee(job.modelFee, job.currency)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <button
                  type="button"
                  className="admin-btn-ghost h-9 px-3 text-xs"
                  onClick={() => {
                    setEditing({
                      id: job.id,
                      modelId,
                      kind: job.kind,
                      customTitle: job.customTitle ?? "",
                      date: isoDay(job.date),
                      endDate: job.endDate ? isoDay(job.endDate) : "",
                      agencyFee: String(job.agencyFee),
                      modelFee: String(job.modelFee),
                      currency: isJobCurrency(job.currency) ? job.currency : "EUR",
                      country: job.country ?? "",
                      city: job.city ?? "",
                      notes: job.notes ?? "",
                    });
                    setOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-btn-ghost h-9 px-3 text-xs text-red-400 hover:text-red-300"
                  onClick={() => {
                    if (!confirm("Remove this job from the calendar?")) return;
                    startTransition(() => deleteModelJob(job.id));
                  }}
                >
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
          <div className="admin-card max-h-[90dvh] w-full max-w-lg overflow-y-auto p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{editing ? "Edit job" : "Assign job"}</h3>
                <p className="mt-0.5 text-sm text-zinc-500">Fees, location and dates show up on the calendar.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-100">
                ✕
              </button>
            </div>
            <ModelJobForm
              key={editing?.id ?? "new"}
              lockModel
              initial={editing ?? emptyJobValues(modelId)}
              onCancel={() => setOpen(false)}
              onDone={close}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function formatRange(date: string, endDate: string | null) {
  const fmt = (iso: string) =>
    new Date(`${isoDay(iso)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  if (!endDate || isoDay(endDate) === isoDay(date)) return fmt(date);
  return `${fmt(date)} – ${fmt(endDate)}`;
}
