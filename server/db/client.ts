// server/db/client.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Diagnostic: log DB environment and working directory to help debug missing table errors
if (!globalForPrisma.prisma) {
  console.log(
    "[prisma] initializing PrismaClient",
    "NODE_ENV=",
    process.env.NODE_ENV,
    "CWD=",
    process.cwd(),
    "DATABASE_URL=",
    process.env.DATABASE_URL,
  );
}

const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Run a lightweight startup check for essential tables to give an early warning
(async () => {
  try {
    await prisma.$connect();

    // Log which SQLite file is actually attached to this connection
    try {
      const dbList = (await prisma.$queryRaw`PRAGMA database_list;`) as any[];
      console.log("[prisma] PRAGMA database_list:", dbList);
    } catch (e) {
      console.warn("[prisma] Could not run PRAGMA database_list:", e);
    }

    const rows = (await prisma.$queryRaw`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name IN ('settings','sessions')
    `) as any[];

    console.log("[prisma] sqlite_master rows:", rows);

    const found = rows.map((r) => r.name as string);
    const required = ["settings", "sessions"];
    const missing = required.filter((n) => !found.includes(n));

    if (missing.length) {
      // Resolve and stat the expected DB file path, if possible, to aid debugging
      try {
        const dbUrl = process.env.DATABASE_URL || "";
        let dbPath = dbUrl;
        if (dbPath.startsWith("file:")) dbPath = dbPath.replace("file:", "");
        const fs = await import("fs");
        const path = await import("path");
        const absPath = path.resolve(process.cwd(), dbPath);
        const exists = fs.existsSync(absPath);
        const stat = exists ? fs.statSync(absPath) : null;
        console.warn(
          "[prisma] WARNING: Missing expected tables:",
          missing.join(", "),
          `(resolved DB path=${absPath} exists=${exists} stat=${stat})`,
        );
      } catch (e) {
        console.warn(
          "[prisma] WARNING: Missing expected tables:",
          missing.join(", "),
          e,
        );
      }
    } else {
      console.log("[prisma] DB check OK - essential tables present");
    }
  } catch (err) {
    console.error("[prisma] DB check failed:", err);
  }
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
