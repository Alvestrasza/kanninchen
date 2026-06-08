"use client";

// Meta
// Version: 0.1.1
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: Grouped task list panel for selecting rabbit care quests.

import { motion } from "motion/react";

import { completedFromSubtasks } from "@/components/rabbit/rabbit-progress-state";
import { rabbitTasks } from "@/data/rabbit/tasks";
import type { TaskProgressState } from "@/lib/rabbit/progress";
import type { RabbitTaskFrequency } from "@/types/rabbit";

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

export function TaskPanel({ activeTaskId, progress, onSelectTask }: TaskPanelProps) {
  return (
    <aside className="panel task-panel">
      <div className="panel-title">Aufgaben</div>

      <div className="task-sections" id="taskList">
        {taskSections.map((section) => {
          const sectionTasks = rabbitTasks.filter((task) => task.frequency === section.frequency);

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
                {sectionTasks.map((task, index) => {
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