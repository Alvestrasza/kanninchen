-- Meta
-- Version: 0.1.0
-- Created: 2026-06-09
-- Updated: 2026-06-09
-- Purpose: Add family isolation model for Kaninchen Quest.

CREATE TABLE "RabbitFamily" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RabbitFamily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RabbitFamily_key_key"
  ON "RabbitFamily"("key");

CREATE INDEX "RabbitFamily_name_idx"
  ON "RabbitFamily"("name");

CREATE TABLE "RabbitFamilyMembership" (
  "id" TEXT NOT NULL,
  "familyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'child',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RabbitFamilyMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RabbitFamilyMembership_familyId_userId_key"
  ON "RabbitFamilyMembership"("familyId", "userId");

CREATE INDEX "RabbitFamilyMembership_userId_idx"
  ON "RabbitFamilyMembership"("userId");

CREATE INDEX "RabbitFamilyMembership_familyId_role_idx"
  ON "RabbitFamilyMembership"("familyId", "role");

ALTER TABLE "RabbitFamilyMembership"
  ADD CONSTRAINT "RabbitFamilyMembership_familyId_fkey"
  FOREIGN KEY ("familyId") REFERENCES "RabbitFamily"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "RabbitFamilyMembership"
  ADD CONSTRAINT "RabbitFamilyMembership_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "RabbitProfile"
  ADD COLUMN "familyId" TEXT;

INSERT INTO "RabbitFamily" (
  "id",
  "key",
  "name",
  "description",
  "createdAt",
  "updatedAt"
)
SELECT
  'family_' || md5("id"),
  'family-' || lower(substring(md5("id"), 1, 12)),
  COALESCE("name", "email", 'Familie') || ' Familie',
  'Automatically created family for existing user.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User"
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RabbitFamilyMembership" (
  "id",
  "familyId",
  "userId",
  "role",
  "createdAt",
  "updatedAt"
)
SELECT
  'family_membership_' || md5("User"."id"),
  'family_' || md5("User"."id"),
  "User"."id",
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User"
ON CONFLICT ("familyId", "userId") DO NOTHING;

UPDATE "RabbitProfile"
SET "familyId" = 'family_' || md5("userId")
WHERE "familyId" IS NULL;

ALTER TABLE "RabbitProfile"
  ALTER COLUMN "familyId" SET NOT NULL;

ALTER TABLE "RabbitProfile"
  ADD CONSTRAINT "RabbitProfile_familyId_fkey"
  FOREIGN KEY ("familyId") REFERENCES "RabbitFamily"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

CREATE INDEX "RabbitProfile_familyId_name_idx"
  ON "RabbitProfile"("familyId", "name");