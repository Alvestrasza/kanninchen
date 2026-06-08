// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Static Kaninchen Quest task catalog migrated from the original single-page app.

import type { Achievement, RabbitMetric, RabbitTask } from "@/types/rabbit";

export const rabbitTasks: RabbitTask[] = [
  {
    id: "feed",
    icon: "🥬",
    title: "Kaninchen füttern",
    type: "Tägliche Aufgabe",
    frequency: "daily",
    description:
      "Sorge dafür, dass deine Kaninchen täglich frisches Futter erhalten, um gesund und glücklich zu bleiben.",
    subtasks: [
      {
        icon: "🥬",
        title: "Frischfutter geben",
        description:
          "Gib eine abwechslungsreiche Auswahl an Gemüse, Kräutern und frischen Pflanzen.",
      },
      {
        icon: "🌾",
        title: "Heu kontrollieren",
        description:
          "Stelle sicher, dass immer frisches, sauberes Heu in ausreichender Menge vorhanden ist.",
      },
      {
        icon: "🥣",
        title: "Trockenfutter bereitstellen",
        description: "Fülle die Futterschüssel mit hochwertigem Kaninchenfutter auf.",
      },
    ],
  },
  {
    id: "water",
    icon: "💧",
    title: "Frisches Wasser geben",
    type: "Tägliche Aufgabe",
    frequency: "daily",
    description:
      "Fülle die Trinknäpfe und Flaschen mit sauberem Wasser und prüfe, ob alles gut erreichbar ist.",
    subtasks: [
      {
        icon: "🚰",
        title: "Wasser wechseln",
        description: "Leere altes Wasser aus und fülle frisches Wasser nach.",
      },
      {
        icon: "🧽",
        title: "Napf reinigen",
        description: "Spüle Näpfe und Flaschen gründlich aus.",
      },
      {
        icon: "👀",
        title: "Trinkstelle prüfen",
        description: "Achte darauf, dass jedes Kaninchen problemlos trinken kann.",
      },
    ],
  },
  {
    id: "clean",
    icon: "🧹",
    title: "Kaninchenstall ausmisten",
    type: "Wöchentliche Aufgabe",
    frequency: "weekly",
    description:
      "Halte den Stall sauber, trocken und angenehm, damit deine Tiere entspannt bleiben.",
    subtasks: [
      {
        icon: "🧹",
        title: "Streu auffrischen",
        description: "Entferne feuchte Stellen und verteile frische Einstreu.",
      },
      {
        icon: "🗑",
        title: "Abfall entsorgen",
        description: "Bringe altes Heu und Schmutz direkt weg.",
      },
      {
        icon: "✨",
        title: "Liegeplatz ordnen",
        description: "Richte den Ruhebereich wieder gemütlich her.",
      },
    ],
  },
  {
    id: "hay",
    icon: "🥕",
    title: "Heu nachfüllen",
    type: "Tägliche Aufgabe",
    frequency: "daily",
    description:
      "Heu ist die Basis der Kaninchenernährung. Sorge für einen dauerhaft gefüllten Vorrat.",
    subtasks: [
      {
        icon: "🌾",
        title: "Heuraufe füllen",
        description: "Fülle die Raufe bis oben mit duftigem Heu.",
      },
      {
        icon: "🔎",
        title: "Qualität prüfen",
        description: "Entferne staubiges oder feuchtes Heu.",
      },
      {
        icon: "📦",
        title: "Vorrat merken",
        description: "Notiere, wenn der Heuvorrat knapp wird.",
      },
    ],
  },
  {
    id: "health",
    icon: "💖",
    title: "Gesundheitscheck",
    type: "Tägliche Aufgabe",
    frequency: "daily",
    description: "Ein kurzer Check hilft, Veränderungen früh zu bemerken.",
    subtasks: [
      {
        icon: "👁",
        title: "Augen und Nase prüfen",
        description: "Achte auf klare Augen und eine trockene Nase.",
      },
      {
        icon: "⚖",
        title: "Verhalten beobachten",
        description: "Schau, ob jedes Tier normal frisst und aktiv ist.",
      },
      {
        icon: "📝",
        title: "Auffälligkeiten notieren",
        description: "Halte Besonderheiten direkt im Tagebuch fest.",
      },
    ],
  },
  {
    id: "run",
    icon: "🐇",
    title: "Freilauf vorbereiten",
    type: "Tägliche Aufgabe",
    frequency: "daily",
    description: "Schaffe einen sicheren Bereich zum Hoppeln, Erkunden und Toben.",
    subtasks: [
      {
        icon: "🚪",
        title: "Bereich sichern",
        description: "Schließe Lücken und entferne gefährliche Gegenstände.",
      },
      {
        icon: "🧸",
        title: "Spielbereich aufbauen",
        description: "Lege Tunnel, Kartons oder Matten bereit.",
      },
      {
        icon: "⏱",
        title: "Zeit einplanen",
        description: "Gib den Kaninchen genug ruhige Bewegungszeit.",
      },
    ],
  },
  {
    id: "toys",
    icon: "🏐",
    title: "Beschäftigung prüfen",
    type: "Regelmäßige Aufgabe",
    frequency: "asNeeded",
    description: "Abwechslung hält die Tiere neugierig und zufrieden.",
    subtasks: [
      {
        icon: "🧩",
        title: "Spielzeug wechseln",
        description: "Tausche ein bekanntes Spielzeug gegen ein anderes aus.",
      },
      {
        icon: "🌿",
        title: "Knabbermaterial anbieten",
        description: "Lege geeignete Zweige oder Blätter bereit.",
      },
      {
        icon: "🎯",
        title: "Interesse beobachten",
        description: "Schau, welche Beschäftigung heute gut ankommt.",
      },
    ],
  },
  {
    id: "fur",
    icon: "🐑",
    title: "Fellkontrolle",
    type: "Wöchentliche Aufgabe",
    frequency: "weekly",
    description: "Ein gepflegtes Fell schützt und zeigt, ob sich deine Kaninchen wohlfühlen.",
    subtasks: [
      {
        icon: "🤲",
        title: "Sanft abtasten",
        description: "Prüfe Rücken und Bauch behutsam.",
      },
      {
        icon: "🪮",
        title: "Lose Haare entfernen",
        description: "Bürste bei Bedarf vorsichtig nach.",
      },
      {
        icon: "🔎",
        title: "Verfilzungen finden",
        description: "Achte besonders auf lange Fellpartien.",
      },
    ],
  },
  {
    id: "claws",
    icon: "🐾",
    title: "Krallenkontrolle",
    type: "Monatliche Aufgabe",
    frequency: "monthly",
    description: "Behalte die Krallen im Blick, damit deine Kaninchen bequem laufen.",
    subtasks: [
      {
        icon: "🐾",
        title: "Pfoten ansehen",
        description: "Kontrolliere alle Pfoten kurz und ruhig.",
      },
      {
        icon: "📏",
        title: "Länge prüfen",
        description: "Vergleiche, ob Krallen gekürzt werden müssen.",
      },
      {
        icon: "📅",
        title: "Termin planen",
        description: "Setze eine Erinnerung, falls Pflege nötig ist.",
      },
    ],
  },
  {
    id: "weekly",
    icon: "🗓",
    title: "Wochenaufgaben",
    type: "Wochenziel",
    frequency: "weekly",
    description:
      "Sammle größere Pflegeaufgaben für das Wochenende und behalte den Überblick.",
    weekly: "0/5 erledigt",
    subtasks: [
      {
        icon: "🧺",
        title: "Vorräte sortieren",
        description: "Prüfe Heu, Futter und Einstreu.",
      },
      {
        icon: "🧼",
        title: "Grundreinigung planen",
        description: "Lege einen passenden Zeitraum fest.",
      },
      {
        icon: "📋",
        title: "Checkliste aktualisieren",
        description: "Ergänze alles, was diese Woche wichtig ist.",
      },
    ],
  },
];

export const achievements: Achievement[] = [
  { icon: "🌿", title: "7 Tage", description: "Ohne Aufgabe vergessen" },
  { icon: "🧹", title: "Saubere Sache", description: "Stallpflege Meister" },
  { icon: "🥕", title: "Meister-Fütterer", description: "Fütterungs-Experte" },
];

export const baseMetrics: RabbitMetric[] = [
  { icon: "❤️", label: "Gesundheit", value: 100 },
  { icon: "🥕", label: "Sättigung", value: 100 },
  { icon: "💧", label: "Wasser", value: 100 },
  { icon: "😊", label: "Glücklichkeit", value: 100 },
];
