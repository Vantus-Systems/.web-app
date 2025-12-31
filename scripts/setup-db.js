import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";
import { pathToFileURL } from "url";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const DB_PATH = path.join(ROOT, "med.db");

function log(...args) {
  console.log("[setup-db]", ...args);
}

async function ensureEnv() {
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

  await ensureEnv();

  log("Generating Prisma client...");
  runCmd("npx prisma generate");

  log("Pushing schema to SQLite...");
  // Use db push for SQLite to avoid migration overhead in this simple setup
  runCmd("npx prisma db push --accept-data-loss");

  log("Seeding database...");
  runCmd("npx prisma db seed");

  log("Database setup complete!");
}

main().catch((e) => {
  console.error("Setup failed:", e);
  process.exit(1);
});
