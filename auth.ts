// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Auth.js configuration for external login and database sessions.

import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  resolveAppRolesFromTokens,
  resolveFamilyKeyFromTokens,
} from "@/lib/auth/roles";
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
    async session({ session, user }) {
      if (session.user) {
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "keycloak",
          },
          select: {
            access_token: true,
            id_token: true,
          },
        });

        const tokenContext = {
          idToken: account?.id_token,
          accessToken: account?.access_token,
          clientId: process.env.AUTH_KEYCLOAK_ID,
        };

        const roles = resolveAppRolesFromTokens(tokenContext);
        const familyKey = resolveFamilyKeyFromTokens(tokenContext);
        if (process.env.KANINCHEN_AUTH_DEBUG === "true") {
          console.log("Kaninchen Auth Debug:", {
            userId: user.id,
            email: user.email,
            roles,
            familyKey,
            hasAccessToken: Boolean(account?.access_token),
            hasIdToken: Boolean(account?.id_token),
            authKeycloakId: process.env.AUTH_KEYCLOAK_ID,
          });
        }
        session.user.id = user.id;
        session.user.roles = roles;
        session.user.familyKey = familyKey;
        session.user.isChild = roles.includes("child");
        session.user.isParent = roles.includes("parent");
        session.user.isAdmin = roles.includes("admin");
        session.user.isTester = roles.includes("tester");
      }

      return session;
    },
  },
  trustHost: true,
});
