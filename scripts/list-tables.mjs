import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$connect();
  const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`; 
  console.log("Tables:", tables);
} catch (err) {
  console.error("Error listing tables:", err);
} finally {
  await prisma.$disconnect();
}
