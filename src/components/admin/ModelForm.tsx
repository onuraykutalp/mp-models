"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Board, Division, FormState } from "@/types";
import type { ModelFormValues } from "@/lib/model-form";
import { deleteModel, saveModel } from "@/app/admin/actions";
import { IconCamera, IconExternal, IconImage, IconLink, IconTrash, IconUsers, IconVideo } from "./icons";
import { MediaManager } from "./MediaManager";
import { PdfUpload } from "./PdfUpload";
import { Field, FieldMessage, Notice, SubmitButton, Toggle } from "./ui";
import { PlaneIcon } from "@/components/ui/PlaneIcon";
import {
  BOARDS,
  COUNTRIES,
  DIVISIONS,
  PLACEMENT,
  cmToFeet,
  cn,
  compactNumber,
  countryName,
  divisionInfo,
  stayRange,
} from "@/lib/utils";

const QUICK_COUNTRIES = ["TR", "IT", "FR", "GB", "DE", "PL", "ES", "US"];

const BOARD_SPECIALTY_HINTS: Partial<Record<Board, string>> = {
  INFLUENCER: "Fashion, Beauty, Travel",
  UGC_CREATOR: "Lifestyle, Tech, Fitness",
  MAKEUP_ARTIST: "Editorial, Bridal, Runway",
  PHOTOGRAPHER: "Fashion, Portrait, Campaign",
  HAIR_STYLIST: "Session, Runway, Red Carpet",
  DANCER: "Contemporary, Commercial, Hip-Hop",
};

interface ModelFormProps {
  id?: string;
  slug?: string;
  initial: ModelFormValues;
  suggestions: { hair: string[]; eyes: string[] };
}

const initialState: FormState = { status: "idle" };

