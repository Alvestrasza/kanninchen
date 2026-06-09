// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Rabbit caretaker assignment helpers for family-based Kaninchen Quest administration.

import { prisma } from "@/lib/db/prisma";

export type RabbitCaretakerAssignmentView = {
  id: string;
  rabbitId: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  isPrimary: boolean;
};

export type RabbitCaretakerChildOption = {
  id: string;
  name: string;
  email: string | null;
};

export type RabbitCaretakerAssignmentInput = {
  rabbitId: string;
  userId: string;
  isPrimary?: boolean;
};

async function assertParentOrAdmin(userId: string, familyId: string): Promise<void> {
  const membership = await prisma.rabbitFamilyMembership.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw new Error("User is not a member of this rabbit family.");
  }

  if (!["parent", "admin"].includes(membership.role)) {
    throw new Error("User is not allowed to manage rabbit caretaker assignments.");
  }
}

async function assertChildInFamily(userId: string, familyId: string): Promise<void> {
  const membership = await prisma.rabbitFamilyMembership.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership || membership.role !== "child") {
    throw new Error("Assigned user must be a child in this rabbit family.");
  }
}

async function assertRabbitInFamily(rabbitId: string, familyId: string): Promise<void> {
  const rabbit = await prisma.rabbitProfile.findFirst({
    where: {
      id: rabbitId,
      familyId,
    },
    select: {
      id: true,
    },
  });

  if (!rabbit) {
    throw new Error("Rabbit does not belong to this family.");
  }
}

export async function getFamilyChildOptions(
  viewerUserId: string,
  familyId: string,
): Promise<RabbitCaretakerChildOption[]> {
  await assertParentOrAdmin(viewerUserId, familyId);

  const memberships = await prisma.rabbitFamilyMembership.findMany({
    where: {
      familyId,
      role: "child",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.user.id,
    name: membership.user.name ?? membership.user.email ?? "Unbenanntes Kind",
    email: membership.user.email,
  }));
}

export async function getRabbitCaretakerAssignments(
  viewerUserId: string,
  familyId: string,
): Promise<RabbitCaretakerAssignmentView[]> {
  await assertParentOrAdmin(viewerUserId, familyId);

  const assignments = await prisma.rabbitCaretakerAssignment.findMany({
    where: {
      familyId,
    },
    orderBy: [
      {
        isPrimary: "desc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      rabbitId: true,
      userId: true,
      isPrimary: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return assignments.map((assignment) => ({
    id: assignment.id,
    rabbitId: assignment.rabbitId,
    userId: assignment.userId,
    userName: assignment.user.name ?? assignment.user.email ?? "Unbenanntes Kind",
    userEmail: assignment.user.email,
    isPrimary: assignment.isPrimary,
  }));
}

export async function assignRabbitCaretaker(
  viewerUserId: string,
  familyId: string,
  input: RabbitCaretakerAssignmentInput,
): Promise<RabbitCaretakerAssignmentView[]> {
  await assertParentOrAdmin(viewerUserId, familyId);
  await assertRabbitInFamily(input.rabbitId, familyId);
  await assertChildInFamily(input.userId, familyId);

  await prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.rabbitCaretakerAssignment.updateMany({
        where: {
          familyId,
          rabbitId: input.rabbitId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    await tx.rabbitCaretakerAssignment.upsert({
      where: {
        familyId_rabbitId_userId: {
          familyId,
          rabbitId: input.rabbitId,
          userId: input.userId,
        },
      },
      update: {
        isPrimary: input.isPrimary ?? false,
      },
      create: {
        familyId,
        rabbitId: input.rabbitId,
        userId: input.userId,
        isPrimary: input.isPrimary ?? false,
      },
    });
  });

  return getRabbitCaretakerAssignments(viewerUserId, familyId);
}

export async function removeRabbitCaretakerAssignment(
  viewerUserId: string,
  familyId: string,
  assignmentId: string,
): Promise<RabbitCaretakerAssignmentView[]> {
  await assertParentOrAdmin(viewerUserId, familyId);

  const assignment = await prisma.rabbitCaretakerAssignment.findFirst({
    where: {
      id: assignmentId,
      familyId,
    },
    select: {
      id: true,
    },
  });

  if (!assignment) {
    throw new Error("Caretaker assignment was not found in this family.");
  }

  await prisma.rabbitCaretakerAssignment.delete({
    where: {
      id: assignment.id,
    },
  });

  return getRabbitCaretakerAssignments(viewerUserId, familyId);
}

export async function getVisibleRabbitCaretakerAssignments(
  viewerUserId: string,
  familyId: string,
): Promise<RabbitCaretakerAssignmentView[]> {
  const membership = await prisma.rabbitFamilyMembership.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId: viewerUserId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    throw new Error("User is not a member of this rabbit family.");
  }

  const assignments = await prisma.rabbitCaretakerAssignment.findMany({
    where: {
      familyId,
    },
    orderBy: [
      {
        isPrimary: "desc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      rabbitId: true,
      userId: true,
      isPrimary: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return assignments.map((assignment) => ({
    id: assignment.id,
    rabbitId: assignment.rabbitId,
    userId: assignment.userId,
    userName: assignment.user.name ?? assignment.user.email ?? "Unbenanntes Kind",
    userEmail: assignment.user.email,
    isPrimary: assignment.isPrimary,
  }));
}