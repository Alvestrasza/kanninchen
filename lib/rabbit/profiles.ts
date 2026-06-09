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

export async function getUserRabbitProfiles(userId: string): Promise<RabbitProfileView[]> {
  const profiles = await prisma.rabbitProfile.findMany({
    where: {
      userId,
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

  await prisma.rabbitProfile.create({
    data: {
      userId,
      name,
      breed,
      color,
      notes,
      birthday,
    },
  });

  return getUserRabbitProfiles(userId);
}

export async function updateUserRabbitProfile(
  userId: string,
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
      userId,
    },
    data: {
      name,
      breed,
      color,
      notes,
      birthday,
    },
  });

  return getUserRabbitProfiles(userId);
}

export async function deleteUserRabbitProfile(
  userId: string,
  rabbitId: string,
): Promise<RabbitProfileView[]> {
  await prisma.rabbitProfile.delete({
    where: {
      id: rabbitId,
      userId,
    },
  });

  return getUserRabbitProfiles(userId);
}