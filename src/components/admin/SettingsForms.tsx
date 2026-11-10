"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { changePassword, updateProfile } from "@/app/admin/actions";
import { useFormAction } from "@/hooks/useFormAction";
import { IconLock, IconUsers } from "./icons";
import { Field, Notice, PasswordField, SubmitButton } from "./ui";

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="admin-card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-white/[0.05] text-clay-light">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const { state, onSubmit, pending } = useFormAction(updateProfile);
  return (
    <Card icon={<IconUsers width={16} height={16} />} title="Profile">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {state.status !== "idle" && state.message && <Notice status={state.status} message={state.message} />}
        <Field label="Name" name="name" defaultValue={name} autoComplete="name" error={state.errors?.name} />
        <Field label="Email" name="email" type="email" defaultValue={email} autoComplete="email" error={state.errors?.email} />
        <SubmitButton pending={pending}>Save profile</SubmitButton>
      </form>
    </Card>
  );
}

export function PasswordForm() {
  const { state, onSubmit, pending } = useFormAction(changePassword);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <Card icon={<IconLock width={16} height={16} />} title="Password">
      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
        {state.status !== "idle" && state.message && <Notice status={state.status} message={state.message} />}
        <PasswordField label="Current password" name="current" autoComplete="current-password" error={state.errors?.current} />
        <PasswordField label="New password" name="next" autoComplete="new-password" hint="At least 10 characters." error={state.errors?.next} />
        <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" error={state.errors?.confirm} />
        <SubmitButton pending={pending}>Change password</SubmitButton>
      </form>
    </Card>
  );
}
