# Mary Esther Bingo

Official website for Mary Esther Bingo, a premier entertainment venue in Florida. This project is built with **Nuxt 3**, **Tailwind CSS**, and **Pinia** to deliver a "Fortune 10000" quality digital experience.

## Features

- **High-End Design:** Custom Emerald & Gold theme using Tailwind CSS.
- **Performance:** Optimized images (`@nuxt/image`) and fonts (`@nuxtjs/google-fonts`).
- **State Management:** Pinia for managing global state (e.g., Progressive Jackpot ticker).
- **SEO & Accessibility:** Full Schema.org integration, semantic HTML, and ARIA compliance.
- **Forms:** Contact form validation using Zod with server-side rate limiting and spam protection.
- **Data:** Centralized business configuration for easy updates (`utils/business.ts`).
- **Authentication:** Admin portal with session-based authentication. Note: the project includes a demo password-only login endpoint (`server/api/auth/login.post.ts`) that accepts the hardcoded password `admin123` for convenience; proper user-based auth is implemented in `server/utils/users.ts` (PBKDF2 hashes) and should be used in production.
- **Real-time Updates:** Jackpot ticker refreshes every 5 minutes.
- **Daily Specials:** Mary Esther Bingo is the only Fort Walton hall running session every day, and we highlight the hero specials with time-based offers and nearby halls (Crestview, Pensacola, Panama City).

## Tech Stack

