// Meta
// Version: 0.1.0
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: Static achievement definitions for Kaninchen Quest.

export type RabbitAchievementCategory = "task" | "daily" | "streak" | "level";

export type RabbitAchievementDefinition = {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: RabbitAchievementCategory;
  target: number;
};

export const rabbitAchievements: RabbitAchievementDefinition[] = [
  {
    id: "first_task",
    icon: "🌱",
    title: "Erster Schritt",
    description: "Schließe deine erste Aufgabe ab.",
    category: "task",
    target: 1,
  },
  {
    id: "first_full_day",
    icon: "☀️",
    title: "Guter Pflegetag",
    description: "Erledige alle täglichen Aufgaben an einem Tag.",
    category: "daily",
    target: 1,
  },
  {
    id: "daily_tasks_7",
    icon: "🗓️",
    title: "Verlässlicher Helfer",
    description: "Erreiche 7 vollständige Pflegetage.",
    category: "daily",
    target: 7,
  },
  {
    id: "daily_tasks_30",
    icon: "🌕",
    title: "Pflege-Routine",
    description: "Erreiche 30 vollständige Pflegetage.",
    category: "daily",
    target: 30,
  },
  {
    id: "feed_10",
    icon: "🥬",
    title: "Futterfreund",
    description: "Schließe 10 Fütterungsaufgaben ab.",
    category: "task",
    target: 10,
  },
  {
    id: "water_10",
    icon: "💧",
    title: "Wasserwächter",
    description: "Schließe 10 Wasseraufgaben ab.",
    category: "task",
    target: 10,
  },
  {
    id: "hay_10",
    icon: "🌾",
    title: "Heu-Held",
    description: "Fülle 10-mal Heu nach.",
    category: "task",
    target: 10,
  },
  {
    id: "health_10",
    icon: "💖",
    title: "Gesundheitsblick",
    description: "Führe 10 Gesundheitschecks durch.",
    category: "task",
    target: 10,
  },
  {
    id: "clean_10",
    icon: "🧹",
    title: "Stallprofi",
    description: "Schließe 10 Stallpflege-Aufgaben ab.",
    category: "task",
    target: 10,
  },
  {
    id: "streak_3",
    icon: "🔥",
    title: "Kleine Flamme",
    description: "Erreiche eine Streak von 3 Tagen.",
    category: "streak",
    target: 3,
  },
  {
    id: "streak_7",
    icon: "🔥",
    title: "Stabile Flamme",
    description: "Erreiche eine Streak von 7 Tagen.",
    category: "streak",
    target: 7,
  },
  {
    id: "streak_30",
    icon: "🐇",
    title: "Hasenfeuer",
    description: "Erreiche eine Streak von 30 Tagen.",
    category: "streak",
    target: 30,
  },
  {
    id: "level_5",
    icon: "⭐",
    title: "Erster Rang",
    description: "Erreiche Tierpfleger-Level 5.",
    category: "level",
    target: 5,
  },
  {
    id: "level_10",
    icon: "🏅",
    title: "Erfahrener Helfer",
    description: "Erreiche Tierpfleger-Level 10.",
    category: "level",
    target: 10,
  },
  {
    id: "level_25",
    icon: "💎",
    title: "Gesundheitswächter",
    description: "Erreiche Tierpfleger-Level 25.",
    category: "level",
    target: 25,
  },
];