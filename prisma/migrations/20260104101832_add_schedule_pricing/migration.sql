-- AlterTable
ALTER TABLE "bingo_games" ADD COLUMN "payout_config" TEXT DEFAULT '{}';
ALTER TABLE "bingo_games" ADD COLUMN "pricing_config" TEXT DEFAULT '{}';
ALTER TABLE "bingo_games" ADD COLUMN "timeline_config" TEXT DEFAULT '{}';

-- CreateTable
CREATE TABLE "schedule_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "published_at" DATETIME,
    "published_by" TEXT,
    "week_start" DATETIME
);

-- CreateTable
CREATE TABLE "schedule_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schedule_version_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "program_slug" TEXT NOT NULL,
    "overrides" TEXT,
    CONSTRAINT "schedule_slots_schedule_version_id_fkey" FOREIGN KEY ("schedule_version_id") REFERENCES "schedule_versions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pricing_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "published_at" DATETIME,
    "published_by" TEXT,
    "content" TEXT NOT NULL
);
