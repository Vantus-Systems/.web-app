import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";
import net from "net";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const DEFAULT_CONTAINER = "med-postgres";
const DEFAULT_USER = "postgres";
const DEFAULT_PASSWORD = "postgres";
const DEFAULT_DB = "med";
const DEFAULT_IMAGE = "postgres:15-alpine";

function log(...args) {
  console.log("[setup-db]", ...args);
}

function parseEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

async function readEnv() {
  try {
    const raw = await fs.readFile(ENV_PATH, "utf8");
    return parseEnv(raw);
  } catch {
    return {};
  }
}

async function writeEnv(updates) {
  const current = await readEnv();
  const merged = { ...current, ...updates };
  const lines = [];
  for (const [k, v] of Object.entries(merged)) {
    lines.push(`${k}="${String(v).replace(/"/g, '\\"')}"`);
  }
  await fs.writeFile(ENV_PATH, lines.join("\n") + "\n");
}

function isLikelyPlaceholder(url) {
  if (!url) return true;
  const low = url.toLowerCase();
  return (
    low.includes("user") ||
    low.includes("password") ||
    low.includes("host") ||
    low.includes("database")
  );
}

function dockerAvailable() {
  try {
    // Ensure docker is installed
    execSync("docker --version", { stdio: "ignore" });
    // Ensure current user can access the daemon (avoid permission-denied scenarios)
    execSync("docker ps", { stdio: "ignore" });
    return true;
  } catch (err) {
    // If docker is installed but the daemon socket is not accessible, provide a helpful message
    const msg = String(err && err.message ? err.message : err);
    if (msg.includes("permission denied") || msg.includes("connect: permission denied")) {
      log("Docker is installed but the current user cannot access the Docker daemon socket.");
      log("Fix: add your user to the docker group and re-login: `sudo usermod -aG docker $USER && newgrp docker` (then re-run install)");
      return false;
    }
    return false;
  }
}

function containerExists(name) {
  try {
    const out = execSync(
      `docker ps -a --filter name=${name} --format "{{.Names}}"`,
      { encoding: "utf8" },
    );
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(name);
  } catch {
    return false;
  }
}

function containerRunning(name) {
  try {
    const out = execSync(
      `docker ps --filter name=${name} --format "{{.Names}}"`,
      { encoding: "utf8" },
    );
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(name);
  } catch {
    return false;
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", () => resolve(false));
    s.once("listening", () => {
      s.close();
      resolve(true);
    });
    s.listen(port, "127.0.0.1");
  });
}

async function findFreePort(start = 5432, end = 5500) {
  for (let p = start; p <= end; p++) {
    const free = await isPortFree(p);
    if (free) return p;
  }
  throw new Error("No free ports between " + start + " and " + end);
}

function runCmd(cmd, envExtra = {}) {
  log("RUN:", cmd);
  return execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, ...envExtra },
  });
}

function pushSchemaAndSeed(databaseUrl) {
  log("Pushing Prisma schema to", databaseUrl);
  try {
    runCmd("npx prisma db push --accept-data-loss", {
      DATABASE_URL: databaseUrl,
    });
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    throw new Error(`prisma db push failed: ${msg}`);
  }

  log("Running seed...");
  try {
    // Use npm script so prisma uses the configured seed command
    runCmd("npx prisma db seed", { DATABASE_URL: databaseUrl });
  } catch (e) {
    log("prisma db seed failed (non-fatal):", e && e.message ? e.message : e);
  }
}

