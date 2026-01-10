# System Logic & Operations

This document outlines the internal operational logic of Project SENTINEL. It serves as a reference for the "plumbing" that secures and powers the application.

## 1. Authentication & Identity

The system uses **NextAuth.js** for identity management, backed by a custom Prisma adapter and hardened security middlewares.

### NextAuth Configuration
**Source:** `lib/auth.ts`
The application implements a multi-provider strategy:
*   **Credentials Provider:** Standard email/password flow using Argon2 for hashing.
*   **Callbacks:**
    *   `jwt`: Augments the token with `userId`, `role`, and `tenantId`.
    *   `session`: Persists the JWT claims into the client-side session object.
*   **Events:** `signIn` events trigger an audit log entry via the `AuditLog` service.

### Session Handling
Sessions are primarily **stateless (JWT)** to ensure edge compatibility.
*   **Persistence:** The JWT is signed with `NEXTAUTH_SECRET` and stored in a generic `__Secure-next-auth.session-token` cookie.
*   **Validation:** Middleware verifies the signature on every protected route.
*   **Revocation:** While stateless, a `sessionVersion` counter in the User model allows for global revocation (if the token version < user version, the request is rejected).

### MFA Flow
**Source:** `lib/security/mfa.ts`
Multi-Factor Authentication is enforced for `Owner` and `Admin` roles.
1.  **Setup:** Generates a generic TOTP secret (encrypted in DB) and a QR code data URL.
2.  **Verification:** Uses `otplib` to verify the 6-digit token against the stored secret within a 30-second window.
3.  **Backup Codes:** A set of 10 one-time-use recovery codes is generated upon setup and stored hashed.

### RBAC Enforcer
**Source:** `middleware.ts`, `lib/admin/guards.ts`
Access control is enforced at the edge:
1.  **Hierarchy:** `Owner` > `Admin` > `Editor` > `Analyst`.
2.  **Logic:**
    *   `middleware.ts`: preventing unauthenticated access to `/dashboard/*`.
    *   `guards.ts`: `requireRole('ADMIN')` throws a `403 Forbidden` if the user's role index is lower than the required threshold.

## 2. Security Defense Layers

The application employs a "Defense in Depth" strategy.

### Request Validation
**Source:** `lib/security/request.ts`, `lib/security/origin.ts`
*   **CSRF:** Custom Double-Submit Cookie pattern for API routes not handled by NextAuth.
*   **Origin Check:** `origin.ts` strictly validates the `Origin` and `Referer` headers against `NEXT_PUBLIC_APP_URL` to prevent cross-origin attacks.
*   **Zod Schemas:** All API inputs are strictly typed and validated before processing.

### Data Redaction
**Source:** `lib/security/redact.ts`
Outgoing data is sanitized to prevent leakage:
*   **Strip List:** `passwordHash`, `mfaSecret`, `backupCodes`, `stripeId`.
*   **Implementation:** A recursive function traverses the response object. If a key matches the blocklist, it is replaced with `[REDACTED]`.

### Secure Headers
**Source:** `app/api/proof/headers/route.ts`
The application applies rigorous HTTP headers:
*   `Content-Security-Policy`: Default src 'self'; script-src 'self' 'nonce-...'.
*   `Strict-Transport-Security`: max-age=63072000; includeSubDomains; preload.
*   `X-Content-Type-Options`: nosniff.

### Upload Security
**Source:** `lib/security/upload.ts`
*   **File Types:** Whitelist enforcement (PDF, PNG, JPG). Magic number verification is used to prevent extension spoofing.
*   **Sanitization:** Filenames are UUID-renamed (`uuid.v4() + ext`) to prevent directory traversal or shell injection attacks.
*   **Storage:** Files are streamed directly to S3 (or compatible blob storage) without touching the local disk.

## 3. "Hidden" Operations

### Soft Deletion Strategy
**Source:** `prisma/schema.prisma`
Entities such as `Tenant`, `Project`, and `Contract` are never immediately removed.
*   **Schema:** Models include a `deletedAt DateTime?` field.
*   **Logic:**
    *   **Delete:** Sets `deletedAt = now()`.
    *   **Query:** All `findMany` and `findFirst` calls must include `where: { deletedAt: null }`.
    *   **Prune:** A cron job permanently removes soft-deleted records older than 30 days.

### Audit Logging
**Source:** `lib/audit/logger.ts`
*   **Trigger:** Mutations in `/admin` or sensitive User actions (Login, Password Change).
*   **Capture:**
    *   **Actor:** `userId` of the requester.
    *   **Action:** e.g., `PROJECT_UPDATE`, `USER_PROMOTE`.
    *   **Diff:** Captures the `before` and `after` state (JSON) for data integrity verification.

### Job Queues
**Source:** `lib/jobs/`
Background processing is handled via a Redis-backed queue (BullMQ).
*   **Worker:** `scripts/worker.ts` runs a dedicated process.
*   **Queues:**
    *   `contract-reminders`: Sends emails 30 days before contract expiry.
    *   `report-generation`: Heavy computation for monthly PDF reports.
    *   `webhook-delivery`: Retries failed webhook events to external subscribers.

### Cron Tasks
**Source:** `app/api/cron/`
Vercel Cron is used to trigger endpoints:
*   `clean-soft-deletes`: Daily at 00:00 UTC.
*   `snapshot-metrics`: Hourly capture of system KPIs.
*   `sync-stripe`: Daily reconciliation of payment status.

## 4. Business Logic Engines

### Revenue Leak Detection
**Source:** `lib/revenue-leak/model.ts`
A heuristic engine analyzes `Invoice` vs `Contract` data.
*   **Logic:** Calculates `contractValue / duration` vs `billedAmount`.
*   **Flag:** If `billedAmount` < (`expectedMonthly` * `threshold`), a "Leak" alert is generated.
*   **Utilization:** Also checks `Environment` resource usage (e.g., active servers) against the `Contract` limits.

### Server Configurator
**Source:** `lib/server-config/engine.ts`
A rules-based recommendation engine for the "Hardware" aspect of the portfolio.
*   **Inputs:** `concurrency`, `storageReq`, `budget`.
*   **Rules:**
    *   If `concurrency > 1000`, recommend `Cluster` type.
    *   If `compliance == 'HIPAA'`, force `Dedicated` tenancy.
*   **Output:** Returns a specific `SKU` configuration and estimated monthly cost.
