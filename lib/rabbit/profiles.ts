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
  const birthday = input.birthday ? new Date(`${input.birthday}T00:00:00.000Z`) : null;

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