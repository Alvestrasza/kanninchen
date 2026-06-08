-- Meta
-- Version: 0.1.0
-- Created: 2026-06-08
-- Updated: 2026-06-08
-- Purpose: Add activeDateKey to remember the selected task per day.

ALTER TABLE "RabbitUserPreference"
ADD COLUMN "activeDateKey" TEXT NOT NULL DEFAULT 'legacy';

UPDATE "RabbitUserPreference"
SET "activeDateKey" = to_char(now() AT TIME ZONE 'Europe/Berlin', 'YYYY-MM-DD')
WHERE "activeDateKey" = 'legacy';