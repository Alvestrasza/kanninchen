// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Curated rabbit facts for the Kaninchen Quest home dashboard.

export type RabbitFact = {
  id: string;
  icon: string;
  title: string;
  text: string;
};

export const rabbitFacts: RabbitFact[] = [
  {
    id: "hay-main-food",
    icon: "🌾",
    title: "Heu ist mehr als Einstreu",
    text: "Frisches, staubarmes Heu sollte immer verfügbar sein. Es hilft der Verdauung und unterstützt den natürlichen Zahnabrieb.",
  },
  {
    id: "fresh-water",
    icon: "💧",
    title: "Wasser jeden Tag prüfen",
    text: "Kaninchen brauchen jederzeit frisches Wasser. Napf oder Flasche sollten täglich kontrolliert und sauber gehalten werden.",
  },
  {
    id: "rabbits-are-social",
    icon: "🐇",
    title: "Kaninchen sind soziale Tiere",
    text: "Kaninchen leben nicht gern allein. Sie brauchen Artgenossen, Ruheplätze und genug Raum, um sich sicher zu fühlen.",
  },
  {
    id: "not-too-many-carrots",
    icon: "🥕",
    title: "Karotten sind Leckerli",
    text: "Karotten und Obst enthalten viel Zucker. Sie passen besser als seltene kleine Belohnung, nicht als Hauptfutter.",
  },
  {
    id: "movement-matters",
    icon: "🏃",
    title: "Bewegung hält fit",
    text: "Kaninchen brauchen täglich Platz zum Hoppeln, Springen und Erkunden. Tunnel, Häuschen und erhöhte Plätze machen den Bereich spannender.",
  },
  {
    id: "quiet-observation",
    icon: "👀",
    title: "Beobachten hilft",
    text: "Wer seine Kaninchen gut kennt, merkt schneller, wenn sie anders fressen, ruhiger sind oder sich ungewöhnlich verhalten.",
  },
  {
    id: "teeth-grow",
    icon: "🦷",
    title: "Zähne wachsen ständig",
    text: "Kaninchenzähne wachsen ein Leben lang. Viel Heu und geeignetes Knabbermaterial helfen beim natürlichen Abrieb.",
  },
  {
    id: "clean-corners",
    icon: "🧹",
    title: "Saubere Ecken sind wichtig",
    text: "Toilettenecken sollten regelmäßig gereinigt werden. Trockene Einstreu hilft, Pfoten und Fell sauber zu halten.",
  },
  {
    id: "gentle-handling",
    icon: "🤲",
    title: "Ruhig und vorsichtig",
    text: "Viele Kaninchen mögen es nicht, plötzlich hochgehoben zu werden. Ruhige Bewegungen und Geduld schaffen Vertrauen.",
  },
  {
    id: "hideouts",
    icon: "🏡",
    title: "Verstecke geben Sicherheit",
    text: "Kaninchen fühlen sich wohler, wenn sie Rückzugsorte haben. Häuschen, Tunnel oder geschützte Ecken helfen ihnen, sich zu entspannen.",
  },
];