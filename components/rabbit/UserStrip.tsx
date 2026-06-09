"use client";

import { logoutAction } from "@/app/auth-actions";

type UserStripProps = {
  userName: string;
  isPending: boolean;
  message: string;
  showRabbitAddButton?: boolean;
  onAddRabbit?: () => void;
};

export function UserStrip({
  userName,
  isPending,
  message,
  showRabbitAddButton = false,
  onAddRabbit,
}: UserStripProps) {
  return (
    <div className="user-strip panel">
      <div>
        <span className="section-label">Angemeldet</span>
        <strong>{userName}</strong>
      </div>

      <span className="sync-state">
        {isPending ? "Synchronisiere…" : message}
      </span>

      <div className="user-strip-actions">
        {showRabbitAddButton && (
          <button className="ghost-button rabbit-add-button" type="button" onClick={onAddRabbit}>
            + Kaninchen
          </button>
        )}

        <form action={logoutAction}>
          <button className="ghost-button" type="submit">
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}