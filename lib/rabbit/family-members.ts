// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Read-only family member overview helpers for Kaninchen Quest parent administration.

import { rabbitTasks } from "@/data/rabbit/tasks";
import { prisma } from "@/lib/db/prisma";

const APP_TIME_ZONE = "Europe/Berlin";

export type RabbitFamilyMemberAssignmentView = {
  rabbitId: string;
  rabbitName: string;
  isPrimary: boolean;
};

export type RabbitFamilyMemberOverviewView = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  memberSince: string;
  todayCompleted: number;
  todayTotal: number;
  todayPercent: number;
  lastActivityAt: string | null;
  assignedRabbits: RabbitFamilyMemberAssignmentView[];
};

function getTodayDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not build date key.");
  }

  return `${year}-${month}-${day}`;
}

function getPercent(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function getDisplayName(user: { name: string | null; email: string | null }): string {
  return user.name ?? user.email ?? "Unbenannter Benutzer";
}

async function assertParentOrAdmin(userId: string, familyId: string): Promise<void> {
  const membership = await prisma.rabbitFamilyMembership.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw new Error("User is not a member of this rabbit family.");
  }

  if (!["parent", "admin"].includes(membership.role)) {
    throw new Error("User is not allowed to view family members.");
  }
}

export async function getFamilyMemberOverview(
  viewerUserId: string,
  familyId: string,
): Promise<RabbitFamilyMemberOverviewView[]> {
  await assertParentOrAdmin(viewerUserId, familyId);

  const dailyTaskIds = rabbitTasks
    .filter((task) => task.frequency === "daily")
    .map((task) => task.id);

  const todayDateKey = getTodayDateKey();

  const memberships = await prisma.rabbitFamilyMembership.findMany({
    where: {
      familyId,
    },
    orderBy: [
      {
        role: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const userIds = memberships.map((membership) => membership.user.id);

  if (userIds.length === 0) {
    return [];
  }

  const [todayProgressRecords, activityRecords, assignments] = await Promise.all([
    prisma.rabbitTaskProgress.findMany({
      where: {
        userId: {
          in: userIds,
        },
        taskId: {
          in: dailyTaskIds,
        },
        dateKey: todayDateKey,
      },
      select: {
        userId: true,
        taskId: true,
        completed: true,
      },
    }),

    prisma.rabbitTaskProgress.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        userId: true,
        updatedAt: true,
        completedAt: true,
      },
    }),

    prisma.rabbitCaretakerAssignment.findMany({
      where: {
        familyId,
      },
      orderBy: [
        {
          isPrimary: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: {
        userId: true,
        rabbitId: true,
        isPrimary: true,
        rabbit: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const completedTaskIdsByUser = new Map<string, Set<string>>();

  for (const record of todayProgressRecords) {
    if (!record.completed) {
      continue;
    }

    const completedTaskIds = completedTaskIdsByUser.get(record.userId) ?? new Set<string>();
    completedTaskIds.add(record.taskId);
    completedTaskIdsByUser.set(record.userId, completedTaskIds);
  }

  const lastActivityByUser = new Map<string, Date>();

  for (const record of activityRecords) {
    if (lastActivityByUser.has(record.userId)) {
      continue;
    }

    lastActivityByUser.set(record.userId, record.completedAt ?? record.updatedAt);
  }

  const assignmentsByUser = new Map<string, RabbitFamilyMemberAssignmentView[]>();

  for (const assignment of assignments) {
    const current = assignmentsByUser.get(assignment.userId) ?? [];

    current.push({
      rabbitId: assignment.rabbitId,
      rabbitName: assignment.rabbit.name,
      isPrimary: assignment.isPrimary,
    });

    assignmentsByUser.set(assignment.userId, current);
  }

  return memberships.map((membership) => {
    const user = membership.user;
    const todayCompleted = completedTaskIdsByUser.get(user.id)?.size ?? 0;
    const lastActivityAt = lastActivityByUser.get(user.id)?.toISOString() ?? null;

    return {
      id: user.id,
      name: getDisplayName(user),
      email: user.email,
      role: membership.role,
      memberSince: membership.createdAt.toISOString(),
      todayCompleted,
      todayTotal: dailyTaskIds.length,
      todayPercent: getPercent(todayCompleted, dailyTaskIds.length),
      lastActivityAt,
      assignedRabbits: assignmentsByUser.get(user.id) ?? [],
    };
  });
}