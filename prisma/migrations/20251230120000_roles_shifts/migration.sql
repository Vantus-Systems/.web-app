-- Add active flag to users
ALTER TABLE "users" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT 1;

-- Normalize legacy roles
UPDATE "users" SET "role" = 'OWNER' WHERE "role" IN ('admin', 'ADMIN');
UPDATE "users" SET "role" = 'MIC' WHERE lower("role") IN ('mic', 'caller');

-- CreateTable
CREATE TABLE "shift_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "shift" TEXT NOT NULL,
    "pulltabs_total" REAL NOT NULL,
    "deposit_total" REAL NOT NULL,
    "bingo_total" REAL NOT NULL,
    "players" INTEGER,
    "workflow_type" TEXT NOT NULL,
    "beginning_box" REAL,
    "ending_box" REAL,
    "bingo_actual" REAL,
    "deposit_actual" REAL,
    "notes" TEXT,
    "prev_shift_id" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "shift_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shift_records_prev_shift_id_fkey" FOREIGN KEY ("prev_shift_id") REFERENCES "shift_records" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "holiday_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "month" INTEGER,
    "day" INTEGER,
    "weekday" INTEGER,
    "week" INTEGER,
    "closure_type" TEXT NOT NULL,
    "close_time" TEXT,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "shift_records_date_shift_idx" ON "shift_records"("date", "shift");

-- CreateIndex
CREATE INDEX "shift_records_created_by_user_id_idx" ON "shift_records"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_rules_name_key" ON "holiday_rules"("name");
