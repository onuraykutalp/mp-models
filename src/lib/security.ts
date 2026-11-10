import "server-only";

import { headers } from "next/headers";
import { HONEYPOT_FIELD } from "./security-public";

export { HONEYPOT_FIELD };

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Best-effort client IP behind proxies (Vercel / nginx). */
export async function clientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("cf-connecting-ip")?.trim() ||
    "local"
  );
}

/**
 * Fixed-window rate limit. Returns true when the caller should be blocked.
 * In-memory — fine for a single Node instance; on Vercel each isolate has its own map.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

/** Only allow same-origin admin paths — blocks open redirects after login. */
export function safeAdminNext(next: string | undefined | null) {
  if (!next) return "/admin";
  if (!next.startsWith("/admin")) return "/admin";
  if (next.startsWith("//") || next.includes("\\") || next.includes("://")) return "/admin";
  if (next.includes("..")) return "/admin";
  return next;
}

export function isHoneypotTripped(fd: FormData) {
  const value = String(fd.get(HONEYPOT_FIELD) ?? "").trim();
  return value.length > 0;
}
