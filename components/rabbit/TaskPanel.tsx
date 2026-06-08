"use client";

import { motion } from "motion/react";

import { completedFromSubtasks } from "@/components/rabbit/rabbit-progress-state";
import { rabbitTasks } from "@/data/rabbit/tasks";
import type { TaskProgressState } from "@/lib/rabbit/progress";

type TaskPanelProps = {
  activeTaskId: string;
  progress: TaskProgressState;
  onSelectTask: (taskId: string) => void;
};

export function TaskPanel({ activeTaskId, progress, onSelectTask }: TaskPanelProps) {
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