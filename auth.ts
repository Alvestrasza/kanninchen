// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Auth.js configuration for external login and database sessions.

import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/db/prisma";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    Keycloak({
      clientId: requiredEnv("AUTH_KEYCLOAK_ID"),
      clientSecret: requiredEnv("AUTH_KEYCLOAK_SECRET"),
      issuer: requiredEnv("AUTH_KEYCLOAK_ISSUER"),
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  trustHost: true,
});
