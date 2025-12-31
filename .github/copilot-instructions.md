# GitHub Copilot — Unified Fortune-5000 Instructions (Mary Esther Bingo)

These repository instructions apply to Copilot Chat and Copilot coding agent when working in this repo. Keep suggestions aligned to this file and the codebase.

---

## 0) Prime Directive (non-negotiable)
- Read relevant files before proposing changes.
- Keep changes minimal, safe, and consistent with existing patterns.
- Never modify or depend on vendored/generated/third-party artifacts: `node_modules/`, `.output/`, `dist/`, `build/`, `.next/`, `.nuxt/`, `.svelte-kit/`, `coverage/`, `*.min.*`.
- Prefer small PR-shaped changes (even when working locally): narrow scope, clear reasoning, easy review.
- Verify changes by running the repo’s scripts; if verification fails, fix and re-verify before stopping.

---

## 1) How to write outputs (make them usable)
- Start with a concise plan and the exact files you will read/change.
- When you change code, include:
  - what changed
  - why it’s correct
  - how it was verified (commands + expected output)
  - risks/tradeoffs (should be minimal; document explicitly)
- Do not invent APIs, routes, scripts, or file paths; confirm them in the repo first.

---

## 2) Tech stack & runtime facts for this repo
- Framework/runtime: **Nuxt (Nuxt 4)** + Nitro/H3 server, Vue 3, TypeScript, Tailwind, Pinia.
- Backend: file-based API routes in `server/api/**`; business logic in `server/services/**`; Prisma client in `server/db/client.ts`; SQLite by default (`med.db` exists in repo).
- Security: `nuxt-security` is configured in `nuxt.config.ts` (headers + rate limiter). Do not weaken it without strong justification.
- Validation: use **Zod** schemas for request inputs; keep validation near the edge (handlers) and types/DTOs consistent.
- Auth: session token stored in `auth_token` cookie (httpOnly); CSRF token stored in `csrf_token` cookie; CSRF enforced for admin/logout mutations via middleware.

---

## 3) Key repo commands (baseline workflow)
Use the scripts defined in `package.json`:
- Install: `npm install` (runs DB setup + `nuxt prepare` via `postinstall`)
- Dev: `npm run dev`
- Lint: `npm run lint` (fix: `npm run lint:fix`)
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Preview: `npm run preview`
- Run built server: `npm run start:server`
- Local server (HTTP-friendly cookies): `npm run start:local`
- Verify admin flows: `npm run verify:admin` (Python-based)

---

## 4) Architecture map (where to look first)
Frontend:
- Pages/routes: `pages/**` (admin under `pages/admin/**`)
- Components: `components/**` (admin UI under `components/admin/**`)
- Layouts: `layouts/**`
- Middleware (client routing guards): `middleware/**`
- State: Pinia stores in `stores/**`
- Composables: `composables/**`
- Shared types: `types/**`
- Utilities: `utils/**`

Backend:
- API routes: `server/api/**`
- Middleware: `server/middleware/**` (auth + csrf)
- Schemas: `server/schemas/**`
- Services: `server/services/**`
- DB: `server/db/**` (Prisma singleton)
- Server utils: `server/utils/**`

Data/config:
- File-backed content/config: `server/data/*.json`
- Storage helpers: `server/utils/storage.ts`

---

## 5) API Engineering Rules (Fortune-500 baseline)
### 5.1 Input validation (required)
- Validate **every** external input (params/query/body) with allowlist schemas (prefer Zod).
- For write operations, reject unknown fields to prevent mass assignment / unintended updates.
- Normalize and sanitize inputs where needed (dates, enums, IDs).

### 5.2 AuthN/AuthZ (required)
- Enforce authentication on all admin/protected APIs.
- Enforce authorization consistently:
  - apply RBAC/permission checks at the server edge
  - apply object-level authorization on any endpoint that accepts an object ID (BOLA prevention)
- Never rely on client-side role gating for security.

### 5.3 CSRF (required for cookie-based mutations)
- All POST/PUT/PATCH/DELETE hitting `/api/admin/**` or `/api/auth/logout` must pass CSRF checks.
- Frontend contract:
  - use `useCsrf().getHeaders()` to add `x-csrf-token`
  - include `credentials: "include"` for cookie auth
  - do not bypass CSRF for admin APIs

### 5.4 Error handling (required)
- Use `createError({ statusCode, message })` for predictable client handling.
- Do not leak secrets, stack traces, SQL details, or internals in production responses.
- Keep response shapes consistent across endpoints (success + error contracts).

### 5.5 Rate limiting & resource controls (required where applicable)
- Apply stricter rate limiting to auth endpoints and expensive endpoints.
- Enforce payload size limits and timeouts where appropriate.
- Prefer centralized patterns (`nuxt-security` + `server/utils/rateLimiter.ts`) over ad hoc logic.

### 5.6 Logging & auditability (required for admin writes)
- Log security-relevant events (auth failures, permission denials, suspicious patterns) server-side.
- Record admin write actions in an audit log service if present; include actor + action + entity + IDs.
- Never log secrets, tokens, or sensitive personal data.

### 5.7 Prisma safety (required)
- Prefer Prisma query builder APIs.
- Avoid raw SQL; if unavoidable, ensure strict parameterization and never concatenate untrusted input.

### 5.8 Secrets & environment safety
- Never hardcode secrets (APP_SECRET, DB URL, tokens) into source.
- Treat any fallback like `"default-secret"` as development-only; require real env secrets for production.

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

No partial wiring is acceptable: if the UI exists, the endpoint must exist; if the endpoint exists, UI must call it correctly.

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
