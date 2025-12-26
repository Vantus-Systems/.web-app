import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../server/data");

async function main() {
  console.log("Seeding settings...");
  const files = ["business", "jackpot", "pricing", "schedule", "specials"];

  for (const key of files) {
    try {
      const filePath = path.join(dataDir, `${key}.json`);
      const content = await fs.readFile(filePath, "utf-8");
      const value = JSON.parse(content);

      await prisma.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      });
      console.log(`Seeded ${key}`);
    } catch (e) {
      console.warn(`Skipping ${key}:`, e && e.message ? e.message : e);
    }
  }

  console.log("Seeding users...");
  const existingAdmin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash("admin123");
    await prisma.user.create({
      data: {
        username: "admin",
        password_hash: passwordHash,
        role: "admin",
      },
    });
    console.log("Created admin user (password: admin123)");
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
