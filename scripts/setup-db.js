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

  if (!content.includes("DATABASE_URL") && !process.env.DATABASE_URL) {
    const dbUrl = pathToFileURL(DB_PATH).href;
    const line = `DATABASE_URL="${dbUrl}"\n# Production Environment\nNODE_ENV="production"\nSEED_ADMIN_PASSWORD="admin123"\n`;
    await fs.appendFile(ENV_PATH, line);
    log("Added default DATABASE_URL and SEED_ADMIN_PASSWORD to .env", dbUrl);
    process.env.DATABASE_URL = dbUrl;
    process.env.SEED_ADMIN_PASSWORD = "admin123";
  } else if (!process.env.DATABASE_URL) {
    // Extract existing DATABASE_URL for the current process
    const match = content.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  }

  if (process.env.DATABASE_URL) {
    const current = process.env.DATABASE_URL;
    // Normalize relative file: URLs to absolute paths to avoid ambiguous resolution in build/runtime
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

  // Ensure NODE_ENV is set if not present
  if (!content.includes("NODE_ENV") && IS_PROD) {
    await fs.appendFile(ENV_PATH, "NODE_ENV=\"production\"\n");
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
