'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function Page() {
  const [username, setUsername] = useState('');

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    await signIn('credentials', { username, callbackUrl: `${base}/calendar` });
  }

  return (
    <main className="min-h-dvh flex items-center justify-center">
      <form onSubmit={doLogin} className="w-full max-w-sm space-y-4 bg-white p-6 rounded-2xl shadow-card border border-m3-outline">
        <h1 className="text-xl font-semibold">Σύνδεση</h1>
        <input
          className="w-full px-3 py-2 border border-m3-outline rounded-lg"
          placeholder="username: mossy / eleni / fotis"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="w-full px-3 py-2 rounded-lg bg-m3-primary text-white">Login</button>
      </form>
    </main>
  );
}
