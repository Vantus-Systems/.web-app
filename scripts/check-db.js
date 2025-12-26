#!/usr/bin/env node
/* scripts/check-db.js
   Simple DB connectivity check using Prisma Client. Loads .env if present.
*/
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

(async () => {
  loadDotEnv();
  const prisma = new PrismaClient();
  try {
    console.log('[check-db] Connecting to database (DATABASE_URL from env or .env)...');
    await prisma.$connect();
    const res = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('[check-db] Database connected OK:', res);
    process.exit(0);
  } catch (err) {
    console.error('[check-db] DB connectivity check failed:', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
