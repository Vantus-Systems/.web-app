#!/usr/bin/env node
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "med-health-"));
  const dbPath = path.join(tmpDir, "med.db");
  // Create an empty SQLite file (no schema)
  fs.writeFileSync(dbPath, "");

  console.log(`[test] Created empty DB at ${dbPath}`);
  console.log(
    `[test] DB file size before server start: ${fs.statSync(dbPath).size} bytes`,
  );

  const testPort = 3001; // Use a different port to avoid conflicts
  const env = {
    ...process.env,
    DATABASE_URL: `file://${dbPath}`,
    PORT: String(testPort),
  };

  // Start the built server with the empty DB
  const server = spawn(
    "node",
    ["-r", "dotenv/config", ".output/server/index.mjs"],
    {
      env,
      cwd: process.cwd(),
    },
  );

  let serverReady = false;

  server.stdout?.on("data", (data) => {
    const msg = data.toString();
    console.log("[server stdout]", msg);
    if (msg.includes("listening on") || msg.includes("ready")) {
      serverReady = true;
    }
  });

  server.stderr?.on("data", (data) => {
    const msg = data.toString();
    console.log("[server stderr]", msg);
  });

  // Wait for server to start (max 5s)
  let waited = 0;
  // eslint-disable-next-line no-unmodified-loop-condition
  while (waited < 5000 && !serverReady) {
    await new Promise((_resolve) => setTimeout(_resolve, 100));
    waited += 100;
  }

  console.log(
    `[test] DB file size after server start: ${fs.statSync(dbPath).size} bytes`,
  );

  try {
    // Call the health endpoint on the test port
    console.log(`[test] Calling http://localhost:${testPort}/api/health...`);
    const res = await fetch(`http://localhost:${testPort}/api/health`, {
      timeout: 5000,
    });
    const status = res.status;
    const body = await res.text();

    console.log(`[test] Health response: status=${status}, body=${body}`);

    // With an empty DB (missing tables), health should return 503
    if (status === 503) {
      console.log("PASS: health endpoint returned 503 for missing tables");
      process.exit(0);
    } else {
      console.error(`FAIL: expected status 503, got ${status}`, body);
      process.exit(1);
    }
  } catch (e) {
    console.error("FAIL: fetch to health endpoint failed:", e);
    process.exit(1);
  } finally {
    server.kill();
    try {
      fs.rmSync(tmpDir, { recursive: true });
    } catch {
      // cleanup failure is non-fatal
    }
  }
}

main();
