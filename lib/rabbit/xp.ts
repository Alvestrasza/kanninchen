// Meta
// Version: 0.1.0
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: XP ledger helpers for Kaninchen Quest.

import { rabbitTasks } from "@/data/rabbit/tasks";
import { prisma } from "@/lib/db/prisma";
import { getXpForTaskFrequency } from "@/lib/rabbit/level";

export const TASK_COMPLETED_XP_SOURCE = "task_completed";

type AwardTaskCompletionXpInput = {
  userId: string;
  taskProgressId: string;
  taskId: string;
  dateKey: string;
};

export async function getUserTotalXp(userId: string): Promise<number> {
  const result = await prisma.rabbitXpEvent.aggregate({
    where: {
      userId,
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount ?? 0;
}

export async function awardTaskCompletionXp({
  userId,
  taskProgressId,
  taskId,
  dateKey,
}: AwardTaskCompletionXpInput): Promise<number> {
  const task = rabbitTasks.find((candidate) => candidate.id === taskId);

  if (!task) {
    throw new Error(`Unknown task id: ${taskId}`);
  }

  const amount = getXpForTaskFrequency(task.frequency);

  const result = await prisma.rabbitXpEvent.createMany({
    data: {
      userId,
      taskProgressId,
      taskId,
      dateKey,
      source: TASK_COMPLETED_XP_SOURCE,
      frequency: task.frequency,
      amount,
      reason: `Task completed: ${task.title}`,
    },
    skipDuplicates: true,
  });

  return result.count === 1 ? amount : 0;
}