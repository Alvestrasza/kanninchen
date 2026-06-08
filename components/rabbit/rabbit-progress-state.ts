// Meta
// Version: 0.1.1
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: Shared progress state helpers for Kaninchen Quest UI components.

import { rabbitTasks } from "@/data/rabbit/tasks";
import type { TaskProgressState } from "@/lib/rabbit/progress";

export function completedFromSubtasks(taskId: string, progress: TaskProgressState): boolean {
  const task = rabbitTasks.find((candidate) => candidate.id === taskId);

  if (!task) {
    return false;
  }

  const subtasks = progress[taskId]?.subtasks ?? [];

  return task.subtasks.every((_, index) => Boolean(subtasks[index]));
}

export function getCompletedCount(progress: TaskProgressState): number {
  return rabbitTasks.filter((task) => completedFromSubtasks(task.id, progress)).length;
}

export function normalizeTaskSubtasks(taskId: string, progress: TaskProgressState): boolean[] {
  const task = rabbitTasks.find((candidate) => candidate.id === taskId) ?? rabbitTasks[0];
  const existing = progress[task.id]?.subtasks ?? [];

  return task.subtasks.map((_, index) => Boolean(existing[index]));
}