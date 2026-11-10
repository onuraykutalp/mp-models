import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, hasSessionSecret, readSession, signSession } from "./token";

export async function createSession(adminId: string) {
  if (!hasSessionSecret()) {
    throw new Error("SESSION_SECRET is missing or too short. Set it in the Vercel project environment.");
  }
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = await signSession({ adminId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function deleteSession() {
  await cookies().then((jar) => jar.delete(SESSION_COOKIE));
}

/** Returns the signed-in admin, or null. Never throws — DB/env failures count as logged out. */
export const getAdmin = cache(async () => {
  try {
    const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
    if (!session) return null;
    return await prisma.adminUser.findUnique({
      where: { id: session.adminId },
      select: { id: true, email: true, name: true, lastLoginAt: true },
    });
  } catch (error) {
    console.error("[auth] getAdmin failed:", error);
    return null;
  }
});

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
