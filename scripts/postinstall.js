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

  // Run DB setup regardless of environment unless explicitly skipped.
  // The setup-db script is now smart enough to handle production safely.
  if (!skipDb) {
    try {
      run("node ./scripts/setup-db.js");
    } catch (err) {
      log("Note: setup-db encountered an issue (non-fatal):", err.message);
    }
  }

  // Try to setup python environment for verification scripts
  try {
    run("node ./scripts/setup-python.js");
  } catch (err) {
    log("Note: setup-python encountered an issue (non-fatal):", err.message);
  }

  try {
    run("nuxt prepare");
  } catch (err) {
    if (prod) {
      // In production we want the failure to surface so the deploy fails loudly.
      throw err;
    }
    log(
      "Non-fatal: 'nuxt prepare' failed during postinstall:",
      err && err.message ? err.message : err,
    );
  }

  // Final summary and next steps
  try {
    run("node ./scripts/install-summary.js");
  } catch (err) {
    // ignore summary errors
  }
})();
