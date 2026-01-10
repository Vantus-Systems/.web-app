# Copilot Instructions — Mary Esther Bingo (Nuxt 4 + Prisma)

These instructions are for GitHub Copilot (VS Code) working **inside this repository**.

## What this repo is
- Project name (package.json): `app`
- App title (README.md): **Mary Esther Bingo**
- Primary goal: a public website plus an authenticated admin portal for operations (pricing, schedule, jackpots, MIC tools).

## Tech stack (grounded in this repo)
- Framework: Nuxt 4 (Vue 3) with TypeScript.
- Styling: Tailwind CSS (via @nuxtjs/tailwindcss).
- State: Pinia (via @pinia/nuxt).
- Server: Nitro/H3 API routes under server/api.
- Validation: Zod (and @vee-validate/zod on the client).
- Database: Prisma ORM; datasource defaults to SQLite for local development (prisma/schema.prisma).
- Security: nuxt-security module; custom CSRF middleware in server/middleware/csrf.ts; in-memory rate limiter in server/utils/rateLimiter.ts.

## Directory map (high-signal)
- `pages/` — Nuxt file-based routes (public + `/admin/*` pages).
- `components/` — Vue SFC components (admin UI lives in `components/admin/`).
- `server/api/` — API routes (public + admin + auth).
- `server/services/` — server-side business logic (e.g., auth/session).
- `server/middleware/` — H3/Nitro middleware (CSRF, auth).
- `server/schemas/` — Zod schemas used by server endpoints.
- `prisma/` — Prisma schema + seed scripts.
- `utils/`, `composables/`, `stores/`, `types/` — shared app logic/types.
- `.github/workflows/` — CI/monitoring.
- `.agent/` and `.github/agents/` — existing audit/runbook/agent docs already checked into this repo.

## Key routes you must not break
### Nuxt pages (from `pages/`)
- /
- /about
- /admin
- /admin/charities
- /admin/login
- /admin/mic
- /admin/mic/restricted-players
- /admin/mic/shifts
- /admin/mic/shifts/:id
- /admin/operations
- /admin/operations-enhanced
- /admin/operations/schedule/print
- /admin/operations/schedule/tv
- /admin/owner
- /admin/people
- /admin/progressives
- /contact
- /house-rules
- /pricing
- /privacy
- /programs
- /schedule

### API endpoints (from `server/api/`)
- Total endpoints found: **57**
- Convention: file name suffix controls HTTP verb: `.get.ts`, `.post.ts`, `.delete.ts`, etc.
- Spot-check list (first 25 by route):
- `ANY` /api/admin/approval-requests  ← server/api/admin/approval-requests.ts
- `ANY` /api/admin/approval-requests/:id  ← server/api/admin/approval-requests/[id].ts
- `GET` /api/admin/audit-logs  ← server/api/admin/audit-logs.get.ts
- `POST` /api/admin/business  ← server/api/admin/business.post.ts
- `ANY` /api/admin/charities  ← server/api/admin/charities.ts
- `ANY` /api/admin/charities/:id  ← server/api/admin/charities/[id].ts
- `GET` /api/admin/holiday-rules  ← server/api/admin/holiday-rules.get.ts
- `POST` /api/admin/holiday-rules  ← server/api/admin/holiday-rules.post.ts
- `POST` /api/admin/jackpot  ← server/api/admin/jackpot.post.ts
- `GET` /api/admin/messages  ← server/api/admin/messages.get.ts
- `GET` /api/admin/mic/incidents  ← server/api/admin/mic/incidents.get.ts
- `POST` /api/admin/mic/incidents  ← server/api/admin/mic/incidents.post.ts
- `PUT` /api/admin/mic/incidents/:id  ← server/api/admin/mic/incidents/[id].put.ts
- `GET` /api/admin/mic/restricted-players  ← server/api/admin/mic/restricted-players.get.ts
- `POST` /api/admin/mic/restricted-players  ← server/api/admin/mic/restricted-players.post.ts
- `GET` /api/admin/mic/restricted-players.search  ← server/api/admin/mic/restricted-players.search.get.ts
- `DELETE` /api/admin/mic/restricted-players/:id  ← server/api/admin/mic/restricted-players/[id].delete.ts
- `POST` /api/admin/mic/shifts  ← server/api/admin/mic/shifts.post.ts
- `GET` /api/admin/ops-schema  ← server/api/admin/ops-schema.get.ts
- `POST` /api/admin/ops-schema  ← server/api/admin/ops-schema.post.ts
- `POST` /api/admin/ops-schema.publish  ← server/api/admin/ops-schema.publish.post.ts
- `POST` /api/admin/ops-schema.rollback  ← server/api/admin/ops-schema.rollback.post.ts
- `POST` /api/admin/ops-schema/publish  ← server/api/admin/ops-schema/publish.post.ts
- `POST` /api/admin/ops-schema/rollback  ← server/api/admin/ops-schema/rollback.post.ts
- `DELETE` /api/admin/patterns  ← server/api/admin/patterns.delete.ts

## Environment variables (observed in source)
Documented in `.env.example`:
- APP_SECRET
- DATABASE_URL
- HEALTH_ALERT_WEBHOOK
- NODE_ENV
- SERVICE_NAME

Also referenced in code/scripts (not currently listed in `.env.example`):
- HEALTH_ALERT_TTL_MS
- NPM_CONFIG_PRODUCTION
- SEED_ADMIN_PASSWORD
- SEED_ADMIN_USERNAME
- SKIP_DB_SETUP
- SKIP_SERVER

## Golden rules for Copilot changes
1. **Do not guess API contracts.** If you change a server response shape, update every consumer in `pages/`, `components/`, `composables/`, `stores/`.
2. **All external input must be validated.** Use Zod on server handlers that parse body/query/params.
3. **Auth + RBAC are required for admin routes.**
   - UI: `middleware/auth.ts` and `middleware/role.ts` gate admin pages.
   - Server: use/extend server auth middleware patterns; do not rely on client-side checks.
4. **CSRF must cover mutating requests.** See `server/middleware/csrf.ts` and confirm it applies to all POST/PUT/PATCH/DELETE handlers.
5. **Keep production behavior clean.**
   - No debug logs in production hot paths.
   - Avoid introducing new `console.log` except in scripts/tests.
6. **No placeholders.** Never output “TODO”, “FIXME”, “…” or partial code in changed files.

## Standard workflow (commands defined in package.json)
```bash
# install
npm ci

# dev
npm run dev

# build + preview
npm run build
npm run preview

# quality gates
npm run lint
npm run typecheck

# database
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed

# admin UI smoke check (Playwright)
npm run verify:admin
```

## Database change workflow (Prisma)
1. Edit `prisma/schema.prisma`.
2. Run:
   ```bash
   npm run prisma:migrate:dev
   npm run prisma:generate
   ```
3. Update any Zod schemas in `server/schemas/` that mirror DB shapes.
4. Update API handlers in `server/api/` and all UI consumers.
5. If seed data depends on the change, update `prisma/seed.js`.

## Where to look first (entry points)
- `nuxt.config.ts` — modules, security headers, runtime config.
- `app.vue` — app shell.
- `server/api/auth/*` + `server/services/auth.service.ts` — login/session.
- `server/api/admin/*` — admin surface area.
- `components/admin/` — admin UI components.

