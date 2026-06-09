"use client";

// Meta
// Version: 0.1.2
// Created: 2026-06-08
// Updated: 2026-06-09
// Purpose: Secondary views for Kaninchen Quest, including dashboard, lexicon, rabbit profiles, achievements and settings.

import { motion } from "motion/react";

import type { RabbitView } from "@/components/rabbit/rabbit-navigation";
import type { RabbitAchievementView } from "@/lib/rabbit/achievements";
import { getCaretakerLevelInfo } from "@/lib/rabbit/level";

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

const rabbitProfilePlaceholders = [
  {
    icon: "🐰",
    title: "Kaninchenprofil vorbereiten",
    description:
      "Hier werden später Name, Geburtstag, Rasse, Farbe und besondere Hinweise zu jedem Kaninchen angezeigt.",
  },
  {
    icon: "⚖️",
    title: "Gesundheitsdaten",
    description:
      "Gewicht, Tierarztbesuche, Auffälligkeiten und Pflegehinweise können später pro Tier dokumentiert werden.",
  },
  {
    icon: "💬",
    title: "Charakter & Verhalten",
    description:
      "Notiere später, ob ein Kaninchen eher mutig, vorsichtig, neugierig oder ruhig ist.",
  },
] as const;

export function SecondaryView({
  view,
  completedCount,
  totalTasks,
  totalXp,
  achievements,
  onReset,
  onResetAll,
}: SecondaryViewProps) {
  const levelInfo = getCaretakerLevelInfo(totalXp);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const nextAchievement = achievements
    .filter((achievement) => !achievement.unlocked)
    .sort((left, right) => right.percent - left.percent)[0];

  if (view === "home") {
    return (
      <>
        <h2>Home</h2>

        <p>
          Willkommen zurück. Hier siehst du auf einen Blick, wie deine Pflege heute läuft und
          was du schon erreicht hast.
        </p>

        <div className="home-dashboard">
          <motion.article
            className="home-hero-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="level-badge large">
              <span>{levelInfo.level}</span>
            </div>

            <div>
              <span className="home-kicker">Tierpfleger-Level</span>
              <h3>{levelInfo.title}</h3>

              <div className="xp-track">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.percent}%` }}
                />
              </div>

              <small>
                {levelInfo.isMaxLevel
                  ? `${levelInfo.totalXp.toLocaleString("de-DE")} XP erreicht`
                  : `${levelInfo.totalXp.toLocaleString("de-DE")} / ${levelInfo.nextLevelXp.toLocaleString("de-DE")} XP`}
              </small>
            </div>
          </motion.article>

          <div className="home-stat-grid">
            <div className="info-tile">
              <strong>
                {completedCount} / {totalTasks}
              </strong>
              <br />
              Heute erledigt
            </div>

            <div className="info-tile">
              <strong>{unlockedCount}</strong>
              <br />
              Erfolge freigeschaltet
            </div>

            <div className="info-tile">
              <strong>{totalXp.toLocaleString("de-DE")}</strong>
              <br />
              Erfahrungspunkte
            </div>

            <div className="info-tile">
              <strong>{Math.round((completedCount / Math.max(1, totalTasks)) * 100)} %</strong>
              <br />
              Tagesfortschritt
            </div>
          </div>

          <section className="home-next-card">
            <div className="section-label">Nächstes Ziel</div>

            {nextAchievement ? (
              <article className="achievement-mini-card">
                <span>{nextAchievement.icon}</span>

                <div>
                  <strong>{nextAchievement.title}</strong>
                  <small>
                    {nextAchievement.progress} / {nextAchievement.target} · {nextAchievement.percent} %
                  </small>
                </div>
              </article>
            ) : (
              <article className="achievement-mini-card">
                <span>🏆</span>

                <div>
                  <strong>Alle Erfolge freigeschaltet</strong>
                  <small>Großartige Pflegearbeit.</small>
                </div>
              </article>
            )}
          </section>
        </div>
      </>
    );
  }

  if (view === "rabbits") {
    return (
      <>
        <h2>Kaninchen</h2>

        <p>
          Hier werden später die zu betreuenden Kaninchen hinterlegt. Für den Moment ist diese
          Seite als Übersicht vorbereitet.
        </p>

        <div className="rabbit-profile-grid">
          {rabbitProfilePlaceholders.map((item) => (
            <motion.article
              className="guide-card rabbit-profile-card"
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.article>
          ))}
        </div>
      </>
    );
  }

  if (view === "lexicon") {
    return (
      <>
        <h2>Lexikon</h2>

        <p>
          Kurzes Pflegewissen für den Alltag. Diese Hinweise helfen, Kaninchen gesund,
          sicher und aufmerksam zu betreuen.
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

  if (view === "journal") {
    return (
      <>
        <h2>Tagebuch</h2>

        <p>
          Heute: Futter aufgefüllt, Wasser gewechselt und viel Freilauf eingeplant.
        </p>

        <div className="mobile-grid">
          <div className="info-tile">
            <strong>📝</strong>
            <br />
            Beobachtungen und Notizen folgen später.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h2>Aufgaben</h2>

      <p>Wähle eine Aufgabe aus und pflege deine Kaninchen Schritt für Schritt.</p>

      <div className="mobile-grid">
        <div className="info-tile">
          <strong>
            {completedCount} / {totalTasks}
          </strong>
          <br />
          Aufgaben erledigt
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