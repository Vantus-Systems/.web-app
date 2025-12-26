#!/usr/bin/env node
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
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

(async () => {
  loadDotEnv();
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, created_at: true },
    });
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
      console.log(`  ${u.username} (${u.role}) - created: ${u.created_at}`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Query failed:", err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
