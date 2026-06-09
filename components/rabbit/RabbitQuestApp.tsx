"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createRabbitProfileAction,
  deleteRabbitProfileAction,
  resetAllRabbitDataAction,
  resetProgressAction,
  saveTaskProgressAction,
  setActiveTaskAction,
  updateRabbitProfileAction,
} from "@/app/actions";
import { rabbitTasks } from "@/data/rabbit/tasks";
import type { TaskProgressState } from "@/lib/rabbit/progress";
import type { RabbitAchievementView } from "@/lib/rabbit/achievements";
import type { AppRole } from "@/lib/auth/roles";
import type { RabbitFamilyView } from "@/lib/rabbit/families";
import type {
  RabbitProfileCreateInput,
  RabbitProfileUpdateInput,
  RabbitProfileView,
} from "@/lib/rabbit/profiles";
import { topTabs, type RabbitView } from "@/components/rabbit/rabbit-navigation";
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
  initialUserRoles: AppRole[];
  initialFamily: RabbitFamilyView;
  initialActiveTaskId: string;
  initialProgress: TaskProgressState;
  initialStreakCount: number;
  initialTotalXp: number;
  initialAchievements: RabbitAchievementView[];
  initialRabbits: RabbitProfileView[];
};

export function RabbitQuestApp({
  userName,
  initialUserRoles,
  initialFamily,
  initialActiveTaskId,
  initialProgress,
  initialStreakCount,
  initialTotalXp,
  initialAchievements,
  initialRabbits,
}: RabbitQuestAppProps) {
  const initialTaskExists = rabbitTasks.some((task) => task.id === initialActiveTaskId);
  const activeFamily = initialFamily;
  const canUseParentArea =
    initialUserRoles.includes("parent") || initialUserRoles.includes("admin");

  const visibleTabs = topTabs.filter(
    (tab) => tab.view !== "parents" || canUseParentArea,
  ); 
  const [activeTaskId, setActiveTaskId] = useState(initialTaskExists ? initialActiveTaskId : "feed");
  const [progress, setProgress] = useState<TaskProgressState>(initialProgress);
  const [streakCount, setStreakCount] = useState(initialStreakCount);
  const [totalXp, setTotalXp] = useState(initialTotalXp);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [rabbits, setRabbits] = useState(initialRabbits);
  const [isRabbitModalOpen, setIsRabbitModalOpen] = useState(false);
  const [editingRabbit, setEditingRabbit] = useState<RabbitProfileView | null>(null);
  const [recentUnlockIds, setRecentUnlockIds] = useState<string[]>([]);
  const [view, setView] = useState<RabbitView>("home");
  const [message, setMessage] = useState("Fortschritt wird sicher gespeichert.");
  const [isMessageVisible, setIsMessageVisible] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!message) {
      return;
    }

    setIsMessageVisible(true);

    const timeout = window.setTimeout(() => {
      setIsMessageVisible(false);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [message]);

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
  const isPrimaryView = view === "quests";
  const recentUnlocks = achievements.filter((achievement) =>
    recentUnlockIds.includes(achievement.id),
  );

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
        const result = await saveTaskProgressAction(activeFamily.id, taskId, nextSubtasks);

        setProgress(result.progress);
        setStreakCount(result.streakCount);
        setTotalXp(result.totalXp);
        setAchievements(result.achievements);
        setRabbits(result.rabbits);

        if (result.unlockedAchievementIds.length > 0) {
          setRecentUnlockIds(result.unlockedAchievementIds);

          window.setTimeout(() => {
            setRecentUnlockIds([]);
          }, 4200);

          setMessage(
            result.awardedXp > 0
              ? `${successMessage} +${result.awardedXp} XP · Neuer Erfolg freigeschaltet!`
              : `${successMessage} Neuer Erfolg freigeschaltet!`,
          );
          return;
        }

        setRecentUnlockIds([]);

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
      const result = await resetProgressAction(activeFamily.id);

      setProgress(result.progress);
      setStreakCount(result.streakCount);
      setTotalXp(result.totalXp);
      setAchievements(result.achievements);
      setRabbits(result.rabbits);
      setRecentUnlockIds([]);
      setMessage("Tagesfortschritt wurde zurückgesetzt. XP und Erfolge bleiben erhalten.");
    } catch {
      setMessage("Zurücksetzen fehlgeschlagen. Bitte prüfe Anmeldung und Datenbankverbindung.");
    }
  });
};

  const resetAllRabbitData = () => {
    const confirmed = window.confirm(
      "Wirklich alles zurücksetzen? Aufgaben, XP und Erfolge werden für diesen Benutzer gelöscht.",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await resetAllRabbitDataAction(activeFamily.id);

        setProgress(result.progress);
        setStreakCount(result.streakCount);
        setTotalXp(result.totalXp);
        setAchievements(result.achievements);
        setRabbits(result.rabbits);
        setRecentUnlockIds([]);
        setMessage("Test-Reset abgeschlossen. Aufgaben, XP und Erfolge wurden zurückgesetzt.");
      } catch {
        setMessage("Vollständiger Reset fehlgeschlagen. Bitte prüfe Anmeldung und Datenbankverbindung.");
      }
    });
  };

  const createRabbitProfile = (input: RabbitProfileCreateInput) => {
    startTransition(async () => {
      try {
        const nextRabbits = await createRabbitProfileAction(activeFamily.id, input);

        setRabbits(nextRabbits);
        setIsRabbitModalOpen(false);
        setMessage(`Kaninchenprofil „${input.name.trim()}“ wurde angelegt.`);
      } catch {
        setMessage("Kaninchenprofil konnte nicht angelegt werden. Bitte prüfe die Eingaben.");
      }
    });
  };

  const updateRabbitProfile = (input: RabbitProfileUpdateInput) => {
    startTransition(async () => {
      try {
        const nextRabbits = await updateRabbitProfileAction(activeFamily.id, input);

        setRabbits(nextRabbits);
        setEditingRabbit(null);
        setIsRabbitModalOpen(false);
        setMessage(`Kaninchenprofil „${input.name.trim()}“ wurde aktualisiert.`);
      } catch {
        setMessage("Kaninchenprofil konnte nicht aktualisiert werden. Bitte prüfe die Eingaben.");
      }
    });
  };

  const deleteRabbitProfile = (rabbit: RabbitProfileView) => {
    const confirmed = window.confirm(
      `Kaninchenprofil „${rabbit.name}“ wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const nextRabbits = await deleteRabbitProfileAction(activeFamily.id, rabbit.id);

        setRabbits(nextRabbits);
        setMessage(`Kaninchenprofil „${rabbit.name}“ wurde gelöscht.`);
      } catch {
        setMessage("Kaninchenprofil konnte nicht gelöscht werden.");
      }
    });
  };

  const openCreateRabbitModal = () => {
    setEditingRabbit(null);
    setIsRabbitModalOpen(true);
  };

  const openEditRabbitModal = (rabbit: RabbitProfileView) => {
    setEditingRabbit(rabbit);
    setIsRabbitModalOpen(true);
  };

  const closeRabbitModal = () => {
    setEditingRabbit(null);
    setIsRabbitModalOpen(false);
  };  

  const setCurrentView = (nextView: RabbitView) => {
    if (nextView === "parents" && !canUseParentArea) {
      setView("home");
      setMessage("Der Elternbereich ist für diesen Benutzer nicht freigeschaltet.");
      return;
    }

    setView(nextView);
  };

  return (
    <div className="app-shell">
      <div className="scanline" aria-hidden="true" />

        <TopNavigation
          view={view}
          visibleTabs={visibleTabs}
          onChangeView={setCurrentView}
        />

        <UserStrip
          userName={userName}
          isPending={isPending}
          message={isMessageVisible ? message : ""}
          showRabbitAddButton={view === "rabbits"}
          onAddRabbit={openCreateRabbitModal}
        />

        <AnimatePresence>
          {recentUnlocks.map((achievement) => (
            <motion.div
              className="achievement-toast"
              key={achievement.id}
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <div className="achievement-toast-icon">{achievement.icon}</div>

              <div>
                <strong>Neuer Erfolg!</strong>
                <span>{achievement.title}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

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
              achievements={achievements}
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
            userName={userName}
            familyName={activeFamily.name}
            completedCount={completedDailyCount}
            totalTasks={totalDailyTasks}
            totalXp={totalXp}
            achievements={achievements}
            rabbits={rabbits}
            editingRabbit={editingRabbit}
            isRabbitModalOpen={isRabbitModalOpen}
            onCloseRabbitModal={closeRabbitModal}
            onCreateRabbit={createRabbitProfile}
            onUpdateRabbit={updateRabbitProfile}
            onEditRabbit={openEditRabbitModal}
            onDeleteRabbit={deleteRabbitProfile}
            onReset={resetProgress}
            onResetAll={resetAllRabbitData}
          />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}