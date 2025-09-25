'use client';
import Calendar from '../../../components/Calendar';
import ClientSelectedDay from './ClientSelectedDay';
import { SessionProvider } from 'next-auth/react';
import UserBar from '../../../components/UserBar';

export default function CalendarPageClient() {
  return (
    <SessionProvider>
      <main className="p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <UserBar />
          <div className="grid md:grid-cols-2 gap-6">
            <section>
              <h1 className="text-2xl font-bold mb-4">Ημερολόγιο</h1>
              <Calendar
                onSelect={(day: any) => {
                  const event = new CustomEvent('select-day', { detail: day });
                  window.dispatchEvent(event);
                }}
              />
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">Λεπτομέρειες ημέρας</h2>
              <ClientSelectedDay />
            </section>
          </div>
        </div>
      </main>
    </SessionProvider>
  );
}
