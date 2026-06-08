"use client";

// Meta
// Version: 0.1.2
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: Grouped task list panel for selecting rabbit care quests with animated sorting by completion state.

import { motion } from "motion/react";

import { completedFromSubtasks } from "@/components/rabbit/rabbit-progress-state";
import { rabbitTasks } from "@/data/rabbit/tasks";
import type { TaskProgressState } from "@/lib/rabbit/progress";
import type { RabbitTask, RabbitTaskFrequency } from "@/types/rabbit";

type TaskPanelProps = {
  activeTaskId: string;
  progress: TaskProgressState;
  onSelectTask: (taskId: string) => void;
};

type TaskSection = {
  frequency: RabbitTaskFrequency;
  title: string;
  description: string;
};

type SortableTask = {
  task: RabbitTask;
  originalIndex: number;
  completed: boolean;
};

const taskSections: TaskSection[] = [
  {
    frequency: "daily",
    title: "Heute",
    description: "Aufgaben für die tägliche Pflege",
  },
  {
    frequency: "weekly",
    title: "Diese Woche",
    description: "Regelmäßige Aufgaben für den Wochenrhythmus",
  },
  {
    frequency: "monthly",
    title: "Monatlich",
    description: "Kontrollen mit größerem Abstand",
  },
  {
    frequency: "asNeeded",
    title: "Nach Bedarf",
    description: "Aufgaben, die je nach Situation wichtig werden",
  },
];

function getSortedSectionTasks(
  frequency: RabbitTaskFrequency,
  progress: TaskProgressState,
): SortableTask[] {
  return rabbitTasks
    .map((task, originalIndex) => ({
      task,
      originalIndex,
      completed: completedFromSubtasks(task.id, progress),
    }))
    .filter((entry) => entry.task.frequency === frequency)
    .sort((left, right) => {
      if (left.completed !== right.completed) {
        return left.completed ? 1 : -1;
      }

      return left.originalIndex - right.originalIndex;
    });
}

export function TaskPanel({ activeTaskId, progress, onSelectTask }: TaskPanelProps) {
  return (
    <aside className="panel task-panel">
      <div className="panel-title">Aufgaben</div>

      <div className="task-sections" id="taskList">
        {taskSections.map((section) => {
          const sectionTasks = getSortedSectionTasks(section.frequency, progress);

          if (sectionTasks.length === 0) {
            return null;
          }

          return (
            <section className="task-section" key={section.frequency} aria-label={section.title}>
              <div className="task-section-head">
                <span>{section.title}</span>
                <small>{section.description}</small>
              </div>

              <div className="task-list">
                {sectionTasks.map(({ task, completed }, index) => {
                  const active = task.id === activeTaskId;

                  return (
                    <motion.button
                      key={task.id}
                      layout="position"
                      className={`task-item${active ? " active" : ""}${completed ? " completed" : ""}`}
                      type="button"
                      onClick={() => onSelectTask(task.id)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        opacity: { duration: 0.18, delay: index * 0.025 },
                        x: { duration: 0.18, delay: index * 0.025 },
                        layout: {
                          duration: 0.55,
                          ease: "easeInOut",
                        },
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="task-icon">{task.icon}</span>

                      <span className="task-name">
                        {task.title}
                        <span className="task-meta">{task.type}</span>
                      </span>

                      <span className="check">{completed ? "✓" : ""}</span>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}