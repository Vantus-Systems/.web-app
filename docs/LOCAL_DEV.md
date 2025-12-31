# Local development

This repo is a **Nuxt 4** app with a Nitro server and a Prisma (SQLite by default) database.

## Prereqs

- Node.js (recommended: current LTS)
- Python 3 (only needed for `npm run verify:admin`)

## Environment

Copy `.env.example` to `.env` (optional for local; install will also create/normalize `.env` if needed):

- `APP_SECRET` (required for secure CSRF derivation; dev will warn if missing)
- `DATABASE_URL` (defaults to `file:./med.db`)

## Install

`npm install` will:

1) run `scripts/setup-db.js` **in non-production installs** (apply migrations + seed)
2) run `nuxt prepare`

If you want to skip DB setup locally:

- set `SKIP_DB_SETUP=1` for the install environment.

## Run

- Dev server: `npm run dev`
- Build: `npm run build`
- Run built server with dotenv (useful for cookie behavior): `npm run start:local`

## Database setup & seeding

- Apply migrations + seed (default seed on non-prod): `npm run db:setup`
- Apply migrations only: set `RUN_DB_SEED=0` then run `npm run db:setup`

### Admin user

- In **development**, the seed script will create an admin user and print the generated credentials once.
- In **production**, the seed script will **not** create a default admin unless you set:
  - `SEED_ADMIN_USERNAME`
  - `SEED_ADMIN_PASSWORD`

## Health check

- `GET /api/health` returns `{ ok: true }` when the DB is reachable and the schema is ready.
