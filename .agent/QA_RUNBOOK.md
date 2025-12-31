# QA_RUNBOOK

## Baseline commands
- Install: `npm install`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Tests: (none defined beyond custom scripts; use `npm run verify:admin` for Playwright-style check)
- Build: `npm run build`

## Expected outcomes
- Document results for each run.

## Run log
- 2025-12-31: `npm install` ✅ (postinstall ran setup-db + nuxt prepare; Prisma db push/seed succeeded; 0 vulnerabilities reported)
