import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaninchen Quest",
  description: "Eine kleine Pflege-Quest-App für Kaninchen.",
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
