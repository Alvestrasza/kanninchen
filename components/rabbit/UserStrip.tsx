"use client";

import { logoutAction } from "@/app/auth-actions";

type UserStripProps = {
  userName: string;
  isPending: boolean;
  message: string;
};

export function UserStrip({ userName, isPending, message }: UserStripProps) {
  return (
    <div className="user-strip panel">
      <div>
        <span className="section-label">Angemeldet</span>
        <strong>{userName}</strong>
      </div>

      <span className="sync-state">
        {isPending ? "Synchronisiere…" : message}
      </span>

      <form action={logoutAction}>
        <button className="ghost-button" type="submit">
          Abmelden
        </button>
      </form>
    </div>
  );
}