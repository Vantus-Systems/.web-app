// server/db/client.ts
import path from "node:path";
import { PrismaClient } from "@prisma/client";

// Prisma + SQLite: relative URLs like `file:./med.db` can resolve relative to the generated
// client folder when bundled for production (e.g. `.output/server/node_modules/.prisma/client`).
// Normalize to an absolute path early so the DB location is stable and respects the app's
// working directory (systemd WorkingDirectory, repo root in dev, etc.).
const dbUrl = process.env.DATABASE_URL;
if (dbUrl?.startsWith("file:")) {
  const rest = dbUrl.slice("file:".length);

  // Absolute paths (Linux/macOS): file:/abs/path.db
  // File URLs: file:///abs/path.db (leave as-is)
  const isAbsolute = rest.startsWith("/") || rest.startsWith("///");

  if (!isAbsolute) {
    const absPath = path.resolve(process.cwd(), rest);
    process.env.DATABASE_URL = `file:${absPath}`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
