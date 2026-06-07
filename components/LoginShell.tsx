// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Public landing screen before Keycloak authentication.

import Image from "next/image";

import { SignInButton } from "@/components/AuthButtons";

export function LoginShell() {
  return (
    <main className="login-shell">
      <div className="ambient-orb orb-one" />
      <div className="ambient-orb orb-two" />

      <section className="login-card panel">
        <div className="bunny-card login-bunny" aria-hidden="true">
          <div className="bunny-ears" />
          <div className="bunny-face">
            <span className="eye left" />
            <span className="eye right" />
            <span className="nose" />
            <span className="smile" />
          </div>
          <div className="food-bowl">🥬</div>
        </div>

        <div className="login-copy">
          <span className="pill">A-Corp Care Utility</span>
          <h1>Kaninchen Quest</h1>
          <p>
            Pflegeaufgaben, Fortschritt, Streak und kleine Erfolge — geschützt über Keycloak
            und sauber in PostgreSQL gespeichert.
          </p>
          <div className="login-actions">
            <SignInButton />
            <span className="login-hint">Dein Fortschritt wird nach der Anmeldung pro Benutzer gespeichert.</span>
          </div>
        </div>

        <div className="qr-card">
          <Image
            src="/kaninchen-app-qr.png"
            alt="QR-Code für die ursprüngliche Kaninchen Quest App"
            width={144}
            height={144}
            priority
          />
          <small>Original-QR aus der Vorlage</small>
        </div>
      </section>
    </main>
  );
}
