"use client";

import { topTabs, type RabbitView } from "@/components/rabbit/rabbit-navigation";

type TopNavigationProps = {
  view: RabbitView;
  onChangeView: (view: RabbitView) => void;
};

export function TopNavigation({ view, onChangeView }: TopNavigationProps) {
  return (
    <header className="topbar" aria-label="Hauptnavigation">
      <button className="shoulder" aria-label="Vorheriger Bereich" type="button">
        L
      </button>

      <nav className="tabs" id="topTabs">
        {topTabs.map((tab) => (
          <button
            key={tab.view}
            className={`tab ${
              view === tab.view || (view === "home" && tab.view === "quests") ? "active" : ""
            }`}
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