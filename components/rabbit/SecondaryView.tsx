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

    return (
      <>
        <h2>Erfolge</h2>

        <p>
          {unlockedCount} von {achievements.length} Erfolgen freigeschaltet.
          Jeder Erfolg zeigt dir, wie weit du schon gekommen bist.
        </p>

        <div className="badges expanded-badges">
          {achievements.map((achievement) => (
            <div
              className={`guide-card achievement-card${achievement.unlocked ? " unlocked" : " locked"}`}
              key={achievement.id}
            >
              <div className={`badge-mark${achievement.unlocked ? "" : " locked"}`}>
                {achievement.icon}
              </div>

              <h3>{achievement.title}</h3>

              <p>{achievement.description}</p>

              <div className="achievement-progress">
                <span>
                  {achievement.progress} / {achievement.target}
                </span>

                <div className="xp-track">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.percent}%` }}
                  />
                </div>
              </div>

              <small>
                {achievement.unlocked
                  ? "Freigeschaltet"
                  : "Noch nicht freigeschaltet"}
              </small>
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
          Der Fortschritt wird nicht mehr lokal im Browser gespeichert, sondern pro Benutzer
          in einer Datenbank.
        </p>

        <div className="mobile-grid">
          <div className="info-tile">
            <strong>
              {completedCount} / {totalTasks}
            </strong>
            <br />
            Aufgaben erledigt
          </div>

          <button className="danger-button" type="button" onClick={onReset}>
            Fortschritt zurücksetzen
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