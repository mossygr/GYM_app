import './globals.css';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Gym Tracker',
  description: 'Καθαρό UX για προπονήσεις'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased text-[17px] md:text-[16px]">
        {/* SessionProvider ONLY at client components, so we wrap at pages that need it.
            Here we keep it simple: leave as-is, components will use their own provider if needed */}
        {children}
      </body>
    </html>
  );
}
