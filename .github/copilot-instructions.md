---
description: Comprehensive engineering guidelines and agent instructions for working within the Mary Esther Bingo (Nuxt 4 + Prisma) repository.
applyTo: **
---
# Mary Esther Bingo - GitHub Copilot Instructions

**Context**: This is a production-grade Nuxt 4 bingo hall website + admin portal with Prisma (SQLite), session auth, CSRF protection, and Fortune-500 security standards. This repository implements a complete full-stack application with 57 API endpoints, 25 Nuxt pages, and comprehensive admin tooling.

**Primary Reference**: **ALWAYS start with `.github/details.md`** for complete, grounded facts about:
- Exact file counts and directory structure
- All 57 API endpoints (public, auth, admin) with methods and paths
- All 25 Nuxt pages (public and admin routes)
- Complete environment variable list
- Tech stack versions and configurations
- Directory map with file counts

**Additional resources**:
- `.agent/` — Audit artifacts (API_INVENTORY, ARCHITECTURE_MAP, SECURITY_HARDENING, etc.)
- `.agent/skills/` — Specialized agent skills for concurrent task execution
- `.github/agents/` — Agent definitions for admin-portal, backend, frontend, security-production
- `README.md` — Project overview and setup instructions

### 0) Prime Directive (non-negotiable)
- **Read `.github/details.md` FIRST** before any changes to understand the complete codebase structure
- **Read relevant files before proposing changes.** Confirm APIs, routes, scripts, and file paths exist in the repo.
- Keep changes minimal, safe, and consistent with existing patterns.
- Never modify or depend on vendored/generated/third-party artifacts: `node_modules/`, `.output/`, `dist/`, `build/`, `.next/`, `.nuxt/`, `.svelte-kit/`, `coverage/`, `*.min.*`.
- Prefer small PR-shaped changes (even when working locally): narrow scope, clear reasoning, easy review.
- **Verify changes by running the repo's scripts**; if verification fails, fix and re-verify before stopping.

### 0.1) How to use this file
This file provides **HOW** to work with the codebase (patterns, rules, workflows).  
`.github/details.md` provides **WHAT** exists (files, endpoints, routes, counts).  
**Always cross-reference both files** when making changes.

---

## 1) How to write outputs (make them usable)
- **Start with `.github/details.md`** to confirm file paths, API endpoints, and routes exist
- Start with a concise plan and the exact files you will read/change
- When you change code, include:
  - what changed
  - why it's correct (reference existing patterns from `.github/details.md`)
  - how it was verified (commands + expected output)
  - risks/tradeoffs (should be minimal; document explicitly)
- **Never invent APIs, routes, scripts, or file paths** — always verify in `.github/details.md` first
- Reference specific line numbers or sections from `.github/details.md` when relevant

---

## 2) Quick Start: Essential Facts (from `.github/details.md`)

**Before ANY changes, review `.github/details.md` for:**
- **57 API endpoints** (14 public, 3 auth, 40 admin) with exact methods and paths
- **25 Nuxt pages** (9 public, 16 admin) with route mapping
- **153 total source files** (.ts and .vue only, excluding generated artifacts)
- **Complete directory structure** from `pages/` to `scripts/`

**Tech Stack (grounded in `.github/details.md`):**
- **Framework**: Nuxt 4.2 (Vue 3) + Nitro/H3 server
- **Database**: Prisma 5.22 with SQLite (`med.db` in repo root)
- **Security**: nuxt-security (CSP, 150 req/5min rate limit), argon2 hashing, CSRF middleware
- **Validation**: Zod schemas in `server/schemas/**`
- **State**: Pinia stores (6 files)
- **UI**: Tailwind CSS, Lucide Vue Next, VueUse Motion

**Key File Conventions** (from `.github/details.md`):
- API routes: `server/api/**` with `.get.ts`, `.post.ts`, `.put.ts`, `.delete.ts`, `.patch.ts` suffixes
- Admin pages: `pages/admin/**`
- Admin components: `components/admin/**`
- Services: `server/services/**` (8 services)
- Middleware: `server/middleware/auth.ts` and `server/middleware/csrf.ts`

---

## 3) Key Repo Commands (Fortune-500 Workflow)

