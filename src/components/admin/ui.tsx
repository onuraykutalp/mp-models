"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { IconCheck, IconEye, IconEyeOff, IconSpinner } from "./icons";
import { cn } from "@/lib/utils";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
  suffix?: ReactNode;
}

export function Field({ label, name, error, hint, suffix, className, ...props }: FieldProps) {
  const id = props.id ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="admin-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("admin-input", suffix && "pr-12")}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs text-zinc-500">
            {suffix}
          </span>
        )}
      </div>
      <FieldMessage id={`${id}-error`} error={error} hint={hint} />
    </div>
  );
}

export function FieldMessage({ id, error, hint }: { id?: string; error?: string; hint?: ReactNode }) {
  if (error?.trim()) {
    return (
      <p id={id} className="mt-1.5 text-xs text-red-400">
        {error}
      </p>
    );
  }
  return hint ? <p className="mt-1.5 text-xs text-zinc-500">{hint}</p> : null;
}

export function PasswordField(props: Omit<FieldProps, "type" | "suffix">) {
  const [visible, setVisible] = useState(false);
  const id = props.id ?? `f-${props.name}`;
  return (
    <div className={props.className}>
      <label htmlFor={id} className="admin-label">
        {props.label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={!!props.error || undefined}
          className="admin-input pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-1.5 my-auto grid size-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:text-zinc-200"
        >
          {visible ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
        </button>
      </div>
      <FieldMessage error={props.error} hint={props.hint} />
    </div>
  );
}

export function SubmitButton({ pending, children, className }: { pending: boolean; children: ReactNode; className?: string }) {
  return (
    <button type="submit" disabled={pending} className={cn("admin-btn-primary", className)}>
      {pending && <IconSpinner width={16} height={16} />}
      {children}
    </button>
  );
}

export function Notice({ status, message }: { status: "success" | "error"; message: string }) {
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm",
        status === "error"
          ? "border-red-400/20 bg-red-400/[0.08] text-red-300"
          : "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
      )}
    >
      {status === "success" && <IconCheck width={16} height={16} />}
      {message}
    </p>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-zinc-100">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-zinc-500">{description}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="block h-6 w-10 rounded-full bg-white/15 transition-colors peer-checked:bg-clay-light peer-focus-visible:ring-4 peer-focus-visible:ring-clay/30" />
        <span className="absolute top-1 left-1 size-4 rounded-full bg-[#fff] shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
