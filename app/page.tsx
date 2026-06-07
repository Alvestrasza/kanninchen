// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Auth-aware home page for Kaninchen Quest.

import { auth } from "@/auth";
import { LoginShell } from "@/components/LoginShell";
import { RabbitQuestApp } from "@/components/RabbitQuestApp";
import { getUserProgress } from "@/lib/progress";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <LoginShell />;
  }

  const state = await getUserProgress(session.user.id);

  return (
    <RabbitQuestApp
      userName={session.user.name ?? session.user.email ?? "Tierpfleger"}
      initialActiveTaskId={state.activeTaskId}
      initialProgress={state.progress}
    />
  );
}
