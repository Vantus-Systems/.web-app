# Production Runbook

## 1. Environment Setup
Copy `.env.example` to `.env` and populate secrets:
```bash
cp .env.example .env
nano .env
```
**Critical Vars:**
- `APP_SECRET`: Must be a long random string (e.g., `openssl rand -hex 32`).
- `DATABASE_URL`: Connection string.

## 2. Database Migration
Run Prisma migrations to ensure the DB schema is up to date:
```bash
npx prisma migrate deploy
```
*Note: Do not run `migrate dev` in production.*

## 3. Build & Deploy
Build the application:
```bash
npm install
npm run build
```
The output will be in `.output/`.

Start the server:
```bash
node .output/server/index.mjs
```

## 4. Rollback Procedure
If a deployment fails:
1.  Revert the application code/binary to the previous version.
2.  If database migrations were applied, check if they are backward compatible. If not, maintainance window may be required to restore DB backup.
3.  Restart the service.

## 5. Backup Strategy
-   **SQLite:** Periodic copy of `med.db` to S3/Cloud Storage.
-   **Postgres:** `pg_dump` daily.

## 6. Monitoring
-   Check `GET /api/health` for DB connectivity.
-   Monitor logs for `[audit]` entries to track admin actions.
