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