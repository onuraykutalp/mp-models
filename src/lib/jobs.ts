import type { JobKind } from "@/types";

export type { JobKind };

export interface JobKindInfo {
  key: JobKind;
  label: string;
  /** Tailwind-friendly solid color for the round indicator. */
  color: string;
  /** Soft tint for chips / calendar cells. */
  soft: string;
  /** Text on soft backgrounds. */
  text: string;
  ring: string;
}

export const JOB_KINDS: Record<JobKind, JobKindInfo> = {
  BASIC_EVENT: {
    key: "BASIC_EVENT",
    label: "Basic Event",
    color: "bg-sky-500",
    soft: "bg-sky-500/15",
    text: "text-sky-700",
    ring: "ring-sky-500/30",
  },
  WORK: {
    key: "WORK",
    label: "Work",
    color: "bg-red-500",
    soft: "bg-red-500/15",
    text: "text-red-700",
    ring: "ring-red-500/30",
  },
  FITTING: {
    key: "FITTING",
    label: "Fitting",
    color: "bg-amber-400",
    soft: "bg-amber-400/20",
    text: "text-amber-800",
    ring: "ring-amber-400/40",
  },
  ZOOM_CALL: {
    key: "ZOOM_CALL",
    label: "Zoom Call",
    color: "bg-emerald-500",
    soft: "bg-emerald-500/15",
    text: "text-emerald-700",
    ring: "ring-emerald-500/30",
  },
};

export const JOB_KIND_LIST = Object.values(JOB_KINDS);

export const jobKindLabel = (kind: JobKind, customTitle?: string | null) =>
  kind === "BASIC_EVENT" && customTitle?.trim() ? customTitle.trim() : JOB_KINDS[kind].label;

export const CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "TRY", label: "Turkish Lira", symbol: "₺" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "PLN", label: "Polish Złoty", symbol: "zł" },
] as const;

export type JobCurrency = (typeof CURRENCIES)[number]["code"];

export const isJobCurrency = (code: string): code is JobCurrency =>
  CURRENCIES.some((c) => c.code === code);

export const currencySymbol = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol ?? code;

export const formatFee = (n: number | string, currency: string = "EUR") => {
  const code = isJobCurrency(currency) ? currency : "EUR";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "TRY" ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(Number(n));
  } catch {
    return `${Number(n).toLocaleString("en-GB")} ${code}`;
  }
};

export const isoDay = (d: Date | string) => {
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

/** Inclusive list of YYYY-MM-DD days a job covers. */
export function jobDays(date: Date | string, endDate?: Date | string | null): string[] {
  const start = isoDay(date);
  const end = endDate ? isoDay(endDate) : start;
  if (end < start) return [start];
  const days: string[] = [];
  const cur = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  while (cur <= last) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

export const monthLabel = (year: number, month: number) =>
  new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1)));
