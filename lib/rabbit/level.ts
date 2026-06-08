// Meta
// Version: 0.1.0
// Created: 2026-06-08
// Updated: 2026-06-08
// Purpose: XP and caretaker level calculation for Kaninchen Quest.

import type { RabbitTaskFrequency } from "@/types/rabbit";

export const MAX_CARETAKER_LEVEL = 50;

export const XP_BY_TASK_FREQUENCY: Record<RabbitTaskFrequency, number> = {
  daily: 10,
  asNeeded: 15,
  weekly: 30,
  monthly: 75,
};

export const LEVEL_XP_THRESHOLDS = [
  0,
  50,
  125,
  225,
  350,
  525,
  725,
  975,
  1250,
  1600,
  2000,
  2450,
  2950,
  3500,
  4100,
  4700,
  5350,
  6050,
  6775,
  7500,
  8300,
  9150,
  10050,
  11000,
  12000,
  13100,
  14250,
  15450,
  16700,
  18000,
  19400,
  20850,
  22350,
  23900,
  25500,
  27150,
  28850,
  30550,
  32275,
  34000,
  35450,
  36950,
  38500,
  40100,
  41700,
  43300,
  44950,
  46600,
  48300,
  50000,
] as const;

export type CaretakerLevelInfo = {
  level: number;
  title: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  percent: number;
  isMaxLevel: boolean;
};

export function getXpForTaskFrequency(frequency: RabbitTaskFrequency): number {
  return XP_BY_TASK_FREQUENCY[frequency];
}

export function getCaretakerTitle(level: number): string {
  if (level >= 50) return "Hüter der Kaninchen";
  if (level >= 45) return "Großer Hasenfreund";
  if (level >= 40) return "Meister-Tierpfleger";
  if (level >= 35) return "Reviermeister";
  if (level >= 30) return "Kaninchenversteher";
  if (level >= 25) return "Gesundheitswächter";
  if (level >= 20) return "Gehegepfleger";
  if (level >= 15) return "Futtermeister";
  if (level >= 10) return "Erfahrener Kaninchenhelfer";
  if (level >= 7) return "Kaninchenhelfer";
  if (level >= 4) return "Stallhelfer";

  return "Nachwuchs-Tierpfleger";
}

export function getCaretakerLevelInfo(totalXp: number): CaretakerLevelInfo {
  const safeTotalXp = Math.max(0, Math.floor(totalXp));

  let level = 1;

  for (let index = 0; index < LEVEL_XP_THRESHOLDS.length; index += 1) {
    if (safeTotalXp >= LEVEL_XP_THRESHOLDS[index]) {
      level = index + 1;
    }
  }

  const isMaxLevel = level >= MAX_CARETAKER_LEVEL;
  const currentLevelXp = LEVEL_XP_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXp = isMaxLevel
    ? LEVEL_XP_THRESHOLDS[MAX_CARETAKER_LEVEL - 1]
    : LEVEL_XP_THRESHOLDS[level] ?? currentLevelXp;

  const xpIntoLevel = isMaxLevel ? nextLevelXp - currentLevelXp : safeTotalXp - currentLevelXp;
  const xpForNextLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const percent = isMaxLevel
    ? 100
    : Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return {
    level,
    title: getCaretakerTitle(level),
    totalXp: safeTotalXp,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpForNextLevel,
    percent,
    isMaxLevel,
  };
}