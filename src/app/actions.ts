"use server";

import type { FormState } from "@/types";
import { hasDatabase } from "@/lib/queries";
import { HONEYPOT_FIELD, clientIp, isHoneypotTripped, rateLimit } from "@/lib/security";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHECK_FORM = "Please check the form.";
const GENERIC_ERROR = "Something went wrong, please try again later.";
const RATE_LIMITED = "You're sending too many requests. Please wait a few minutes and try again.";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function required(fd: FormData, keys: string[], errors: Record<string, string>) {
  for (const key of keys) if (!str(fd, key)) errors[key] = "This field is required.";
}

function checkEmail(fd: FormData, errors: Record<string, string>) {
  const email = str(fd, "email");
  if (email && !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
}

async function guardPublicForm(kind: string): Promise<FormState | null> {
  const ip = await clientIp();
  if (rateLimit(`form:${kind}:${ip}`, 8, 15 * 60 * 1000) || rateLimit(`form-ip:${ip}`, 30, 15 * 60 * 1000)) {
    return { status: "error", message: RATE_LIMITED };
  }
  return null;
}

async function persist(write: () => Promise<unknown>, label: string, payload: unknown) {
  if (!hasDatabase()) {
    console.info(`[demo] ${label} received (no database configured):`, payload);
    return;
  }
  await write();
}

const db = async () => (await import("@/lib/prisma")).prisma;

export async function submitApplication(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isHoneypotTripped(fd)) return { status: "success", message: "We've received your application! Our scouting team will get back to you within 10 business days." };
  const blocked = await guardPublicForm("application");
  if (blocked) return blocked;

  const errors: Record<string, string> = {};
  required(fd, ["firstName", "lastName", "email", "phone", "birthDate", "gender", "height", "city"], errors);
  checkEmail(fd, errors);

  const height = Number(str(fd, "height"));
  if (str(fd, "height") && (!Number.isFinite(height) || height < 140 || height > 220)) {
    errors.height = "Height must be between 140 and 220 cm.";
  }
  if (!fd.get("consent")) errors.consent = "You need to give your consent to continue.";
  if (Object.keys(errors).length) return { status: "error", message: CHECK_FORM, errors };

  const data = {
    firstName: str(fd, "firstName"),
    lastName: str(fd, "lastName"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    birthDate: new Date(str(fd, "birthDate")),
    gender: str(fd, "gender"),
    height,
    city: str(fd, "city"),
    instagram: str(fd, "instagram") || null,
    message: str(fd, "message") || null,
  };

  try {
    await persist(async () => (await db()).application.create({ data }), "Model application", data);
    return {
      status: "success",
      message: "We've received your application! Our scouting team will get back to you within 10 business days.",
    };
  } catch (error) {
    console.error(error);
    return { status: "error", message: GENERIC_ERROR };
  }
}

export async function submitContact(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isHoneypotTripped(fd)) return { status: "success", message: "Thanks for your message. We'll get back to you shortly." };
  const blocked = await guardPublicForm("contact");
  if (blocked) return blocked;

  const errors: Record<string, string> = {};
  required(fd, ["name", "email", "subject", "message"], errors);
  checkEmail(fd, errors);
  if (Object.keys(errors).length) return { status: "error", message: CHECK_FORM, errors };

  const data = {
    name: str(fd, "name"),
    email: str(fd, "email"),
    subject: str(fd, "subject"),
    message: str(fd, "message"),
  };

  try {
    await persist(async () => (await db()).contactMessage.create({ data }), "Contact message", data);
    return { status: "success", message: "Thanks for your message. We'll get back to you shortly." };
  } catch (error) {
    console.error(error);
    return { status: "error", message: GENERIC_ERROR };
  }
}

export async function submitBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isHoneypotTripped(fd)) {
    return {
      status: "success",
      message: "Your request has been sent to our booking team. We'll get back to you within 24 hours.",
    };
  }
  const blocked = await guardPublicForm("booking");
  if (blocked) return blocked;

  const errors: Record<string, string> = {};
  required(fd, ["company", "name", "email"], errors);
  checkEmail(fd, errors);

  const slugs = fd.getAll("models").map(String).filter(Boolean);
  if (!slugs.length) errors.models = "Your shortlist needs at least one model.";
  if (Object.keys(errors).length) return { status: "error", message: CHECK_FORM, errors };

  const data = {
    company: str(fd, "company"),
    name: str(fd, "name"),
    email: str(fd, "email"),
    dates: str(fd, "dates") || null,
    message: str(fd, "message") || null,
  };

  try {
    await persist(
      async () =>
        (await db()).bookingRequest.create({
          data: { ...data, models: { connect: slugs.map((slug) => ({ slug })) } },
        }),
      "Booking request",
      { ...data, models: slugs },
    );
    return {
      status: "success",
      message: "Your request has been sent to our booking team. We'll get back to you within 24 hours.",
    };
  } catch (error) {
    console.error(error);
    return { status: "error", message: GENERIC_ERROR };
  }
}
