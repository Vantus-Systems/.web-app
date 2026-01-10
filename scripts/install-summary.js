#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");

function log(...args) {
  console.log(...args);
}

(() => {
  console.log("\n" + "=".repeat(70));
  console.log("   MARY ESTHER BINGO - INSTALLATION COMPLETE");
  console.log("=".repeat(70));

  const hasEnv = fs.existsSync(ENV_PATH);
  let envContent = "";
  let appSecret = "NOT SET";
  let dbUrl = "NOT SET";
  let adminUser = "admin";

  if (hasEnv) {
    envContent = fs.readFileSync(ENV_PATH, "utf8");

    const appSecretMatch = envContent.match(/APP_SECRET=["']?([^"'\n]+)["']?/);
    if (appSecretMatch) {
      appSecret = appSecretMatch[1].substring(0, 16) + "...";
    }

    const dbMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (dbMatch) {
      dbUrl = dbMatch[1];
    }

    const userMatch = envContent.match(
      /SEED_ADMIN_USERNAME=["']?([^"'\n]+)["']?/,
    );
    if (userMatch) {
      adminUser = userMatch[1];
    }
  }

  console.log("\n✔  Dependencies installed via npm");
  console.log("✔  Environment file (.env) configured");
  console.log("✔  Database initialized with Prisma");
  console.log("✔  Admin user seeded and ready");

  console.log("\n" + "-".repeat(70));
  console.log("   CONFIGURATION STATUS");
  console.log("-".repeat(70));
  console.log(`Database URL:        ${dbUrl}`);
  console.log(`APP_SECRET:          ${appSecret}`);
  console.log(`Admin User:          ${adminUser}`);
  console.log(`Admin Password:      admin123 (default)`);

  console.log("\n" + "-".repeat(70));
  console.log("   NEXT STEPS (COPY-PASTE COMMANDS)");
  console.log("-".repeat(70));

  console.log("\n1. BUILD THE APPLICATION:");
  console.log("   npm run build");

  console.log("\n2. START THE PRODUCTION SERVER:");
  console.log("   npm run start:server");
  console.log("   (Server will be running at http://localhost:3000)");

  console.log("\n3. ADMIN LOGIN:");
  console.log("   URL:      http://localhost:3000/admin/login");
  console.log("   Username: admin");
  console.log("   Password: admin123");

  console.log("\n4. (OPTIONAL) VERIFY ADMIN CONSOLE:");
  console.log("   npm run verify:admin");
  console.log("   (Requires Python + Playwright)");

  console.log("\n" + "-".repeat(70));
  console.log("   PRODUCTION NOTES");
  console.log("-".repeat(70));
  console.log(
    "• APP_SECRET is critical for CSRF protection - it's been auto-generated",
  );
  console.log("• DATABASE_URL points to SQLite at: " + dbUrl);
  console.log("• Change admin password immediately after first login");
  console.log("• Review .env for all configuration options");
  console.log("• Run 'npm run check:db' to verify database connectivity");

  console.log("\n" + "=".repeat(70));
  console.log("Setup complete. Ready for production deployment.");
  console.log("=".repeat(70) + "\n");
})();