### Development Workflow
```bash
# Initial setup (auto-runs postinstall → DB setup + nuxt prepare)
npm install

# Daily development (HMR + API routes on :3000)
npm run dev

# Quality gates (run before every commit)
npm run lint          # Type-check only (vue-tsc --noEmit)
npm run lint:fix      # ESLint auto-fix
npm run typecheck     # Same as lint
npm run build         # Production build → .output/

# Preview & testing
npm run preview       # Preview production build
npm run start:server  # Run built server (scripts/start-server.js)
npm run start:local   # HTTP dev mode (no Secure cookies)
npm run verify:admin  # Playwright E2E tests (verification/verify_admin_console.py)
```

### Database Management
```bash
# Postinstall automatically runs this, but you can re-run:
npm run setup:db      # Provision database (same as postinstall)
npm run check:db      # Verify Prisma connectivity
npm run prisma:studio # Open Prisma Studio GUI
npm run prisma:generate # Regenerate Prisma client
npm run prisma:migrate:dev # Create migration
```

### Postinstall Flow (automatic on `npm install`)
From `.github/details.md` - **understand this flow**:
1. Ensures `DATABASE_URL` exists (defaults to `file:med.db` absolute path)
2. Runs `prisma generate` (refresh Prisma client)
3. Runs `prisma db push --accept-data-loss` (sync schema to SQLite)
4. Runs `prisma db seed` (load admin user + config from `prisma/seed.js`)
5. Runs `nuxt prepare` (generate `.nuxt/` types)

**Critical**: If you delete `med.db` or need to reset, run `npm run setup:db` to re-provision.

---

## 4) Architecture Map (Complete Structure)

**For complete directory structure and file counts, see `.github/details.md`**

