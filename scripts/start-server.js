#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync, spawn } from "child_process";

const ROOT = process.cwd();
const SERVER_ENTRY = path.join(ROOT, ".output", "server", "index.mjs");

function log(...args) {
  console.log("[start-server]", ...args);
}

function ensureBuild() {
  if (fs.existsSync(SERVER_ENTRY)) {
    log("Build already exists, skipping nuxt build.");
    return;
  }

  log("Built server entry not found. Running \"npx nuxt build\"...");
  execSync("npx nuxt build", { stdio: "inherit", shell: true });

  if (!fs.existsSync(SERVER_ENTRY)) {
    throw new Error("Nuxt build did not produce .output/server/index.mjs");
  }
}

function startServer() {
  if (process.env.SKIP_SERVER === "1") {
    log("SKIP_SERVER=1, exiting after ensuring build.");
    process.exit(0);
  }

  const child = spawn(process.execPath, [SERVER_ENTRY, ...process.argv.slice(2)], {
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

(async () => {
  ensureBuild();
  startServer();
})();