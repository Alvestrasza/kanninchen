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
          <span className="pill">Kanninchenpflege App</span>
          <h1>Kaninchen Quest</h1>
          <p>
            Pflegeaufgaben, Fortschritt, Streak und kleine Erfolge
          </p>
          <div className="login-actions">
            <SignInButton />
            <span className="login-hint">Dein Fortschritt wird nach der Anmeldung pro Benutzer gespeichert.</span>
          </div>
        </div>

      </section>
    </main>
  );
}
