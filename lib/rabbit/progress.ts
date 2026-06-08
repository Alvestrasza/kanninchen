// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Persistence helpers for user-specific rabbit task progress.

import { prisma } from "@/lib/db/prisma";
import { rabbitTasks } from "@/data/rabbit/tasks";

const APP_TIME_ZONE = "Europe/Berlin";

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

export type TaskProgressState = Record<
  string,
  {
    completed: boolean;
    subtasks: boolean[];
  }
>;

function normalizeSubtasks(value: unknown, length: number): boolean[] {
  if (!Array.isArray(value)) {
    return Array.from({ length }, () => false);
  }

  return Array.from({ length }, (_, index) => Boolean(value[index]));
}

export async function getUserProgress(userId: string): Promise<{
  activeTaskId: string;
  progress: TaskProgressState;
}> {
  const dateKey = getTodayDateKey();
  const [records, preference] = await Promise.all([
    prisma.rabbitTaskProgress.findMany({
      where: {
        userId,
        dateKey,
      },
      select: {
        taskId: true,
        completed: true,
        subtasks: true,
      },
    }),
    prisma.rabbitUserPreference.upsert({
      where: { userId },
      update: {},
      create: { userId, activeTaskId: "feed" },
      select: { activeTaskId: true },
    }),
  ]);

  const byTaskId = new Map(records.map((record) => [record.taskId, record]));

  const progress = Object.fromEntries(
    rabbitTasks.map((task) => {
      const record = byTaskId.get(task.id);
      return [
        task.id,
        {
          completed: record?.completed ?? false,
          subtasks: normalizeSubtasks(record?.subtasks, task.subtasks.length),
        },
      ];
    }),
  ) as TaskProgressState;

  const taskExists = rabbitTasks.some((task) => task.id === preference.activeTaskId);

  return {
    activeTaskId: taskExists ? preference.activeTaskId : "feed",
    progress,
  };
}

export async function upsertTaskProgress(
  userId: string,
  taskId: string,
  subtasks: boolean[],
): Promise<TaskProgressState> {
  const dateKey = getTodayDateKey();
  const task = rabbitTasks.find((candidate) => candidate.id === taskId);

  if (!task) {
    throw new Error(`Unknown task id: ${taskId}`);
  }

  const normalized = normalizeSubtasks(subtasks, task.subtasks.length);
  const completed = normalized.every(Boolean);

  await prisma.rabbitTaskProgress.upsert({
    where: {
      userId_taskId_dateKey: {
        userId,
        taskId,
        dateKey,
      },
    },
    update: {
      subtasks: normalized,
      completed,
      completedAt: completed ? new Date() : null,
    },
    create: {
      userId,
      taskId,
      dateKey,
      subtasks: normalized,
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  return (await getUserProgress(userId)).progress;
}

export async function setActiveTask(userId: string, activeTaskId: string): Promise<string> {
  const taskExists = rabbitTasks.some((task) => task.id === activeTaskId);
  const safeTaskId = taskExists ? activeTaskId : "feed";

  await prisma.rabbitUserPreference.upsert({
    where: { userId },
    update: { activeTaskId: safeTaskId },
    create: { userId, activeTaskId: safeTaskId },
  });

  return safeTaskId;
}

export async function resetAllProgress(userId: string): Promise<TaskProgressState> {
  const dateKey = getTodayDateKey();

  await prisma.rabbitTaskProgress.deleteMany({
    where: {
      userId,
      dateKey,
    },
  });

  return (await getUserProgress(userId)).progress;
}
