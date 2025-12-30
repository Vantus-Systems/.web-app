# Mary Esther Bingo - Project Architecture

## Overview
A Nuxt 3 full-stack web application for managing a bingo hall in Mary Esther, FL.

## Tech Stack
- **Frontend**: Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Pinia
- **Backend**: Nitro server, H3 event handlers
- **Database**: SQLite (Prisma ORM)
- **Auth**: Argon2id password hashing, SHA256 token hashing, session-based
- **Validation**: Zod schemas

## Architecture Patterns
- **File-Based Routing**: `/pages` directory
- **API Routes**: `/server/api` with H3 handlers
- **Middleware**: Server (`/server/middleware`) and client (`/middleware`)
- **Composables**: Reusable logic in `/composables`
- **Services**: Business logic in `/server/services`
- **Stores**: Pinia state management in `/stores`

## Key Features
1. Public-facing pages (schedule, pricing, programs, contact)
2. Admin panel with role-based access (OWNER, MIC, CHARITY, CALLER)
3. Operations schema management (pricing, schedules, day profiles)
4. Shift record tracking
5. Pattern and program management for bingo games
6. Contact form with message tracking
7. Audit logging for sensitive operations

## Security Model
- Session-based authentication with HTTP-only cookies
- Role-based authorization via `assertRole()` utility
- Password hashing with Argon2id
- Session tokens hashed with SHA256
- Prisma ORM prevents SQL injection
- All admin routes protected by middleware

## Data Storage
- **Prisma/SQLite**: Users, sessions, audit logs, patterns, programs, games, shift records, holiday rules, contact messages, settings
- **JSON Files** (legacy, being migrated): `/server/data/*.json`

## Critical Dependencies
- `@prisma/client`: Database ORM
- `argon2`: Password hashing
- `zod`: Runtime type validation
- `nuxt-security`: Security headers module (needs review)
- `@vueuse/core`: Composable utilities
- `@pinia/nuxt`: State management
