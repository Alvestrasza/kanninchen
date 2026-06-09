// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Auth.js session type extensions for Kaninchen Quest roles.

import type { DefaultSession } from "next-auth";

import type { AppRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: AppRole[];
      isChild: boolean;
      isParent: boolean;
      isAdmin: boolean;
      isTester: boolean;
    } & DefaultSession["user"];
  }
}