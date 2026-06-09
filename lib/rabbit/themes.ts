// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Theme catalog for user-selectable Kaninchen Quest visual styles.

export const rabbitThemes = [
  {
    id: "classic",
    name: "Kaninchen Quest",
    description: "Der bisherige dunkle Quest-Stil mit Cyan und Gold.",
    icon: "🐰",
  },
  {
    id: "purah",
    name: "Ancient Pad",
    description: "Ein helleres, türkisfarbenes Geräte-Theme mit ruhiger Pad-Anmutung.",
    icon: "🌀",
  },
  {
    id: "forest",
    name: "Waldlichtung",
    description: "Wärmer, grüner und weicher – gut für eine kindlichere Oberfläche.",
    icon: "🌿",
  },
  {
    id: "night",
    name: "Nachtmodus",
    description: "Dunkler, ruhiger und mit weniger Leuchteffekten.",
    icon: "🌙",
  },
] as const;

export type RabbitThemeId = (typeof rabbitThemes)[number]["id"];

export const DEFAULT_RABBIT_THEME: RabbitThemeId = "classic";

export function isRabbitThemeId(value: string): value is RabbitThemeId {
  return rabbitThemes.some((theme) => theme.id === value);
}

export function normalizeRabbitTheme(value: string | null | undefined): RabbitThemeId {
  if (value && isRabbitThemeId(value)) {
    return value;
  }

  return DEFAULT_RABBIT_THEME;
}