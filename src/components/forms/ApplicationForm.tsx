"use client";

import Link from "next/link";
import { submitApplication } from "@/app/actions";
import { useFormAction } from "@/hooks/useFormAction";
import { FormMessage, Input, Select, SubmitButton, Textarea } from "./Field";
import { Honeypot } from "./Honeypot";

export function ApplicationForm() {
  const { state, onSubmit, pending } = useFormAction(submitApplication);
  const e = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div className="flex min-h-96 flex-col justify-center gap-5">
        <p className="eyebrow text-clay">Application received</p>
        <p className="font-display text-3xl leading-tight">Great — we can&apos;t wait to get to know you.</p>
        <p className="max-w-md text-stone">{state.message}</p>
        <Link href="/models" className="link-underline w-fit text-sm font-semibold">
          Meanwhile, explore our board
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-14" noValidate>
      <Honeypot />
      <fieldset className="grid gap-8 sm:grid-cols-2">
        <legend className="font-display mb-8 text-3xl">
          <span className="mr-3 text-stone">01</span>Personal details
        </legend>
        <Input label="First name" name="firstName" autoComplete="given-name" error={e.firstName} />
        <Input label="Last name" name="lastName" autoComplete="family-name" error={e.lastName} />
        <Input label="Email" name="email" type="email" autoComplete="email" error={e.email} />
        <Input label="Phone" name="phone" type="tel" autoComplete="tel" placeholder="+44" error={e.phone} />
        <Input label="Date of birth" name="birthDate" type="date" error={e.birthDate} />
        <Select label="Gender" name="gender" defaultValue="" error={e.gender}>
          <option value="" disabled>
            Select
          </option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="nonbinary">Non-binary</option>
        </Select>
      </fieldset>

      <fieldset className="grid gap-8 sm:grid-cols-2">
        <legend className="font-display mb-8 text-3xl">
          <span className="mr-3 text-stone">02</span>Profile
        </legend>
        <Input label="Height (cm)" name="height" type="number" inputMode="numeric" min={140} max={220} error={e.height} />
        <Input label="City" name="city" autoComplete="address-level2" error={e.city} />
        <Input label="Instagram (optional)" name="instagram" placeholder="@username" className="sm:col-span-2" />
        <Textarea
          label="Tell us about yourself (optional)"
          name="message"
          placeholder="Your experience, hobbies, why you want to model..."
          className="sm:col-span-2"
        />
        <div className="rounded-sm border border-dashed border-ink/25 p-6 text-sm text-stone sm:col-span-2">
          <p className="font-semibold text-ink">Photos</p>
          <p className="mt-1">
            File uploads are disabled in this demo. In production, this area will accept a headshot, a profile shot and
            a full-length photo.
          </p>
        </div>
      </fieldset>

      <div className="space-y-6">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent" className="mt-0.5 size-4 accent-ink" />
          <span className={e.consent ? "text-clay" : "text-stone"}>
            I consent to my personal data being processed for the purpose of reviewing my application. If I am under
            18, I have my parent or guardian&apos;s permission.
          </span>
        </label>
        <FormMessage status={state.status} message={state.message} />
        <SubmitButton pending={pending}>Submit application</SubmitButton>
      </div>
    </form>
  );
}