async function main() {
  // Respect CI and explicit opt-outs
  if (process.env.CI) {
    log("CI detected - skipping automatic DB setup");
    return;
  }

  if (
    process.env.SKIP_DB_SETUP === "true" ||
    process.env.NO_DB_SETUP === "true"
  ) {
    log("SKIP_DB_SETUP set - skipping automatic DB setup");
    return;
  }

  // Prefer runtime env var
  const runtimeDb = process.env.DATABASE_URL;
  if (runtimeDb && !isLikelyPlaceholder(runtimeDb)) {
    log("Found existing DATABASE_URL in environment - trying to use it");
    try {
      await pushSchemaAndSeed(runtimeDb);
      log("Database is ready (via existing DATABASE_URL)");
      return;
    } catch (e) {
      log("Existing DATABASE_URL could not be used:", e.message || e);
      // continue to attempt local docker provisioning
    }
  }

  const envVars = await readEnv();
  const fileDb = envVars.DATABASE_URL;
  if (fileDb && !isLikelyPlaceholder(fileDb)) {
    log("Found existing DATABASE_URL in .env - trying to use it");
    try {
      await pushSchemaAndSeed(fileDb);
      log("Database is ready (via .env DATABASE_URL)");
      return;
    } catch (e) {
      log(".env DATABASE_URL could not be used:", e.message || e);
    }
  }

  // No usable DATABASE_URL found - attempt to provision a local Postgres via Docker
  if (!dockerAvailable()) {
    log("Docker is not available and no valid DATABASE_URL was found.");
    log(
      "To finish setup, either install Docker or set a valid DATABASE_URL in .env",
    );
    log("Example (Linux/Mac):");
    log(
      '  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/med?schema=public"',
    );
    return;
  }

  try {
    const POSTGRES_IMAGE = process.env.POSTGRES_IMAGE || DEFAULT_IMAGE;
    const POSTGRES_CONTAINER = process.env.POSTGRES_CONTAINER || DEFAULT_CONTAINER;
    const DB_PROVISION_TIMEOUT_MS = parseInt(process.env.DB_PROVISION_TIMEOUT_MS || String(120 * 1000), 10);
    const DB_PROVISION_INTERVAL_MS = parseInt(process.env.DB_PROVISION_INTERVAL_MS || String(2000), 10);

    log("Docker available — provisioning local PostgreSQL container...");

    const chosenPort = await findFreePort(5432, 5540);
    log("Found free host port", chosenPort);

    let hostPort = chosenPort;

    if (!containerExists(POSTGRES_CONTAINER)) {
      // Start a new container, mapping chosenPort -> 5432 inside container
      runCmd(
        `docker run -d --name ${POSTGRES_CONTAINER} -e POSTGRES_PASSWORD=${DEFAULT_PASSWORD} -e POSTGRES_USER=${DEFAULT_USER} -e POSTGRES_DB=${DEFAULT_DB} -p ${chosenPort}:5432 ${POSTGRES_IMAGE}`,
      );
      hostPort = chosenPort;
    } else {
      if (!containerRunning(POSTGRES_CONTAINER)) {
        log(`Starting existing container ${POSTGRES_CONTAINER}`);
        runCmd(`docker start ${POSTGRES_CONTAINER}`);
      } else {
        log(`Using already running container ${POSTGRES_CONTAINER}`);
      }

      // Try to discover host port mapping for the running container
      try {
        const portOut = execSync(`docker port ${POSTGRES_CONTAINER} 5432`, { encoding: "utf8" }).trim();
        if (portOut) {
          const m = portOut.match(/:(\d+)$/);
          if (m) {
            hostPort = parseInt(m[1], 10);
            log(`Detected container host port mapping: ${hostPort}`);
          } else {
            log("Could not parse container port mapping, falling back to chosen host port", chosenPort);
          }
        } else {
          log("No port mapping found for container, using chosen host port", chosenPort);
        }
      } catch (err) {
        log("Could not inspect container port mapping:", err && err.message ? err.message : err);
        log("Falling back to chosen host port", chosenPort);
      }
    }

    const databaseUrl = `postgresql://${DEFAULT_USER}:${DEFAULT_PASSWORD}@localhost:${hostPort}/${DEFAULT_DB}?schema=public`;

    // wait for DB to accept connections and push schema
    const timeoutMs = DB_PROVISION_TIMEOUT_MS;
    const intervalMs = DB_PROVISION_INTERVAL_MS;
    const start = Date.now();
    let ok = false;
    while (Date.now() - start < timeoutMs) {
      try {
        // Prefer to probe readiness from inside the container using pg_isready
        try {
          execSync(`docker exec ${POSTGRES_CONTAINER} pg_isready -U ${DEFAULT_USER} -d ${DEFAULT_DB}`, { stdio: "ignore" });
          log("pg_isready reports Postgres is accepting connections inside the container.");
        } catch (probeErr) {
          // Not ready yet or probe failed — fall through to log and wait
          throw probeErr;
        }

        // If we get here, attempt schema push + seed
        pushSchemaAndSeed(databaseUrl);
        ok = true;
        break;
      } catch (err) {
        // Not ready yet; try to show container logs for diagnostic hints
        try {
          const logs = execSync(`docker logs ${POSTGRES_CONTAINER} --tail 25`, { encoding: "utf8" });
          if (logs.includes("database system is ready to accept connections")) {
            log("Detected Postgres readiness message in container logs.");
            // try push/seed once more
            try {
              pushSchemaAndSeed(databaseUrl);
              ok = true;
              break;
            } catch (e) {
              // continue waiting
            }
          }
          log("Waiting for Postgres to be ready (container logs last 25 lines):");
          log(logs);
        } catch (logsErr) {
          log("Waiting for Postgres to be ready (unable to fetch logs yet).");
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    if (!ok) {
      log(`Timed out waiting for Postgres to become ready after ${timeoutMs}ms`);
      log(`Tip: run \`docker logs ${POSTGRES_CONTAINER}\` and \`docker inspect ${POSTGRES_CONTAINER}\` to inspect the container.`);
      return;
    }

    // Persist to .env for convenience if not already set
    if (!envVars.DATABASE_URL || isLikelyPlaceholder(envVars.DATABASE_URL)) {
      log("Saving DATABASE_URL to .env");
      await writeEnv({ DATABASE_URL: databaseUrl });
    }

    log("Database provisioning completed.");
  } catch (e) {
    log("Failed to provision database:", e && e.message ? e.message : e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
