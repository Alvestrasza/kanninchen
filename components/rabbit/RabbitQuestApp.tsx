"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { rabbitTasks } from "@/data/rabbit/tasks";
import { topTabs, type RabbitView } from "@/components/rabbit/rabbit-navigation";
import { TaskPanel } from "@/components/rabbit/TaskPanel";
import { QuestPanel } from "@/components/rabbit/QuestPanel";
import { SideStack } from "@/components/rabbit/SideStack";
import { SecondaryView } from "@/components/rabbit/SecondaryView";
import { UserStrip } from "@/components/rabbit/UserStrip";
import { TopNavigation } from "@/components/rabbit/TopNavigation";
import {
  createRabbitProfileAction,
  deleteRabbitProfileAction,
  resetAllRabbitDataAction,
  resetProgressAction,
  saveTaskProgressAction,
  setActiveTaskAction,
  setThemeAction,
  updateRabbitProfileAction,
} from "@/app/actions";
import {
  completedFromSubtasks,
  getCompletedCount,
  getCompletedDailyCount,
  getDailyTasks,
  normalizeTaskSubtasks,
} from "@/components/rabbit/rabbit-progress-state";
import type { TaskProgressState } from "@/lib/rabbit/progress";
import type { RabbitAchievementView } from "@/lib/rabbit/achievements";
import type { AppRole } from "@/lib/auth/roles";
import type { RabbitFamilyView } from "@/lib/rabbit/families";
import type { ParentDashboardView } from "@/lib/rabbit/parent-dashboard";
import type { RabbitFamilyMemberOverviewView } from "@/lib/rabbit/family-members";
import type { RabbitThemeId } from "@/lib/rabbit/themes";
import type {
  RabbitCaretakerAssignmentView,
  RabbitCaretakerChildOption,
} from "@/lib/rabbit/caretaker-assignments";
import type {
  RabbitProfileCreateInput,
  RabbitProfileUpdateInput,
  RabbitProfileView,
} from "@/lib/rabbit/profiles";

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
  initialTheme: RabbitThemeId;
  initialParentDashboard: ParentDashboardView | null;
  initialParentChildOptions: RabbitCaretakerChildOption[];
  initialCaretakerAssignments: RabbitCaretakerAssignmentView[];
  userId: string;
  initialFamilyMembers: RabbitFamilyMemberOverviewView[];
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
  initialTheme,
  initialParentDashboard,
  initialParentChildOptions,
  initialCaretakerAssignments,
  userId,
  initialFamilyMembers,
}: RabbitQuestAppProps) {
  const initialTaskExists = rabbitTasks.some((task) => task.id === initialActiveTaskId);
  const activeFamily = initialFamily;
  const canUseParentArea = activeFamily.role === "parent" || activeFamily.role === "admin";
  const [activeTaskId, setActiveTaskId] = useState(initialTaskExists ? initialActiveTaskId : "feed");
  const [progress, setProgress] = useState<TaskProgressState>(initialProgress);
  const [streakCount, setStreakCount] = useState(initialStreakCount);
  const [totalXp, setTotalXp] = useState(initialTotalXp);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [rabbits, setRabbits] = useState(initialRabbits);
  const [theme, setTheme] = useState<RabbitThemeId>(initialTheme);
  const [isRabbitModalOpen, setIsRabbitModalOpen] = useState(false);
  const [editingRabbit, setEditingRabbit] = useState<RabbitProfileView | null>(null);
  const [recentUnlockIds, setRecentUnlockIds] = useState<string[]>([]);
  const [view, setView] = useState<RabbitView>("home");
  const [navigationDirection, setNavigationDirection] = useState(1);
  const [message, setMessage] = useState("Fortschritt wird sicher gespeichert.");
  const [isMessageVisible, setIsMessageVisible] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.dataset.rabbitTheme = theme;

    return () => {
      delete document.documentElement.dataset.rabbitTheme;
    };
  }, [theme]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentIndex = topTabs.findIndex((tab) => tab.view === view);

      if (currentIndex < 0) {
        return;
      }

      if (event.key === "ArrowLeft") {
        const previousTab = topTabs[(currentIndex - 1 + topTabs.length) % topTabs.length];
        setCurrentView(previousTab.view);
      }

      if (event.key === "ArrowRight") {
        const nextTab = topTabs[(currentIndex + 1) % topTabs.length];
        setCurrentView(nextTab.view);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [view]);

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

  const changeTheme = (nextTheme: RabbitThemeId) => {
    setTheme(nextTheme);
    setMessage("Theme gespeichert.");

    startTransition(async () => {
      try {
        const savedTheme = await setThemeAction(nextTheme);
        setTheme(savedTheme);
        setMessage("Theme wurde gespeichert.");
      } catch {
        setMessage("Theme konnte nicht gespeichert werden.");
      }
    });
  };

  const setCurrentView = (nextView: RabbitView) => {
    if (nextView === view) {
      return;
    }

    const currentIndex = topTabs.findIndex((tab) => tab.view === view);
    const nextIndex = topTabs.findIndex((tab) => tab.view === nextView);

    if (currentIndex >= 0 && nextIndex >= 0) {
      const forwardDistance = (nextIndex - currentIndex + topTabs.length) % topTabs.length;
      const backwardDistance = (currentIndex - nextIndex + topTabs.length) % topTabs.length;

      setNavigationDirection(forwardDistance <= backwardDistance ? 1 : -1);
    }

    setView(nextView);
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <div className="scanline" aria-hidden="true" />

        <TopNavigation
          view={view}
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
          className="dashboard purah-swipe-surface"
          id="dashboard"
          initial={{
            opacity: 0,
            x: navigationDirection * 42,
            filter: "blur(0.35rem)",
          }}
          animate={{
            opacity: 1,
            x: 0,
            filter: "blur(0rem)",
          }}
          exit={{
            opacity: 0,
            x: navigationDirection * -34,
            filter: "blur(0.3rem)",
          }}
          transition={{
            duration: 0.34,
            ease: [0.22, 1, 0.36, 1],
          }}
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
              className="mobile-view panel purah-swipe-surface"
              initial={{
                opacity: 0,
                x: navigationDirection * 42,
                scale: 0.985,
                filter: "blur(0.35rem)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: "blur(0rem)",
              }}
              exit={{
                opacity: 0,
                x: navigationDirection * -34,
                scale: 0.985,
                filter: "blur(0.3rem)",
              }}
              transition={{
                duration: 0.34,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
            <SecondaryView
              view={view}
              userName={userName}
              familyName={activeFamily.name}
              canUseParentArea={canUseParentArea}
              completedCount={completedDailyCount}
              totalTasks={totalDailyTasks}
              totalXp={totalXp}
              achievements={achievements}
              rabbits={rabbits}
              familyId={activeFamily.id}
              parentDashboard={initialParentDashboard}
              parentChildOptions={initialParentChildOptions}
              initialCaretakerAssignments={initialCaretakerAssignments}
              userId={userId}
              initialFamilyMembers={initialFamilyMembers}
              activeTheme={theme}
              onThemeChange={changeTheme}
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