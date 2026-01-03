-- AlterTable
ALTER TABLE "bingo_programs" ADD COLUMN "pricing_config" TEXT DEFAULT '{}';
ALTER TABLE "bingo_programs" ADD COLUMN "schedule_config" TEXT DEFAULT '{}';
ALTER TABLE "bingo_programs" ADD COLUMN "specials_config" TEXT DEFAULT '{}';