### Frontend (Nuxt 4 + Vue 3)
- **Pages** (`pages/`): 25 files
  - Public: `/`, `/about`, `/contact`, `/house-rules`, `/pricing`, `/privacy`, `/programs/**`, `/schedule`
  - Admin: `/admin/**` (login, homepage, charities, people, owner, progressives, mic/**, operations/**, pricing)
- **Components** (`components/`): 45 files
  - `components/admin/` (25): Admin UI components
  - `components/public/` (12): Public-facing components
  - `components/ui/` (8): UI kit (buttons, cards, etc.)
  - Domain-specific: `bingo/`, `pricing/`
- **State Management** (`stores/`): 6 Pinia stores
  - homepage, jackpot, ops, pricing, schedule, user
- **Composables** (`composables/`): 9 files
  - auth, autosave, business, csrf, permissions, schedule, shifts, toast
- **Middleware** (`middleware/`): 2 files
  - `auth.ts` (route guard), `role.ts` (RBAC)
- **Utilities** (`utils/`): 10 files
  - cn, format, normalizeDay, pattern utils, roles, shift calculations
- **Types** (`types/`): 4 files
  - bingo.ts, shared types

### Backend (Nitro/H3)
- **API Routes** (`server/api/`): 57 endpoints
  - Public (14): business, calendar, charities, contact, health, homepage, jackpot, next-session, pricing, programs, schedule, specials
  - Auth (3): login, logout, user
  - Admin (40): approval-requests, audit-logs, business, charities, holiday-rules, homepage, jackpot, messages, mic/**, patterns, pricing, programs, schedule, shift-records, specials, users
- **Middleware** (`server/middleware/`): 2 files
  - `auth.ts` (session validation), `csrf.ts` (token enforcement)
- **Services** (`server/services/`): 8 files
  - audit, auth, contact, holidayRules, pricingCompiler, settings, shiftRecords, version
- **Schemas** (`server/schemas/`): 6 Zod validation files
  - homepage, micIncident, micShift, restrictedPlayer, plus others
- **Server Utils** (`server/utils/`): rateLimiter, storage, users, sessions
- **Database** (`server/db/`): Prisma client singleton

### Database (Prisma 5.22 + SQLite)
- **Schema** (`prisma/schema.prisma`): User, Session, Shift, Incident, Program, Pricing, Settings
- **Seed** (`prisma/seed.js`): Admin user + default config
- **Migrations** (`prisma/migrations/`): Prisma migrations

### Tooling & Scripts
- **Scripts** (`scripts/`): 11 files
  - postinstall.js, setup-db.js, start-server.js, check-db.js, integration/
- **Verification** (`verification/`): Playwright E2E tests
- **Documentation** (`docs/`): 8 files (API endpoints, audit reports, deployment, runbook)
- **Audit Artifacts** (`.agent/`): API_INVENTORY, ARCHITECTURE_MAP, SECURITY_HARDENING, etc.

---

## 5) API Engineering Rules (Fortune-500 Baseline)

### 5.1 Input validation (required)
- Validate **every** external input (params/query/body) with allowlist schemas (prefer Zod).
- For write operations, reject unknown fields to prevent mass assignment / unintended updates.
- Normalize and sanitize inputs where needed (dates, enums, IDs).
- **Reference**: See `server/schemas/**` for existing Zod patterns

### 5.2 AuthN/AuthZ (required)
- Enforce authentication on all admin/protected APIs.
- Enforce authorization consistently:
  - apply RBAC/permission checks at the server edge
  - apply object-level authorization on any endpoint that accepts an object ID (BOLA prevention)
- Never rely on client-side role gating for security.
- **Reference**: `server/middleware/auth.ts` and `server/services/auth.service.ts`

### 5.3 CSRF (required for cookie-based mutations)
- All POST/PUT/PATCH/DELETE hitting `/api/admin/**` or `/api/auth/logout` must pass CSRF checks.
- Frontend contract:
  - use `useCsrf().getHeaders()` to add `x-csrf-token`
  - include `credentials: "include"` for cookie auth
  - do not bypass CSRF for admin APIs
- **Reference**: `server/middleware/csrf.ts` and `composables/useCsrf.ts`

### 5.4 Error handling (required)
- Use `createError({ statusCode, message })` for predictable client handling.
- Do not leak secrets, stack traces, SQL details, or internals in production responses.
- Keep response shapes consistent across endpoints (success + error contracts).

### 5.5 Rate limiting & resource controls (required where applicable)
- Apply stricter rate limiting to auth endpoints and expensive endpoints.
- Enforce payload size limits and timeouts where appropriate.
- Prefer centralized patterns (`nuxt-security` + `server/utils/rateLimiter.ts`) over ad hoc logic.
- **Reference**: `server/utils/rateLimiter.ts` for in-memory rate limiting

### 5.6 Logging & auditability (required for admin writes)
- Log security-relevant events (auth failures, permission denials, suspicious patterns) server-side.
- Record admin write actions in an audit log service if present; include actor + action + entity + IDs.
- Never log secrets, tokens, or sensitive personal data.
- **Reference**: `server/services/audit.service.ts`

### 5.7 Prisma safety (required)
- Prefer Prisma query builder APIs.
- Avoid raw SQL; if unavoidable, ensure strict parameterization and never concatenate untrusted input.
- **Reference**: `server/db/client.ts` for Prisma singleton pattern

### 5.8 Secrets & environment safety
- Never hardcode secrets (APP_SECRET, DB URL, tokens) into source.
- Treat any fallback like `"default-secret"` as development-only; require real env secrets for production.
- **Reference**: `.env.example` for required variables

---

## 6) Admin Console “Wiring” Rules (UI → API → DB → UI)
When asked to “wire” an admin feature, trace and complete the entire chain:
1) UI trigger (button/form/table action)
2) Store/composable action (client logic)
3) HTTP call (`$fetch` / `useFetch`) with CSRF + credentials
4) Server endpoint exists in `server/api/**` with correct method/path
5) Auth + permission checks (RBAC + object-level)
6) Input validation (Zod)
7) Business logic in `server/services/**`
8) DB write/read via Prisma
9) Audit logging for writes
10) Response contract matches what the UI expects
11) UI state updates: loading, success, error (no silent failures)
12) Verification: manual check + `npm run verify:admin` for admin flows

**No partial wiring is acceptable**: if the UI exists, the endpoint must exist; if the endpoint exists, UI must call it correctly.

**Reference existing patterns**:
- `pages/admin/mic/shifts.vue` → `server/api/admin/mic/shifts.post.ts` → `server/services/shiftRecords.service.ts`
- `stores/ops.ts` → `server/api/admin/ops-schema.get.ts` → Prisma

---

## 7) “Elite Audit + Integration Agent” Mode (for large refactors)
When the user requests a full wiring/security audit, follow this workflow end-to-end and do not stop early.

### 7.1 Non-negotiable audit outcomes
- Review the entire codebase (excluding excluded folders).
- Ensure every expected API exists and is correctly implemented.
- Ensure every admin action is wired end-to-end and verified.
- Harden security across APIs and auth flows.
- Provide a final report that is verifiable via repo commands/tests.

### 7.2 Create a no-drift working set
Create `.agent/` and keep these files updated as the source of truth:
1) `.agent/NO_SKIP_LEDGER.md`
   - list all relevant files (via `git ls-files` or `find` with excludes)
   - mark each file as READ / CHANGED / TESTED
2) `.agent/ARCHITECTURE_MAP.md`
   - routes/pages, admin modules, API structure, auth/csrf, data layer
3) `.agent/API_INVENTORY.md`
   - method, path, handler file, auth/roles, validation, response shape, rate limit
4) `.agent/UI_ACTION_INVENTORY.md`
   - admin screen/component, action name, trigger, client call, endpoint, expected result
5) `.agent/WIRING_GAPS.md`
   - missing endpoints, mismatched methods/paths, missing permission checks, missing client calls, response mismatches
6) `.agent/SECURITY_HARDENING.md`
   - checklist status (PASS/FAIL) for auth, BOLA checks, validation, CSRF, headers, rate limiting, logging, dependency hygiene
7) `.agent/QA_RUNBOOK.md`
   - exact commands to run and what “good” looks like

### 7.3 Phase workflow (must complete)
PHASE 0 — Baseline
- Enumerate files (NO_SKIP_LEDGER).
- Run baseline scripts: install, lint, typecheck, build, dev/preview as appropriate.
- Record results in QA_RUNBOOK.

PHASE 1 — Read everything
- Read every file in NO_SKIP_LEDGER.
- Update ARCHITECTURE_MAP and mark files READ.

PHASE 2 — Map expected APIs from UI/client
- Inventory every `$fetch`/`useFetch`/store/composable client call.
- Populate UI_ACTION_INVENTORY and derive Expected API Surface.

PHASE 3 — Map actual APIs from server
- Inventory all handlers in `server/api/**`.
- Populate API_INVENTORY with auth, validation, response shape, rate limit.

PHASE 4 — Diff & fix wiring
- Compare Expected vs Actual:
  - implement missing endpoints
  - fix path/method mismatches
  - add missing client wiring
  - align response shapes (DTO/adapters)
- Add tests (unit/integration) for key flows and regressions.

PHASE 5 — Security hardening
- Enforce auth + authorization (including object-level checks).
- Enforce validation allowlists for all endpoints.
- Enforce rate limiting for auth/high-cost paths.
- Enforce safe errors and consistent responses.
- Ensure CSRF rules are followed for admin/logout mutations.
- Audit headers/CORS/cookies configuration; do not relax `nuxt-security` without reason.
- Run dependency audit (`npm audit` or equivalent) and address high-risk items carefully.

PHASE 6 — Contracts & regression prevention
- If API contracts exist, validate implementation against them.
- If not, generate minimal API documentation (OpenAPI or equivalent) for admin APIs.
- Add lightweight contract tests or verification steps to QA_RUNBOOK.

PHASE 7 — Final verification loop (must pass)
- Run: lint, typecheck, build, and verify admin flows.
- If anything fails, fix and re-run until clean.

### 7.4 Self-check loop (required)
At the end of each phase:
- Confirm NO_SKIP_LEDGER is complete and accurate.
- Confirm WIRING_GAPS is empty or shrinking; if not, loop back.
- Confirm SECURITY_HARDENING items are PASS; fix FAIL items immediately.
- Confirm QA commands pass; if not, fix immediately.

### 7.5 Final deliverables (required)
- `.agent/*` files updated and complete.
- A final report with:
  - grouped list of changes
  - verification commands + outcomes
  - API coverage summary (Expected vs Actual reconciled)
  - security hardening summary
  - remaining TODOs (should be optional enhancements only)

---
## 7) "Elite Audit + Integration Agent" Mode (for large refactors)
When the user requests a full wiring/security audit, follow this workflow end-to-end and do not stop early.

### 7.1 Non-negotiable audit outcomes
- Review the entire codebase (excluding excluded folders).
- Ensure every expected API exists and is correctly implemented.
- Ensure every admin action is wired end-to-end and verified.
- Harden security across APIs and auth flows.
- Provide a final report that is verifiable via repo commands/tests.

### 7.2 Create a no-drift working set
Create `.agent/` and keep these files updated as the source of truth:
1) `.agent/NO_SKIP_LEDGER.md`
   - list all relevant files (via `git ls-files` or `find` with excludes)
   - mark each file as READ / CHANGED / TESTED
2) `.agent/ARCHITECTURE_MAP.md`
   - routes/pages, admin modules, API structure, auth/csrf, data layer
3) `.agent/API_INVENTORY.md`
   - method, path, handler file, auth/roles, validation, response shape, rate limit
4) `.agent/UI_ACTION_INVENTORY.md`
   - admin screen/component, action name, trigger, client call, endpoint, expected result
5) `.agent/WIRING_GAPS.md`
   - missing endpoints, mismatched methods/paths, missing permission checks, missing client calls, response mismatches
6) `.agent/SECURITY_HARDENING.md`
   - checklist status (PASS/FAIL) for auth, BOLA checks, validation, CSRF, headers, rate limiting, logging, dependency hygiene
7) `.agent/QA_RUNBOOK.md`
   - exact commands to run and what "good" looks like

### 7.3 Phase workflow (must complete)
PHASE 0 — Baseline
- Enumerate files (NO_SKIP_LEDGER).
- Run baseline scripts: install, lint, typecheck, build, dev/preview as appropriate.
- Record results in QA_RUNBOOK.

PHASE 1 — Read everything
- Read every file in NO_SKIP_LEDGER.
- Update ARCHITECTURE_MAP and mark files READ.

PHASE 2 — Map expected APIs from UI/client
- Inventory every `$fetch`/`useFetch`/store/composable client call.
- Populate UI_ACTION_INVENTORY and derive Expected API Surface.

PHASE 3 — Map actual APIs from server
- Inventory all handlers in `server/api/**`.
- Populate API_INVENTORY with auth, validation, response shape, rate limit.

PHASE 4 — Diff & fix wiring
- Compare Expected vs Actual:
  - implement missing endpoints
  - fix path/method mismatches
  - add missing client wiring
  - align response shapes (DTO/adapters)
- Add tests (unit/integration) for key flows and regressions.

PHASE 5 — Security hardening
- Enforce auth + authorization (including object-level checks).
- Enforce validation allowlists for all endpoints.
- Enforce rate limiting for auth/high-cost paths.
- Enforce safe errors and consistent responses.
- Ensure CSRF rules are followed for admin/logout mutations.
- Audit headers/CORS/cookies configuration; do not relax `nuxt-security` without reason.
- Run dependency audit (`npm audit` or equivalent) and address high-risk items carefully.

PHASE 6 — Contracts & regression prevention
- If API contracts exist, validate implementation against them.
- If not, generate minimal API documentation (OpenAPI or equivalent) for admin APIs.
- Add lightweight contract tests or verification steps to QA_RUNBOOK.

PHASE 7 — Final verification loop (must pass)
- Run: lint, typecheck, build, and verify admin flows.
- If anything fails, fix and re-run until clean.

### 7.4 Self-check loop (required)
At the end of each phase:
- Confirm NO_SKIP_LEDGER is complete and accurate.
- Confirm WIRING_GAPS is empty or shrinking; if not, loop back.
- Confirm SECURITY_HARDENING items are PASS; fix FAIL items immediately.
- Confirm QA commands pass; if not, fix immediately.

### 7.5 Final deliverables (required)
- `.agent/*` files updated and complete.
- A final report with:
  - grouped list of changes
  - verification commands + outcomes
  - API coverage summary (Expected vs Actual reconciled)
  - security hardening summary
  - remaining TODOs (should be optional enhancements only)

---
## 8) Repo-specific conventions and “good reference files”
Prefer existing patterns in these files when implementing new work:
- `server/api/auth/login.post.ts`
- `server/api/auth/logout.post.ts`
- `server/middleware/auth.ts`
- `server/middleware/csrf.ts`
- `composables/useCsrf.ts`
- `stores/ops.ts`
- `pages/admin/index.vue`
- `pages/admin/mic/shifts.vue`
- `server/services/auth.service.ts`
- `server/utils/rateLimiter.ts`
- `scripts/setup-db.js`
- `README.md`

---

## 9) Definition of Done (must satisfy before stopping)
For meaningful changes:
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- For admin work: `npm run verify:admin` and a manual smoke of the affected flow(s)
- Documentation updated if endpoints or behavior changed (README or relevant docs)

---

## 10) Specialized Agents & Skills

This repository includes pre-configured agents for complex tasks. Use them when appropriate:

### Available Agents (`.github/agents/`)
- **admin-portal**: Admin UX + admin APIs with strict RBAC, Zod validation, Prisma
- **backend**: Nuxt 3, Nitro, H3 event handlers
- **frontend**: Nuxt 3, Vue 3, Tailwind CSS, Fortune-10000 UI/UX
- **security-production**: OWASP checks, CSRF, rate limiting, dependency hygiene

### Agent Skills (`.agent/skills/`)
- **admin-workflows**: Coordinated admin feature implementation
- **prisma-data-model**: Database schema changes
- **ops-deployment**: Deployment and operations
- **ui-design-system**: Component and design system work

**When to use agents**: Complex refactors, full-stack features, security audits, or when you need concurrent task execution.

**How to invoke**: Use the `runSubagent` tool with the appropriate agent name and detailed prompt.
