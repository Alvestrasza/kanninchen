// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Read-only parent dashboard data for family-wide Kaninchen Quest overviews.

import { prisma } from "@/lib/db/prisma";
import { rabbitTasks } from "@/data/rabbit/tasks";

const APP_TIME_ZONE = "Europe/Berlin";
const HISTORY_DAYS = 14;

export type ParentDashboardChildView = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  todayCompleted: number;
  todayTotal: number;
  todayPercent: number;
  lastActivityAt: string | null;
};

export type ParentDashboardHistoryEntry = {
  dateKey: string;
  childId: string;
  childName: string;
  completed: number;
  total: number;
  percent: number;
};

export type ParentDashboardRabbitView = {
  id: string;
  name: string;
  breed: string | null;
  color: string | null;
  notes: string | null;
  birthday: string | null;
};

export type ParentDashboardView = {
  family: {
    id: string;
    key: string;
    name: string;
  };
  children: ParentDashboardChildView[];
  history: ParentDashboardHistoryEntry[];
  rabbits: ParentDashboardRabbitView[];
};

function getDateKey(date = new Date()): string {
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

function getHistoryDateKeys(days: number): string[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return getDateKey(date);
  });
}

function getPercent(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function getDisplayName(user: { name: string | null; email: string | null }): string {
  return user.name ?? user.email ?? "Unbenanntes Kind";
}

export async function getParentDashboard(
  familyId: string,
  viewerUserId: string,
): Promise<ParentDashboardView> {
  const viewerMembership = await prisma.rabbitFamilyMembership.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId: viewerUserId,
      },
    },
    select: {
      role: true,
      family: {
        select: {
          id: true,
          key: true,
          name: true,
        },
      },
    },
  });

  if (!viewerMembership) {
    throw new Error("User is not a member of this rabbit family.");
  }

  if (!["parent", "admin"].includes(viewerMembership.role)) {
    throw new Error("User is not allowed to view the parent dashboard.");
  }

  const dailyTaskIds = rabbitTasks
    .filter((task) => task.frequency === "daily")
    .map((task) => task.id);

  const todayDateKey = getDateKey();
  const historyDateKeys = getHistoryDateKeys(HISTORY_DAYS);

  const [childMemberships, rabbits] = await Promise.all([
    prisma.rabbitFamilyMembership.findMany({
      where: {
        familyId,
        role: "child",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.rabbitProfile.findMany({
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
    }),
  ]);

  const childIds = childMemberships.map((membership) => membership.user.id);

  if (childIds.length === 0) {
    return {
      family: viewerMembership.family,
      children: [],
      history: [],
      rabbits: rabbits.map((rabbit) => ({
        id: rabbit.id,
        name: rabbit.name,
        breed: rabbit.breed,
        color: rabbit.color,
        notes: rabbit.notes,
        birthday: rabbit.birthday?.toISOString() ?? null,
      })),
    };
  }

  const progressRecords = await prisma.rabbitTaskProgress.findMany({
    where: {
      userId: {
        in: childIds,
      },
      taskId: {
        in: dailyTaskIds,
      },
      dateKey: {
        in: historyDateKeys,
      },
    },
    select: {
      userId: true,
      taskId: true,
      dateKey: true,
      completed: true,
      completedAt: true,
      updatedAt: true,
    },
  });

  const completedTaskIdsByUserAndDate = new Map<string, Set<string>>();
  const lastActivityByUser = new Map<string, Date>();

  for (const record of progressRecords) {
    const activityAt = record.completedAt ?? record.updatedAt;
    const previousActivityAt = lastActivityByUser.get(record.userId);

    if (!previousActivityAt || activityAt > previousActivityAt) {
      lastActivityByUser.set(record.userId, activityAt);
    }

    if (!record.completed) {
      continue;
    }

    const key = `${record.userId}:${record.dateKey}`;
    const completedTaskIds = completedTaskIdsByUserAndDate.get(key) ?? new Set<string>();
    completedTaskIds.add(record.taskId);
    completedTaskIdsByUserAndDate.set(key, completedTaskIds);
  }

  const children = childMemberships.map((membership) => {
    const user = membership.user;
    const todayCompleted = completedTaskIdsByUserAndDate.get(`${user.id}:${todayDateKey}`)?.size ?? 0;
    const lastActivityAt = lastActivityByUser.get(user.id)?.toISOString() ?? null;

    return {
      id: user.id,
      name: getDisplayName(user),
      email: user.email,
      role: membership.role,
      todayCompleted,
      todayTotal: dailyTaskIds.length,
      todayPercent: getPercent(todayCompleted, dailyTaskIds.length),
      lastActivityAt,
    };
  });

  const history = historyDateKeys.flatMap((dateKey) =>
    childMemberships.map((membership) => {
      const user = membership.user;
      const completed = completedTaskIdsByUserAndDate.get(`${user.id}:${dateKey}`)?.size ?? 0;

      return {
        dateKey,
        childId: user.id,
        childName: getDisplayName(user),
        completed,
        total: dailyTaskIds.length,
        percent: getPercent(completed, dailyTaskIds.length),
      };
    }),
  );

  return {
    family: viewerMembership.family,
    children,
    history,
    rabbits: rabbits.map((rabbit) => ({
      id: rabbit.id,
      name: rabbit.name,
      breed: rabbit.breed,
      color: rabbit.color,
      notes: rabbit.notes,
      birthday: rabbit.birthday?.toISOString() ?? null,
    })),
  };
}