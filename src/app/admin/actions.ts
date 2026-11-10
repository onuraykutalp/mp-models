"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Board, Division, FormState, JobKind } from "@/types";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, requireAdmin } from "@/lib/auth/session";
import { JOB_KINDS, isJobCurrency } from "@/lib/jobs";
import { deleteUploads } from "@/lib/uploads";
import { clientIp, rateLimit, safeAdminNext } from "@/lib/security";
import { BOARDS, DIVISIONS, divisionInfo, isCountryCode, slugify } from "@/lib/utils";

const fieldErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
};

/* ------------------------------------------------------------------ auth */

const email = () => z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));

const loginSchema = z.object({
  email: email(),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

// Compared against when the email doesn't exist so response time doesn't reveal which accounts exist.
const DUMMY_HASH = hashPassword("not-a-real-password");

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const { email, password, next } = parsed.data;
  const ip = await clientIp();
  const key = `login:${ip}:${email}`;
  // Cap both per-email and per-IP brute force.
  if (rateLimit(key, 8, 15 * 60 * 1000) || rateLimit(`login-ip:${ip}`, 40, 15 * 60 * 1000)) {
    return { status: "error", message: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const valid = await verifyPassword(password, admin?.passwordHash ?? (await DUMMY_HASH));
  if (!admin || !valid) {
    return { status: "error", message: "Incorrect email or password." };
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await createSession(admin.id);
  redirect(safeAdminNext(next));
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

/* ---------------------------------------------------------------- models */

const DIVISION_KEYS = DIVISIONS.map((d) => d.key) as [Division, ...Division[]];
const BOARD_KEYS = Object.keys(BOARDS) as [Board, ...Board[]];
const IMAGE_HOSTS = ["images.unsplash.com", "images.pexels.com"];

const isImageUrl = (url: string) => {
  if (url.startsWith("/uploads/images/")) return true;
  try {
    return IMAGE_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
};

const isVideoUrl = (url: string) => {
  if (url.startsWith("/uploads/videos/")) return true;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
};

const jsonList = <T extends z.ZodType>(item: T) =>
  z.string().transform((s, ctx) => {
    try {
      return z.array(item).parse(JSON.parse(s));
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid media list." });
      return z.NEVER;
    }
  });

/** Empty form inputs arrive as "" — treat them as "not provided". */
const blankToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const measure = (label: string, min: number, max: number) =>
  z.preprocess(
    blankToNull,
    z.coerce
      .number({ error: `${label} must be a number.` })
      .int(`${label} must be a whole number.`)
      .min(min, `${label} must be at least ${min}.`)
      .max(max, `${label} must be at most ${max}.`)
      .nullable(),
  );

const text = (label: string, max = 60) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const optionalText = (label: string, max: number) =>
  z.preprocess(blankToNull, z.string().trim().max(max, `${label} is too long.`).nullable());

const stayDate = (label: string) =>
  z.preprocess(
    blankToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date.`)
      .refine((s) => !Number.isNaN(Date.parse(s)), `${label} must be a valid date.`)
      .nullable(),
  );

const handle = z
  .string()
  .trim()
  .max(60)
  .transform((s) => (s ? `@${s.replace(/^@+/, "")}` : null));

const REQUIRED_MEASUREMENTS = [
  ["height", "Height"],
  ["bust", "Bust"],
  ["waist", "Waist"],
  ["hips", "Hips"],
  ["shoes", "Shoe size"],
  ["hair", "Hair"],
  ["eyes", "Eyes"],
] as const;

const modelSchema = z
  .object({
    firstName: text("First name"),
    lastName: text("Last name"),
    division: z.enum(DIVISION_KEYS, { error: "Choose a category." }),
    board: z.preprocess(blankToNull, z.enum(BOARD_KEYS, { error: "Choose a board." }).nullable()),
    height: measure("Height", 50, 230),
    bust: measure("Bust", 30, 200),
    waist: measure("Waist", 30, 200),
    hips: measure("Hips", 30, 200),
    shoes: z.preprocess(
      blankToNull,
      z.coerce
        .number({ error: "Shoe size must be a number." })
        .min(15, "Shoe size must be at least 15.")
        .max(52, "Shoe size must be at most 52.")
        .refine((n) => Number.isInteger(n * 2), "Use whole or half sizes.")
        .nullable(),
    ),
    hair: optionalText("Hair", 40),
    eyes: optionalText("Eyes", 40),
    city: text("City"),
    nationality: text("Nationality"),
    instagram: handle,
    tiktok: handle,
    website: z.preprocess(
      (v) => {
        const s = blankToNull(v);
        return typeof s === "string" && !/^https?:\/\//i.test(s.trim()) ? `https://${s.trim()}` : s;
      },
      z.url({ protocol: /^https?$/, error: "Enter a valid website address." }).max(300).nullable(),
    ),
    followers: z.preprocess(
      blankToNull,
      z.coerce
        .number({ error: "Followers must be a number." })
        .int("Followers must be a whole number.")
        .min(0, "Followers can't be negative.")
        .max(2_000_000_000, "That's a lot of followers — please check the number.")
        .nullable(),
    ),
    specialties: optionalText("Specialties", 200),
    locationCountry: z.preprocess(blankToNull, z.string().refine(isCountryCode, "Choose a country from the list.").nullable()),
    locationCity: optionalText("City", 80),
    locationFrom: stayDate("Start date"),
    locationTo: stayDate("End date"),
    bio: z.string().trim().max(2000, "Bio is too long."),
    featured: z.literal("true").optional().transform(Boolean),
    published: z.literal("true").optional().transform(Boolean),
    portfolio: jsonList(z.string().refine(isImageUrl)).refine((l) => l.length > 0, "Add at least one portfolio image."),
    snaps: jsonList(z.string().refine(isImageUrl)),
    videos: jsonList(z.string().refine(isVideoUrl)),
    portfolioPdf: z
      .string()
      .trim()
      .refine((url) => !url || /^\/uploads\/pdfs\/[\w/-]+\.pdf$/.test(url), "Upload the PDF again.")
      .transform((url) => url || null),
  })
  .superRefine((d, ctx) => {
    const info = divisionInfo(d.division);
    if (!info) return;
    if (info.boards.length > 0 && (!d.board || !info.boards.includes(d.board))) {
      ctx.addIssue({ code: "custom", path: ["board"], message: `Choose a ${info.label} board.` });
    }
    if (info.measured) {
      for (const [key, label] of REQUIRED_MEASUREMENTS) {
        if (d[key] == null) ctx.addIssue({ code: "custom", path: [key], message: `${label} is required.` });
      }
    }
    const hasStay = d.locationCity || d.locationFrom || d.locationTo;
    if (!d.locationCountry && hasStay) {
      ctx.addIssue({ code: "custom", path: ["locationCountry"], message: "Choose the country first." });
    }
    if (d.locationFrom && d.locationTo && d.locationTo < d.locationFrom) {
      ctx.addIssue({ code: "custom", path: ["locationTo"], message: "End date can't be before the start date." });
    }
  })
  .transform((d) => ({
    ...d,
    board: divisionInfo(d.division).boards.length ? d.board : null,
    locationFrom: d.locationFrom ? new Date(`${d.locationFrom}T00:00:00Z`) : null,
    locationTo: d.locationTo ? new Date(`${d.locationTo}T00:00:00Z`) : null,
  }));

async function uniqueSlug(base: string, excludeId?: string) {
  const taken = new Set(
    (
      await prisma.model.findMany({
        where: { slug: { startsWith: base }, ...(excludeId && { NOT: { id: excludeId } }) },
        select: { slug: true },
      })
    ).map((m) => m.slug),
  );
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

const mediaUrls = (m: { images: { url: string }[]; videos: { url: string }[]; portfolioPdf: string | null }) => [
  ...m.images.map((i) => i.url),
  ...m.videos.map((v) => v.url),
  ...(m.portfolioPdf ? [m.portfolioPdf] : []),
];

export async function saveModel(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = modelSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }

  const { portfolio, snaps, videos, ...fields } = parsed.data;
  const name = `${fields.firstName} ${fields.lastName}`;
  const existing = id ? await prisma.model.findUnique({ where: { id }, include: { images: true, videos: true } }) : null;
  if (id && !existing) return { status: "error", message: "This model no longer exists." };

  const sameName = existing && existing.firstName === fields.firstName && existing.lastName === fields.lastName;
  const slug = sameName ? existing.slug : await uniqueSlug(slugify(name) || "model", id ?? undefined);

  const media = {
    images: {
      create: [
        ...portfolio.map((url, order) => ({ url, order, kind: "PORTFOLIO" as const, alt: `${name} portfolio ${order + 1}` })),
        ...snaps.map((url, order) => ({ url, order, kind: "SNAP" as const, alt: `${name} snap ${order + 1}` })),
      ],
    },
    videos: {
      create: videos.map((url, order) => ({
        url,
        order,
        poster: existing?.videos.find((v) => v.url === url)?.poster ?? null,
      })),
    },
  };
  const data = { ...fields, slug, coverImage: portfolio[0] };

  if (existing) {
    await prisma.$transaction([
      prisma.modelImage.deleteMany({ where: { modelId: existing.id } }),
      prisma.modelVideo.deleteMany({ where: { modelId: existing.id } }),
      prisma.model.update({ where: { id: existing.id }, data: { ...data, ...media } }),
    ]);
    const kept = new Set([...portfolio, ...snaps, ...videos, fields.portfolioPdf]);
    await deleteUploads(mediaUrls(existing).filter((url) => !kept.has(url)));
  } else {
    await prisma.model.create({ data: { ...data, ...media } });
  }

  revalidatePath("/", "layout");
  redirect(`/admin/models?saved=${encodeURIComponent(name)}`);
}

export async function deleteModel(id: string) {
  await requireAdmin();
  const model = await prisma.model.findUnique({ where: { id }, include: { images: true, videos: true } });
  if (!model) return;
  await prisma.model.delete({ where: { id } });
  await deleteUploads(mediaUrls(model));
  revalidatePath("/", "layout");
}

export async function setModelFlag(id: string, flag: "featured" | "published", value: boolean) {
  await requireAdmin();
  await prisma.model.update({ where: { id }, data: flag === "featured" ? { featured: value } : { published: value } });
  revalidatePath("/", "layout");
}

/* -------------------------------------------------------------- settings */

const profileSchema = z.object({
  name: text("Name"),
  email: email(),
});

export async function updateProfile(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = profileSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const clash = await prisma.adminUser.findFirst({ where: { email: parsed.data.email, NOT: { id: admin.id } } });
  if (clash) return { status: "error", errors: { email: "Another admin already uses this email." } };

  await prisma.adminUser.update({ where: { id: admin.id }, data: parsed.data });
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Profile updated." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(10, "Use at least 10 characters.").max(128),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { path: ["confirm"], message: "Passwords don't match." });

export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error) };

  const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { status: "error", errors: { current: "Current password is incorrect." } };
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  return { status: "success", message: "Password changed." };
}

/* -------------------------------------------------------------- job types */

const newToken = () => randomBytes(16).toString("hex");

const jobTypeSchema = z.object({
  title: text("Title", 160),
  description: z.string().trim().max(2000, "Description is too long."),
  clientName: optionalText("Client", 120),
  active: z.literal("true").optional().transform(Boolean),
  modelIds: z.string().transform((s, ctx) => {
    try {
      const ids = z.array(z.string().min(1)).parse(JSON.parse(s));
      return [...new Set(ids)];
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid model list." });
      return z.NEVER;
    }
  }),
});

export async function saveJobType(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = jobTypeSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }

  const { modelIds, description, clientName, ...fields } = parsed.data;
  if (modelIds.length === 0) {
    return { status: "error", message: "Select at least one model.", errors: { modelIds: "Select at least one model." } };
  }

  const found = await prisma.model.count({ where: { id: { in: modelIds } } });
  if (found !== modelIds.length) {
    return { status: "error", message: "One or more selected models no longer exist." };
  }

  const models = {
    create: modelIds.map((modelId, order) => ({ modelId, order })),
  };
  const data = {
    ...fields,
    description: description || null,
    clientName,
  };

  if (id) {
    const existing = await prisma.jobType.findUnique({ where: { id } });
    if (!existing) return { status: "error", message: "This job type no longer exists." };
    await prisma.$transaction([
      prisma.jobTypeModel.deleteMany({ where: { jobTypeId: id } }),
      prisma.jobType.update({ where: { id }, data: { ...data, models } }),
    ]);
  } else {
    await prisma.jobType.create({ data: { ...data, token: newToken(), models } });
  }

  revalidatePath("/admin/job-types");
  revalidatePath("/cast", "layout");
  redirect(`/admin/job-types?saved=${encodeURIComponent(fields.title)}`);
}

