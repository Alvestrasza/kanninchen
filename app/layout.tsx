// Meta
// Version: 0.1.0
// Created: 2026-06-07
// Updated: 2026-06-07
// Purpose: Root layout and metadata for Kaninchen Quest.

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaninchen Quest",
  description: "Eine kleine Pflege-Quest-App für Kaninchen mit Keycloak Login und PostgreSQL Speicherung.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#031019",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
