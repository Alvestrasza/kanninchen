"use client";

// Meta
// Version: 0.1.2
// Created: 2026-06-08
// Updated: 2026-06-09
// Purpose: Secondary views for Kaninchen Quest, including dashboard, lexicon, rabbit profiles, achievements and settings.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { RabbitView } from "@/components/rabbit/rabbit-navigation";
import { rabbitFacts } from "@/data/rabbit/facts";
import type { RabbitAchievementView } from "@/lib/rabbit/achievements";
import { getCaretakerLevelInfo } from "@/lib/rabbit/level";
import type {
  RabbitProfileCreateInput,
  RabbitProfileUpdateInput,
  RabbitProfileView,
} from "@/lib/rabbit/profiles";

type SecondaryViewProps = {
  view: RabbitView;
  userName: string;
  completedCount: number;
  totalTasks: number;
  totalXp: number;
  achievements: RabbitAchievementView[];
  rabbits: RabbitProfileView[];
  editingRabbit: RabbitProfileView | null;
  isRabbitModalOpen: boolean;
  onCloseRabbitModal: () => void;
  onCreateRabbit: (input: RabbitProfileCreateInput) => void;
  onUpdateRabbit: (input: RabbitProfileUpdateInput) => void;
  onEditRabbit: (rabbit: RabbitProfileView) => void;
  onDeleteRabbit: (rabbit: RabbitProfileView) => void;
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

function formatRabbitBirthday(birthday: string | null): string {
  if (!birthday) {
    return "Nicht hinterlegt";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(birthday));
}

function formatBirthdayForInput(birthday: string | null): string {
  if (!birthday) {
    return "";
  }

  return birthday.slice(0, 10);
}

export function SecondaryView({
  view,
  userName,
  completedCount,
  totalTasks,
  totalXp,
  achievements,
  rabbits,
  editingRabbit,
  isRabbitModalOpen,
  onCloseRabbitModal,
  onCreateRabbit,
  onUpdateRabbit,
  onEditRabbit,
  onDeleteRabbit,
  onReset,
  onResetAll,
}: SecondaryViewProps) {
  const levelInfo = getCaretakerLevelInfo(totalXp);
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);
  const unlockedCount = unlockedAchievements.length;
  const latestAchievements = unlockedAchievements.slice(-5).reverse();
  const nextAchievement = achievements
    .filter((achievement) => !achievement.unlocked)
    .sort((left, right) => right.percent - left.percent)[0];

  const dailyPercent = Math.round((completedCount / Math.max(1, totalTasks)) * 100);
  const factIndex = new Date().getDate() % rabbitFacts.length;
  const rabbitFact = rabbitFacts[factIndex];

  const homeStatusText =
    completedCount === 0
      ? "Heute ist noch alles offen. Ein kleiner Anfang reicht schon — such dir die erste Aufgabe aus."
      : completedCount >= totalTasks
        ? "Alle Tagesaufgaben sind erledigt. Deine Kaninchen sind heute gut versorgt."
        : "Ein Teil ist schon geschafft. Bleib ruhig dran, Schritt für Schritt wird der Tag vollständig.";

  const [rabbitName, setRabbitName] = useState("");
  const [rabbitBreed, setRabbitBreed] = useState("");
  const [rabbitColor, setRabbitColor] = useState("");
  const [rabbitBirthday, setRabbitBirthday] = useState("");
  const [rabbitNotes, setRabbitNotes] = useState("");

  const isEditingRabbit = Boolean(editingRabbit);
  const canSaveRabbit = rabbitName.trim().length > 0;

  useEffect(() => {
    if (!isRabbitModalOpen) {
      return;
    }

    if (!editingRabbit) {
      setRabbitName("");
      setRabbitBreed("");
      setRabbitColor("");
      setRabbitBirthday("");
      setRabbitNotes("");
      return;
    }

    setRabbitName(editingRabbit.name);
    setRabbitBreed(editingRabbit.breed ?? "");
    setRabbitColor(editingRabbit.color ?? "");
    setRabbitBirthday(formatBirthdayForInput(editingRabbit.birthday));
    setRabbitNotes(editingRabbit.notes ?? "");
  }, [editingRabbit, isRabbitModalOpen]);

  const submitRabbitProfile = () => {
    if (!canSaveRabbit) {
      return;
    }

    const input = {
      name: rabbitName,
      breed: rabbitBreed,
      color: rabbitColor,
      birthday: rabbitBirthday,
      notes: rabbitNotes,
    };

    if (editingRabbit) {
      onUpdateRabbit({
        id: editingRabbit.id,
        ...input,
      });
      return;
    }

    onCreateRabbit(input);
  };

  const closeRabbitModal = () => {
    onCloseRabbitModal();
    setRabbitName("");
    setRabbitBreed("");
    setRabbitColor("");
    setRabbitBirthday("");
    setRabbitNotes("");
  };

  if (view === "home") {
    return (
      <>
        <section className="home-welcome">
          <span className="home-kicker">Willkommen zurück</span>
          <h2>Hallo, {userName}</h2>
          <p>{homeStatusText}</p>
        </section>

        <div className="home-dashboard home-dashboard-split">
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

          <motion.article
            className="home-care-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="home-care-ring">
              <strong>{dailyPercent}%</strong>
              <span>Heute</span>
            </div>

            <div>
              <span className="home-kicker">Tagespflege</span>
              <h3>
                {completedCount} von {totalTasks} Aufgaben erledigt
              </h3>
              <p>{homeStatusText}</p>
            </div>
          </motion.article>

          <section className="home-fact-card home-wide">
            <div className="section-label">Wusstest du schon?</div>

            <div className="home-fact-content">
              <div className="home-fact-icon">{rabbitFact.icon}</div>

              <div>
                <h3>{rabbitFact.title}</h3>
                <p>{rabbitFact.text}</p>
              </div>
            </div>
          </section>

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

          <section className="home-badges-card">
            <div className="section-label">Letzte Erfolge</div>

            {latestAchievements.length > 0 ? (
              <div className="home-badge-row">
                {latestAchievements.map((achievement) => (
                  <div className="home-badge" key={achievement.id} title={achievement.title}>
                    <span>{achievement.icon}</span>
                    <small>{achievement.title}</small>
                  </div>
                ))}
              </div>
            ) : (
              <article className="achievement-mini-card">
                <span>🌱</span>

                <div>
                  <strong>Noch keine Erfolge</strong>
                  <small>Der erste Erfolg wartet schon auf dich.</small>
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
          Hier findest du die Kaninchen, die betreut werden. Über den Button
          oben rechts kannst du ein neues Kaninchenprofil hinzufügen.
        </p>

        {rabbits.length > 0 ? (
          <div className="rabbit-profile-grid">
            {rabbits.map((rabbit) => (
              <motion.article
                className="rabbit-profile-card"
                key={rabbit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
              <div className="rabbit-profile-head">
                <div className="rabbit-avatar">🐰</div>

                <div>
                  <span className="home-kicker">Kaninchenprofil</span>
                  <h3>{rabbit.name}</h3>
                </div>

                <div className="rabbit-card-actions">
                  <button className="ghost-button tiny" type="button" onClick={() => onEditRabbit(rabbit)}>
                    Bearbeiten
                  </button>

                  <button
                    className="ghost-button tiny danger-text"
                    type="button"
                    onClick={() => onDeleteRabbit(rabbit)}
                  >
                    Löschen
                  </button>
                </div>
              </div>

                <dl className="rabbit-profile-facts">
                  <div>
                    <dt>Rasse</dt>
                    <dd>{rabbit.breed ?? "Nicht hinterlegt"}</dd>
                  </div>

                  <div>
                    <dt>Farbe</dt>
                    <dd>{rabbit.color ?? "Nicht hinterlegt"}</dd>
                  </div>

                  <div>
                    <dt>Geburtstag</dt>
                    <dd>{formatRabbitBirthday(rabbit.birthday)}</dd>
                  </div>
                </dl>

                {rabbit.notes && <p className="rabbit-profile-notes">{rabbit.notes}</p>}
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rabbit-empty-state">
            <div className="rabbit-empty-icon">🐇</div>

            <h3>Noch keine Kaninchenprofile</h3>

            <p>
              Über „+ Kaninchen“ kannst du das erste Profil anlegen.
              Danach erscheint es hier als Karte.
            </p>
          </div>
        )}

        <AnimatePresence>
          {isRabbitModalOpen && (
            <motion.div
              className="rabbit-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRabbitModal}
            >
              <motion.section
                className="rabbit-modal"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.96 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="rabbit-modal-head">
                  <div>
                    <span className="section-label">Kaninchen hinzufügen</span>
                    <h3>{isEditingRabbit ? "Kaninchenprofil bearbeiten" : "Neues Kaninchenprofil"}</h3>
                  </div>

                  <button className="modal-close-button" type="button" onClick={closeRabbitModal}>
                    ×
                  </button>
                </div>

                <div className="rabbit-form-grid">
                  <label>
                    Name *
                    <input
                      type="text"
                      value={rabbitName}
                      onChange={(event) => setRabbitName(event.target.value)}
                      placeholder="z. B. Luna"
                    />
                  </label>

                  <label>
                    Rasse
                    <input
                      type="text"
                      value={rabbitBreed}
                      onChange={(event) => setRabbitBreed(event.target.value)}
                      placeholder="z. B. Zwergwidder"
                    />
                  </label>

                  <label>
                    Farbe
                    <input
                      type="text"
                      value={rabbitColor}
                      onChange={(event) => setRabbitColor(event.target.value)}
                      placeholder="z. B. weiß-braun"
                    />
                  </label>

                  <label>
                    Geburtstag
                    <input
                      type="date"
                      value={rabbitBirthday}
                      onChange={(event) => setRabbitBirthday(event.target.value)}
                    />
                  </label>
                </div>

                <label className="rabbit-notes-field">
                  Notizen
                  <textarea
                    value={rabbitNotes}
                    onChange={(event) => setRabbitNotes(event.target.value)}
                    placeholder="Besondere Hinweise, Charakter, Verhalten oder Pflegehinweise..."
                    rows={4}
                  />
                </label>

                <div className="rabbit-modal-actions">
                  <button className="ghost-button" type="button" onClick={closeRabbitModal}>
                    Abbrechen
                  </button>

                  <button
                    className="primary-action-button"
                    type="button"
                    onClick={submitRabbitProfile}
                    disabled={!canSaveRabbit}
                  >
                    {isEditingRabbit ? "Änderungen speichern" : "Profil speichern"}
                  </button>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
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