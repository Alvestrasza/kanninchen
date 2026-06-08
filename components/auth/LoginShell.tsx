import { SignInButton } from "@/components/auth/AuthButtons";
import { BunnyCard } from "@/components/rabbit/BunnyCard";

export function LoginShell() {
  return (
    <main className="login-shell">
      <div className="ambient-orb orb-one" />
      <div className="ambient-orb orb-two" />

      <section className="login-card panel">
        <BunnyCard className="login-bunny" />

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
