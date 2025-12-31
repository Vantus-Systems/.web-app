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
    run("node ./scripts/setup-db.js");
  } else {
    log(
      prod
        ? "Production install detected; skipping automatic DB setup."
        : "SKIP_DB_SETUP=1; skipping automatic DB setup.",
    );
  }

  run("nuxt prepare");
})();
