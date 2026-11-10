"use client";

import { login } from "@/app/admin/actions";
import { useFormAction } from "@/hooks/useFormAction";
import { IconArrowRight } from "./icons";
import { Field, Notice, PasswordField, SubmitButton } from "./ui";

export function LoginForm({ next }: { next?: string }) {
  const { state, onSubmit, pending } = useFormAction(login);
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state.status === "error" && state.message && <Notice status="error" message={state.message} />}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="you@mpmodels.com"
        required
        autoFocus
        error={state.errors?.email}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••••"
        required
        error={state.errors?.password}
      />
      <SubmitButton pending={pending} className="h-11 w-full">
        Sign in
        {!pending && <IconArrowRight width={16} height={16} />}
      </SubmitButton>
    </form>
  );
}