export async function deleteJobType(id: string) {
  await requireAdmin();
  await prisma.jobType.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/job-types");
  revalidatePath("/cast", "layout");
}

export async function regenerateJobTypeToken(id: string) {
  await requireAdmin();
  const updated = await prisma.jobType.update({ where: { id }, data: { token: newToken() } }).catch(() => null);
  if (!updated) return { status: "error" as const, message: "This job type no longer exists." };
  revalidatePath("/admin/job-types");
  revalidatePath("/cast", "layout");
  return { status: "success" as const, token: updated.token };
}

export async function setJobTypeActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.jobType.update({ where: { id }, data: { active } });
  revalidatePath("/admin/job-types");
  revalidatePath("/cast", "layout");
}

/* ----------------------------------------------------------- model jobs */

const JOB_KIND_KEYS = Object.keys(JOB_KINDS) as [JobKind, ...JobKind[]];

const money = (label: string) =>
  z.preprocess(
    blankToNull,
    z.coerce
      .number({ error: `${label} must be a number.` })
      .min(0, `${label} can't be negative.`)
      .max(1_000_000, `${label} is too large.`)
      .nullable(),
  );

const modelJobSchema = z
  .object({
    modelId: z.string().min(1, "Choose a model."),
    kind: z.enum(JOB_KIND_KEYS, { error: "Choose a job type." }),
    customTitle: optionalText("Title", 120),
    date: stayDate("Date"),
    endDate: stayDate("End date"),
    agencyFee: money("Agency fee"),
    modelFee: money("Model fee"),
    currency: z.string().trim().toUpperCase().refine(isJobCurrency, "Choose a currency."),
    country: z.preprocess(blankToNull, z.string().refine(isCountryCode, "Choose a country from the list.").nullable()),
    city: optionalText("City", 80),
    notes: z.preprocess(blankToNull, z.string().trim().max(1000, "Notes are too long.").nullable()),
  })
  .superRefine((d, ctx) => {
    if (!d.date) ctx.addIssue({ code: "custom", path: ["date"], message: "Date is required." });
    if (d.agencyFee == null) ctx.addIssue({ code: "custom", path: ["agencyFee"], message: "Agency fee is required." });
    if (d.modelFee == null) ctx.addIssue({ code: "custom", path: ["modelFee"], message: "Model fee is required." });
    if (d.kind !== "BASIC_EVENT" && d.customTitle) {
      ctx.addIssue({ code: "custom", path: ["customTitle"], message: "Custom titles are only for Basic Event." });
    }
    if (d.date && d.endDate && d.endDate < d.date) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date can't be before the start date." });
    }
    if (d.city && !d.country) {
      ctx.addIssue({ code: "custom", path: ["country"], message: "Choose the country first." });
    }
  });

