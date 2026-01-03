-- AlterTable
ALTER TABLE "bingo_patterns" ADD COLUMN "active_sessions" TEXT;
ALTER TABLE "bingo_patterns" ADD COLUMN "category" TEXT;
ALTER TABLE "bingo_patterns" ADD COLUMN "tags" TEXT;

-- CreateTable
CREATE TABLE "cash_counts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shift_id" TEXT NOT NULL,
    "denom_100_count" INTEGER NOT NULL DEFAULT 0,
    "denom_50_count" INTEGER NOT NULL DEFAULT 0,
    "denom_20_count" INTEGER NOT NULL DEFAULT 0,
    "denom_10_count" INTEGER NOT NULL DEFAULT 0,
    "denom_5_count" INTEGER NOT NULL DEFAULT 0,
    "denom_1_count" INTEGER NOT NULL DEFAULT 0,
    "denom_quarters" INTEGER NOT NULL DEFAULT 0,
    "denom_dimes" INTEGER NOT NULL DEFAULT 0,
    "denom_nickels" INTEGER NOT NULL DEFAULT 0,
    "denom_pennies" INTEGER NOT NULL DEFAULT 0,
    "total_value" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cash_counts_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shift_records" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "check_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shift_id" TEXT NOT NULL,
    "player_name" TEXT NOT NULL,
    "check_number" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "stamped_on_back" BOOLEAN NOT NULL DEFAULT false,
    "phone_dl_written" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "check_logs_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shift_records" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "restricted_players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shift_id" TEXT,
    "reported_by_user_id" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME,
    CONSTRAINT "incidents_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shift_records" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "incidents_reported_by_user_id_fkey" FOREIGN KEY ("reported_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_shift_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "shift" TEXT NOT NULL,
    "pulltabs_total" REAL NOT NULL,
    "sales_bingo" REAL NOT NULL DEFAULT 0,
    "sales_pulltabs" REAL NOT NULL DEFAULT 0,
    "sales_total" REAL NOT NULL DEFAULT 0,
    "deposit_total" REAL NOT NULL,
    "bingo_total" REAL NOT NULL,
    "cash_total" REAL,
    "checks_total" REAL,
    "variance" REAL,
    "variance_note" TEXT,
    "negative_bingo_reason_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "players" INTEGER,
    "workflow_type" TEXT NOT NULL,
    "beginning_box" REAL,
    "ending_box" REAL,
    "bingo_actual" REAL,
    "deposit_actual" REAL,
    "notes" TEXT,
    "prev_shift_id" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "shift_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shift_records_prev_shift_id_fkey" FOREIGN KEY ("prev_shift_id") REFERENCES "shift_records" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_shift_records" ("beginning_box", "bingo_actual", "bingo_total", "created_at", "created_by_user_id", "date", "deposit_actual", "deposit_total", "ending_box", "id", "is_deleted", "notes", "players", "prev_shift_id", "pulltabs_total", "shift", "updated_at", "workflow_type") SELECT "beginning_box", "bingo_actual", "bingo_total", "created_at", "created_by_user_id", "date", "deposit_actual", "deposit_total", "ending_box", "id", "is_deleted", "notes", "players", "prev_shift_id", "pulltabs_total", "shift", "updated_at", "workflow_type" FROM "shift_records";
DROP TABLE "shift_records";
ALTER TABLE "new_shift_records" RENAME TO "shift_records";
CREATE INDEX "shift_records_date_shift_idx" ON "shift_records"("date", "shift");
CREATE INDEX "shift_records_created_by_user_id_idx" ON "shift_records"("created_by_user_id");
CREATE INDEX "shift_records_status_idx" ON "shift_records"("status");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "id", "is_active", "last_login_at", "password_hash", "role", "updated_at", "username") SELECT "created_at", "id", "is_active", "last_login_at", "password_hash", "role", "updated_at", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "cash_counts_shift_id_key" ON "cash_counts"("shift_id");

-- CreateIndex
CREATE INDEX "check_logs_shift_id_idx" ON "check_logs"("shift_id");

-- CreateIndex
CREATE INDEX "check_logs_player_name_idx" ON "check_logs"("player_name");

-- CreateIndex
CREATE UNIQUE INDEX "restricted_players_name_key" ON "restricted_players"("name");

-- CreateIndex
CREATE INDEX "incidents_shift_id_idx" ON "incidents"("shift_id");

-- CreateIndex
CREATE INDEX "incidents_reported_by_user_id_idx" ON "incidents"("reported_by_user_id");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");
