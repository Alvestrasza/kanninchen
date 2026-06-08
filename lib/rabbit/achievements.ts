// Meta
// Version: 0.1.0
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: Achievement progress and unlock helpers for Kaninchen Quest.

import { rabbitAchievements } from "@/data/rabbit/achievements";
import { rabbitTasks } from "@/data/rabbit/tasks";
import { prisma } from "@/lib/db/prisma";
import { getCaretakerLevelInfo } from "@/lib/rabbit/level";
import { getUserTotalXp } from "@/lib/rabbit/xp";

export type RabbitAchievementView = {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  target: number;
  percent: number;
  unlocked: boolean;
  unlockedAt: Date | null;
};

function clampProgress(progress: number, target: number): number {
  return Math.min(target, Math.max(0, progress));
}

function getTaskIdFromAchievementId(achievementId: string): string | null {
  if (achievementId === "feed_10") return "feed";
  if (achievementId === "water_10") return "water";
  if (achievementId === "hay_10") return "hay";
  if (achievementId === "health_10") return "health";
  if (achievementId === "clean_10") return "clean";

  return null;
}

async function getCompletedTaskCount(userId: string, taskId?: string): Promise<number> {
  return prisma.rabbitTaskProgress.count({
    where: {
      userId,
      completed: true,
      ...(taskId ? { taskId } : {}),
    },
  });
}

async function getFullDailyCareDays(userId: string): Promise<number> {
  const dailyTaskIds = rabbitTasks
    .filter((task) => task.frequency === "daily")
    .map((task) => task.id);

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

  const byDate = new Map<string, Set<string>>();

  for (const record of records) {
    const taskIds = byDate.get(record.dateKey) ?? new Set<string>();
    taskIds.add(record.taskId);
    byDate.set(record.dateKey, taskIds);
  }

  let completedDays = 0;

  for (const taskIds of byDate.values()) {
    if (dailyTaskIds.every((taskId) => taskIds.has(taskId))) {
      completedDays += 1;
    }
  }

  return completedDays;
}

export async function getAchievementProgressMap(
  userId: string,
  streakCount: number,
): Promise<Map<string, number>> {
  const totalXp = await getUserTotalXp(userId);
  const levelInfo = getCaretakerLevelInfo(totalXp);

  const [
    totalCompletedTasks,
    fullDailyCareDays,
    feedCount,
    waterCount,
    hayCount,
    healthCount,
    cleanCount,
  ] = await Promise.all([
    getCompletedTaskCount(userId),
    getFullDailyCareDays(userId),
    getCompletedTaskCount(userId, "feed"),
    getCompletedTaskCount(userId, "water"),
    getCompletedTaskCount(userId, "hay"),
    getCompletedTaskCount(userId, "health"),
    getCompletedTaskCount(userId, "clean"),
  ]);

  return new Map<string, number>([
    ["first_task", totalCompletedTasks],
    ["first_full_day", fullDailyCareDays],
    ["daily_tasks_7", fullDailyCareDays],
    ["daily_tasks_30", fullDailyCareDays],
    ["feed_10", feedCount],
    ["water_10", waterCount],
    ["hay_10", hayCount],
    ["health_10", healthCount],
    ["clean_10", cleanCount],
    ["streak_3", streakCount],
    ["streak_7", streakCount],
    ["streak_30", streakCount],
    ["level_5", levelInfo.level],
    ["level_10", levelInfo.level],
    ["level_25", levelInfo.level],
  ]);
}

export async function unlockEligibleAchievements(
  userId: string,
  streakCount: number,
): Promise<string[]> {
  const progressMap = await getAchievementProgressMap(userId, streakCount);
  const unlockedIds: string[] = [];

  for (const achievement of rabbitAchievements) {
    const progress = progressMap.get(achievement.id) ?? 0;

    if (progress < achievement.target) {
      continue;
    }

    const result = await prisma.rabbitAchievementUnlock.createMany({
      data: {
        userId,
        achievementId: achievement.id,
      },
      skipDuplicates: true,
    });

    if (result.count === 1) {
      unlockedIds.push(achievement.id);
    }
  }

  return unlockedIds;
}

export async function getUserAchievementViews(
  userId: string,
  streakCount: number,
): Promise<RabbitAchievementView[]> {
  const [progressMap, unlocks] = await Promise.all([
    getAchievementProgressMap(userId, streakCount),
    prisma.rabbitAchievementUnlock.findMany({
      where: {
        userId,
      },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
    }),
  ]);

  const unlockMap = new Map(unlocks.map((unlock) => [unlock.achievementId, unlock.unlockedAt]));

  return rabbitAchievements.map((achievement) => {
    const rawProgress = progressMap.get(achievement.id) ?? 0;
    const progress = clampProgress(rawProgress, achievement.target);
    const unlockedAt = unlockMap.get(achievement.id) ?? null;
    const unlocked = Boolean(unlockedAt);
    const percent = Math.round((progress / achievement.target) * 100);

    return {
      id: achievement.id,
      icon: achievement.icon,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      progress,
      target: achievement.target,
      percent,
      unlocked,
      unlockedAt,
    };
  });
}