"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  resetAllProgress,
  setActiveTask,
  type TaskProgressState,
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
