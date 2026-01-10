---
name: ops-deployment
description: Procedures for building, verifying, and deploying the application using custom scripts.
---

# Ops & Deployment

Project SENTINEL uses a custom build pipeline to ensure integrity and security.

## Build & Verification

### The "Build Proof" System
Instead of a standard build, the system requires a cryptographic proof of the build artifacts.
1.  **Run Build:**
    ```bash
    npm run build
    ```
    This triggers `scripts/generate-build-proof.mjs` automatically after Next.js build.
2.  **Output:** Generates a `build-proof.json` containing hashes of critical output files. This proof is verified during deployment.

## Deployment Scripts

### 1. Server Bootstrap (`bootstrap-ubuntu22.sh`)
Used for provisioning new Ubuntu 22.04 LTS servers.
*   **Usage:** `sudo ./scripts/bootstrap-ubuntu22.sh`
*   **Actions:** Installs Node.js, Nginx, Docker, and fail2ban. Sets up basic firewall rules.

### 2. Nginx Configuration (`generate-nginx-config.mjs`)
Generates the Nginx reverse proxy configuration based on environment variables.
*   **Usage:** `node scripts/generate-nginx-config.mjs`
*   **Output:** Prints valid Nginx config to stdout (pipe to `/etc/nginx/sites-available/default`).

### 3. Environment Security (`setup-env.js`)
Validates and encrypts environment secrets.
*   **Usage:** `node scripts/setup-env.js`
*   **Key Checks:** Ensures `DATABASE_URL` is SSL-enabled, `NEXTAUTH_SECRET` is of sufficient length.

## Deployment Workflow
1.  **Provision:** Run `bootstrap-ubuntu22.sh` on target.
2.  **Config:** Run `setup-env.js` to populate secrets.
3.  **Build:** Run `npm run build` (and verify proof).
4.  **Routing:** Run `generate-nginx-config.mjs` and reload Nginx.
