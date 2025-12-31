# Verification

## Static checks

- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Production build: `npm run build`

## Runtime smoke

1) Start a server:
   - dev: `npm run dev`
   - built: `npm run start:local`
2) Hit the health endpoint:
   - `GET http://localhost:3000/api/health` → `{ ok: true }`

## Admin console smoke (Playwright)

`npm run verify:admin` expects a server already running on `http://localhost:3000`.

Suggested flow:

1) `npm run dev`
2) in another terminal: `npm run verify:admin`

This script navigates to a small set of admin routes and fails on console errors.
