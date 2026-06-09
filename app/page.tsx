import { auth } from "@/auth";
import { LoginShell } from "@/components/auth/LoginShell";
import { RabbitQuestApp } from "@/components/rabbit/RabbitQuestApp";
import { getActiveUserFamily } from "@/lib/rabbit/families";
import { getUserProgress } from "@/lib/rabbit/progress";
import { getParentDashboard } from "@/lib/rabbit/parent-dashboard";
import {
  getFamilyChildOptions,
  getVisibleRabbitCaretakerAssignments,
  type RabbitCaretakerChildOption,
} from "@/lib/rabbit/caretaker-assignments";
import type { ParentDashboardView } from "@/lib/rabbit/parent-dashboard";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <LoginShell />;
  }

  const activeFamily = await getActiveUserFamily({
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email,
    roles: session.user.roles ?? [],
    familyKey: session.user.familyKey,
  });

  const state = await getUserProgress(session.user.id, activeFamily.id);

  const canUseParentArea =
    session.user.roles?.includes("parent") || session.user.roles?.includes("admin");

  let parentDashboard: ParentDashboardView | null = null;
  let parentChildOptions: RabbitCaretakerChildOption[] = [];

  const caretakerAssignments = await getVisibleRabbitCaretakerAssignments(
    session.user.id,
    activeFamily.id,
  );

  if (canUseParentArea) {
    [parentDashboard, parentChildOptions] = await Promise.all([
      getParentDashboard(activeFamily.id, session.user.id),
      getFamilyChildOptions(session.user.id, activeFamily.id),
    ]);
  }

  return (
    <RabbitQuestApp
      userName={session.user.name ?? session.user.email ?? "Tierpfleger"}
      initialUserRoles={session.user.roles ?? []}
      initialFamily={activeFamily}
      initialActiveTaskId={state.activeTaskId}
      initialProgress={state.progress}
      initialStreakCount={state.streakCount}
      initialTotalXp={state.totalXp}
      initialAchievements={state.achievements}
      initialRabbits={state.rabbits}
      userId={session.user.id}
      initialParentDashboard={parentDashboard}
      initialParentChildOptions={parentChildOptions}
      initialCaretakerAssignments={caretakerAssignments}
    />
  );
}
