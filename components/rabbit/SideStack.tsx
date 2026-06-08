"use client";

import { motion } from "motion/react";
import { baseMetrics } from "@/data/rabbit/tasks";
import type { RabbitAchievementView } from "@/lib/rabbit/achievements";
import { getCaretakerLevelInfo } from "@/lib/rabbit/level";

type SideStackProps = {
  completedCount: number;
  streakCount: number;
  percent: number;
  litSegments: number;
  totalXp: number;
  achievements: RabbitAchievementView[];
  onShowAchievements: () => void;
};

export function SideStack({
  completedCount,
  streakCount,
  percent,
  litSegments,
  totalXp,
  achievements,
  onShowAchievements,
}: SideStackProps) {
  const bonus = Math.min(8, completedCount);
  const levelInfo = getCaretakerLevelInfo(totalXp);
  const formattedTotalXp = levelInfo.totalXp.toLocaleString("de-DE");
  const formattedNextLevelXp = levelInfo.nextLevelXp.toLocaleString("de-DE");
  const highlightedAchievements = achievements
    .filter((achievement) => achievement.unlocked)
    .slice(0, 3);

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
            <span>{streakCount}</span> Tage in Folge
          </div>

          <p>Weiter so! Du bist großartig!</p>
        </div>

        <div className="medal">★</div>
      </section>

      <section className="panel level-panel">
        <div className="level-badge">
          <span>{levelInfo.level}</span>
        </div>

        <div className="level-copy">
          <div>{levelInfo.title}</div>

          <div className="xp-track">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.percent}%` }}
            />
          </div>

          <small>
            {levelInfo.isMaxLevel
              ? `${formattedTotalXp} XP erreicht`
              : `${formattedTotalXp} / ${formattedNextLevelXp} XP`}
          </small>
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
          {highlightedAchievements.length > 0 ? (
            highlightedAchievements.map((achievement) => (
              <div key={achievement.id}>
                <div className="badge-mark">{achievement.icon}</div>
                <div className="badge-title">{achievement.title}</div>
                <div className="badge-copy">Freigeschaltet</div>
              </div>
            ))
          ) : (
            achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id}>
                <div className="badge-mark locked">{achievement.icon}</div>
                <div className="badge-title">{achievement.title}</div>
                <div className="badge-copy">
                  {achievement.progress} / {achievement.target}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}