export function ModelForm({ id, slug, initial, suggestions }: ModelFormProps) {
  const [values, setValues] = useState(initial);
  const [portfolio, setPortfolio] = useState(initial.portfolio);
  const [snaps, setSnaps] = useState(initial.snaps);
  const [videos, setVideos] = useState(initial.videos);
  const [state, dispatch, pending] = useActionState(saveModel.bind(null, id ?? null), initialState);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const [edited, setEdited] = useState<ReadonlySet<string>>(new Set());
  const [errorsFrom, setErrorsFrom] = useState(state);
  if (errorsFrom !== state) {
    setErrorsFrom(state);
    setEdited(new Set());
  }
  const errors = Object.fromEntries(
    Object.entries(state.errors ?? {}).filter(([key]) => !edited.has(key)),
  ) as NonNullable<FormState["errors"]>;
  const markEdited = (key: string) =>
    setEdited((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));

  const set = <K extends keyof ModelFormValues>(key: K, value: ModelFormValues[K]) => {
    markEdited(key);
    setValues((v) => ({ ...v, [key]: value }));
  };

  const dirty = useMemo(
    () => JSON.stringify({ ...values, portfolio, snaps, videos }) !== JSON.stringify(initial),
    [values, portfolio, snaps, videos, initial],
  );

  useEffect(() => {
    if (!dirty || pending) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);

  useEffect(() => {
    if (state.status === "error") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === "boolean") {
        if (value) fd.set(key, "true");
      } else if (typeof value === "string") fd.set(key, value);
    }
    fd.set("portfolio", JSON.stringify(portfolio));
    fd.set("snaps", JSON.stringify(snaps));
    fd.set("videos", JSON.stringify(videos));
    startTransition(() => dispatch(fd));
  };

  const input = (key: keyof ModelFormValues) => ({
    name: key,
    value: values[key] as string,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
    error: errors[key],
  });

  const division = divisionInfo(values.division);
  const isTalent = !division.measured;
  const changeDivision = (key: Division) => {
    const next = divisionInfo(key);
    set("division", key);
    if (!values.board || !next.boards.includes(values.board)) set("board", next.boards[0] ?? "");
  };

  const chestLabel = values.division === "MEN" ? "Chest" : "Bust";
  const name = `${values.firstName} ${values.lastName}`.trim();
  const heightNumber = Number(values.height);
  const followersNumber = Number(values.followers);
  const category = values.board ? `${division.label} · ${BOARDS[values.board].label}` : division.label;
  const previewStats: [string, string][] = isTalent
    ? [
        ["Board", values.board ? BOARDS[values.board].label : "—"],
        ["Followers", followersNumber > 0 ? compactNumber(followersNumber) : "—"],
        ["Country", values.nationality || "—"],
      ]
    : [
        ["Height", values.height],
        [chestLabel, values.bust],
        ["Waist", values.waist],
        ["Hips", values.hips],
        ["Shoes", values.shoes],
      ];

  return (
    <form onSubmit={onSubmit} noValidate className="pb-24 xl:pb-0">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {state.status === "error" && state.message && <Notice status="error" message={state.message} />}

          <Section icon={<IconUsers width={16} height={16} />} title="Profile" description="Name, board and a short bio for the model page.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" autoComplete="off" {...input("firstName")} />
              <Field label="Last name" autoComplete="off" {...input("lastName")} />

              <fieldset className="sm:col-span-2">
                <legend className="admin-label">Category</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DIVISIONS.map((d) => (
                    <PillOption
                      key={d.key}
                      name="division"
                      value={d.key}
                      checked={values.division === d.key}
                      onChange={() => changeDivision(d.key)}
                      className="h-11 text-sm"
                    >
                      {d.label}
                    </PillOption>
                  ))}
                </div>
                <FieldMessage error={errors.division} />
              </fieldset>

              {division.boards.length > 0 && (
                <fieldset className="sm:col-span-2">
                  <legend className="admin-label">{division.label} board</legend>
                  <div className="flex flex-wrap gap-2">
                    {division.boards.map((b) => (
                      <PillOption
                        key={b}
                        name="board"
                        value={b}
                        checked={values.board === b}
                        onChange={() => set("board", b)}
                        className="h-9 px-4 text-xs"
                      >
                        {BOARDS[b].label}
                      </PillOption>
                    ))}
                  </div>
                  <FieldMessage error={errors.board} hint={values.board ? BOARDS[values.board].description : undefined} />
                </fieldset>
              )}

              <input type="hidden" name="city" value={values.city} />
              <input type="hidden" name="locationCity" value="" />
              <Field label="Country" placeholder="Turkey" hint="Nationality / country of origin" {...input("nationality")} />

              <div className="sm:col-span-2">
                <label htmlFor="f-bio" className="admin-label">
                  Bio
                </label>
                <textarea
                  id="f-bio"
                  name="bio"
                  rows={4}
                  maxLength={2000}
                  value={values.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder={
                    isTalent
                      ? "A few lines about their style, clients and best-known work."
                      : "A few lines about the model's look, experience and credits."
                  }
                  className="admin-input h-auto resize-y py-3 leading-relaxed"
                />
                <FieldMessage error={errors.bio} hint={`${values.bio.length} / 2000`} />
              </div>
            </div>
          </Section>

          <Section
            icon={<IconLink width={16} height={16} />}
            title="Social & reach"
            description={isTalent ? "Handles, audience and expertise shown on the talent page." : "Social handles shown on the model page."}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram" placeholder="@username" hint="Optional" {...input("instagram")} />
              <Field label="TikTok" placeholder="@username" hint="Optional" {...input("tiktok")} />
              <Field
                label="Followers"
                type="number"
                inputMode="numeric"
                placeholder="125000"
                hint={followersNumber > 0 ? `Shown as ${compactNumber(followersNumber)}` : "Optional — total audience"}
                {...input("followers")}
              />
              <Field label="Website" type="url" inputMode="url" placeholder="portfolio.com" hint="Optional" {...input("website")} />
              {isTalent && (
                <div className="sm:col-span-2">
                  <Field
                    label="Specialties"
                    placeholder={BOARD_SPECIALTY_HINTS[values.board || "INFLUENCER"] ?? "Editorial, Campaign"}
                    hint="Comma separated, e.g. Editorial, Bridal, Runway"
                    {...input("specialties")}
                  />
                </div>
              )}
            </div>
          </Section>

          <Section
            icon={<PlaneIcon className="size-4 rotate-45" />}
            title="Current location"
            description="Where they are right now. Shown on the model photo on hover — leave empty if they're at home."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="f-locationCountry" className="admin-label">
                  Country
                </label>
                <div className="relative">
                  <select
                    id="f-locationCountry"
                    name="locationCountry"
                    value={values.locationCountry}
                    onChange={(e) => set("locationCountry", e.target.value)}
                    aria-invalid={!!errors.locationCountry || undefined}
                    className="admin-input appearance-none pr-10"
                  >
                    <option value="">Not travelling</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-zinc-500"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_COUNTRIES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => set("locationCountry", code)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                        values.locationCountry === code
                          ? "border-clay-light/60 bg-clay/15 text-white"
                          : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200",
                      )}
                    >
                      {countryName(code)}
                    </button>
                  ))}
                </div>
                <FieldMessage
                  error={errors.locationCountry}
                  hint={values.locationCountry === PLACEMENT.country ? `Listed under “${PLACEMENT.label}” until the end date.` : undefined}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:max-w-md">
                <Field label="From" type="date" {...input("locationFrom")} />
                <Field label="Until" type="date" min={values.locationFrom || undefined} {...input("locationTo")} />
              </div>
              {values.locationCountry && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 px-3.5 py-3 sm:col-span-2">
                  <p className="text-xs text-zinc-400">
                    Shown as{" "}
                    <span className="font-semibold tracking-wider text-zinc-100 uppercase">{countryName(values.locationCountry)}</span>
                    {stayRange({ from: values.locationFrom || null, to: values.locationTo || null }) && (
                      <span className="text-zinc-500 tabular-nums"> · {stayRange({ from: values.locationFrom || null, to: values.locationTo || null })}</span>
                    )}
                    . Hidden automatically after the end date.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      set("locationCountry", "");
                      set("locationCity", "");
                      set("locationFrom", "");
                      set("locationTo", "");
                    }}
                    className="shrink-0 text-xs font-medium text-zinc-400 hover:text-red-400"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </Section>

          <Section
            icon={<span className="text-xs font-bold">cm</span>}
            title="Measurements"
            description={
              isTalent
                ? "Optional for talents — fill in only if they also model."
                : "Metric values — the website converts them to feet and inches."
            }
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Field
                label="Height"
                type="number"
                inputMode="numeric"
                suffix="cm"
                hint={heightNumber >= 50 ? cmToFeet(heightNumber) : " "}
                {...input("height")}
              />
              <Field label={chestLabel} type="number" inputMode="numeric" suffix="cm" {...input("bust")} error={errors.bust?.replace("Bust", chestLabel)} />
              <Field label="Waist" type="number" inputMode="numeric" suffix="cm" {...input("waist")} />
              <Field label="Hips" type="number" inputMode="numeric" suffix="cm" {...input("hips")} />
              <Field label="Shoes" type="number" inputMode="decimal" step="0.5" suffix="EU" {...input("shoes")} />
            </div>
          </Section>

          <Section
            icon={<IconCamera width={16} height={16} />}
            title="Appearance"
            description={isTalent ? "Optional for talents. Used for filtering on the website." : "Used for filtering on the website."}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {(["hair", "eyes"] as const).map((key) => (
                <div key={key}>
                  <Field label={key === "hair" ? "Hair" : "Eyes"} placeholder={key === "hair" ? "Dark Brown" : "Hazel"} {...input(key)} />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {suggestions[key].slice(0, 8).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set(key, s)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          values[key] === s
                            ? "border-clay-light/60 bg-clay/15 text-white"
                            : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <MediaManager
            kind="image"
            items={portfolio}
            onChange={(next) => { markEdited("portfolio"); setPortfolio(next); }}
            title="Portfolio"
            description="Editorial and campaign images. Drag to reorder — the first image is the cover."
            icon={<IconImage width={16} height={16} />}
            coverLabel="Cover"
            error={errors.portfolio}
          />
          <MediaManager
            kind="image"
            items={snaps}
            onChange={(next) => { markEdited("snaps"); setSnaps(next); }}
            title="Snaps"
            description="Natural, unretouched digitals — no makeup, plain background."
            icon={<IconCamera width={16} height={16} />}
            error={errors.snaps}
          />
          <MediaManager
            kind="video"
            items={videos}
            onChange={(next) => { markEdited("videos"); setVideos(next); }}
            title="Videos"
            description="Runway, intro or casting videos. Upload a file or paste a link."
            icon={<IconVideo width={16} height={16} />}
            error={errors.videos}
          />
          <PdfUpload value={values.portfolioPdf} onChange={(url) => set("portfolioPdf", url)} error={errors.portfolioPdf} />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="admin-card overflow-hidden">
            <div className="relative aspect-[4/5] bg-white/[0.04]">
              {portfolio[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portfolio[0]} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-zinc-600">
                  <IconImage width={28} height={28} />
                  <span className="text-xs">Cover preview</span>
                </div>
              )}
              <span className="on-photo absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                {category}
              </span>
              <div className="on-photo absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-16">
                <p className="font-display text-2xl leading-tight text-white">{name || (isTalent ? "New talent" : "New model")}</p>
                <p className="mt-0.5 text-xs text-zinc-300">{(isTalent && values.specialties) || values.nationality || "Country"}</p>
                {values.locationCountry && (
                  <div className="mt-3 border-t border-white/20 pt-3">
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-white uppercase">
                      {countryName(values.locationCountry)}
                      <span className="grid size-5 place-items-center rounded-full bg-white/15 ring-1 ring-white/30">
                        <PlaneIcon className="size-2.5 rotate-45" />
                      </span>
                    </p>
                    {stayRange({ from: values.locationFrom || null, to: values.locationTo || null }) && (
                      <p className="mt-1.5 text-[10px] tracking-[0.2em] text-zinc-300 tabular-nums">
                        {stayRange({ from: values.locationFrom || null, to: values.locationTo || null })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <dl
              className={cn(
                "grid divide-x divide-white/[0.06] border-t border-white/[0.06] text-center",
                previewStats.length === 5 ? "grid-cols-5" : "grid-cols-3",
              )}
            >
              {previewStats.map(([label, value]) => (
                <div key={label} className="min-w-0 px-1 py-3">
                  <dt className="text-[9px] tracking-wider text-zinc-500 uppercase">{label}</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="admin-card space-y-5 p-5">
            <Toggle
              label="Published"
              description="Visible on the website"
              checked={values.published}
              onChange={(v) => set("published", v)}
            />
            <Toggle
              label="Featured"
              description="Shown on the homepage"
              checked={values.featured}
              onChange={(v) => set("featured", v)}
            />
          </div>

          <div className="hidden gap-2 xl:flex">
            <Link href="/admin/models" className="admin-btn-ghost h-11 flex-1">
              Cancel
            </Link>
            <SubmitButton pending={pending} className="h-11 flex-[2]">
              {id ? "Save changes" : isTalent ? "Create talent" : "Create model"}
            </SubmitButton>
          </div>

          {id && (
            <div className="flex items-center justify-between gap-2 px-1">
              {slug && values.published ? (
                <a
                  href={`/models/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  <IconExternal width={14} height={14} /> View on website
                </a>
              ) : (
                <span />
              )}
              {deleting ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-400">Delete permanently?</span>
                  <button type="button" onClick={() => setDeleting(false)} className="font-medium text-zinc-300 hover:text-white">
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteModel(id);
                        router.push("/admin/models");
                      })
                    }
                    className="font-semibold text-red-400 hover:text-red-300"
                  >
                    Yes, delete
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleting(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-red-400"
                >
                  <IconTrash width={14} height={14} /> Delete model
                </button>
              )}
            </div>
          )}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.06] bg-[#f4f1ec]/85 p-3 backdrop-blur-xl lg:left-64 xl:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <span className="hidden flex-1 truncate text-xs text-zinc-500 sm:block">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <Link href="/admin/models" className="admin-btn-ghost h-11 flex-1 sm:flex-none">
            Cancel
          </Link>
          <SubmitButton pending={pending} className="h-11 flex-[2] sm:flex-none">
            {id ? "Save changes" : isTalent ? "Create talent" : "Create model"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

function PillOption({
  name,
  value,
  checked,
  onChange,
  className,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-xl border font-medium transition",
        "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-clay/30",
        checked
          ? "border-clay-light/60 bg-clay/15 text-white"
          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200",
        className,
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function Section({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section className="admin-card p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-clay-light">{icon}</span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
