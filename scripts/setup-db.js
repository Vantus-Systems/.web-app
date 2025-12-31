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
  if (IS_PROD) {
    // In production we do not auto-create/modify .env. The process manager should inject env vars.
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required in production. Set it via environment variables (or an EnvironmentFile).",
      );
    }
    return;
  }

  let content = "";
  try {
    content = await fs.readFile(ENV_PATH, "utf8");
  } catch {
    log("Creating new .env file");
  }

  if (!content.includes("DATABASE_URL")) {
    const dbUrl = pathToFileURL(DB_PATH).href;
    const line = `DATABASE_URL="${dbUrl}"\n`;
    await fs.appendFile(ENV_PATH, line);
    log("Added DATABASE_URL to .env", dbUrl);
    process.env.DATABASE_URL = dbUrl;
  } else {
    // Extract existing DATABASE_URL for the current process
    const match = content.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) {
      const current = match[1];
      // Normalize relative file: URLs to absolute paths to avoid ambiguous resolution in build/runtime
      if (current.startsWith("file:") && !current.startsWith("file:/")) {
        const rel = current.replace("file:", "");
        const abs = pathToFileURL(path.resolve(ROOT, rel)).href;
        content = content.replace(match[0], `DATABASE_URL="${abs}"`);
        await fs.writeFile(ENV_PATH, content, "utf8");
        log("Normalized DATABASE_URL in .env to absolute path:", abs);
        process.env.DATABASE_URL = abs;
      } else {
        process.env.DATABASE_URL = current;
      }
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
        runCmd("npx prisma migrate resolve --applied 20251230120000_roles_shifts");
        // Retry deploy to ensure the rest of the migrations are recorded.
        runCmd("npx prisma migrate deploy");
      } catch (inner) {
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
