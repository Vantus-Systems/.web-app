#!/usr/bin/env node
import { execSync } from "child_process";

function log(...args) {
  console.log("[postinstall]", ...args);
}

function run(cmd) {
  log("RUN:", cmd);
  execSync(cmd, { stdio: "inherit", shell: true });
}

function isProductionInstall() {
  // npm may set npm_config_production=true for prod installs; NODE_ENV is commonly set too.
  return (
    process.env.NODE_ENV === "production" ||
    process.env.npm_config_production === "true" ||
    process.env.NPM_CONFIG_PRODUCTION === "true"
  );
}

(() => {
  const prod = isProductionInstall();
  const skipDb = process.env.SKIP_DB_SETUP === "1";

  if (!prod && !skipDb) {
    try {
      run("node ./scripts/setup-db.js");
    } catch (err) {
      // Setup may fail on some developer machines (missing native binaries, permission issues,
      // or transient npx failures). Do not break `npm install` for non-production installs.
      log("Non-fatal: setup-db failed:", err && err.message ? err.message : err);
    }
  } else {
    log(
      prod
        ? "Production install detected; skipping automatic DB setup."
        : "SKIP_DB_SETUP=1; skipping automatic DB setup.",
    );
  }

  try {
    run("nuxt prepare");
  } catch (err) {
    // nuxt prepare can fail in environments without build toolchain available yet.
    // For development installs we log and continue so `npm install` succeeds.
    if (prod) {
      // In production we want the failure to surface so the deploy fails loudly.
      throw err;
    }
    log("Non-fatal: 'nuxt prepare' failed during postinstall:", err && err.message ? err.message : err);
  }
})();
