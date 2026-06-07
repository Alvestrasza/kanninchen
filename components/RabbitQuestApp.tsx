"use client";

// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Main interactive Kaninchen Quest dashboard with Motion animations and server persistence.

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useTransition } from "react";

import {
  resetProgressAction,
  saveTaskProgressAction,
  setActiveTaskAction,
} from "@/app/actions";
import { logoutAction } from "@/app/auth-actions";
import { achievements, baseMetrics, rabbitTasks } from "@/data/tasks";
import type { TaskProgressState } from "@/lib/progress";

type View = "home" | "quests" | "journal" | "rabbits" | "achievements" | "lexicon" | "settings";

type RabbitQuestAppProps = {
  userName: string;
  initialActiveTaskId: string;
  initialProgress: TaskProgressState;
};

const topTabs: Array<{ view: View; label: string }> = [
  { view: "quests", label: "Quest-Übersicht" },
  { view: "journal", label: "Tagebuch" },
  { view: "rabbits", label: "Kaninchen" },
  { view: "achievements", label: "Erfolge" },
  { view: "lexicon", label: "Lexikon" },
];

const bottomTabs: Array<{ view: View; label: string; icon: string }> = [
  { view: "home", label: "Home", icon: "⌂" },
  { view: "quests", label: "Quests", icon: "▤" },
  { view: "rabbits", label: "Kaninchen", icon: "♘" },
  { view: "achievements", label: "Erfolge", icon: "♕" },
  { view: "settings", label: "Einstellungen", icon: "⚙" },
];

function completedFromSubtasks(taskId: string, progress: TaskProgressState): boolean {
  const task = rabbitTasks.find((candidate) => candidate.id === taskId);
  if (!task) return false;
  const subtasks = progress[taskId]?.subtasks ?? [];
  return task.subtasks.every((_, index) => Boolean(subtasks[index]));
}

function getCompletedCount(progress: TaskProgressState): number {
  return rabbitTasks.filter((task) => completedFromSubtasks(task.id, progress)).length;
}

function normalizeTaskSubtasks(taskId: string, progress: TaskProgressState): boolean[] {
  const task = rabbitTasks.find((candidate) => candidate.id === taskId) ?? rabbitTasks[0];
  const existing = progress[task.id]?.subtasks ?? [];
  return task.subtasks.map((_, index) => Boolean(existing[index]));
}

