# Security Audit & Hardening Report

## 1. Architecture Summary
- **Stack:** Nuxt 3, H3 Server, Prisma ORM, SQLite (Dev)/Postgres (Prod).
- **Auth:** Session-based (HttpOnly Cookies) with CSRF protection.
- **Role Control:** RBAC with `assertRole` and `assertPermission` helpers.

## 2. API Inventory & Status
| Endpoint | Method | Auth | Validation | Audit Log | Status |
|----------|--------|------|------------|-----------|--------|
| `/api/auth/login` | POST | Rate Limit | Zod | - | Hardened |
| `/api/admin/shift-records` | POST | RBAC (mic:edit) | Zod | YES | Hardened |
| `/api/admin/shift-records/:id` | PUT | RBAC (OWNER) | Zod | YES | Hardened |
| `/api/admin/mic/shifts` | POST | RBAC (MIC) | Zod | YES | Hardened (Transactional) |
| `/api/admin/users` | POST/DEL | RBAC (OWNER) | Zod | YES | Hardened |
| `/api/contact` | POST | Rate Limit | Zod | - | Safe |

## 3. Findings & Fixes
### Critical Findings
1.  **Transactional Integrity:** `mic/shifts.post.ts` was not using transactions, risking partial data writes (e.g., Shift created but Checks failed).
    *   *Fix:* Wrapped creation logic in `prisma.$transaction`.
2.  **Audit Gaps:** Financial endpoints (`shift-records`) were not generating audit logs.
    *   *Fix:* Added `auditService.log` to Create/Update operations.
3.  **Missing Permissions:** Some endpoints relied on implicit trust.
    *   *Fix:* Enforced `assertRole` or `assertPermission` on all Admin APIs.

### Security Hardening Implemented
-   **CSRF:** Stateless Double-Submit Cookie pattern (via `csrf.ts`).
-   **Rate Limiting:** In-memory limiter for Login (5/15min) and Contact (3/10min).
-   **Headers:** `nuxt-security` module configured with HSTS, X-Frame-Options, and NoSniff.
-   **Input Validation:** Strict Zod schemas for all mutations. Unknown fields are stripped.

## 4. Remaining Risks
-   **Rate Limiting (Distributed):** The current rate limiter is in-memory. If deployed to a serverless/cluster environment, limits will apply per-instance. Recommended: Redis-based limiter for scale.
-   **CSP:** Content Security Policy allows `unsafe-inline` for scripts/styles to support Tailwind/Nuxt dev mode. For strict production, hash-based CSP is recommended.

## 5. Deployment Notes
-   Ensure `APP_SECRET` is set to a strong random string.
-   Run `npm run build` to generate the production artifact.
-   Use `DATABASE_URL` to point to the production DB.
