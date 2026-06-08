// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Persistence helpers for user-specific rabbit task progress.

import { prisma } from "@/lib/db/prisma";
import { rabbitTasks } from "@/data/rabbit/tasks";
import {
  getUserAchievementViews,
  unlockEligibleAchievements,
  type RabbitAchievementView,
} from "@/lib/rabbit/achievements";
import { awardTaskCompletionXp, getUserTotalXp } from "@/lib/rabbit/xp";

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

function getDailyTaskIds(): string[] {
  return rabbitTasks
    .filter((task) => task.frequency === "daily")
    .map((task) => task.id);
}

function getDefaultActiveTaskId(): string {
  return rabbitTasks.find((task) => task.frequency === "daily")?.id ?? rabbitTasks[0]?.id ?? "feed";
}

function getPreviousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}

export async function getUserStreak(userId: string): Promise<number> {
  const dailyTaskIds = getDailyTaskIds();

  if (dailyTaskIds.length === 0) {
    return 0;
  }

  const records = await prisma.rabbitTaskProgress.findMany({
    where: {
      userId,
      completed: true,
      taskId: {
        in: dailyTaskIds,
      },
    },
    select: {
      dateKey: true,
      taskId: true,
    },
  });

  const completedTaskIdsByDate = new Map<string, Set<string>>();

  for (const record of records) {
    const taskIds = completedTaskIdsByDate.get(record.dateKey) ?? new Set<string>();
    taskIds.add(record.taskId);
    completedTaskIdsByDate.set(record.dateKey, taskIds);
  }

  let streakCount = 0;
  let cursorDateKey = getTodayDateKey();

  while (true) {
    const completedTaskIds = completedTaskIdsByDate.get(cursorDateKey);

    if (!completedTaskIds) {
      break;
    }

    const allDailyTasksCompleted = dailyTaskIds.every((taskId) => completedTaskIds.has(taskId));

    if (!allDailyTasksCompleted) {
      break;
    }

    streakCount += 1;
    cursorDateKey = getPreviousDateKey(cursorDateKey);
  }

  return streakCount;
}

export type TaskProgressState = Record<
  string,
  {
    completed: boolean;
    subtasks: boolean[];
  }
>;

export type UserProgressState = {
  activeTaskId: string;
  progress: TaskProgressState;
  streakCount: number;
  totalXp: number;
  achievements: RabbitAchievementView[];
};

export type ProgressUpdateResult = {
  progress: TaskProgressState;
  streakCount: number;
  totalXp: number;
  awardedXp: number;
  achievements: RabbitAchievementView[];
  unlockedAchievementIds: string[];
};

function normalizeSubtasks(value: unknown, length: number): boolean[] {
  if (!Array.isArray(value)) {
    return Array.from({ length }, () => false);
  }

  return Array.from({ length }, (_, index) => Boolean(value[index]));
}

export async function getUserProgress(userId: string): Promise<UserProgressState> {
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
      create: {
        userId,
        activeTaskId: getDefaultActiveTaskId(),
        activeDateKey: dateKey,
      },
      select: {
        activeTaskId: true,
        activeDateKey: true,
      },
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
  const isSameDay = preference.activeDateKey === dateKey;

  const activeTaskId =
    isSameDay && taskExists ? preference.activeTaskId : getDefaultActiveTaskId();

  if (preference.activeTaskId !== activeTaskId || preference.activeDateKey !== dateKey) {
    await prisma.rabbitUserPreference.update({
      where: { userId },
      data: {
        activeTaskId,
        activeDateKey: dateKey,
      },
    });
  }

  const [streakCount, totalXp] = await Promise.all([
    getUserStreak(userId),
    getUserTotalXp(userId),
  ]);

  const achievements = await getUserAchievementViews(userId, streakCount);

  return {
    activeTaskId,
    progress,
    streakCount,
    totalXp,
    achievements,
  };
}

export async function upsertTaskProgress(
  userId: string,
  taskId: string,
  subtasks: boolean[],
): Promise<ProgressUpdateResult> {
  const dateKey = getTodayDateKey();
  const task = rabbitTasks.find((candidate) => candidate.id === taskId);

  if (!task) {
    throw new Error(`Unknown task id: ${taskId}`);
  }

  const normalized = normalizeSubtasks(subtasks, task.subtasks.length);
  const completed = normalized.every(Boolean);

  const where = {
    userId_taskId_dateKey: {
      userId,
      taskId,
      dateKey,
    },
  };

  const existing = await prisma.rabbitTaskProgress.findUnique({
    where,
    select: {
      completed: true,
    },
  });

  const savedProgress = await prisma.rabbitTaskProgress.upsert({
    where,
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
    select: {
      id: true,
    },
  });

  let awardedXp = 0;
  let unlockedAchievementIds: string[] = [];

  if (completed && !existing?.completed) {
    awardedXp = await awardTaskCompletionXp({
      userId,
      taskProgressId: savedProgress.id,
      taskId,
      dateKey,
    });

    const streakCount = await getUserStreak(userId);
    unlockedAchievementIds = await unlockEligibleAchievements(userId, streakCount);
  }

  const state = await getUserProgress(userId);

  return {
    progress: state.progress,
    streakCount: state.streakCount,
    totalXp: state.totalXp,
    awardedXp,
    achievements: state.achievements,
    unlockedAchievementIds,
  };
}

export async function setActiveTask(userId: string, activeTaskId: string): Promise<string> {
  const dateKey = getTodayDateKey();
  const taskExists = rabbitTasks.some((task) => task.id === activeTaskId);
  const safeTaskId = taskExists ? activeTaskId : getDefaultActiveTaskId();

  await prisma.rabbitUserPreference.upsert({
    where: { userId },
    update: {
      activeTaskId: safeTaskId,
      activeDateKey: dateKey,
    },
    create: {
      userId,
      activeTaskId: safeTaskId,
      activeDateKey: dateKey,
    },
  });

  return safeTaskId;
}

export async function resetAllProgress(userId: string): Promise<ProgressUpdateResult> {
  const dateKey = getTodayDateKey();

  await prisma.rabbitTaskProgress.deleteMany({
    where: {
      userId,
      dateKey,
    },
  });

  const state = await getUserProgress(userId);

  return {
    progress: state.progress,
    streakCount: state.streakCount,
    totalXp: state.totalXp,
    awardedXp: 0,
    achievements: state.achievements,
    unlockedAchievementIds: [],
  };
}
