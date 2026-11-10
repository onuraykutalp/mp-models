import { HONEYPOT_FIELD } from "@/lib/security-public";

/** Invisible field — real users never see/fill it; bots that do are rejected silently. */
export function Honeypot() {
  return (
    <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0" tabIndex={-1}>
      <label htmlFor={HONEYPOT_FIELD}>Website</label>
      <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" autoComplete="off" tabIndex={-1} defaultValue="" />
    </div>
  );
}
