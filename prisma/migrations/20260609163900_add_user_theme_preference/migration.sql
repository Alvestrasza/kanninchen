-- Meta
-- Version: 0.1.0
-- Created: 2026-06-09
-- Updated: 2026-06-09
-- Purpose: Add user-selectable theme preference for Kaninchen Quest.

ALTER TABLE "RabbitUserPreference"
ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'classic';