- **Framework:** [Nuxt 3](https://nuxt.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide Vue](https://lucide.dev/)
- **Animation:** [VueUse Motion](https://motion.vueuse.org/)
- **Validation:** [Zod](https://zod.dev/) for server-side validation
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Server Runtime:** [H3](https://h3.unjs.io/)

## Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Development Server:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

3. **Linting & Type Checking:**
   ```bash
   npm run lint
   npm run typecheck
   ```

4. **Build & Preview:**
   ```bash
   npm run build
   npm run preview   # quick preview of the production build
   # or run the built server directly
   node .output/server/index.mjs
   ```

### Local database setup (new)

- After cloning, a simple setup flow is:

  ```bash
  npm install
  npm run postinstall   # runs DB setup (if necessary), generates Prisma client, prepares Nuxt
  npm run generate
  npm run start
  ```

- What happens during `postinstall`:
  - If a valid `DATABASE_URL` is already present, Prisma schema will be pushed and seeds applied.
  - If no `DATABASE_URL` is found and Docker is available, the script will start a local Postgres container (`med-postgres`) and configure `DATABASE_URL` in `.env` for you and then push the Prisma schema and run the seed.
  - The setup step is skipped in CI environments (when `CI=true`) or when `SKIP_DB_SETUP=true`.

- Manual commands (if you prefer to run only DB setup):
  - `npm run setup:db` or `npm run db:setup`

- If you don't want automatic DB provisioning, set `SKIP_DB_SETUP=true` in your environment.

## Project Structure

- `assets/`: Global styles and images.
- `components/`: Reusable Vue components (UI kit).
- `layouts/`: Page layouts (Navigation, Footer).
- `pages/`: Application routes (Home, Schedule, Pricing, About, Contact, House Rules, Privacy, Admin).
- `stores/`: Pinia stores (Jackpot logic).
- `utils/`: Business constants (`business.ts`) and utility functions (`cn.ts`).
- `server/`: Backend API and data persistence.
  - `server/api/`: H3 API endpoints (public and admin).
  - `server/data/`: JSON file-based data storage (users, sessions, messages, etc.).
  - `server/utils/`: Auth, sessions, storage, and user management utilities.
- `verification/`: Playwright-based E2E verification scripts.

## Admin Portal

The application includes an admin portal at `/admin/login`. Authentication now uses **username + password**:

- Login accepts `{ username, password }` and verifies credentials using `server/utils/users.ts` (`getUserByUsername()` + `verifyPassword()`).
- On success, the server sets a session cookie `auth_token` (httpOnly) and a client-visible `admin_auth` flag cookie for client-side navigation guards.
- A default admin account exists for initial setup; credentials are `admin` / `admin123` (created by `server/utils/users.ts` when `server/data/users.json` is missing). Change this password immediately in production.

### Admin Features
- User management (create/update users with roles: admin/mic)
- Business information updates
- Jackpot value management
- Message inbox

## API Endpoints

### Public Endpoints
- `GET /api/business` - Business configuration
- `GET /api/jackpot` - Current jackpot value
- `GET /api/schedule` - Schedule data
- `GET /api/pricing` - Pricing information
- `GET /api/specials` - Daily specials (Fort Walton time zone, hero note, and weekly offers)
- `POST /api/contact` - Contact form submission (with rate limiting)

### Admin Endpoints (Require authentication)
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create/update user
- `DELETE /api/admin/users` - Delete user
- `POST /api/admin/business` - Update business info
- `POST /api/admin/jackpot` - Update jackpot value
- `POST /api/admin/schedule` - Update schedule
- `POST /api/admin/pricing` - Update pricing
- `POST /api/admin/specials` - Update the daily specials hero content
- `GET /api/admin/messages` - List contact messages

## Authentication & Security

- **Sessions:** Token-based sessions stored in `server/data/sessions.json`.
- **Cookies:** Server sets `auth_token` (httpOnly) for server sessions; the admin UI sets a client-only `admin_auth` cookie to gate client-side navigation to `/admin/*`.
- **Password Hashing:** PBKDF2 (100,000 iterations, SHA-512) used by `server/utils/users.ts`.
- **Rate Limiting:** Login attempts and contact form submissions are rate-limited (in-memory maps).
- **Spam Protection:** Contact form contains a honeypot field `website` to reduce bot spam.

## Data Persistence

The application uses JSON files for data storage:
- `server/data/users.json` - User accounts
- `server/data/sessions.json` - Active sessions
- `server/data/messages.json` - Contact form submissions
- `server/data/business.json` - Business configuration
- `server/data/jackpot.json` - Jackpot value
- `server/data/schedule.json` - Schedule data
- `server/data/pricing.json` - Pricing data
- `server/data/specials.json` - Daily specials hero + weekly offerings and timezone metadata

## Verification & Testing

The project includes Playwright-based verification scripts (Python). These scripts expect a running dev server at `http://localhost:3000` and will capture screenshots (saved to `verification/` or the project root).

Install Playwright and the browsers (Python):

```bash
python3 -m pip install --user playwright
python3 -m playwright install
```

Run the scripts (after starting the dev server):

```bash
npm run dev
python3 verify_homepage.py
python3 verification/verify_admin.py
python3 verification/verify_new_features.py
```

`verification/verify_new_features.py` now confirms the Daily Specials hero loads on the homepage.

Note: these scripts require Python 3.8+ and Playwright; if you change the admin auth flow, update the verification scripts accordingly.

## Deployment

This application can be deployed to any Node.js-compatible hosting service (Vercel, Netlify, DigitalOcean, etc.).

```bash
npm run build
node .output/server/index.mjs
```

For production:
1. Set `NODE_ENV=production`
2. Replace the demo login in `server/api/auth/login.post.ts` with a secure username/password flow (use `getUserByUsername()` + `verifyPassword()`); rotate default credentials
3. Ensure `server/data/` directory is writable and persistent across deploys
4. Configure secrets and environment variables as needed (e.g., secure cookie flags depend on `NODE_ENV`) 

## Development Workflow

1. **Before committing:**
   ```bash
   npm run lint:fix
   npm run typecheck
   ```

2. **Testing changes:**
   - Run dev server: `npm run dev`
   - Run verification scripts to ensure functionality
   - Check browser console for errors

3. **Adding new features:**
   - Use Zod for validation in API endpoints
   - Use `requireAuth()` for protected routes
   - Use `readJson`/`writeJson` from `server/utils/storage.ts` for data operations
   - Update verification scripts if needed

## Notes & Troubleshooting

- Demo login: `server/api/auth/login.post.ts` uses a hardcoded password for demo use; replace before production and ensure sessions are created with the user's id.
- Playwright scripts assume the admin login flow and page structure; update them if you change auth or UI.
- Storage: `server/data/` is file-backed and lacks concurrency protections; avoid concurrent writes in production unless migrated to a proper DB.

## License

Copyright © 2025 Mary Esther Bingo. All rights reserved.
