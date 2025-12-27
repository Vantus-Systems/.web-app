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
      // Validate JSON
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

  console.log("Seeding Bingo Patterns...");

  // Helper to create empty grid
  const emptyFrame = () => Array(25).fill(0);
  const frameWith = (indices) => {
    const f = emptyFrame();
    indices.forEach((i) => {
      // Validate index to prevent property pollution warning
      if (typeof i === "number" && i >= 0 && i < 25) {
        f[i] = 1;
      }
    });
    return f;
  };

  // 1. Regular Bingo (Static)
  const regularBingoFrame = frameWith([]); // Just a placeholder, actually standard bingo is any line.
  // Let's make "Coverall"
  const coverallFrame = frameWith(Array.from({ length: 25 }, (_, i) => i));

  // 2. Letter X (Static)
  const letterXFrame = frameWith([0, 4, 6, 8, 12, 16, 18, 20, 24]);

  // 3. Four Corners (Static)
  const fourCornersFrame = frameWith([0, 4, 20, 24]);

  // 4. Crazy Kite (Animated)
  const kite1 = frameWith([4, 8, 12, 16, 17, 18, 19]); // Top right kiteish
  const kite2 = frameWith([0, 6, 12, 18, 24, 23, 22, 21]); // etc. just random frames for animation
  // Let's do a simple blinking box for animation
  const box1 = frameWith([6, 7, 8, 11, 13, 16, 17, 18]); // inner box
  const box2 = frameWith([
    0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24,
  ]); // outer box

  // 5. Hard Way (Static)
  const hardWayFrame = frameWith([
    5, 6, 7, 8, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24,
  ]); // not really hard way but illustrative

  const patterns = [
    {
      slug: "coverall",
      name: "Coverall",
      description: "Cover the entire board",
      isAnimated: false,
      definition: JSON.stringify({ frames: [coverallFrame] }),
    },
    {
      slug: "letter-x",
      name: "Letter X",
      description: "Form an X shape",
      isAnimated: false,
      definition: JSON.stringify({ frames: [letterXFrame] }),
    },
    {
      slug: "four-corners",
      name: "Four Corners",
      description: "The four corners of the grid",
      isAnimated: false,
      definition: JSON.stringify({ frames: [fourCornersFrame] }),
    },
    {
      slug: "pulsing-box",
      name: "Pulsing Box",
      description: "Inner and outer box alternating",
      isAnimated: true,
      definition: JSON.stringify({ frames: [box1, box2], interval: 500 }),
    },
    {
      slug: "hard-way",
      name: "Hard Way",
      description: "Straight lines without using the free space",
      isAnimated: false,
      definition: JSON.stringify({ frames: [hardWayFrame] }),
    },
  ];

  for (const p of patterns) {
    await prisma.bingoPattern.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log("Seeded Patterns");

  console.log("Seeding Bingo Programs...");

  const programs = [
    {
      slug: "evening-main-program",
      name: "Evening Main Program",
      description: "The standard nightly session games.",
    },
    {
      slug: "sunday-premier-program",
      name: "Sunday Premier",
      description: "High stakes games for Sunday afternoon.",
    },
  ];

  for (const prog of programs) {
    await prisma.bingoProgram.upsert({
      where: { slug: prog.slug },
      update: prog,
      create: prog,
    });
  }
  console.log("Seeded Programs");

  console.log("Seeding Bingo Games...");

  // Fetch IDs
  const eveningProg = await prisma.bingoProgram.findUnique({
    where: { slug: "evening-main-program" },
  });
  const sundayProg = await prisma.bingoProgram.findUnique({
    where: { slug: "sunday-premier-program" },
  });

  const pCoverall = await prisma.bingoPattern.findUnique({
    where: { slug: "coverall" },
  });
  const pLetterX = await prisma.bingoPattern.findUnique({
    where: { slug: "letter-x" },
  });
  const pCorners = await prisma.bingoPattern.findUnique({
    where: { slug: "four-corners" },
  });
  const pPulse = await prisma.bingoPattern.findUnique({
    where: { slug: "pulsing-box" },
  });
  const pHard = await prisma.bingoPattern.findUnique({
    where: { slug: "hard-way" },
  });

  const eveningGames = [
    {
      sort_order: 1,
      title: "Warm Up",
      paperColor: "#FFC0CB",
      pattern_id: pCorners.id,
      notes: "Early bird special",
    }, // Pink
    {
      sort_order: 2,
      title: "Double Action",
      paperColor: "#ADD8E6",
      pattern_id: pLetterX.id,
    }, // LightBlue
    {
      sort_order: 3,
      title: "Jackpot Special",
      paperColor: "#90EE90",
      pattern_id: pCoverall.id,
      notes: "$1000 Guaranteed",
    }, // LightGreen
    {
      sort_order: 4,
      title: "Intermission Fun",
      paperColor: "#FFFFE0",
      pattern_id: pPulse.id,
    }, // LightYellow
    {
      sort_order: 5,
      title: "Last Chance",
      paperColor: "#D3D3D3",
      pattern_id: pHard.id,
    }, // LightGray
  ];

  const sundayGames = [
    {
      sort_order: 1,
      title: "Super Starter",
      paperColor: "#FFA07A",
      pattern_id: pCorners.id,
    }, // LightSalmon
    {
      sort_order: 2,
      title: "Big X",
      paperColor: "#E0FFFF",
      pattern_id: pLetterX.id,
    }, // LightCyan
    {
      sort_order: 3,
      title: "Mega Coverall",
      paperColor: "#FFD700",
      pattern_id: pCoverall.id,
      notes: "Progressive Jackpot",
    }, // Gold
    {
      sort_order: 4,
      title: "Crazy Box",
      paperColor: "#FF69B4",
      pattern_id: pPulse.id,
    }, // HotPink
  ];

  const seedGames = async (progId, games) => {
    // Clear existing games for idempotency
    await prisma.bingoGame.deleteMany({ where: { program_id: progId } });

    for (const g of games) {
      await prisma.bingoGame.create({
        data: {
          program_id: progId,
          ...g,
        },
      });
    }
  };

  await seedGames(eveningProg.id, eveningGames);
  await seedGames(sundayProg.id, sundayGames);

  console.log("Seeded Games");
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
