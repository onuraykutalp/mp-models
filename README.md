# MP Models

International model management site — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma, MySQL.

Public site is English. Admin panel manages models, casting boards (`/cast/[token]`), jobs and calendar.

## Quick start

```bash
npm install
cp .env.example .env   # then fill SESSION_SECRET + DATABASE_URL
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `DATABASE_URL` the public site falls back to dummy data; the admin panel needs a database.

## Security notes

- Admin routes are gated by JWT cookies (`httpOnly`, `sameSite=lax`, `secure` in production) + DB session check
- Login, public forms and uploads are rate-limited; forms include a honeypot
- Uploads are type-sniffed (magic bytes), size-capped and stored under random UUIDs — path traversal is blocked
- Casting pages use unguessable tokens and are `noindex`
- Security headers: HSTS, CSP, frame denial, nosniff, Referrer-Policy, Permissions-Policy
- `.env` is gitignored — never commit secrets

Change the seeded admin password after first login.

## Vercel (temporary deploy)

1. Create a managed MySQL database and set `DATABASE_URL` + a strong `SESSION_SECRET` in the Vercel project env.
2. Run `npx prisma db push` (and seed) against that database once.
3. Deploy from this repo. Note: local `/uploads` disk storage **does not persist** on Vercel serverless — for real media use object storage (S3 / Vercel Blob / Cloudflare R2) before production.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema |
| `npm run db:seed` | Seed admin + sample data |

## Repo

https://github.com/onuraykutalp/mp-models
