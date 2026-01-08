#!/usr/bin/env node
import { execSync } from "child_process";

function log(...args) {
  console.log("[setup-python]", ...args);
}

function run(cmd, ignoreError = false) {
  try {
    log("RUN:", cmd);
    execSync(cmd, { stdio: "inherit", shell: true });
    return true;
  } catch (err) {
    if (!ignoreError) {
      log("Command failed:", cmd, err.message);
    }
    return false;
  }
}

(() => {
  log("Checking Python environment for admin verification scripts...");

  let hasPython = false;
  try {
    execSync("python3 --version", { stdio: "ignore" });
    hasPython = true;
  } catch {
    log("python3 not found. Admin verification (playwright) will be unavailable.");
    process.exit(0); // Non-fatal
  }

  log("python3 found. Installing playwright package...");
  
  // Try to install playwright python package
  const pipInstalled = run("python3 -m pip install --upgrade pip playwright", true);
  
  if (pipInstalled) {
    log("Installing playwright browsers (chromium)...");
    // We try to install chromium. If it fails (e.g. missing system deps), 
    // we let the user know in the summary.
    run("python3 -m playwright install chromium", true);
  } else {
    log("Failed to install playwright via pip. You may need to install pip3 manually.");
  }

  log("Python setup attempt complete.");
})();
