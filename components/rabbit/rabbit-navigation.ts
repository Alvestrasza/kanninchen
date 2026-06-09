// Meta
// Version: 0.1.1
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: Navigation configuration for the Kaninchen Quest app.

export type RabbitView =
  | "home"
  | "quests"
  | "journal"
  | "rabbits"
  | "achievements"
  | "lexicon"
  | "parents"
  | "settings";

export const topTabs: Array<{ view: RabbitView; label: string }> = [
  { view: "home", label: "Home" },
  { view: "quests", label: "Quests" },
  { view: "journal", label: "Tagebuch" },
  { view: "rabbits", label: "Kaninchen" },
  { view: "achievements", label: "Erfolge" },
  { view: "lexicon", label: "Lexikon" },
  { view: "parents", label: "Eltern" },
  { view: "settings", label: "Einstellungen" },
];