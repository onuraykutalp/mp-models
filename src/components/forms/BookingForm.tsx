"use client";

import { submitBooking } from "@/app/actions";
import { useFormAction } from "@/hooks/useFormAction";
import { useShortlist } from "@/store/shortlist";
import { FormMessage, Input, SubmitButton, Textarea } from "./Field";
import { Honeypot } from "./Honeypot";

export function BookingForm() {
  const { state, onSubmit, pending } = useFormAction(submitBooking);
  const items = useShortlist((s) => s.items);
  const clear = useShortlist((s) => s.clear);

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <p className="font-display text-4xl">Request sent.</p>
        <p className="text-stone">{state.message}</p>
        <button type="button" onClick={clear} className="link-underline text-sm font-semibold">
          Clear shortlist
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-7" noValidate>
      <Honeypot />
      {items.map((i) => (
        <input key={i.slug} type="hidden" name="models" value={i.slug} />
      ))}
      <Input label="Company / Brand" name="company" autoComplete="organization" error={state.errors?.company} />
      <Input label="Full name" name="name" autoComplete="name" error={state.errors?.name} />
      <Input label="Email" name="email" type="email" autoComplete="email" error={state.errors?.email} />
      <Input label="Shoot dates (optional)" name="dates" placeholder="e.g. 12-14 October" />
      <Textarea label="Project details (optional)" name="message" rows={3} />
      {state.errors?.models && <p className="text-xs text-clay">{state.errors.models}</p>}
      <FormMessage status={state.status} message={state.message} />
      <SubmitButton pending={pending}>Send booking request</SubmitButton>
    </form>
  );
}
