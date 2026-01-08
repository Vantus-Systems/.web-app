#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");

function log(...args) {
  console.log(...args);
}

(() => {
  console.log("\n" + "=".repeat(60));
  console.log("   MARY ESTHER BINGO - INSTALLATION SUMMARY");
  console.log("=".repeat(60));

  const hasEnv = fs.existsSync(ENV_PATH);
  
  console.log("\n[✔] Dependencies installed via npm.");
  
  if (hasEnv) {
    console.log("[✔] Environment file (.env) created/updated.");
  } else {
    console.log("[!] Warning: .env file missing. Run 'npm run setup:db' to create it.");
  }

  console.log("[✔] Database migrations and client generation attempted.");
  
  console.log("\n" + "-".repeat(60));
  console.log("   NEXT STEPS (COPY-PASTE COMMANDS)");
  console.log("-".repeat(60));

  console.log("\n1. BUILD THE APPLICATION:");
  console.log("   npm run build");

  console.log("\n2. RUN THE PRODUCTION SERVER:");
  console.log("   npm run start:server");

  console.log("\n3. (OPTIONAL) VERIFY ADMIN CONSOLE (Requires Python + Playwright):");
  console.log("   # If playright setup failed during install, run:");
  console.log("   # python3 -m pip install playwright && python3 -m playwright install --with-deps chromium");
  console.log("   npm run verify:admin");

  console.log("\n4. ACCESS THE SITE:");
  console.log("   Default Port: 3000 (Localhost)");
  console.log("   Admin Login: http://localhost:3000/admin/login");
  console.log("   Default Admin credentials:");
  console.log("     Username: admin");
  console.log("     Password: admin123 (Change this in .env SEED_ADMIN_PASSWORD if needed)");

  console.log("\n" + "=".repeat(60));
  console.log("Setup complete for the current user in: " + ROOT);
  console.log("For issues, check the logs or run 'npm run check:db' to verify database connectivity.");
  console.log("=".repeat(60) + "\n");
})();
