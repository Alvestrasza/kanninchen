"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useTransition } from "react";
import { resetProgressAction, saveTaskProgressAction, setActiveTaskAction } from "@/app/actions";
import { rabbitTasks } from "@/data/rabbit/tasks";
import type { TaskProgressState } from "@/lib/rabbit/progress";
import type { RabbitView } from "@/components/rabbit/rabbit-navigation";
import { TaskPanel } from "@/components/rabbit/TaskPanel";
import {
  completedFromSubtasks,
  getCompletedCount,
  getCompletedDailyCount,
  getDailyTasks,
  normalizeTaskSubtasks,
} from "@/components/rabbit/rabbit-progress-state";
import { QuestPanel } from "@/components/rabbit/QuestPanel";
import { SideStack } from "@/components/rabbit/SideStack";
import { SecondaryView } from "@/components/rabbit/SecondaryView";
import { UserStrip } from "@/components/rabbit/UserStrip";
import { TopNavigation } from "@/components/rabbit/TopNavigation";

type RabbitQuestAppProps = {
  userName: string;
  initialActiveTaskId: string;
  initialProgress: TaskProgressState;
  initialStreakCount: number;
  initialTotalXp: number;
};

export function RabbitQuestApp({
  userName,
  initialActiveTaskId,
  initialProgress,
  initialStreakCount,
  initialTotalXp,
}: RabbitQuestAppProps) {
  const initialTaskExists = rabbitTasks.some((task) => task.id === initialActiveTaskId);
const [activeTaskId, setActiveTaskId] = useState(initialTaskExists ? initialActiveTaskId : "feed");
const [progress, setProgress] = useState<TaskProgressState>(initialProgress);
const [streakCount, setStreakCount] = useState(initialStreakCount);
const [totalXp, setTotalXp] = useState(initialTotalXp);
const [view, setView] = useState<RabbitView>("quests");
const [message, setMessage] = useState("Fortschritt wird sicher gespeichert.");
const [isPending, startTransition] = useTransition();

  const activeTask = useMemo(
    () => rabbitTasks.find((task) => task.id === activeTaskId) ?? rabbitTasks[0],
    [activeTaskId],
  );
  const activeSubtasks = normalizeTaskSubtasks(activeTask.id, progress);
  const activeCompleted = completedFromSubtasks(activeTask.id, progress);
  const completedCount = getCompletedCount(progress);
  const completedDailyCount = getCompletedDailyCount(progress);
  const totalDailyTasks = getDailyTasks().length;
  const percent =
    totalDailyTasks > 0 ? Math.round((completedDailyCount / totalDailyTasks) * 100) : 0;
  const litSegments = Math.round((percent / 100) * 15);
  const isPrimaryView = view === "home" || view === "quests";

  const selectTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setView("quests");
    startTransition(async () => {
      await setActiveTaskAction(taskId);
    });
  };

  const saveSubtasks = (taskId: string, nextSubtasks: boolean[], successMessage: string) => {
    setProgress((current) => ({
      ...current,
      [taskId]: {
        completed: nextSubtasks.every(Boolean),
        subtasks: nextSubtasks,
      },
    }));
    setMessage(successMessage);

    startTransition(async () => {
      try {
        const result = await saveTaskProgressAction(taskId, nextSubtasks);

        setProgress(result.progress);
        setStreakCount(result.streakCount);
        setTotalXp(result.totalXp);

        setMessage(
          result.awardedXp > 0
            ? `${successMessage} +${result.awardedXp} XP`
            : successMessage,
        );
      } catch {
        setMessage("Speichern fehlgeschlagen. Bitte prüfe Anmeldung und Datenbankverbindung.");
      }
    });
  };

  const toggleSubtask = (index: number) => {
    const nextSubtasks = activeSubtasks.map((value, currentIndex) =>
      currentIndex === index ? !value : value,
    );
    saveSubtasks(activeTask.id, nextSubtasks, "Teilaufgabe gespeichert.");
  };

  const completeQuest = () => {
    const nextSubtasks = activeTask.subtasks.map(() => true);
    saveSubtasks(activeTask.id, nextSubtasks, "Quest abgeschlossen und gespeichert.");
  };

  const resetProgress = () => {
    startTransition(async () => {
      try {
        const result = await resetProgressAction();

        setProgress(result.progress);
        setStreakCount(result.streakCount);
        setTotalXp(result.totalXp);
        setMessage("Tagesfortschritt wurde zurückgesetzt. XP bleiben erhalten.");
      } catch {
        setMessage("Zurücksetzen fehlgeschlagen. Bitte prüfe Anmeldung und Datenbankverbindung.");
      }
    });
  };

  const setCurrentView = (nextView: RabbitView) => {
    setView(nextView);
  };

  return (
    <div className="app-shell">
      <div className="scanline" aria-hidden="true" />

      <TopNavigation view={view} onChangeView={setCurrentView} />

      <UserStrip userName={userName} isPending={isPending} message={message} />

      <AnimatePresence mode="wait">
        {isPrimaryView ? (
          <motion.main
            key="dashboard"
            className="dashboard"
            id="dashboard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <TaskPanel activeTaskId={activeTask.id} progress={progress} onSelectTask={selectTask} />
            <QuestPanel
              task={activeTask}
              subtasks={activeSubtasks}
              completed={activeCompleted}
              onToggleSubtask={toggleSubtask}
              onComplete={completeQuest}
            />
            <SideStack
              completedCount={completedCount}
              streakCount={streakCount}
              percent={percent}
              litSegments={litSegments}
              totalXp={totalXp}
              onShowAchievements={() => setCurrentView("achievements")}
            />
          </motion.main>
        ) : (
          <motion.section
            key={view}
            className="mobile-view panel"
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.24 }}
          >
          <SecondaryView
            view={view}
            completedCount={completedDailyCount}
            totalTasks={totalDailyTasks}
            totalXp={totalXp}
            onReset={resetProgress}
          />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}