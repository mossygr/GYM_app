'use client';
import { useSession, signOut } from 'next-auth/react';

export default function UserBar() {
  const { data } = useSession();
  const name = data?.user?.name || '—';
  return (
    <div className="flex items-center justify-between bg-white border-b border-m3-outline px-4 py-2 rounded-t-2xl">
      <div className="text-sm text-m3-muted">Χρήστης: <span className="font-medium">{name}</span></div>
      <button className="text-sm px-3 py-1 rounded-lg border border-m3-outline hover:bg-m3-surfaceVariant" onClick={() => signOut({ callbackUrl: '/login' })}>
        Logout
      </button>
    </div>
  );
}
