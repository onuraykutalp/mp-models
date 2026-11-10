/**
 * Upsert admin users. Pass credentials via env — never commit passwords.
 *
 * Example (PowerShell):
 *   $env:DATABASE_URL="mysql://...production..."
 *   $env:ADMINS="magda@mpmodels.com:Magda:PASS1;poli@mpmodels.com:Poli:PASS2"
 *   node scripts/create-admins.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);
const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function parseAdmins(raw) {
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [email, name, password] = part.split(":");
      if (!email || !name || !password) throw new Error(`Invalid ADMINS entry: ${part}`);
      return { email: email.trim().toLowerCase(), name: name.trim(), password };
    });
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const raw = process.env.ADMINS;
  if (!raw) throw new Error('Set ADMINS like "email:Name:password;email2:Name2:password2"');

  const host = process.env.DATABASE_URL.replace(/^mysql:\/\//, "http://");
  try {
    const u = new URL(host);
    console.log(`Using database host: ${u.hostname}${u.pathname}`);
  } catch {
    console.log("Using DATABASE_URL from environment");
  }

  for (const user of parseAdmins(raw)) {
    const passwordHash = await hashPassword(user.password);
    await prisma.adminUser.upsert({
      where: { email: user.email },
      update: { name: user.name, passwordHash },
      create: { email: user.email, name: user.name, passwordHash },
    });
    console.log(`Admin ready: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
