// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Rabbit profile read helpers for Kaninchen Quest.

import { prisma } from "@/lib/db/prisma";

export type RabbitProfileView = {
  id: string;
  name: string;
  breed: string | null;
  color: string | null;
  notes: string | null;
  birthday: string | null;
};

export type RabbitProfileCreateInput = {
  name: string;
  breed?: string;
  color?: string;
  notes?: string;
  birthday?: string;
};

export type RabbitProfileUpdateInput = RabbitProfileCreateInput & {
  id: string;
};

export async function getUserRabbitProfiles(
  userId: string,
  familyId: string,
): Promise<RabbitProfileView[]> {
  const membership = await prisma.rabbitFamilyMembership.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    return [];
  }

  const profiles = await prisma.rabbitProfile.findMany({
    where: {
      familyId,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      breed: true,
      color: true,
      notes: true,
      birthday: true,
    },
  });

  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    breed: profile.breed,
    color: profile.color,
    notes: profile.notes,
    birthday: profile.birthday?.toISOString() ?? null,
  }));
}

function parseOptionalBirthday(birthday?: string): Date | null {
  return birthday ? new Date(`${birthday}T00:00:00.000Z`) : null;
}

export async function createUserRabbitProfile(
  userId: string,
  familyId: string,
  input: RabbitProfileCreateInput,
): Promise<RabbitProfileView[]> {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Rabbit profile name is required.");
  }

  const breed = input.breed?.trim() || null;
  const color = input.color?.trim() || null;
  const notes = input.notes?.trim() || null;
  const birthday = parseOptionalBirthday(input.birthday);

  const membership = await prisma.rabbitFamilyMembership.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    throw new Error("User is not a member of this rabbit family.");
  }

  await prisma.rabbitProfile.create({
    data: {
      userId,
      familyId,
      name,
      breed,
      color,
      notes,
      birthday,
    },
  });

  return getUserRabbitProfiles(userId, familyId);
}

export async function updateUserRabbitProfile(
  userId: string,
  familyId: string,
  input: RabbitProfileUpdateInput,
): Promise<RabbitProfileView[]> {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Rabbit profile name is required.");
  }

  const breed = input.breed?.trim() || null;
  const color = input.color?.trim() || null;
  const notes = input.notes?.trim() || null;
  const birthday = parseOptionalBirthday(input.birthday);

  await prisma.rabbitProfile.update({
    where: {
      id: input.id,
      familyId,
    },
    data: {
      name,
      breed,
      color,
      notes,
      birthday,
    },
  });

  return getUserRabbitProfiles(userId, familyId);
}

export async function deleteUserRabbitProfile(
  userId: string,
  familyId: string,
  rabbitId: string,
): Promise<RabbitProfileView[]> {
  await prisma.rabbitProfile.delete({
    where: {
      id: rabbitId,
      familyId,
    },
  });

  return getUserRabbitProfiles(userId, familyId);
}