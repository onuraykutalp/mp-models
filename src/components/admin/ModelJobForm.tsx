"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import type { FormState, JobKind } from "@/types";
import { saveModelJob } from "@/app/admin/actions";
import { JobKindDot } from "./JobKindDot";
import { Field, FieldMessage, Notice, SubmitButton } from "./ui";
import { CURRENCIES, JOB_KIND_LIST, JOB_KINDS, currencySymbol, formatFee, type JobCurrency } from "@/lib/jobs";
import { COUNTRIES, cn, countryName, isCountryCode } from "@/lib/utils";

export interface ModelJobFormValues {
  id?: string;
  modelId: string;
  kind: JobKind;
  customTitle: string;
  date: string;
  endDate: string;
  agencyFee: string;
  modelFee: string;
  currency: JobCurrency;
  country: string;
  city: string;
  notes: string;
}

const emptyState: FormState = { status: "idle" };

const QUICK_COUNTRIES = ["TR", "IT", "FR", "GB", "DE", "PL", "ES", "US"];

interface ModelJobFormProps {
  initial: ModelJobFormValues;
  /** When set, model is locked (editing from a model page). */
  lockModel?: boolean;
  models?: { id: string; firstName: string; lastName: string; coverImage: string }[];
  onDone?: () => void;
  onCancel?: () => void;
}