const revalidateJobs = (modelId: string) => {
  revalidatePath("/admin/calendar");
  revalidatePath(`/admin/models/${modelId}`);
  revalidatePath("/admin/models");
};

export async function saveModelJob(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = modelJobSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  }

  const d = parsed.data;
  const model = await prisma.model.findUnique({ where: { id: d.modelId }, select: { id: true } });
  if (!model) return { status: "error", message: "This model no longer exists." };

  const data = {
    modelId: d.modelId,
    kind: d.kind,
    customTitle: d.kind === "BASIC_EVENT" ? d.customTitle : null,
    date: new Date(`${d.date!}T00:00:00Z`),
    endDate: d.endDate ? new Date(`${d.endDate}T00:00:00Z`) : null,
    agencyFee: d.agencyFee!,
    modelFee: d.modelFee!,
    currency: d.currency,
    country: d.country,
    city: d.city,
    notes: d.notes,
  };

  if (id) {
    const existing = await prisma.modelJob.findUnique({ where: { id } });
    if (!existing) return { status: "error", message: "This job no longer exists." };
    await prisma.modelJob.update({ where: { id }, data });
    revalidateJobs(existing.modelId);
    if (existing.modelId !== d.modelId) revalidateJobs(d.modelId);
  } else {
    await prisma.modelJob.create({ data });
    revalidateJobs(d.modelId);
  }

  return { status: "success", message: id ? "Job updated." : "Job assigned." };
}

export async function deleteModelJob(id: string) {
  await requireAdmin();
  const job = await prisma.modelJob.findUnique({ where: { id } });
  if (!job) return;
  await prisma.modelJob.delete({ where: { id } });
  revalidateJobs(job.modelId);
}
