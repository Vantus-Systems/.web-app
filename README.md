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
  - If no `DATABASE_URL` is found and Docker is available (and accessible by your user), the script will start a local Postgres container (default name `med-postgres`) and configure `DATABASE_URL` in `.env` for you, then push the Prisma schema and run the seed.
  - The setup step is skipped in CI environments (`CI=true`) or when `SKIP_DB_SETUP=true`.

- Environment configuration / advanced options:
  - `POSTGRES_IMAGE` - override the image used to provision Postgres (default: `postgres:15-alpine`).
  - `POSTGRES_CONTAINER` - override the container name (default: `med-postgres`).
  - `DB_PROVISION_TIMEOUT_MS` - how long the script waits for Postgres readiness (default: `120000` ms).
  - `DB_PROVISION_INTERVAL_MS` - polling interval while waiting for readiness (default: `2000` ms).

- Manual commands & verification:
  - `npm run setup:db` or `npm run db:setup` to run the provisioning script by hand.
  - `npm run check:db` to verify your app can connect to the DB (runs a simple Prisma query).

- Troubleshooting:
  - If you see `permission denied while trying to connect to the Docker daemon socket`, fix it by adding your user to the docker group and re-login:
    ```bash
    sudo usermod -aG docker $USER
    # then log out & back in, or run:
    newgrp docker
    ```
  - If provisioning times out, inspect the container with:
    ```bash
    docker logs med-postgres --tail 50
    docker inspect med-postgres
    ```

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

Nice — the provisioning completed but there's room to harden the provisioning script and add a verification script. My next step is to add Docker permission checks, a robust readiness probe (pg_isready + checking container port mapping), a small `scripts/check-db.js` health-check script, and README updates; I'll start by creating a todo list and begin the first task.

Created 5 todos

Using "Replace String in File"


```

```


