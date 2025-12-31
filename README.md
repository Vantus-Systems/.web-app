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
- **Database:** SQLite with Prisma ORM

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

   Tip: `npm run dev` runs a full dev server with API routes and is the recommended workflow while you iterate on server-side features.

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

   Important notes about previewing builds locally:
   - `npm run preview` and `node .output/server/index.mjs` will run the server runtime and make API routes available (unlike `serve -s .output/public` which only serves static files and will not expose server APIs).
   - In production builds the server may set the session cookie `auth_token` with the `Secure` attribute (meaning it will only be sent over HTTPS). For local development over plain HTTP either use `npm run dev` or use the provided convenience script `npm run start:local` which starts the built server with `NODE_ENV=development` and loads `.env` so cookies are set without `Secure` and will work on `http://localhost:3000`.

### Local database setup (SQLite)

- After cloning, `npm install` automatically provisions the SQLite database before anything else runs:

  ```bash
  npm install        # postinstall runs setup-db.js + nuxt prepare
  npm run dev
  ```

- The `postinstall` workflow (and the standalone `npm run setup:db`) does the following:
  - Uses `scripts/setup-db.js` to ensure a `DATABASE_URL` value exists, defaulting to the absolute `file://.../med.db` path.
  - Runs `npx prisma generate` to refresh the Prisma client.
  - Runs `npx prisma db push --accept-data-loss` so the SQLite schema matches `prisma/schema.prisma`.
  - Runs `npx prisma db seed` to load the out-of-the-box admin user + configuration JSON.
  - Runs `nuxt prepare` (from the `postinstall` hook) so Nuxt is ready for dev/build commands without needing extra setup.

- Manual helpers:
  - `npm run setup:db` or `npm run db:setup` re-runs the provisioning script if you ever delete `med.db` or want to reset the schema.
  - `npm run check:db` runs a simple Prisma query against `DATABASE_URL` to verify connectivity.
  - `npm run prisma:studio` opens the Prisma Studio database browser for inspection after setup completes.

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
  - `server/db/`: Prisma client and database configuration.
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
- `GET /api/health` - Application health check (database connectivity)

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
- **CSRF Protection:** Admin mutations require CSRF token verification.

## Data Persistence

The application uses SQLite with Prisma for data storage:

- `med.db` - SQLite database file
- Tables: `users`, `sessions`, `settings`, `messages` (managed by Prisma schema)

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
```

Note: these scripts require Python 3.8+ and Playwright; if you change the admin auth flow, update the verification scripts accordingly.

## Deployment

This application can be deployed to any Node.js-compatible hosting service (Vercel, Netlify, DigitalOcean, etc.).

```bash
npm run build
node .output/server/index.mjs
```

Alternatively, you can run `npm run start:server` after cloning; the helper script automatically runs `nuxt build` whenever the `.output/server/index.mjs` entrypoint is missing, so you don't need to build manually before starting the production runtime.

For production:

1. Set `NODE_ENV=production`
2. Replace the demo login in `server/api/auth/login.post.ts` with a secure username/password flow (use `getUserByUsername()` + `verifyPassword()`); rotate default credentials
3. Ensure `med.db` database is backed up and persistent across deploys
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
   - Follow existing patterns in similar endpoints
   - Update verification scripts if needed

## Notes & Troubleshooting

- Demo login: `server/api/auth/login.post.ts` uses a hardcoded password for demo use; replace before production and ensure sessions are created with the user's id.
- Playwright scripts assume the admin login flow and page structure; update them if you change auth or UI.
- Database: SQLite is file-backed; ensure `med.db` is writable and persistent in production.

## Health Checks & Monitoring

The application includes production-ready health checks and monitoring features:

### Health Endpoint

The `/api/health` endpoint provides a lightweight status check:

```bash
curl http://localhost:3000/api/health
# Returns: { "ok": true }
# Status codes:
#   200 - All systems operational, required tables present
#   503 - Database is missing required tables (settings, sessions)
#   500 - Database connectivity error
```

### CI Pipeline Health Check

GitHub Actions workflow (`.github/workflows/ci-health-check.yml`) automatically:
- Runs on every push to `main` and pull requests
- Executes: lint → typecheck → build → healthcheck → integration tests
- Fails the build if the health endpoint doesn't return 200 or if tables are missing

Run locally:

```bash
npm run build
npm run healthcheck       # Quick DB connectivity check
npm run test:integration  # Verify graceful degradation with missing tables
```

### Production Monitoring (Optional)

Enable health monitoring by setting the `MONITOR_URL` secret in GitHub repo settings:

1. Go to **Settings → Secrets and variables → Actions**
2. Create a new secret: `MONITOR_URL` = `https://your-production-app.com`
3. The `.github/workflows/scheduled-monitor.yml` workflow will:
   - Check `/api/health` every 15 minutes
   - Create a GitHub issue if health check fails
   - Include response details and timestamp for debugging

### Webhook Alerting (Optional)

To receive real-time alerts when the database is missing tables, set these environment variables:

```bash
# Alert webhook URL (e.g., Slack incoming webhook, custom service, etc.)
HEALTH_ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# How often to send alerts (default: 1 hour = 3600000 ms)
HEALTH_ALERT_TTL_MS=3600000

# Service name included in alert payload for identification
SERVICE_NAME=med-app
```

When tables are missing, the health endpoint will POST to the webhook with this JSON payload:

```json
{
  "timestamp": "2025-01-15T14:30:00Z",
  "service": "med-app",
  "env": "production",
  "missing": ["settings", "sessions"]
}
```

Alerts are throttled to prevent spam (default once per hour).

### Integration Tests

The test suite includes a scenario that verifies the application gracefully degrades when the database schema is missing:

```bash
npm run test:integration
```

This test:
1. Creates a temporary empty SQLite database
2. Starts the application server with the empty database
3. Calls `/api/health` and verifies it returns HTTP 503
4. Cleans up temporary files

This ensures that missing database tables don't cause unhandled crashes but instead return predictable error responses.

## License

Copyright © 2025 Mary Esther Bingo. All rights reserved.