export function ModelJobForm({ initial, lockModel, models, onDone, onCancel }: ModelJobFormProps) {
  const [values, setValues] = useState(initial);
  const [state, dispatch, pending] = useActionState(saveModelJob.bind(null, initial.id ?? null), emptyState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
  }, [state, onDone]);

  const set = <K extends keyof ModelJobFormValues>(key: K, value: ModelJobFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (key === "id") continue;
      fd.set(key, value);
    }
    startTransition(() => dispatch(fd));
  };

  const errors = state.errors ?? {};
  const agency = Number(values.agencyFee);
  const modelFee = Number(values.modelFee);
  const total = (Number.isFinite(agency) ? agency : 0) + (Number.isFinite(modelFee) ? modelFee : 0);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {state.status === "error" && state.message && <Notice status="error" message={state.message} />}

      {!lockModel && models && (
        <div>
          <label htmlFor="f-job-model" className="admin-label">
            Model
          </label>
          <select
            id="f-job-model"
            value={values.modelId}
            onChange={(e) => set("modelId", e.target.value)}
            className="admin-input appearance-none"
            aria-invalid={!!errors.modelId || undefined}
          >
            <option value="">Select a model…</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
          <FieldMessage error={errors.modelId} />
        </div>
      )}
      {lockModel && <input type="hidden" name="modelId" value={values.modelId} />}

      <fieldset>
        <legend className="admin-label">Job type</legend>
        <div className="grid grid-cols-2 gap-2">
          {JOB_KIND_LIST.map((k) => {
            const checked = values.kind === k.key;
            return (
              <label
                key={k.key}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                  checked ? cn("border-transparent ring-2", k.ring, k.soft, k.text) : "border-white/10 text-zinc-500 hover:border-white/20",
                )}
              >
                <input
                  type="radio"
                  name="kind"
                  value={k.key}
                  checked={checked}
                  onChange={() => set("kind", k.key)}
                  className="sr-only"
                />
                <JobKindDot kind={k.key} />
                {k.label}
              </label>
            );
          })}
        </div>
        <FieldMessage error={errors.kind} />
      </fieldset>

      {values.kind === "BASIC_EVENT" && (
        <Field
          label="Event name"
          name="customTitle"
          value={values.customTitle}
          onChange={(e) => set("customTitle", e.target.value)}
          placeholder="Optional — e.g. Brand dinner, Launch party"
          hint="Leave empty to show “Basic Event”"
          error={errors.customTitle}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" name="date" type="date" value={values.date} onChange={(e) => set("date", e.target.value)} error={errors.date} required />
        <Field
          label="End date"
          name="endDate"
          type="date"
          value={values.endDate}
          min={values.date || undefined}
          onChange={(e) => set("endDate", e.target.value)}
          hint="Optional — for multi-day jobs"
          error={errors.endDate}
        />
      </div>

      <div>
        <label htmlFor="f-job-currency" className="admin-label">
          Currency
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CURRENCIES.map((c) => {
            const checked = values.currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => set("currency", c.code)}
                aria-pressed={checked}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition",
                  checked
                    ? "border-clay-light/60 bg-clay/15 text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200",
                )}
              >
                <span className="tabular-nums opacity-70">{c.symbol}</span>
                {c.code}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="currency" value={values.currency} />
        <FieldMessage error={errors.currency} hint={CURRENCIES.find((c) => c.code === values.currency)?.label} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Agency share"
          name="agencyFee"
          type="number"
          inputMode="decimal"
          step="1"
          min="0"
          value={values.agencyFee}
          onChange={(e) => set("agencyFee", e.target.value)}
          suffix={currencySymbol(values.currency)}
          error={errors.agencyFee}
        />
        <Field
          label="Model share"
          name="modelFee"
          type="number"
          inputMode="decimal"
          step="1"
          min="0"
          value={values.modelFee}
          onChange={(e) => set("modelFee", e.target.value)}
          suffix={currencySymbol(values.currency)}
          error={errors.modelFee}
        />
      </div>
      {total > 0 && (
        <p className="rounded-xl border border-dashed border-white/15 px-3.5 py-2.5 text-xs text-zinc-500">
          Total booking{" "}
          <span className="font-semibold text-zinc-100 tabular-nums">{formatFee(total, values.currency)}</span>
          {Number.isFinite(agency) && Number.isFinite(modelFee) && total > 0 && (
            <span>
              {" "}
              · agency {Math.round((agency / total) * 100)}% / model {Math.round((modelFee / total) * 100)}%
            </span>
          )}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="f-job-country" className="admin-label">
            Country
          </label>
          <select
            id="f-job-country"
            value={values.country}
            onChange={(e) => set("country", e.target.value)}
            className="admin-input appearance-none"
            aria-invalid={!!errors.country || undefined}
          >
            <option value="">No location</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_COUNTRIES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => set("country", code)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  values.country === code
                    ? "border-clay-light/60 bg-clay/15 text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200",
                )}
              >
                {countryName(code)}
              </button>
            ))}
          </div>
          <FieldMessage error={errors.country} />
        </div>
        <Field
          label="City"
          name="city"
          value={values.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder={values.country && isCountryCode(values.country) ? `City in ${countryName(values.country)}` : "City"}
          hint="Optional"
          error={errors.city}
        />
      </div>

      <div>
        <label htmlFor="f-job-notes" className="admin-label">
          Notes
        </label>
        <textarea
          id="f-job-notes"
          rows={2}
          maxLength={1000}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Call time, contact, wardrobe…"
          className="admin-input h-auto resize-y py-3 leading-relaxed"
        />
        <FieldMessage error={errors.notes} />
      </div>

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="admin-btn-ghost flex-1">
            Cancel
          </button>
        )}
        <SubmitButton pending={pending} className="flex-1">
          {initial.id ? "Save job" : "Assign job"}
        </SubmitButton>
      </div>
      <p className="text-center text-[11px] text-zinc-500">
        {JOB_KINDS[values.kind].label}
        {values.kind === "BASIC_EVENT" && values.customTitle ? ` · ${values.customTitle}` : ""}
      </p>
    </form>
  );
}

export const emptyJobValues = (modelId = "", date = ""): ModelJobFormValues => ({
  modelId,
  kind: "BASIC_EVENT",
  customTitle: "",
  date,
  endDate: "",
  agencyFee: "",
  modelFee: "",
  currency: "EUR",
  country: "",
  city: "",
  notes: "",
});
