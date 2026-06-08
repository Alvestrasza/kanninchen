-- Meta
-- Version: 0.1.0
-- Created: 2026-06-08
-- Updated: 2026-06-08
-- Purpose: Add achievement unlock table for Kaninchen Quest.

CREATE TABLE "RabbitAchievementUnlock" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RabbitAchievementUnlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RabbitAchievementUnlock_userId_achievementId_key"
  ON "RabbitAchievementUnlock"("userId", "achievementId");

CREATE INDEX "RabbitAchievementUnlock_userId_unlockedAt_idx"
  ON "RabbitAchievementUnlock"("userId", "unlockedAt");

ALTER TABLE "RabbitAchievementUnlock"
  ADD CONSTRAINT "RabbitAchievementUnlock_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;