# API Endpoints Inventory

This document is generated from the actual file-based API handlers in `server/api/**` (Nuxt/Nitro).

Conventions:
- **Auth session** is cookie-based (`auth_token`), populated by `server/middleware/auth.ts`.
- **CSRF** is enforced for mutating requests to `/api/admin/**` and `/api/auth/logout` by `server/middleware/csrf.ts`.
- “Caller(s)” are best-effort references found by searching for `$fetch('/api/...')` / `useFetch('/api/...')` in the repo.

> Note: Some endpoints may not currently have a direct frontend caller (admin pages may be incomplete or use server-side tooling). Those entries are marked accordingly and will be revisited as wiring is verified end-to-end.

## Auth

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | Public | Create session, set `auth_token` + `csrf_token` cookies | `server/api/auth/login.post.ts` | `pages/admin/login.vue` |
| POST | `/api/auth/logout` | Session + CSRF | Revoke session and clear cookies | `server/api/auth/logout.post.ts` | `composables/useAuthUser.ts`; multiple admin pages call directly (see `pages/admin/**`) |
| GET | `/api/auth/user` | Session | Return current user info | `server/api/auth/user.get.ts` | `composables/useAuthUser.ts`; many admin pages |

## Public (no auth)

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET | `/api/health` | Public | Health check (DB + app) | `server/api/health.get.ts` | (not found via `$fetch`/`useFetch`) |
| GET | `/api/business` | Public | Public business info | `server/api/business.get.ts` | `composables/useBusiness.ts`; `pages/admin/index.vue` (also loads for admin UI) |
| GET | `/api/jackpot` | Public | Public jackpot amounts | `server/api/jackpot.get.ts` | `composables/useBusiness.ts`; `pages/admin/index.vue` |
| GET | `/api/pricing` | Public | Public pricing configuration | `server/api/pricing.get.ts` | `composables/useBusiness.ts`; `stores/ops.ts` |
| GET | `/api/schedule` | Public | Public schedule sessions | `server/api/schedule.get.ts` | `composables/useBusiness.ts`; `stores/ops.ts` |
| GET | `/api/specials` | Public | Public specials content | `server/api/specials.get.ts` | `composables/useBusiness.ts` |
| GET | `/api/programs` | Public | List bingo programs | `server/api/programs/index.get.ts` | `pages/programs.vue` |
| GET | `/api/programs/:slug` | Public | Get a single bingo program | `server/api/programs/[slug].get.ts` | `pages/schedule.vue` |
| POST | `/api/contact` | Public | Contact form submit | `server/api/contact.post.ts` | `pages/contact.vue` |

## Admin (requires session; CSRF for mutations)

### Ops schema + derived schedule/pricing

| Method | Path | Auth | Purpose | Handler | Caller(s) | Notes |
|---|---|---|---|---|---|---|
| GET | `/api/admin/ops-schema` | OWNER (current) | Fetch ops schema draft/live + publish history meta | `server/api/admin/ops-schema.get.ts` | `stores/ops.ts` | Auth consistency with permissions will be normalized. |
| POST | `/api/admin/ops-schema` | `ops:edit` | Save ops schema draft | `server/api/admin/ops-schema.post.ts` | `stores/ops.ts` | Validated with `opsSchemaV2Schema`. |
| POST | `/api/admin/ops-schema/publish` | `ops:publish` | Publish ops schema → compile & persist `schedule` + `pricing` | `server/api/admin/ops-schema/publish.post.ts` | `stores/ops.ts` | Canonical endpoint (preferred). |
| POST | `/api/admin/ops-schema/rollback` | OWNER (current) | Roll back ops schema draft to last live/history | `server/api/admin/ops-schema/rollback.post.ts` | `stores/ops.ts` | Canonical endpoint (preferred). |
| POST | `/api/admin/ops-schema.publish` | OWNER (legacy) | Publish ops schema (duplicate route shape) | `server/api/admin/ops-schema.publish.post.ts` | (not found) | Deprecated wrapper; will delegate to canonical publish. |
| POST | `/api/admin/ops-schema.rollback` | OWNER (legacy) | Rollback ops schema (duplicate route shape) | `server/api/admin/ops-schema.rollback.post.ts` | (not found) | Deprecated wrapper; will delegate to canonical rollback. |

### Schedule day profiles

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET | `/api/admin/schedule-day-profiles` | OWNER | Get saved day profiles/assignments/overrides | `server/api/admin/schedule-day-profiles.get.ts` | `stores/ops.ts` |
| POST | `/api/admin/schedule-day-profiles` | OWNER | Save day profiles/assignments/overrides | `server/api/admin/schedule-day-profiles.post.ts` | `stores/ops.ts` |

### Direct pricing/schedule settings (manual overrides)

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| POST | `/api/admin/pricing` | OWNER | Save pricing settings | `server/api/admin/pricing.post.ts` | `stores/ops.ts` |
| POST | `/api/admin/schedule` | OWNER | Save schedule settings | `server/api/admin/schedule.post.ts` | `stores/ops.ts` |

### Patterns & programs

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET | `/api/admin/patterns` | OWNER | List bingo patterns with parsed JSON fields | `server/api/admin/patterns.get.ts` | `stores/ops.ts` |
| POST | `/api/admin/patterns` | OWNER + CSRF | Create/update bingo pattern with validation | `server/api/admin/patterns.post.ts` | `stores/ops.ts` |
| DELETE | `/api/admin/patterns` | OWNER + CSRF | Delete bingo pattern (query `?slug=`), prevents deletion if used in programs | `server/api/admin/patterns.delete.ts` | `stores/ops.ts` |
| GET | `/api/admin/programs` | (verify) | List programs | `server/api/admin/programs.get.ts` | `stores/ops.ts` |
| POST | `/api/admin/programs` | (verify) | Create/update program | `server/api/admin/programs.post.ts` | `stores/ops.ts` |
| DELETE | `/api/admin/programs` | (verify) | Delete program (query `?slug=`) | `server/api/admin/programs.delete.ts` | (not found via `$fetch`/`useFetch`) |

