-- Meta
-- Version: 0.1.0
-- Created: 2026-06-07
-- Updated: 2026-06-07
-- Purpose: Initial PostgreSQL schema for Kaninchen Quest.

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Authenticator" (
  "credentialID" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "credentialPublicKey" TEXT NOT NULL,
  "counter" INTEGER NOT NULL,
  "credentialDeviceType" TEXT NOT NULL,
  "credentialBackedUp" BOOLEAN NOT NULL,
  "transports" TEXT,
  CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId", "credentialID")
);

CREATE TABLE "RabbitTaskProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "subtasks" JSONB NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RabbitTaskProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RabbitJournalEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "mood" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RabbitJournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RabbitProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "breed" TEXT,
  "color" TEXT,
  "notes" TEXT,
  "birthday" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RabbitProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RabbitUserPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "activeTaskId" TEXT NOT NULL DEFAULT 'feed',
  "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RabbitUserPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");
CREATE UNIQUE INDEX "RabbitTaskProgress_userId_taskId_key" ON "RabbitTaskProgress"("userId", "taskId");
CREATE INDEX "RabbitTaskProgress_taskId_idx" ON "RabbitTaskProgress"("taskId");
CREATE INDEX "RabbitJournalEntry_userId_createdAt_idx" ON "RabbitJournalEntry"("userId", "createdAt");
CREATE INDEX "RabbitProfile_userId_name_idx" ON "RabbitProfile"("userId", "name");
CREATE UNIQUE INDEX "RabbitUserPreference_userId_key" ON "RabbitUserPreference"("userId");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RabbitTaskProgress" ADD CONSTRAINT "RabbitTaskProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RabbitJournalEntry" ADD CONSTRAINT "RabbitJournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RabbitProfile" ADD CONSTRAINT "RabbitProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RabbitUserPreference" ADD CONSTRAINT "RabbitUserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
