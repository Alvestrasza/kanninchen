"use server";

// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Server actions used by the Kaninchen Quest client UI.

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  resetAllProgress,
  setActiveTask,
  TaskProgressState,
  upsertTaskProgress,
} from "@/lib/progress";

async function requireUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return session.user.id;
}

export async function saveTaskProgressAction(
  taskId: string,
  subtasks: boolean[],
): Promise<TaskProgressState> {
  const userId = await requireUserId();
  const progress = await upsertTaskProgress(userId, taskId, subtasks);
  revalidatePath("/");
  return progress;
}

export async function setActiveTaskAction(taskId: string): Promise<string> {
  const userId = await requireUserId();
  const activeTaskId = await setActiveTask(userId, taskId);
  revalidatePath("/");
  return activeTaskId;
}

export async function resetProgressAction(): Promise<TaskProgressState> {
  const userId = await requireUserId();
  const progress = await resetAllProgress(userId);
  revalidatePath("/");
  return progress;
}
