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
        Bitte anmelden
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
