import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "mp_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  adminId: string;
  expiresAt: number;
}

function getSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export function hasSessionSecret() {
  return getSecret() !== null;
}

export async function signSession(payload: SessionPayload) {
  const key = getSecret();
  if (!key) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters in the environment.");
  }
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expiresAt / 1000))
    .sign(key);
}

export async function readSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const key = getSecret();
  // Misconfigured deployments must not 500 on every /admin hit — treat as logged out.
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return typeof payload.adminId === "string" ? (payload as unknown as SessionPayload) : null;
  } catch {
    return null;
  }
}