export function RabbitQuestApp({
  userName,
  initialActiveTaskId,
  initialProgress,
}: RabbitQuestAppProps) {
  const initialTaskExists = rabbitTasks.some((task) => task.id === initialActiveTaskId);
  const [activeTaskId, setActiveTaskId] = useState(initialTaskExists ? initialActiveTaskId : "feed");
  const [progress, setProgress] = useState<TaskProgressState>(initialProgress);
  const [view, setView] = useState<View>("quests");
  const [message, setMessage] = useState("Fortschritt wird in PostgreSQL gespeichert.");
  const [isPending, startTransition] = useTransition();

  const activeTask = useMemo(
    () => rabbitTasks.find((task) => task.id === activeTaskId) ?? rabbitTasks[0],
    [activeTaskId],
  );
  const activeSubtasks = normalizeTaskSubtasks(activeTask.id, progress);
  const activeCompleted = completedFromSubtasks(activeTask.id, progress);
  const completedCount = getCompletedCount(progress);
  const totalTasks = rabbitTasks.length;
  const percent = Math.round((completedCount / totalTasks) * 100);
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
        const savedProgress = await saveTaskProgressAction(taskId, nextSubtasks);
        setProgress(savedProgress);
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
        const savedProgress = await resetProgressAction();
        setProgress(savedProgress);
        setMessage("Fortschritt wurde zurückgesetzt.");
      } catch {
        setMessage("Zurücksetzen fehlgeschlagen. Bitte prüfe Anmeldung und Datenbankverbindung.");
      }
    });
  };

  const setCurrentView = (nextView: View) => {
    setView(nextView);
  };

  return (
    <div className="app-shell">
      <div className="scanline" aria-hidden="true" />
      <header className="topbar" aria-label="Hauptnavigation">
        <button className="shoulder" aria-label="Vorheriger Bereich" type="button">
          L
        </button>
        <nav className="tabs" id="topTabs">
          {topTabs.map((tab) => (
            <button
              key={tab.view}
              className={`tab ${view === tab.view || (view === "home" && tab.view === "quests") ? "active" : ""}`}
              type="button"
              onClick={() => setCurrentView(tab.view)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="shoulder" aria-label="Nächster Bereich" type="button">
          R
        </button>
      </header>

      <div className="user-strip panel">
        <div>
          <span className="section-label">Angemeldet</span>
          <strong>{userName}</strong>
        </div>
        <span className="sync-state">{isPending ? "Synchronisiere…" : message}</span>
        <form action={logoutAction}>
          <button className="ghost-button" type="submit">
            Abmelden
          </button>
        </form>
      </div>

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
              percent={percent}
              litSegments={litSegments}
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
              completedCount={completedCount}
              totalTasks={totalTasks}
              onReset={resetProgress}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="bottom-nav" id="bottomNav" aria-label="Schnellnavigation">
        {bottomTabs.map((tab) => (
          <button
            key={tab.view}
            className={view === tab.view ? "active" : ""}
            type="button"
            onClick={() => setCurrentView(tab.view)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </footer>
    </div>
  );
}

function TaskPanel({
  activeTaskId,
  progress,
  onSelectTask,
}: {
  activeTaskId: string;
  progress: TaskProgressState;
  onSelectTask: (taskId: string) => void;
}) {
  return (
    <aside className="panel task-panel">
      <div className="panel-title">Tägliche Aufgaben</div>
      <div className="task-list" id="taskList">
        {rabbitTasks.map((task, index) => {
          const active = task.id === activeTaskId;
          const completed = completedFromSubtasks(task.id, progress);
          return (
            <motion.button
              key={task.id}
              className={`task-item${active ? " active" : ""}`}
              type="button"
              onClick={() => onSelectTask(task.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, delay: index * 0.025 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="task-icon">{task.icon}</span>
              <span className="task-name">
                {task.title}
                {task.weekly ? <span className="task-meta">{task.weekly}</span> : null}
              </span>
              <span className="check">{completed ? "✓" : ""}</span>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}

function QuestPanel({
  task,
  subtasks,
  completed,
  onToggleSubtask,
  onComplete,
}: {
  task: (typeof rabbitTasks)[number];
  subtasks: boolean[];
  completed: boolean;
  onToggleSubtask: (index: number) => void;
  onComplete: () => void;
}) {
  return (
    <section className="panel quest-panel" aria-live="polite">
      <div className="quest-head">
        <motion.div
          className="bunny-card"
          aria-hidden="true"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="bunny-ears" />
          <div className="bunny-face">
            <span className="eye left" />
            <span className="eye right" />
            <span className="nose" />
            <span className="smile" />
          </div>
          <motion.div
            className="food-bowl"
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            🥬
          </motion.div>
        </motion.div>
        <div>
          <motion.h1 key={task.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {task.title}
          </motion.h1>
          <span className="pill">{task.type}</span>
          <p>{task.description}</p>
        </div>
      </div>

      <div className="section-label">Aufgaben</div>
      <div className="subtasks" id="subtasks">
        <AnimatePresence mode="popLayout">
          {task.subtasks.map((subtask, index) => (
            <motion.article
              className="subtask"
              key={`${task.id}-${subtask.title}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <span className="task-icon">{subtask.icon}</span>
              <div>
                <h2>{subtask.title}</h2>
                <p>{subtask.description}</p>
              </div>
              <button
                className={`subtask-toggle ${subtasks[index] ? "done" : ""}`}
                type="button"
                aria-label={`${subtask.title} umschalten`}
                onClick={() => onToggleSubtask(index)}
              >
                {subtasks[index] ? "✓" : ""}
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      <div className="complete-wrap">
        <motion.button
          className="complete-btn"
          type="button"
          disabled={completed}
          onClick={onComplete}
          whileHover={completed ? undefined : { scale: 1.02 }}
          whileTap={completed ? undefined : { scale: 0.98 }}
        >
          <span>✓</span>
          {completed ? "Quest erledigt" : "Quest abschließen"}
        </motion.button>
        <p className="completion-note">
          {completed ? "Alle Aufgaben erledigt!" : "Erledige erst die Teilaufgaben oder schließe die Quest direkt ab."}
        </p>
      </div>
    </section>
  );
}

function SideStack({
  completedCount,
  percent,
  litSegments,
  onShowAchievements,
}: {
  completedCount: number;
  percent: number;
  litSegments: number;
  onShowAchievements: () => void;
}) {
  const bonus = Math.min(8, completedCount);

  return (
    <aside className="side-stack">
      <section className="panel status-panel">
        <div className="panel-title">Kaninchen-Status</div>
        <div className="metric-list" id="metrics">
          {baseMetrics.map((metric) => {
            const score = Math.min(100, metric.value + bonus);
            return (
              <div className="metric" key={metric.label}>
                <span className="metric-icon">{metric.icon}</span>
                <span>{metric.label}</span>
                <div className="bar">
                  <motion.span initial={{ width: 0 }} animate={{ width: `${score}%` }} />
                </div>
                <strong>{score} %</strong>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel progress-panel">
        <div className="panel-title">Tagesfortschritt</div>
        <div className="day-progress">
          <span className="mini-bunny">🐰</span>
          <div className="segmented" id="segments" aria-hidden="true">
            {Array.from({ length: 15 }, (_, index) => (
              <span key={index} className={`segment ${index < litSegments ? "on" : ""}`} />
            ))}
          </div>
          <strong>{percent} %</strong>
        </div>
      </section>

      <section className="panel streak-panel">
        <motion.div
          className="flame"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          🔥
        </motion.div>
        <div>
          <div className="panel-title">Streak</div>
          <div className="streak-number">
            <span>{15 + completedCount}</span> Tage in Folge
          </div>
          <p>Weiter so! Du bist großartig!</p>
        </div>
        <div className="medal">★</div>
      </section>

      <section className="panel level-panel">
        <div className="level-badge">
          <span>{completedCount >= 9 ? 8 : 7}</span>
        </div>
        <div className="level-copy">
          <div>Tierpfleger Level {completedCount >= 9 ? 8 : 7}</div>
          <div className="xp-track">
            <motion.span initial={{ width: 0 }} animate={{ width: `${Math.min(100, 65 + completedCount * 4)}%` }} />
          </div>
          <small>{650 + completedCount * 40} / 1000 XP</small>
        </div>
      </section>

      <section className="panel achievement-panel">
        <div className="achievement-head">
          <div className="panel-title">Erfolge</div>
          <button type="button" onClick={onShowAchievements}>
            Ansehen ›
          </button>
        </div>
        <div className="badges" id="badges">
          {achievements.map((achievement) => (
            <div key={achievement.title}>
              <div className="badge-mark">{achievement.icon}</div>
              <div className="badge-title">{achievement.title}</div>
              <div className="badge-copy">{achievement.description}</div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function SecondaryView({
  view,
  completedCount,
  totalTasks,
  onReset,
}: {
  view: View;
  completedCount: number;
  totalTasks: number;
  onReset: () => void;
}) {
  if (view === "rabbits") {
    return (
      <>
        <h2>Zwergkaninchen</h2>
        <p>
          Zwergkaninchen sind soziale, bewegungsfreudige Tiere. Sie brauchen Artgenossen, viel
          Platz, gutes Futter und tägliche Beobachtung.
        </p>
        <div className="rabbit-guide">
          {[
            ["🏡", "Haltung", "Mindestens zwei Kaninchen zusammen halten. Der Lebensbereich sollte dauerhaft groß, trocken, sicher und gut belüftet sein."],
            ["🌾", "Ernährung", "Heu muss immer verfügbar sein. Dazu frisches Grünfutter, Kräuter, Gemüse und täglich frisches Wasser. Leckerlis nur selten."],
            ["🐇", "Bewegung", "Zwergkaninchen brauchen täglich Auslauf, Verstecke, Tunnel, erhöhte Plätze und Beschäftigung zum Knabbern und Erkunden."],
            ["💖", "Gesundheit", "Fressverhalten, Gewicht, Zähne, Augen, Nase, Fell, Kot und Krallen regelmäßig prüfen. Bei Fressunlust sofort tierärztlich abklären."],
            ["🧹", "Pflege", "Toilettenecken täglich reinigen, Einstreu trocken halten, Näpfe spülen und Fell sowie Krallen je nach Bedarf kontrollieren."],
            ["😊", "Verhalten", "Hoppeln, Buddeln, Putzen und Ruhen sind normal. Zähneknirschen, Apathie oder aufgeblähter Bauch können Warnzeichen sein."],
          ].map(([icon, title, copy]) => (
            <motion.article
              className="guide-card"
              key={title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>{icon}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </motion.article>
          ))}
        </div>
      </>
    );
  }

  if (view === "achievements") {
    return (
      <>
        <h2>Erfolge</h2>
        <p>Aktive Serie, saubere Stallpflege und Fütterungsroutine laufen.</p>
        <div className="badges expanded-badges">
          {achievements.map((achievement) => (
            <div className="guide-card" key={achievement.title}>
              <div className="badge-mark">{achievement.icon}</div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (view === "settings") {
    return (
      <>
        <h2>Einstellungen</h2>
        <p>
          Der Fortschritt wird nicht mehr lokal im Browser gespeichert, sondern pro Keycloak-Benutzer
          in PostgreSQL.
        </p>
        <div className="mobile-grid">
          <div className="info-tile">
            <strong>{completedCount} / {totalTasks}</strong>
            <br />Aufgaben erledigt
          </div>
          <button className="danger-button" type="button" onClick={onReset}>
            Fortschritt zurücksetzen
          </button>
        </div>
      </>
    );
  }

  const content: Record<string, [string, string]> = {
    journal: ["Tagebuch", "Heute: Futter aufgefüllt, Wasser gewechselt und viel Freilauf eingeplant."],
    lexicon: ["Lexikon", "Heu, Frischfutter, Wasser und tägliche Beobachtung sind die wichtigsten Grundlagen."],
  };

  const [title, copy] = content[view] ?? [
    "Home",
    "Wähle eine Aufgabe aus und pflege deine Kaninchen Schritt für Schritt.",
  ];

  return (
    <>
      <h2>{title}</h2>
      <p>{copy}</p>
      <div className="mobile-grid">
        <div className="info-tile">
          <strong>{completedCount} / {totalTasks}</strong>
          <br />Aufgaben erledigt
        </div>
        <div className="info-tile">
          <strong>{15 + completedCount}</strong>
          <br />Tage Streak
        </div>
        <div className="info-tile">
          <strong>{650 + completedCount * 40}</strong>
          <br />Erfahrungspunkte
        </div>
      </div>
    </>
  );
}
