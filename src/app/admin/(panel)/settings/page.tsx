import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { PasswordForm, ProfileForm } from "@/components/admin/SettingsForms";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader title="Settings" description="Manage your admin account." />
      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <ProfileForm name={admin.name} email={admin.email} />
        <PasswordForm />
      </div>
      {admin.lastLoginAt && (
        <p className="mt-6 text-xs text-zinc-500">
          Last sign-in:{" "}
          {admin.lastLoginAt.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" })}
        </p>
      )}
    </>
  );
}
