# Kaninchen Quest

## Overview

Kaninchen Quest is a private Next.js application for tracking rabbit care tasks, daily progress, achievements and basic care information.

The application uses a clean modular structure:

* `app/` contains Next.js routes, layouts and server actions.
* `components/auth/` contains login and authentication UI.
* `components/rabbit/` contains the rabbit care application UI.
* `data/rabbit/` contains static rabbit care task data.
* `lib/db/` contains shared database infrastructure.
* `lib/rabbit/` contains rabbit-specific server-side logic.
* `types/` contains shared TypeScript type definitions.
* `prisma/` contains the database schema.

The visual design is intentionally kept in the original Kaninchen Quest style.

---

## Technology Stack

* Next.js
* React
* TypeScript
* Auth.js
* Prisma
* PostgreSQL-compatible database
* Tailwind CSS

---

## Project Structure

```text
kaninchen/
├─ app/
│  ├─ api/
│  │  └─ auth/
│  │     └─ [...nextauth]/
│  │        └─ route.ts
│  ├─ actions.ts
│  ├─ auth-actions.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
│
├─ components/
│  ├─ auth/
│  │  ├─ AuthButtons.tsx
│  │  └─ LoginShell.tsx
│  │
│  └─ rabbit/
│     ├─ BunnyCard.tsx
│     ├─ QuestPanel.tsx
│     ├─ RabbitQuestApp.tsx
│     ├─ SecondaryView.tsx
│     ├─ SideStack.tsx
│     ├─ TaskPanel.tsx
│     ├─ TopNavigation.tsx
│     ├─ UserStrip.tsx
│     ├─ rabbit-navigation.ts
│     └─ rabbit-progress-state.ts
│
├─ data/
│  └─ rabbit/
│     └─ tasks.ts
│
├─ lib/
│  ├─ db/
│  │  └─ prisma.ts
│  └─ rabbit/
│     └─ progress.ts
│
├─ prisma/
│  └─ schema.prisma
│
├─ types/
│  └─ rabbit.ts
│
├─ auth.ts
├─ next.config.ts
├─ package.json
└─ tsconfig.json
```

---

## Development

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Run TypeScript checks:

```powershell
npm run typecheck
```

Run linting:

```powershell
npm run lint
```

Build the application:

```powershell
npm run build
```

---

## Database

Generate the Prisma client:

```powershell
npm run prisma:generate
```

Create and apply a development migration:

```powershell
npm run prisma:migrate:dev
```

Apply migrations in production:

```powershell
npm run prisma:migrate:deploy
```

Open Prisma Studio:

```powershell
npm run prisma:studio
```

---

## Environment Configuration

Create a local `.env` file based on `.env.example`.

Required settings include:

```text
APP_ENV
NEXT_PUBLIC_APP_NAME
AUTH_URL
NEXTAUTH_URL
AUTH_SECRET
NEXTAUTH_SECRET
DATABASE_URL
AUTH_KEYCLOAK_ID
AUTH_KEYCLOAK_SECRET
AUTH_KEYCLOAK_ISSUER
```

The authentication provider variables use their technical provider names internally. They should not be exposed as visible product wording in the user interface.

---

## Design Principle

The application structure should stay clean and modular, similar to the SimSoar project structure.

The visual design should remain Kaninchen Quest specific:

* dark panel layout
* cyan and gold highlights
* rabbit-themed UI elements
* animated task feedback
* compact game-like dashboard

Refactoring should not change the visual identity unless explicitly intended.

---

## Refactoring Rules

When changing the project structure:

1. Move only one logical area at a time.
2. Adjust imports immediately after moving files.
3. Run `npm run typecheck`.
4. Run `npm run lint`.
5. Start the app with `npm run dev`.
6. Commit only after the app runs successfully.

Recommended commit style:

```text
refactor: ...
chore: ...
fix: ...
feat: ...
```

---

## Current Architecture Goal

The main app container should remain small and focused.

`RabbitQuestApp.tsx` should only handle:

* client state
* active view selection
* server action calls
* composition of UI panels

Detailed UI areas should stay in separate components.
