import { startTransition, useActionState, type FormEvent } from "react";
import type { FormState } from "@/types";

type ServerAction = (prev: FormState, fd: FormData) => Promise<FormState>;

const initial: FormState = { status: "idle" };

/** Submits via transition so React doesn't reset the form's uncontrolled fields on validation errors. */
export function useFormAction(serverAction: ServerAction) {
  const [state, dispatch, pending] = useActionState(serverAction, initial);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };

  return { state, onSubmit, pending };
}
