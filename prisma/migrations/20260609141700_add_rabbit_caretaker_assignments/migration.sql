-- Meta
-- Version: 0.1.0
-- Created: 2026-06-09
-- Updated: 2026-06-09
-- Purpose: Add rabbit-to-child caretaker assignments for family administration.

CREATE TABLE "RabbitCaretakerAssignment" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "rabbitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RabbitCaretakerAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RabbitCaretakerAssignment_familyId_rabbitId_userId_key"
ON "RabbitCaretakerAssignment"("familyId", "rabbitId", "userId");

CREATE INDEX "RabbitCaretakerAssignment_familyId_idx"
ON "RabbitCaretakerAssignment"("familyId");

CREATE INDEX "RabbitCaretakerAssignment_familyId_userId_idx"
ON "RabbitCaretakerAssignment"("familyId", "userId");

CREATE INDEX "RabbitCaretakerAssignment_familyId_rabbitId_idx"
ON "RabbitCaretakerAssignment"("familyId", "rabbitId");

CREATE INDEX "RabbitCaretakerAssignment_rabbitId_idx"
ON "RabbitCaretakerAssignment"("rabbitId");

CREATE INDEX "RabbitCaretakerAssignment_userId_idx"
ON "RabbitCaretakerAssignment"("userId");

ALTER TABLE "RabbitCaretakerAssignment"
ADD CONSTRAINT "RabbitCaretakerAssignment_familyId_fkey"
FOREIGN KEY ("familyId")
REFERENCES "RabbitFamily"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "RabbitCaretakerAssignment"
ADD CONSTRAINT "RabbitCaretakerAssignment_rabbitId_fkey"
FOREIGN KEY ("rabbitId")
REFERENCES "RabbitProfile"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "RabbitCaretakerAssignment"
ADD CONSTRAINT "RabbitCaretakerAssignment_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;