Read [](file:///home/meb/med/scripts/setup-db.js)

Proceeding to harden the provisioning loop and add robust readiness and port-mapping checks in setup-db.js. I'll replace the existing provisioning block with improved logic (timeout env vars, pg_isready probe, docker logs diagnostics, container port introspection).

Using "Replace String in File"


```

```


Ran Edit Block 
Completed with input: {
  "file_path": "/home/meb/med/scripts/check-db.js",
  "content": "#!/usr/bin/env node\n/* scripts/check-db.js\n   Simple DB connectivity check using Prisma Client. Loads .env if present.\n*/\nimport fs from \"fs\";\nimport path from \"path\";\nimport { PrismaClient } from \"@prisma/client\";\n\nfunction loadDotEnv() {\n  const envPath = path.join(process.cwd(), \".env\");\n  if (!fs.existsSync(envPath)) return;\n  const raw = fs.readFileSync(envPath, \"utf8\");\n  for (const line of raw.split(/\\r?\\n/)) {\n    const trimmed = line.trim();\n    if (!trimmed || trimmed.startsWith(\"#\")) continue;\n    const eq = trimmed.indexOf(\"=\");\n    if (eq === -1) continue;\n    const k = trimmed.slice(0, eq).trim();\n    let v = trimmed.slice(eq + 1).trim();\n    if ((v.startsWith('\"') && v.endsWith('\"')) || (v.startsWith(\"'\") && v.endsWith(\"'\"))) {\n      v = v.slice(1, -1);\n    }\n    if (!process.env[k]) process.env[k] = v;\n  }\n}\n\n(async () => {\n  loadDotEnv();\n  const prisma = new PrismaClient();\n  try {\n    console.log('[check-db] Connecting to database (DATABASE_URL from env or .env)...');\n    await prisma.$connect();\n    const res = await prisma.$queryRaw`SELECT 1 as ok`;\n    console.log('[check-db] Database connected OK:', res);\n    process.exit(0);\n  } catch (err) {\n    console.error('[check-db] DB connectivity check failed:', err && err.message ? err.message : err);\n    process.exit(1);\n  } finally {\n    await prisma.$disconnect();\n  }\n})();"
}

Ran Edit Block 
Completed with input: {
  "file_path": "/home/meb/med/scripts/check-db.js",
  "range": "1-9999",
  "content": "#!/usr/bin/env node\n/* scripts/check-db.js\n   Simple DB connectivity check using Prisma Client. Loads .env if present.\n*/\nimport fs from \"fs\";\nimport path from \"path\";\nimport { PrismaClient } from \"@prisma/client\";\n\nfunction loadDotEnv() {\n  const envPath = path.join(process.cwd(), \".env\");\n  if (!fs.existsSync(envPath)) return;\n  const raw = fs.readFileSync(envPath, \"utf8\");\n  for (const line of raw.split(/\\r?\\n/)) {\n    const trimmed = line.trim();\n    if (!trimmed || trimmed.startsWith(\"#\")) continue;\n    const eq = trimmed.indexOf(\"=\");\n    if (eq === -1) continue;\n    const k = trimmed.slice(0, eq).trim();\n    let v = trimmed.slice(eq + 1).trim();\n    if ((v.startsWith('\"') && v.endsWith('\"')) || (v.startsWith(\"'\") && v.endsWith(\"'\"))) {\n      v = v.slice(1, -1);\n    }\n    if (!process.env[k]) process.env[k] = v;\n  }\n}\n\n(async () => {\n  loadDotEnv();\n  const prisma = new PrismaClient();\n  try {\n    console.log('[check-db] Connecting to database (DATABASE_URL from env or .env)...');\n    await prisma.$connect();\n    const res = await prisma.$queryRaw`SELECT 1 as ok`;\n    console.log('[check-db] Database connected OK:', res);\n    process.exit(0);\n  } catch (err) {\n    console.error('[check-db] DB connectivity check failed:', err && err.message ? err.message : err);\n    process.exit(1);\n  } finally {\n    await prisma.$disconnect();\n  }\n})();"
}

Ran terminal command: cat > scripts/check-db.js <<'EOF'
#!/usr/bin/env node
/* scripts/check-db.js
   Simple DB connectivity check using Prisma Client. Loads .env if present.
*/
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

(async () => {
  loadDotEnv();
  const prisma = new PrismaClient();
  try {
    console.log('[check-db] Connecting to database (DATABASE_URL from env or .env)...');
    await prisma.$connect();
    const res = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('[check-db] Database connected OK:', res);
    process.exit(0);
  } catch (err) {
    console.error('[check-db] DB connectivity check failed:', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
EOF

# ensure it's executable
chmod +x scripts/check-db.js


Using "Replace String in File"


```

```


Using "Replace String in File"


```

```


Ran terminal command: npm run lint && npm run typecheck && npm run check:db

Ran terminal command: npm run lint && npm run typecheck && npm run check:db

Ran terminal command: npm run lint

Ran terminal command: npm run check:db

Ran terminal command: npm run setup:db

Ran terminal command: npm run typecheck

Ran terminal command: npx eslint scripts --ext .js

Ran terminal command: git status --porcelain && git add -A && git commit -m "chore(db): harden setup-db, add DB check script, document env vars"

Starting: *Add DB health-check script* (2/5)

Starting: *Run lint/typecheck and verify locally* (4/5)

Ran terminal command: npm run lint

Completed: *Run lint/typecheck and verify locally* (4/5)

Perfect! The DB provisioning is now hardened (Docker permission checks, container port detection, pg_isready readiness probe, configurable timeouts) and I added check-db.js + `npm run check:db` to verify the DB; next I can add a CI workflow to run the check automatically if you want.## Summary — What I changed ✅

- Fixed and hardened the automatic DB provisioning:
  - setup-db.js
    - Now verifies Docker is actually usable by the current user (runs `docker ps`) and provides a clear, actionable message if permissions are missing.
    - Detects host port mapping when an existing container is running (uses `docker port ...`) rather than assuming a new port mapping.
    - Uses a robust readiness probe (tries `docker exec <container> pg_isready` and inspects container logs for the "ready to accept connections" message).
    - Adds configurable timeouts/poll interval via env vars:
      - `DB_PROVISION_TIMEOUT_MS` (default 120000 ms)
      - `DB_PROVISION_INTERVAL_MS` (default 2000 ms)
    - Adds `POSTGRES_IMAGE` and `POSTGRES_CONTAINER` overrides.
    - Better diagnostic logs and helpful tips (how to inspect logs and fix permission errors).
- Added a small verification script:
  - check-db.js — loads .env if present and runs a quick Prisma query to confirm connectivity.
  - New npm script: `npm run check:db`
- Documentation:
  - README.md: updated Local DB setup section to document new env vars, troubleshooting steps, and `npm run check:db`.
- Testing & verification I ran locally:
  - `npm run setup:db` (idempotent; detected/used existing container, pushed schema, respected seeding)
  - `npm run check:db` — succeeded (connected to DB)
  - `vue-tsc --noEmit` (typecheck) — OK
  - `npx eslint scripts` (lint for changed scripts) — OK
- Committed the changes (on main): "chore(db): harden setup-db, add DB check script, document env vars"

---

## Why this fixes the issue 💡

- We observed earlier that sometimes Docker is installed but the current user can't access the Docker socket (permission denied). The script now detects that and prints an explicit fix (add user to `docker` group and re-login), rather than failing with a cryptic error.
- Some installs start a container that takes a little time to accept connections; instead of blindly retrying prisma push, the script now probes container readiness (pg_isready) and inspects logs to know when to run `prisma db push` + `prisma db seed`.
- If an existing named container is present, the script now discovers the container's host port mapping (so it uses the right port, not an assumed one).

---

## How to reproduce / verify (quick checklist) 🔧

1. Fresh clone → install:
   ```bash
   npm install
   # postinstall runs automatically (attempts DB provisioning)
   ```
2. Manual provisioning (if you want to run the script yourself):
   ```bash
   npm run setup:db     # or npm run db:setup
   npm run check:db     # verifies app can connect to DB via Prisma
   ```
3. If you hit a Docker socket permission error:
   ```bash
   sudo usermod -aG docker $USER
   # Re-login or run:
   newgrp docker
   # Then re-run the setup
   npm run setup:db
   ```

4. If provisioning times out, inspect container logs:
   ```bash
   docker logs med-postgres --tail 50
   docker inspect med-postgres
   ```

5. Override behavior:
   - `POSTGRES_IMAGE` — e.g. `POSTGRES_IMAGE=postgres:15-alpine npm run setup:db`
   - `POSTGRES_CONTAINER` — change name used for the container
   - `DB_PROVISION_TIMEOUT_MS` and `DB_PROVISION_INTERVAL_MS` for custom timeouts

---

## Next steps / options (pick one) ▶️

- I can add a GitHub Action to run `node scripts/check-db.js` (or run `npm run setup:db` inside a runner with Docker) so new changes are validated automatically (follow-up PR).
- I can run a full repo lint job and fix any remaining lint warnings (I ran lint on changed scripts and typecheck; full repo lint may take longer).
- Anything else you want automated in the provisioning (e.g., automatic `docker-compose.yml` or explicit health-check retries / log dumps on failure)?

---

If you want, I’ll:
- open a PR with these changes (if you prefer non-main commits), and/or
- add a simple CI workflow to exercise `check:db` and capture logs on failure.

Which would you like me to do next?

Made changes.