# ARCHITECTURE_MAP

## Stack
- Framework: Nuxt 4.2 (Vue 3, Nitro/H3 server) with Tailwind, nuxt-security, sitemap, @nuxt/image, Pinia, vueuse
- Server runtime: Nuxt/Nitro (H3 handlers under server/api)
- ORM/DB: Prisma 5.22 targeting SQLite (DATABASE_URL env) with rich schema for users, sessions, shifts, incidents, programs, pricing, settings
- Auth: Cookie-based session tokens (auth_token + csrf_token), argon2 password hashing, middleware-driven auth+role enforcement

## Modules
- Frontend: Nuxt pages under `pages/**`, shared components in `components/**`, Tailwind CSS in `assets/css/tailwind.css`
- Admin: Admin shells/components under `components/admin/**`; admin pages under `pages/admin/**` with role middleware
- APIs: REST-style H3 handlers under `server/api/**`, split by domain (auth, business, pricing, programs, admin/*)
- Services: Business logic/services in `server/services/**`; schemas in `server/schemas/**`; middleware in `server/middleware/**`

## Notes
- Pending full review.
