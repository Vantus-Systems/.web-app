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
    console.log("[query-settings] Querying all settings from database...");
    const settings = await prisma.setting.findMany();
    console.log(`[query-settings] Found ${settings.length} settings:`);
    for (const setting of settings) {
      console.log(`  ${setting.key}:`, setting.value.substring(0, 200));
    }
    process.exit(0);
  } catch (err) {
    console.error(
      "[query-settings] Query failed:",
      err && err.message ? err.message : err,
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
