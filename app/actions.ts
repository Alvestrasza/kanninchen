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
import {
  assignRabbitCaretaker,
  getFamilyChildOptions,
  getRabbitCaretakerAssignments,
  removeRabbitCaretakerAssignment,
  type RabbitCaretakerAssignmentInput,
  type RabbitCaretakerAssignmentView,
  type RabbitCaretakerChildOption,
} from "@/lib/rabbit/caretaker-assignments";

async function requireUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return session.user.id;
}

export async function saveTaskProgressAction(
  familyId: string,
  taskId: string,
  subtasks: boolean[],
): Promise<ProgressUpdateResult> {
  const userId = await requireUserId();
  const result = await upsertTaskProgress(userId, familyId, taskId, subtasks);
  revalidatePath("/");
  return result;
}

export async function setActiveTaskAction(taskId: string): Promise<string> {
  const userId = await requireUserId();
  const activeTaskId = await setActiveTask(userId, taskId);
  revalidatePath("/");
  return activeTaskId;
}

export async function resetProgressAction(familyId: string): Promise<ProgressUpdateResult> {
  const userId = await requireUserId();
  const result = await resetAllProgress(userId, familyId);
  revalidatePath("/");
  return result;
}

export async function resetAllRabbitDataAction(familyId: string): Promise<ProgressUpdateResult> {
  const userId = await requireUserId();
  const result = await resetAllUserRabbitData(userId, familyId);
  revalidatePath("/");
  return result;
}

export async function createRabbitProfileAction(
  familyId: string,
  input: RabbitProfileCreateInput,
): Promise<RabbitProfileView[]> {
  const userId = await requireUserId();
  const rabbits = await createUserRabbitProfile(userId, familyId, input);
  revalidatePath("/");
  return rabbits;
}

export async function updateRabbitProfileAction(
  familyId: string,
  input: RabbitProfileUpdateInput,
): Promise<RabbitProfileView[]> {
  const userId = await requireUserId();
  const rabbits = await updateUserRabbitProfile(userId, familyId, input);
  revalidatePath("/");
  return rabbits;
}

export async function deleteRabbitProfileAction(
  familyId: string,
  rabbitId: string,
): Promise<RabbitProfileView[]> {
  const userId = await requireUserId();
  const rabbits = await deleteUserRabbitProfile(userId, familyId, rabbitId);
  revalidatePath("/");
  return rabbits;
}

export async function getFamilyChildOptionsAction(
  familyId: string,
): Promise<RabbitCaretakerChildOption[]> {
  const userId = await requireUserId();
  return getFamilyChildOptions(userId, familyId);
}

export async function getRabbitCaretakerAssignmentsAction(
  familyId: string,
): Promise<RabbitCaretakerAssignmentView[]> {
  const userId = await requireUserId();
  return getRabbitCaretakerAssignments(userId, familyId);
}

export async function assignRabbitCaretakerAction(
  familyId: string,
  input: RabbitCaretakerAssignmentInput,
): Promise<RabbitCaretakerAssignmentView[]> {
  const userId = await requireUserId();
  const assignments = await assignRabbitCaretaker(userId, familyId, input);
  revalidatePath("/");
  return assignments;
}

export async function removeRabbitCaretakerAssignmentAction(
  familyId: string,
  assignmentId: string,
): Promise<RabbitCaretakerAssignmentView[]> {
  const userId = await requireUserId();
  const assignments = await removeRabbitCaretakerAssignment(userId, familyId, assignmentId);
  revalidatePath("/");
  return assignments;
}