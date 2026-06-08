"use client";

import { motion } from "motion/react";
import type { RabbitView } from "@/components/rabbit/rabbit-navigation";
import type { RabbitAchievementView } from "@/lib/rabbit/achievements";

type SecondaryViewProps = {
  view: RabbitView;
  completedCount: number;
  totalTasks: number;
  totalXp: number;
  achievements: RabbitAchievementView[];
  onReset: () => void;
  onResetAll: () => void;
};

const rabbitGuideItems = [
  [
    "🏡",
    "Haltung",
    "Mindestens zwei Kaninchen zusammen halten. Der Lebensbereich sollte dauerhaft groß, trocken, sicher und gut belüftet sein.",
  ],
  [
    "🌾",
    "Ernährung",
    "Heu muss immer verfügbar sein. Dazu frisches Grünfutter, Kräuter, Gemüse und täglich frisches Wasser. Leckerlis nur selten.",
  ],
  [
    "🐇",
    "Bewegung",
    "Zwergkaninchen brauchen täglich Auslauf, Verstecke, Tunnel, erhöhte Plätze und Beschäftigung zum Knabbern und Erkunden.",
  ],
  [
    "💖",
    "Gesundheit",
    "Fressverhalten, Gewicht, Zähne, Augen, Nase, Fell, Kot und Krallen regelmäßig prüfen. Bei Fressunlust sofort tierärztlich abklären.",
  ],
  [
    "🧹",
    "Pflege",
    "Toilettenecken täglich reinigen, Einstreu trocken halten, Näpfe spülen und Fell sowie Krallen je nach Bedarf kontrollieren.",
  ],
  [
    "😊",
    "Verhalten",
    "Hoppeln, Buddeln, Putzen und Ruhen sind normal. Zähneknirschen, Apathie oder ein aufgeblähter Bauch können Warnzeichen sein.",
  ],
] as const;

const secondaryContent: Partial<Record<RabbitView, [string, string]>> = {
  journal: ["Tagebuch", "Heute: Futter aufgefüllt, Wasser gewechselt und viel Freilauf eingeplant."],
  lexicon: ["Lexikon", "Heu, Frischfutter, Wasser und tägliche Beobachtung sind die wichtigsten Grundlagen."],
};

export function SecondaryView({
  view,
  completedCount,
  totalTasks,
  totalXp,
  achievements,
  onReset,
  onResetAll,
}: SecondaryViewProps) {
  if (view === "rabbits") {
    return (
      <>
        <h2>Zwergkaninchen</h2>

        <p>
          Zwergkaninchen sind soziale, bewegungsfreudige Tiere. Sie brauchen Artgenossen,
          viel Platz, gutes Futter und tägliche Beobachtung.
        </p>

        <div className="rabbit-guide">
          {rabbitGuideItems.map(([icon, title, copy]) => (
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
    const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
    const nextAchievements = achievements
      .filter((achievement) => !achievement.unlocked)
      .sort((left, right) => right.percent - left.percent)
      .slice(0, 3);

    return (
      <>
        <h2>Erfolge</h2>

        <div className="achievement-summary">
          <div>
            <strong>
              {unlockedCount} / {achievements.length}
            </strong>
            <span>Erfolge freigeschaltet</span>
          </div>

          <div>
            <strong>{nextAchievements[0]?.percent ?? 100} %</strong>
            <span>Nächster Erfolg</span>
          </div>
        </div>

        {nextAchievements.length > 0 && (
          <section className="achievement-next">
            <div className="section-label">Fast geschafft</div>

            <div className="achievement-next-list">
              {nextAchievements.map((achievement) => (
                <article className="achievement-mini-card" key={achievement.id}>
                  <span>{achievement.icon}</span>

                  <div>
                    <strong>{achievement.title}</strong>
                    <small>
                      {achievement.progress} / {achievement.target}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="achievement-grid">
          {achievements.map((achievement) => (
            <motion.article
              className={`achievement-card${achievement.unlocked ? " unlocked" : " locked"}`}
              key={achievement.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="achievement-card-head">
                <div className={`badge-mark${achievement.unlocked ? "" : " locked"}`}>
                  {achievement.icon}
                </div>

                <span className={`achievement-status${achievement.unlocked ? " unlocked" : ""}`}>
                  {achievement.unlocked ? "Freigeschaltet" : "Offen"}
                </span>
              </div>

              <h3>{achievement.title}</h3>

              <p>{achievement.description}</p>

              <div className="achievement-progress">
                <div className="achievement-progress-line">
                  <span>
                    {achievement.progress} / {achievement.target}
                  </span>

                  <strong>{achievement.percent} %</strong>
                </div>

                <div className="xp-track">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.percent}%` }}
                  />
                </div>
              </div>
            </motion.article>
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
          Der Fortschritt wird pro Benutzer in der Datenbank gespeichert.
          Der vollständige Reset ist nur für die Testphase gedacht.
        </p>

        <div className="mobile-grid">
          <div className="info-tile">
            <strong>
              {completedCount} / {totalTasks}
            </strong>
            <br />
            Tagesaufgaben erledigt
          </div>

          <div className="info-tile">
            <strong>{totalXp.toLocaleString("de-DE")}</strong>
            <br />
            XP gespeichert
          </div>

          <button className="danger-button" type="button" onClick={onReset}>
            Nur Tagesfortschritt zurücksetzen
          </button>

          <button className="danger-button danger-button-strong" type="button" onClick={onResetAll}>
            Test-Reset: Aufgaben, XP und Erfolge löschen
          </button>
        </div>
      </>
    );
  }

  const [title, copy] = secondaryContent[view] ?? [
    "Home",
    "Wähle eine Aufgabe aus und pflege deine Kaninchen Schritt für Schritt.",
  ];

  return (
    <>
      <h2>{title}</h2>

      <p>{copy}</p>

      <div className="mobile-grid">
        <div className="info-tile">
          <strong>
            {completedCount} / {totalTasks}
          </strong>
          <br />
          Aufgaben erledigt
        </div>

        <div className="info-tile">
          <strong>{completedCount}</strong>
          <br />
          Tage Streak
        </div>

        <div className="info-tile">
          <strong>{totalXp.toLocaleString("de-DE")}</strong>
          <br />
          Erfahrungspunkte
        </div>
      </div>
    </>
  );
}