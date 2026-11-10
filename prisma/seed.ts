import { PrismaClient } from "@prisma/client";
import { models } from "../src/data/models";
import { posts } from "../src/data/posts";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.");
    return;
  }
  const passwordHash = await hashPassword(password);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Admin", passwordHash },
  });
  console.log(`Admin user ready: ${email}`);
}

async function main() {
  await prisma.bookingRequest.deleteMany();
  await prisma.modelImage.deleteMany();
  await prisma.modelVideo.deleteMany();
  await prisma.model.deleteMany();
  await prisma.post.deleteMany();

  for (const { portfolio, snaps, videos, ...model } of models) {
    await prisma.model.create({
      data: {
        ...model,
        images: {
          create: [
            ...portfolio.map((img, order) => ({ ...img, order, kind: "PORTFOLIO" as const })),
            ...snaps.map((img, order) => ({ ...img, order, kind: "SNAP" as const })),
          ],
        },
        videos: { create: videos.map((v, order) => ({ ...v, order })) },
      },
    });
  }

  await prisma.post.createMany({
    data: posts.map((p) => ({ ...p, publishedAt: new Date(p.publishedAt) })),
  });

  await seedAdmin();

  console.log(`Seed complete: ${models.length} models, ${posts.length} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
