// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Server-side Auth.js sign-in and sign-out buttons.

import { signIn, signOut } from "@/auth";

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("keycloak");
      }}
    >
      <button className="login-button" type="submit">
        Mit Keycloak anmelden
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button className="ghost-button" type="submit">
        Abmelden
      </button>
    </form>
  );
}
