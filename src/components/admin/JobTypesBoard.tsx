"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteJobType, regenerateJobTypeToken, setJobTypeActive } from "@/app/admin/actions";
import { CopyLinkButton } from "./CopyLinkButton";
import { Notice } from "./ui";
import { IconEdit, IconExternal, IconEye, IconEyeOff, IconTrash } from "./icons";
import { castPath, cn } from "@/lib/utils";

export interface JobTypeRow {
  id: string;
  title: string;
  clientName: string | null;
  token: string;
  active: boolean;
  modelCount: number;
  updatedAt: string;
}

export function JobTypesBoard({ items, savedName }: { items: JobTypeRow[]; savedName?: string }) {
  return (
    <div>
      {savedName && (
        <div className="mb-4">
          <Notice status="success" message={`“${savedName}” saved.`} />
        </div>
      )}
      {items.length === 0 ? (
        <div className="admin-card mt-4 flex flex-col items-center px-4 py-16 text-center">
          <p className="text-sm font-medium">No job types yet</p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            Create a casting board, pick the models that fit, then send the private link to your client.
          </p>
          <Link href="/admin/job-types/new" className="admin-btn-primary mt-6">
            New job type
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <JobTypeCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

function JobTypeCard({ item }: { item: JobTypeRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [token, setToken] = useState(item.token);
  const path = castPath(token);

  return (
    <li className={cn("admin-card relative p-4 sm:p-5", pending && "opacity-60")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/job-types/${item.id}`} className="truncate text-base font-semibold hover:text-clay-light">
              {item.title}
            </Link>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                item.active ? "bg-emerald-400/15 text-emerald-600" : "bg-white/[0.06] text-zinc-500",
              )}
            >
              {item.active ? "Active" : "Off"}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-zinc-500">
            {item.clientName ? `${item.clientName} · ` : ""}
            {item.modelCount} model{item.modelCount === 1 ? "" : "s"} · updated{" "}
            {new Date(item.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p className="mt-2 truncate font-mono text-[11px] text-zinc-500">{path}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={path} className="h-9 px-3 text-xs" />
          <a href={path} target="_blank" rel="noreferrer" className="admin-btn-ghost h-9 px-3 text-xs">
            <IconExternal width={14} height={14} />
            Open
          </a>
          <Link href={`/admin/job-types/${item.id}`} className="admin-btn-ghost h-9 px-3 text-xs">
            <IconEdit width={14} height={14} />
            Edit
          </Link>
          <button
            type="button"
            className="admin-btn-ghost h-9 px-3 text-xs"
            onClick={() => startTransition(() => setJobTypeActive(item.id, !item.active))}
            title={item.active ? "Turn off" : "Turn on"}
          >
            {item.active ? <IconEyeOff width={14} height={14} /> : <IconEye width={14} height={14} />}
            {item.active ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            className="admin-btn-ghost h-9 px-3 text-xs"
            onClick={() =>
              startTransition(async () => {
                if (!confirm("Generate a new link? The old one will stop working.")) return;
                const res = await regenerateJobTypeToken(item.id);
                if (res.status === "success") {
                  setToken(res.token);
                  router.refresh();
                }
              })
            }
          >
            New link
          </button>
          <button type="button" className="admin-btn-ghost h-9 px-3 text-xs text-red-400 hover:text-red-300" onClick={() => setConfirming(true)}>
            <IconTrash width={14} height={14} />
          </button>
        </div>
      </div>

      {confirming && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#fdfcfa]/95 p-4 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm font-medium">Delete “{item.title}”?</p>
            <p className="mt-1 text-xs text-zinc-500">The share link will stop working. Models are not deleted.</p>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" onClick={() => setConfirming(false)} className="admin-btn-ghost h-9 px-3">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => startTransition(() => deleteJobType(item.id))}
                className="admin-btn h-9 bg-red-500 px-3 text-[#fff] hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
