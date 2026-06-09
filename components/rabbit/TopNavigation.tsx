"use client";

// Meta
// Version: 0.1.1
// Created: 2026-06-08
// Updated: 2026-06-09
// Purpose: Top navigation for Kaninchen Quest.

import { topTabs, type RabbitView } from "@/components/rabbit/rabbit-navigation";

type TopNavigationProps = {
  view: RabbitView;
  visibleTabs?: Array<{ view: RabbitView; label: string }>;
  onChangeView: (view: RabbitView) => void;
};

function getTabGlyph(view: RabbitView): string {
  switch (view) {
    case "home":
      return "◈";
    case "quests":
      return "✦";
    case "journal":
      return "▤";
    case "rabbits":
      return "◌";
    case "achievements":
      return "✧";
    case "lexicon":
      return "☷";
    case "settings":
      return "⚙";
    default:
      return "•";
  }
}

export function TopNavigation({
  view,
  visibleTabs = topTabs,
  onChangeView,
}: TopNavigationProps) {
  const currentIndex = Math.max(
    0,
    visibleTabs.findIndex((tab) => tab.view === view),
  );

  const previousTab = visibleTabs[(currentIndex - 1 + visibleTabs.length) % visibleTabs.length];
  const nextTab = visibleTabs[(currentIndex + 1) % visibleTabs.length];

return (
  <header className="topbar ancient-pad-topbar" aria-label="Hauptnavigation">
    <button
      className="shoulder ancient-shoulder ancient-shoulder-left"
      aria-label={`Vorheriger Bereich: ${previousTab.label}`}
      title={`Vorheriger Bereich: ${previousTab.label}`}
      type="button"
      onClick={() => onChangeView(previousTab.view)}
    >
      <span aria-hidden="true">‹</span>
    </button>

    <div className="ancient-nav-shell">
      <div className="ancient-nav-ornament ancient-nav-ornament-left" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <nav className="tabs ancient-tabs" id="topTabs">
        {visibleTabs.map((tab) => (
          <button
            key={tab.view}
            className={`tab ancient-tab ${view === tab.view ? "active" : ""}`}
            type="button"
            onClick={() => onChangeView(tab.view)}
          >
            <span className="ancient-tab-glyph" aria-hidden="true">
              {getTabGlyph(tab.view)}
            </span>
            <span className="ancient-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="ancient-nav-core" aria-hidden="true">
        <span />
      </div>

      <div className="ancient-nav-ornament ancient-nav-ornament-right" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>

    <button
      className="shoulder ancient-shoulder ancient-shoulder-right"
      aria-label={`Nächster Bereich: ${nextTab.label}`}
      title={`Nächster Bereich: ${nextTab.label}`}
      type="button"
      onClick={() => onChangeView(nextTab.view)}
    >
      <span aria-hidden="true">›</span>
    </button>
  </header>
);
}