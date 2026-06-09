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
import {
  createUserRabbitProfile,
  deleteUserRabbitProfile,
  type RabbitProfileCreateInput,
  type RabbitProfileUpdateInput,
  type RabbitProfileView,
  updateUserRabbitProfile,
} from "@/lib/rabbit/profiles";

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

export async function createRabbitProfileAction(
  input: RabbitProfileCreateInput,
): Promise<RabbitProfileView[]> {
  const userId = await requireUserId();
  const rabbits = await createUserRabbitProfile(userId, input);
  revalidatePath("/");
  return rabbits;
}

export async function updateRabbitProfileAction(
  input: RabbitProfileUpdateInput,
): Promise<RabbitProfileView[]> {
  const userId = await requireUserId();
  const rabbits = await updateUserRabbitProfile(userId, input);
  revalidatePath("/");
  return rabbits;
}

export async function deleteRabbitProfileAction(rabbitId: string): Promise<RabbitProfileView[]> {
  const userId = await requireUserId();
  const rabbits = await deleteUserRabbitProfile(userId, rabbitId);
  revalidatePath("/");
  return rabbits;
}