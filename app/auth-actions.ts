"use server";

// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Server actions for authentication controls used from client components.

import { signOut } from "@/auth";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
