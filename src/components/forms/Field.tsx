import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface WrapperProps {
  label: string;
  name: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

function Wrapper({ label, name, error, className, children }: WrapperProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={name} className="text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-2 text-xs text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = { label: string; name: string; error?: string; className?: string };

export function Input({ label, name, error, className, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrapper label={label} name={name} error={error} className={className}>
      <input
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn("field", error && "border-clay")}
        {...props}
      />
    </Wrapper>
  );
}

export function Textarea({ label, name, error, className, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrapper label={label} name={name} error={error} className={className}>
      <textarea
        id={name}
        name={name}
        rows={4}
        aria-invalid={!!error}
        className={cn("field resize-none", error && "border-clay")}
        {...props}
      />
    </Wrapper>
  );
}

export function Select({
  label,
  name,
  error,
  className,
  children,
  ...props
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrapper label={label} name={name} error={error} className={className}>
      <select id={name} name={name} aria-invalid={!!error} className={cn("field cursor-pointer", error && "border-clay")} {...props}>
        {children}
      </select>
    </Wrapper>
  );
}

export function FormMessage({ status, message }: { status: string; message?: string }) {
  if (!message || status === "idle") return null;
  return (
    <p
      role="status"
      className={cn(
        "rounded-sm px-4 py-3 text-sm",
        status === "success" ? "bg-ink text-paper" : "bg-clay/10 text-clay",
      )}
    >
      {message}
    </p>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-ink px-10 text-sm font-semibold text-paper transition-colors hover:bg-clay disabled:cursor-wait disabled:opacity-60"
    >
      {pending && <span className="size-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />}
      {children}
    </button>
  );
}
