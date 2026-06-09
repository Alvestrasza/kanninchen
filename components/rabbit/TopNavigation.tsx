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

export function TopNavigation({
  view,
  visibleTabs = topTabs,
  onChangeView,
}: TopNavigationProps) {
  return (
    <header className="topbar" aria-label="Hauptnavigation">
      <button className="shoulder" aria-label="Vorheriger Bereich" type="button">
        L
      </button>

      <nav className="tabs" id="topTabs">
        {visibleTabs.map((tab) => (
          <button
            key={tab.view}
            className={`tab ${view === tab.view ? "active" : ""}`}
            type="button"
            onClick={() => onChangeView(tab.view)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <button className="shoulder" aria-label="Nächster Bereich" type="button">
        R
      </button>
    </header>
  );
}