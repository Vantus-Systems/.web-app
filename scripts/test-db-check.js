import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    const rows = await prisma.$queryRaw`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name IN ("settings", "sessions")
    `;
    const found = rows.map((r) => r.name);
    const required = ["settings", "sessions"];
    const missing = required.filter((n) => !found.includes(n));

    if (missing.length) {
      console.error("Missing tables:", missing);
      process.exit(1);
    }

    console.log("DB check OK");
    process.exit(0);
  } catch (err) {
    console.error("DB check failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
