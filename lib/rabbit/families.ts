// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Family isolation helpers for Kaninchen Quest.

import { prisma } from "@/lib/db/prisma";
import type { AppRole } from "@/lib/auth/roles";

export type RabbitFamilyMembershipRole = "child" | "parent" | "admin" | "tester";

export type RabbitFamilyView = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  role: RabbitFamilyMembershipRole;
};

type EnsureUserFamilyInput = {
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  roles: AppRole[];
  familyKey?: string | null;
};

function normalizeFamilyKey(familyKey?: string | null): string | null {
  const normalized = familyKey
    ?.trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || null;
}

function getMembershipRole(roles: AppRole[]): RabbitFamilyMembershipRole {
  if (roles.includes("admin")) {
    return "admin";
  }

  if (roles.includes("parent")) {
    return "parent";
  }

  if (roles.includes("tester")) {
    return "tester";
  }

  return "child";
}

function getFallbackFamilyKey(userId: string): string {
  return `family-${userId.slice(0, 12).toLowerCase()}`;
}

function getFamilyDisplayName(
  familyKey: string,
  userName?: string | null,
  userEmail?: string | null,
): string {
  if (familyKey.startsWith("familie-")) {
    const readableName = familyKey
      .replace(/^familie-/, "")
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    if (readableName) {
      return `Familie ${readableName}`;
    }
  }

  if (userName) {
    return `${userName} Familie`;
  }

  if (userEmail) {
    return `${userEmail} Familie`;
  }

  return "Familie";
}

export async function getUserFamilies(userId: string): Promise<RabbitFamilyView[]> {
  const memberships = await prisma.rabbitFamilyMembership.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      role: true,
      family: {
        select: {
          id: true,
          key: true,
          name: true,
          description: true,
        },
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.family.id,
    key: membership.family.key,
    name: membership.family.name,
    description: membership.family.description,
    role: membership.role as RabbitFamilyMembershipRole,
  }));
}

export async function ensureUserFamily({
  userId,
  userName,
  userEmail,
  roles,
  familyKey,
}: EnsureUserFamilyInput): Promise<RabbitFamilyView> {
  const normalizedFamilyKey = normalizeFamilyKey(familyKey) ?? getFallbackFamilyKey(userId);
  const role = getMembershipRole(roles);

  const family = await prisma.rabbitFamily.upsert({
    where: {
      key: normalizedFamilyKey,
    },
    update: {},
    create: {
      key: normalizedFamilyKey,
      name: getFamilyDisplayName(normalizedFamilyKey, userName, userEmail),
      description: "Automatically created family from login context.",
    },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
    },
  });

  await prisma.rabbitFamilyMembership.upsert({
    where: {
      familyId_userId: {
        familyId: family.id,
        userId,
      },
    },
    update: {
      role,
    },
    create: {
      familyId: family.id,
      userId,
      role,
    },
  });

  return {
    id: family.id,
    key: family.key,
    name: family.name,
    description: family.description,
    role,
  };
}

export async function getActiveUserFamily({
  userId,
  userName,
  userEmail,
  roles,
  familyKey,
}: EnsureUserFamilyInput): Promise<RabbitFamilyView> {
  const ensuredFamily = await ensureUserFamily({
    userId,
    userName,
    userEmail,
    roles,
    familyKey,
  });

  return ensuredFamily;
}

export async function assertUserCanAccessFamily(
  userId: string,
  familyId: string,
): Promise<RabbitFamilyView> {
  const membership = await prisma.rabbitFamilyMembership.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId,
      },
    },
    select: {
      role: true,
      family: {
        select: {
          id: true,
          key: true,
          name: true,
          description: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error("User is not a member of this rabbit family.");
  }

  return {
    id: membership.family.id,
    key: membership.family.key,
    name: membership.family.name,
    description: membership.family.description,
    role: membership.role as RabbitFamilyMembershipRole,
  };
}