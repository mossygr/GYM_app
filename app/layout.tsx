// app/layout.tsx
import "../styles/globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gym App",
  description: "Workouts",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="el">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

