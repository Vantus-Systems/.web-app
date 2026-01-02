# Wiring Audit Report

## 1. Architecture Overview
**Frontend**: Nuxt 4 (Vue 3 Composition API) + Tailwind CSS
- **State**: Pinia (`stores/ops.ts`) + Composables (`useAuthUser`, `useCsrf`).
- **Routing**: File-based (`pages/`).
- **API Client**: `$fetch` / `useFetch`.

**Backend**: Nitro Server (`server/api/`)
- **Database**: SQLite via Prisma ORM.
- **Auth**: Session-based (custom `sessions` table).
- **Validation**: Zod (in some handlers).

**Key Modules**:
- **Admin**: Operations (Schedule/Pricing), People (Users), MIC (Shifts/Money), Progressives.
- **Public**: Schedule, Pricing, Programs (read-only from same DB).

## 2. API Inventory & Wiring Status

| Endpoint | Method | Called From (Frontend) | Handler (Backend) | Status | Notes |
|----------|--------|------------------------|-------------------|--------|-------|
| `/api/auth/login` | POST | `pages/admin/login.vue` | `server/api/auth/login.post.ts` | ✅ Wired | |
| `/api/auth/logout` | POST | `useAuthUser`, Admin Shell | `server/api/auth/logout.post.ts` | ✅ Wired | |
| `/api/auth/user` | GET | `useAuthUser`, Admin Pages | `server/api/auth/user.get.ts` | ✅ Wired | |
| `/api/admin/users` | GET | `pages/admin/people/index.vue` | `server/api/admin/users.get.ts` | ✅ Wired | |
| `/api/admin/users` | POST | `pages/admin/people/index.vue` | `server/api/admin/users.post.ts` | ✅ Wired | |
| `/api/admin/users/[id]` | PATCH | `pages/admin/people/index.vue` | `server/api/admin/users/[id].patch.ts` | ✅ Wired | Hardened |
| `/api/admin/users` | DELETE | `pages/admin/people/index.vue` | `server/api/admin/users.delete.ts` | ✅ Wired | |
| `/api/jackpot` | GET | `pages/admin/progressives.vue` | `server/api/jackpot.get.ts` | ✅ Wired | Auto-increment added |
| `/api/admin/jackpot` | POST | `pages/admin/progressives.vue` | `server/api/admin/jackpot.post.ts` | ✅ Wired | |
| `/api/admin/shift-records` | GET | `pages/admin/mic/index.vue` | `server/api/admin/shift-records.get.ts` | ✅ Wired | |
| `/api/admin/shift-records` | POST | `ShiftDepositCard.vue` | `server/api/admin/shift-records.post.ts` | ⚠️ Verify | Check payload match |
| `/api/admin/schedule/doors-open` | POST | `pages/admin/index.vue` | `server/api/admin/schedule/doors-open.post.ts` | ⚠️ Verify | Check connection |
| `/api/admin/ops-schema` | GET/POST | `stores/ops.ts` | `server/api/admin/ops-schema.post.ts` | ✅ Wired | |

## 3. Broken / Missing Wiring
*   **Shift Deposit**: Need to verify `ShiftDepositCard.vue` submits to the correct endpoint and payload matches Prisma schema (`shiftRecord`).
*   **Doors Open**: Need to verify `pages/admin/index.vue` calls `/api/admin/schedule/doors-open`.
*   **W2G**: Need to check if it saves data or just prints.

## 4. Verification Plan
*   **Smoke Test**: Create a script to hit health, auth, and config endpoints.
*   **Manual**: Verify "Doors Open" save persists.
