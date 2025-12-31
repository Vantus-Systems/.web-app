# Production deployment

This app is deployed as a Node server using Nuxt Nitro’s `node-server` output.

## Required environment variables

- `APP_SECRET` (**required**) – long random secret used for CSRF derivation.
- `DATABASE_URL` (**required**) – Prisma connection string.

Optional:

- `SERVICE_NAME` – included in health alerts.
- `HEALTH_ALERT_WEBHOOK` – URL to POST health alerts to.
- `HEALTH_ALERT_TTL_MS` – minimum interval between alerts.

## Build artifact

Build produces `.output/server/index.mjs`.

Recommended CI flow:

1) `npm ci`
2) `npm run lint`
3) `npm run typecheck`
4) `npm run build`

## Database migrations

Run migrations during deploy (recommended):

- `npx prisma migrate deploy`

Seeding is **opt-in** in production. If you need initial data or an initial admin user:

- set `SEED_ADMIN_USERNAME` and `SEED_ADMIN_PASSWORD`
- run `npx prisma db seed`

## Start

You can start the built server directly:

- `node .output/server/index.mjs`

Or via the repo helper (loads dotenv automatically if present):

- `npm run start:server`

## Notes on install safety

`postinstall` is designed to be **production-safe**:

- when `NODE_ENV=production` (or npm production mode), it **skips DB setup**
- it always runs `nuxt prepare`

## Reverse proxy (nginx)

If you run behind nginx, ensure forwarded headers are set (example):

- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `Host`

These are used for rate limiting and correct absolute URL behavior.
