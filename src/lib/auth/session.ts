import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, readSession, signSession } from "./token";

export async function createSession(adminId: string) {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = await signSession({ adminId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
    // Mitigate cookie theft via XSS on non-admin pages a little: browsers that
    // support it won't send the cookie on cross-site top-level navigations either.
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Returns the signed-in admin, or null. Checks the database so revoked users lose access immediately. */
export const getAdmin = cache(async () => {
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true, name: true, lastLoginAt: true },
  });
});

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
