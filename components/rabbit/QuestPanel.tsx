"use client";

import { AnimatePresence, motion } from "motion/react";

import { BunnyCard } from "@/components/rabbit/BunnyCard";
import type { RabbitTask } from "@/types/rabbit";

type QuestPanelProps = {
  task: RabbitTask;
  subtasks: boolean[];
  completed: boolean;
  onToggleSubtask: (index: number) => void;
  onComplete: () => void;
};

export function QuestPanel({
  task,
  subtasks,
  completed,
  onToggleSubtask,
  onComplete,
}: QuestPanelProps) {
  return (
    <section className="panel quest-panel" aria-live="polite">
      <div className="quest-head">
        <BunnyCard animated />

        <div>
          <motion.h1
            key={task.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
          {completed
            ? "Alle Aufgaben erledigt!"
            : "Erledige erst die Teilaufgaben oder schließe die Quest direkt ab."}
        </p>
      </div>
    </section>
  );
}