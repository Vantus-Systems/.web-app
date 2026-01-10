import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";
import { pathToFileURL } from "url";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const DB_PATH = path.join(ROOT, "med.db");

const IS_PROD = process.env.NODE_ENV === "production";

function boolEnv(name, defaultValue = false) {
  const raw = process.env[name];
  if (raw == null) return defaultValue;
  return raw === "1" || raw.toLowerCase() === "true";
}

function log(...args) {
  console.log("[setup-db]", ...args);
}

async function ensureEnv() {
  let content = "";
  try {
    content = await fs.readFile(ENV_PATH, "utf8");
  } catch {
    if (IS_PROD) {
      log("Creating new .env file in production (requested full setup)");
    } else {
      log("Creating new .env file");
    }
  }

  const { randomBytes } = await import("crypto");
  const updates = [];

  // DATABASE_URL
  if (!content.includes("DATABASE_URL") && !process.env.DATABASE_URL) {
    const dbUrl = pathToFileURL(DB_PATH).href;
    updates.push(`DATABASE_URL="${dbUrl}"`);
    log("Adding DATABASE_URL to .env");
    process.env.DATABASE_URL = dbUrl;
  } else if (!process.env.DATABASE_URL) {
    const match = content.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  }

  // APP_SECRET (required for production CSRF)
  if (!content.includes("APP_SECRET") && !process.env.APP_SECRET) {
    const secret = randomBytes(32).toString("hex");
    updates.push(`APP_SECRET="${secret}"`);
    log(
      "Generated and added APP_SECRET to .env (required for production CSRF protection)",
    );
    process.env.APP_SECRET = secret;
  } else if (!process.env.APP_SECRET) {
    const match = content.match(/APP_SECRET=["']?([^"'\n]+)["']?/);
    if (match) {
      process.env.APP_SECRET = match[1];
    }
  }

  // NODE_ENV
  if (!content.includes("NODE_ENV")) {
    updates.push(`NODE_ENV="production"`);
  }

  // SEED_ADMIN_PASSWORD
  if (
    !content.includes("SEED_ADMIN_PASSWORD") &&
    !process.env.SEED_ADMIN_PASSWORD
  ) {
    updates.push(`SEED_ADMIN_PASSWORD="admin123"`);
    log("Added SEED_ADMIN_PASSWORD to .env (default: admin123)");
    process.env.SEED_ADMIN_PASSWORD = "admin123";
  } else if (!process.env.SEED_ADMIN_PASSWORD) {
    const match = content.match(/SEED_ADMIN_PASSWORD=["']?([^"'\n]+)["']?/);
    if (match) {
      process.env.SEED_ADMIN_PASSWORD = match[1];
    }
  }

  // SEED_ADMIN_USERNAME
  if (
    !content.includes("SEED_ADMIN_USERNAME") &&
    !process.env.SEED_ADMIN_USERNAME
  ) {
    updates.push(`SEED_ADMIN_USERNAME="admin"`);
    process.env.SEED_ADMIN_USERNAME = "admin";
  } else if (!process.env.SEED_ADMIN_USERNAME) {
    const match = content.match(/SEED_ADMIN_USERNAME=["']?([^"'\n]+)["']?/);
    if (match) {
      process.env.SEED_ADMIN_USERNAME = match[1];
    }
  }

  // Write all updates at once
  if (updates.length > 0) {
    await fs.appendFile(ENV_PATH, "\n" + updates.join("\n") + "\n");
  }

  // Normalize DATABASE_URL paths
  if (process.env.DATABASE_URL) {
    const current = process.env.DATABASE_URL;
    if (current.startsWith("file:") && !current.startsWith("file:/")) {
      const rel = current.replace("file:", "");
      const abs = pathToFileURL(path.resolve(ROOT, rel)).href;
      if (content.includes(current)) {
        const newContent = content.replace(current, abs);
        await fs.writeFile(ENV_PATH, newContent, "utf8");
      }
      log("Normalized DATABASE_URL to absolute path:", abs);
      process.env.DATABASE_URL = abs;
    }
  }
}

function runCmd(cmd) {
  log("RUN:", cmd);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    log(`Command failed: ${cmd}`);
    throw e;
  }
}

async function main() {
  log("Starting SQLite database setup...");

  const runSeed = boolEnv("RUN_DB_SEED", !IS_PROD);

  await ensureEnv();

  log("Generating Prisma client...");
  runCmd("npx prisma generate");

  log("Applying migrations...");
  // Non-destructive, CI/prod-safe path. Works for SQLite and other providers.
  try {
    runCmd("npx prisma migrate deploy");
  } catch (err) {
    if (!IS_PROD) {
      log(
        "migrate deploy failed; attempting to resolve roles_shifts as applied and retry...",
      );
      try {
        // Mark the migration as applied so Prisma won't try to rerun the failing DDL.
        runCmd(
          "npx prisma migrate resolve --applied 20251230120000_roles_shifts",
        );
        // Retry deploy to ensure the rest of the migrations are recorded.
        runCmd("npx prisma migrate deploy");
      } catch {
        log("Automatic migration recovery failed; see error above.");
        throw err;
      }
    } else {
      throw err;
    }
  }

  if (runSeed) {
    log("Seeding database...");
    runCmd("npx prisma db seed");
  } else {
    log("RUN_DB_SEED disabled; skipping database seed.");
  }

  log("Database setup complete!");
}

main().catch((e) => {
  console.error("Setup failed:", e);
  process.exit(1);
});
