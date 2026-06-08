-- Meta
-- Version: 0.1.0
-- Created: 2026-06-08
-- Updated: 2026-06-08
-- Purpose: Add daily task progress tracking by dateKey.

ALTER TABLE "RabbitTaskProgress"
ADD COLUMN "dateKey" TEXT;

UPDATE "RabbitTaskProgress"
SET "dateKey" = to_char(now() AT TIME ZONE 'Europe/Berlin', 'YYYY-MM-DD')
WHERE "dateKey" IS NULL;

ALTER TABLE "RabbitTaskProgress"
ALTER COLUMN "dateKey" SET NOT NULL;

ALTER TABLE "RabbitTaskProgress"
ALTER COLUMN "dateKey" SET DEFAULT 'legacy';

DROP INDEX IF EXISTS "RabbitTaskProgress_userId_taskId_key";

CREATE UNIQUE INDEX "RabbitTaskProgress_userId_taskId_dateKey_key"
ON "RabbitTaskProgress"("userId", "taskId", "dateKey");

CREATE INDEX "RabbitTaskProgress_userId_dateKey_idx"
ON "RabbitTaskProgress"("userId", "dateKey");