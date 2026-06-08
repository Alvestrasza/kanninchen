"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  resetAllProgress,
  resetAllUserRabbitData,
  setActiveTask,
  type ProgressUpdateResult,
  upsertTaskProgress,
} from "@/lib/rabbit/progress";

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
): Promise<ProgressUpdateResult> {
  const userId = await requireUserId();
  const result = await upsertTaskProgress(userId, taskId, subtasks);
  revalidatePath("/");
  return result;
}

export async function setActiveTaskAction(taskId: string): Promise<string> {
  const userId = await requireUserId();
  const activeTaskId = await setActiveTask(userId, taskId);
  revalidatePath("/");
  return activeTaskId;
}

export async function resetProgressAction(): Promise<ProgressUpdateResult> {
  const userId = await requireUserId();
  const result = await resetAllProgress(userId);
  revalidatePath("/");
  return result;
}

export async function resetAllRabbitDataAction(): Promise<ProgressUpdateResult> {
  const userId = await requireUserId();
  const result = await resetAllUserRabbitData(userId);
  revalidatePath("/");
  return result;
}