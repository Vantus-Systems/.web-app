import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const tables =
      await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log("Tables:", tables);

    const users = await prisma.user.findMany();
    console.log(
      "Users:",
      users.map((u) => ({
        id: u.id,
        username: u.username,
        hash: u.password_hash,
      })),
    );

    const sessions = await prisma.session.findMany();
    console.log("Sessions count:", sessions.length);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
