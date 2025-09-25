import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gym App',
  description: 'Track your workouts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased text-[17px] md:text-[16px]">
        {children}
      </body>
    </html>
  );
}

