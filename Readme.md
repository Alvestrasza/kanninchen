# Kaninchen Quest – Next.js Edition

<!--
Meta:
  Version: 0.1.0
  Created: 2026-06-07
  Updated: 2026-06-07
  Owner: Alvestrasza Corporation
  Purpose: Project overview for the Kaninchen Quest Next.js application.
-->

Kaninchen Quest ist eine kleine Pflege-Quest-App für Kaninchen. Diese Version wurde aus der statischen Vorlage `Kanninchen.zip` in ein modernes Next.js-Projekt überführt.

## Enthalten

- Next.js App Router mit TypeScript
- Tailwind CSS 4 als CSS-Basis
- Motion for React für UI-Animationen
- Auth.js / NextAuth v5 mit Keycloak Provider
- Prisma ORM mit PostgreSQL
- Datenbankpersistenz pro angemeldetem Benutzer
- Originaldesign der Vorlage weitgehend beibehalten
- QR-Grafiken aus der Vorlage unter `public/`
- Beispiel-Migration für PostgreSQL
- Beispielkonfiguration für systemd und NGINX

## Projektstruktur

```text
kanninchen-quest/
├─ app/
│  ├─ api/auth/[...nextauth]/route.ts
│  ├─ actions.ts
│  ├─ auth-actions.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ AuthButtons.tsx
│  ├─ LoginShell.tsx
│  └─ RabbitQuestApp.tsx
├─ data/
│  └─ tasks.ts
├─ lib/
│  ├─ prisma.ts
│  └─ progress.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ public/
│  ├─ kaninchen-app-qr.png
│  └─ kaninchen-app-qr.svg
├─ deploy/
│  ├─ nginx/
│  └─ systemd/
└─ docs/
```

## Lokale Entwicklung

```bash
cd /opt/sites/kanninchen/app
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Wichtige Umgebungsvariablen

```env
AUTH_URL=http://localhost:3000
AUTH_SECRET="CHANGE_ME_GENERATE_A_RANDOM_SECRET"
DATABASE_URL="postgresql://kanninchen_app:CHANGE_ME@localhost:5432/kanninchen?schema=public"
AUTH_KEYCLOAK_ID="kanninchen"
AUTH_KEYCLOAK_SECRET="CHANGE_ME_CLIENT_SECRET"
AUTH_KEYCLOAK_ISSUER="https://login.yourdomain.com/realms/flightclub"
```

## Keycloak Client

Empfohlener Client-Typ: confidential OpenID Connect Client.

Lokale Entwicklung:

```text
Valid redirect URIs: http://localhost:3000/api/auth/callback/keycloak
Web origins:         http://localhost:3000
```

Produktivbeispiel:

```text
Valid redirect URIs: https://kanninchen.yourdomain.com/api/auth/callback/keycloak
Web origins:         https://kanninchen.yourdomain.com
```

## Datenmodell

Auth.js legt Benutzer, Accounts und Sessions in PostgreSQL ab. Die App speichert zusätzlich:

- `RabbitTaskProgress` – erledigte Aufgaben und Teilaufgaben pro Benutzer
- `RabbitJournalEntry` – vorbereitete Tabelle für Tagebuch-Funktion
- `RabbitProfile` – vorbereitete Tabelle für Kaninchenprofile
- `RabbitUserPreference` – aktive Aufgabe und spätere UI-Einstellungen

## Hinweis

Dieses Paket enthält bewusst keine `node_modules` und keine `.env` mit echten Secrets.