### Business + jackpot + specials admin

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| POST | `/api/admin/business` | (verify) | Update business setting | `server/api/admin/business.post.ts` | `pages/admin/index.vue` |
| POST | `/api/admin/jackpot` | (verify) | Update jackpot setting | `server/api/admin/jackpot.post.ts` | `pages/admin/index.vue` |
| POST | `/api/admin/specials` | (verify) | Update specials setting | `server/api/admin/specials.post.ts` | (not found via `$fetch`/`useFetch`) |

### Admin messaging + audit

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET | `/api/admin/messages` | (verify) | Admin dashboard messages | `server/api/admin/messages.get.ts` | `pages/admin/index.vue` |
| GET | `/api/admin/audit-logs` | (verify) | Read audit log entries | `server/api/admin/audit-logs.get.ts` | (not found via `$fetch`/`useFetch`) |

### Users / people management

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET | `/api/admin/users` | (verify) | List users | `server/api/admin/users.get.ts` | `pages/admin/people/index.vue`; `pages/admin/owner/index.vue` |
| POST | `/api/admin/users` | (verify) | Create user | `server/api/admin/users.post.ts` | `pages/admin/people/index.vue` |
| PATCH | `/api/admin/users/:id` | (verify) | Update user (partial) | `server/api/admin/users/[id].patch.ts` | (not found via `$fetch`/`useFetch`) |
| DELETE | `/api/admin/users` | (verify) | Delete user | `server/api/admin/users.delete.ts` | (not found via `$fetch`/`useFetch`) |

### Approvals

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET/POST | `/api/admin/approval-requests` | (verify) | List / create approval requests | `server/api/admin/approval-requests.ts` | `pages/admin/owner/index.vue` |
| GET/POST/etc | `/api/admin/approval-requests/:id` | (verify) | Approval request operations | `server/api/admin/approval-requests/[id].ts` | (not found via `$fetch`/`useFetch`) |

### Charities

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| (varies) | `/api/admin/charities` | (verify) | Charities CRUD | `server/api/admin/charities.ts` | `pages/admin/charities/index.vue` |
| (varies) | `/api/admin/charities/:id` | (verify) | Charities operations by id | `server/api/admin/charities/[id].ts` | (not found via `$fetch`/`useFetch`) |

### MIC

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET | `/api/admin/mic/incidents` | (verify) | List incidents | `server/api/admin/mic/incidents.get.ts` | (not found via `$fetch`/`useFetch`) |
| POST | `/api/admin/mic/incidents` | (verify) | Create incident | `server/api/admin/mic/incidents.post.ts` | `components/admin/mic/ShiftWizard.vue` |
| PUT | `/api/admin/mic/incidents/:id` | (verify) | Update incident | `server/api/admin/mic/incidents/[id].put.ts` | (not found via `$fetch`/`useFetch`) |
| POST | `/api/admin/mic/shifts` | (verify) | Create/update shifts | `server/api/admin/mic/shifts.post.ts` | (not found via `$fetch`/`useFetch`) |
| GET | `/api/admin/mic/restricted-players` | (verify) | List restricted players | `server/api/admin/mic/restricted-players.get.ts` | `pages/admin/mic/restricted-players.vue` |
| GET | `/api/admin/mic/restricted-players/search` | (verify) | Search restricted players | `server/api/admin/mic/restricted-players.search.get.ts` | (not found via `$fetch`/`useFetch`) |
| POST | `/api/admin/mic/restricted-players` | (verify) | Add restricted player | `server/api/admin/mic/restricted-players.post.ts` | `pages/admin/mic/restricted-players.vue` |
| DELETE | `/api/admin/mic/restricted-players/:id` | (verify) | Delete restricted player | `server/api/admin/mic/restricted-players/[id].delete.ts` | (not found via `$fetch`/`useFetch`) |

### Shift records

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET | `/api/admin/shift-records` | (verify) | List shift records | `server/api/admin/shift-records.get.ts` | (not found via `$fetch`/`useFetch`) |
| POST | `/api/admin/shift-records` | (verify) | Create shift record | `server/api/admin/shift-records.post.ts` | (not found via `$fetch`/`useFetch`) |
| GET | `/api/admin/shift-records/:id` | (verify) | Get shift record | `server/api/admin/shift-records/[id].get.ts` | (not found via `$fetch`/`useFetch`) |
| PUT | `/api/admin/shift-records/:id` | (verify) | Update shift record | `server/api/admin/shift-records/[id].put.ts` | (not found via `$fetch`/`useFetch`) |
| DELETE | `/api/admin/shift-records/:id` | (verify) | Delete shift record | `server/api/admin/shift-records/[id].delete.ts` | (not found via `$fetch`/`useFetch`) |

### Holiday rules

| Method | Path | Auth | Purpose | Handler | Caller(s) |
|---|---|---|---|---|---|
| GET | `/api/admin/holiday-rules` | (verify) | List holiday rules | `server/api/admin/holiday-rules.get.ts` | (not found via `$fetch`/`useFetch`) |
| POST | `/api/admin/holiday-rules` | (verify) | Create/update holiday rules | `server/api/admin/holiday-rules.post.ts` | (not found via `$fetch`/`useFetch`) |
