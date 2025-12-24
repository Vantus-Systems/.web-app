# GitHub Copilot / Agent instructions for this repo

Summary
- Small Nuxt 3 website with a light server API (H3 handlers) and JSON file-backed "database" in `server/data/`.
- Useful files: `nuxt.config.ts`, `server/api/**`, `server/utils/*`, `stores/*`, `verification/*` (Playwright scripts).

Quick start (developer flow)
1. Install: `npm install`
2. Dev server: `npm run dev` (http://localhost:3000)
3. Lint/typecheck: `npm run lint` / `npm run typecheck`
4. Build & preview: `npm run build` then `node .output/server/index.mjs` (production preview)

Architecture & important patterns
- Frontend: Nuxt 3 + Vue 3 + Pinia. Stores live in `stores/`. Example: `useJackpotStore` fetches `/api/jackpot` and refreshes periodically (see `stores/jackpot.ts`).
- Server API: Under `server/api/` using H3-style handlers (`defineEventHandler`). Admin-only endpoints live under `server/api/admin/` and require `requireAuth(event)` (see `server/utils/auth.ts`).
- Data persistence: Simple JSON files in `server/data/` read/written via `server/utils/storage.ts`. Be mindful that these are single-process files (no DB transactions/concurrency safeguards).
- Authentication:
  - Login creates a session token stored in `server/data/sessions.json` via `createSession()`.
  - Cookie names: `auth_token` (httpOnly, server-only) and `admin_auth` (client-visible flag). Check `server/api/auth/login.post.ts`. 
  - Default admin: When `server/data/users.json` is empty, the code creates a default admin `admin/admin123` (see `server/utils/users.ts`) — change in prod.

API conventions and examples
- Request validation: Use `zod` (see `server/api/auth/login.post.ts` and `server/api/admin/users.post.ts`). Pattern: `const r = schema.safeParse(body); if (!r.success) throw createError({...})`.
- Error handling: Use `createError({ statusCode, statusMessage, data? })` and return consistent JSON objects for success (`{ success: true, ... }`).
- Auth checks: Use `await requireAuth(event)` and then verify `event.context.user.role` for admin-only actions.
- Rate limiting: Lightweight in-memory rate limiter is used for login (process-local Map). Tests and PRs that change login should be cautious.

Testing & verification
- There are Playwright-based verification scripts (Python) in `verification/` and `verify_homepage.py`. They expect a running dev server at `http://localhost:3000`.
  - Example: run the dev server, then `python3 verification/verify_admin.py` to exercise admin flows and capture screenshots in `verification/`.
- There are no unit tests in the repo — adding tests should follow existing patterns (use Playwright for E2E UI verification).

Developer guidelines (what to do and what to avoid)
- When adding server endpoints, prefer `zod` validation and explicit `createError` responses.
- For admin endpoints, always `await requireAuth(event)` and check `event.context.user.role === 'admin'`.
- Avoid direct file path concatenation; use helper `readJson`/`writeJson` through `server/utils/storage.ts` (it enforces directory traversal checks).
- Keep the UI stateless where possible: stores use `$fetch('/api/...')` and fetch only on `import.meta.client` when appropriate.
- Follow existing linting rules and types: run `npm run lint` and `npm run typecheck` before submitting PRs.

Files to reference while coding
- `server/utils/storage.ts` — safe file I/O and where to add new data files
- `server/utils/sessions.ts` — session creation and validation logic
- `server/utils/users.ts` — password hashing and default admin behavior
- `server/api/*` and `server/api/admin/*` — how endpoints are registered and protected
- `stores/*` — Pinia store patterns and client/server guards
- `verification/*`, `verify_homepage.py` — examples of automated verification scripts

If anything above is unclear or you'd like more examples (e.g., a new endpoint scaffold, test template, or Playwright snippet), say so and I will iterate. Thank you!