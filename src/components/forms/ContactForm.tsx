"use client";

import { submitContact } from "@/app/actions";
import { useFormAction } from "@/hooks/useFormAction";
import { FormMessage, Input, Select, SubmitButton, Textarea } from "./Field";
import { Honeypot } from "./Honeypot";

export function ContactForm({ defaultSubject, defaultMessage }: { defaultSubject?: string; defaultMessage?: string }) {
  const { state, onSubmit, pending } = useFormAction(submitContact);

  if (state.status === "success") {
    return (
      <div className="flex min-h-80 flex-col justify-center gap-4">
        <p className="font-display text-3xl">Thank you.</p>
        <p className="max-w-md text-stone">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-8 sm:grid-cols-2" noValidate>
      <Honeypot />
      <Input label="Full name" name="name" autoComplete="name" error={state.errors?.name} />
      <Input label="Email" name="email" type="email" autoComplete="email" error={state.errors?.email} />
      <Select label="Subject" name="subject" defaultValue={defaultSubject ?? ""} error={state.errors?.subject} className="sm:col-span-2">
        <option value="" disabled>
          Choose a subject
        </option>
        <option value="booking">Booking / Model request</option>
        <option value="press">Press</option>
        <option value="partnership">Partnership</option>
        <option value="other">Other</option>
      </Select>
      <Textarea
        label="Message"
        name="message"
        rows={5}
        defaultValue={defaultMessage}
        error={state.errors?.message}
        className="sm:col-span-2"
      />
      <div className="flex flex-col gap-4 sm:col-span-2">
        <FormMessage status={state.status} message={state.message} />
        <div>
          <SubmitButton pending={pending}>Send message</SubmitButton>
        </div>
      </div>
    </form>
  );
}
