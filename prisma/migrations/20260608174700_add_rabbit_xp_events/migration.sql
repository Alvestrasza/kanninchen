-- Meta
-- Version: 0.1.0
-- Created: 2026-06-08
-- Updated: 2026-06-08
-- Purpose: Add XP ledger table for Kaninchen Quest caretaker levels and future rankings.

CREATE TABLE "RabbitXpEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "taskProgressId" TEXT,
  "taskId" TEXT NOT NULL,
  "dateKey" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'task_completed',
  "frequency" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "reason" TEXT,
  "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RabbitXpEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RabbitXpEvent_userId_taskId_dateKey_source_key"
  ON "RabbitXpEvent"("userId", "taskId", "dateKey", "source");

CREATE INDEX "RabbitXpEvent_userId_awardedAt_idx"
  ON "RabbitXpEvent"("userId", "awardedAt");

CREATE INDEX "RabbitXpEvent_userId_source_idx"
  ON "RabbitXpEvent"("userId", "source");

CREATE INDEX "RabbitXpEvent_taskId_dateKey_idx"
  ON "RabbitXpEvent"("taskId", "dateKey");

ALTER TABLE "RabbitXpEvent"
  ADD CONSTRAINT "RabbitXpEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "RabbitXpEvent"
  ADD CONSTRAINT "RabbitXpEvent_taskProgressId_fkey"
  FOREIGN KEY ("taskProgressId") REFERENCES "RabbitTaskProgress"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Backfill existing completed progress entries.
INSERT INTO "RabbitXpEvent" (
  "id",
  "userId",
  "taskProgressId",
  "taskId",
  "dateKey",
  "source",
  "frequency",
  "amount",
  "reason",
  "awardedAt",
  "createdAt"
)
SELECT
  gen_random_uuid()::TEXT,
  "userId",
  "id",
  "taskId",
  "dateKey",
  'task_completed',
  CASE
    WHEN "taskId" IN ('feed', 'water', 'hay', 'health', 'run') THEN 'daily'
    WHEN "taskId" IN ('clean', 'fur', 'weekly') THEN 'weekly'
    WHEN "taskId" IN ('claws') THEN 'monthly'
    WHEN "taskId" IN ('toys') THEN 'asNeeded'
    ELSE 'unknown'
  END,
  CASE
    WHEN "taskId" IN ('feed', 'water', 'hay', 'health', 'run') THEN 10
    WHEN "taskId" IN ('clean', 'fur', 'weekly') THEN 30
    WHEN "taskId" IN ('claws') THEN 75
    WHEN "taskId" IN ('toys') THEN 15
    ELSE 0
  END,
  'Backfilled XP for existing completed task progress.',
  COALESCE("completedAt", "updatedAt", "createdAt", CURRENT_TIMESTAMP),
  CURRENT_TIMESTAMP
FROM "RabbitTaskProgress"
WHERE
  "completed" = TRUE
  AND "taskId" IN (
    'feed',
    'water',
    'hay',
    'health',
    'run',
    'clean',
    'fur',
    'weekly',
    'claws',
    'toys'
  )
ON CONFLICT ("userId", "taskId", "dateKey", "source") DO NOTHING;