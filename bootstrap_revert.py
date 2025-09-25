import os

FILES = {
  ".gitignore": r"""
node_modules
.next
.env
.env.local
dist
""".lstrip(),

  ".env.example": r"""
# === Postgres ===
DATABASE_URL="postgresql://gym:gympass@localhost:5432/gymdb?schema=public"

# === NextAuth ===
NEXTAUTH_URL="http://127.0.0.1:3000"
NEXTAUTH_SECRET="REPLACE_ME"
""".lstrip(),

  "package.json": r"""
{
  "name": "gym-webapp",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "seed": "tsx scripts/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "next": "^14.2.0",
    "next-auth": "^4.24.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "tsx": "^4.7.0",
    "typescript": "^5.0.0"
  }
}
""".lstrip(),

  "tsconfig.json": r"""
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": [
    "app/**/*.ts",
    "app/**/*.tsx",
    "components/**/*.ts",
    "components/**/*.tsx",
    "lib/**/*.ts",
    "lib/**/*.tsx",
    "scripts/**/*.ts",
    ".next/types/**/*.ts"
  ]
}
""".lstrip(),

  "postcss.config.js": r"""
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""".lstrip(),

  "tailwind.config.js": r"""
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "m3-bg": "#f6f7fb",
        "m3-surface": "#FFFFFF",
        "m3-surfaceVariant": "#F1F3F7",
        "m3-outline": "#E0E4EA",
        "m3-muted": "#6B7280",
        "m3-primary": "#3B82F6",
        "m3-onprimary": "#ffffff",
        "m3-accent": "#6366F1",
        "m3-ok": "#10B981"
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
}
""".lstrip(),

  "app/globals.css": r"""
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { height: 100%; }
body { background: theme('colors.m3-bg'); }
""".lstrip(),

  "app/layout.tsx": r"""
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
      <body className="min-h-dvh">
        {/* SessionProvider ONLY at client components, so we wrap at pages that need it.
            Here we keep it simple: leave as-is, components will use their own provider if needed */}
        {children}
      </body>
    </html>
  );
}
""".lstrip(),

  # ---------------- AUTH ----------------
  "app/api/auth/[...nextauth]/route.ts": r"""
import NextAuth, { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const USERS = [
  { id: 'u1', username: 'mossy' },
  { id: 'u2', username: 'eleni' },
  { id: 'u3', username: 'fotis' },
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 }, // 30 days
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { username: { label: 'Username', type: 'text' } },
      async authorize(credentials) {
        const u = (credentials?.username || '').trim().toLowerCase();
        const user = USERS.find(x => x.username === u);
        if (user) return { id: user.id, name: user.username };
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.name) token.username = user.name;
      return token;
    },
    async session({ session, token }) {
      if (token?.username) {
        session.user = { ...session.user, name: token.username } as any;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
""".lstrip(),

  "app/login/page.tsx": r"""
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
""".lstrip(),

  "middleware.ts": r"""
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/calendar"]
};
""".lstrip(),

  "components/UserBar.tsx": r"""
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
""".lstrip(),

  # ---------------- API: Workouts / Exercises / Sets ----------------
  "app/api/workouts/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// GET /api/workouts?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: any = { deletedAt: null };
  if (from && to) where.date = { gte: new Date(from), lt: new Date(to) };

  const days = await prisma.workoutDay.findMany({
    where,
    orderBy: { date: 'asc' },
    include: {
      exercises: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        include: { sets: { where: { deletedAt: null }, orderBy: { order: 'asc' } } }
      }
    }
  });

  return NextResponse.json(days);
}

// POST /api/workouts (optional use later)
export async function POST(req: Request) {
  const body = await req.json();
  const { date, program, exercises } = body;
  const created = await prisma.workoutDay.create({
    data: {
      date: new Date(date),
      program,
      exercises: {
        create: (exercises || []).map((ex: any, i: number) => ({
          order: ex.order ?? i + 1,
          nameGr: ex.nameGr,
          nameEn: ex.nameEn,
          sets: {
            create: (ex.sets || []).map((s: any, j: number) => ({
              order: s.order ?? j + 1,
              kg: s.kg,
              reps: s.reps,
              notes: s.notes
            }))
          }
        }))
      }
    }
  });
  return NextResponse.json(created, { status: 201 });
}
""".lstrip(),

  "app/api/workouts/[id]/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const day = await prisma.workoutDay.findUnique({
    where: { id: params.id },
    include: {
      exercises: { include: { sets: true }, orderBy: { order: 'asc' } }
    }
  });
  if (!day || day.deletedAt) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(day);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.workoutDay.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const updated = await prisma.workoutDay.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json(updated);
}
""".lstrip(),

  "app/api/workouts/[id]/exercises/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

// POST /api/workouts/:id/exercises
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { nameGr } = body;
  const workoutDayId = params.id;

  // next order
  const maxOrder = await prisma.exercise.aggregate({
    _max: { order: true },
    where: { workoutDayId, deletedAt: null }
  });

  const ex = await prisma.exercise.create({
    data: {
      workoutDayId,
      nameGr,
      order: (maxOrder._max.order || 0) + 1
    },
    include: { sets: true }
  });

  return NextResponse.json(ex, { status: 201 });
}
""".lstrip(),

  "app/api/exercises/[id]/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// PATCH name, DELETE soft
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.exercise.update({
    where: { id: params.id },
    data: { nameGr: body.nameGr }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const updated = await prisma.exercise.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });
  return NextResponse.json(updated);
}
""".lstrip(),

  "app/api/exercises/[id]/sets/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';

// POST add set
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { kg, reps, notes } = body;

  // next order per exercise
  const maxOrder = await prisma.set.aggregate({
    _max: { order: true },
    where: { exerciseId: params.id, deletedAt: null }
  });

  const created = await prisma.set.create({
    data: {
      exerciseId: params.id,
      order: (maxOrder._max.order || 0) + 1,
      kg,
      reps,
      notes
    }
  });
  return NextResponse.json(created, { status: 201 });
}
""".lstrip(),

  "app/api/sets/[id]/route.ts": r"""
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.set.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const updated = await prisma.set.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json(updated);
}
""".lstrip(),

  # ---------------- Calendar UI ----------------
  "app/(dashboard)/calendar/page.tsx": r"""
import CalendarPageClient from './CalendarPageClient';
export default function Page() {
  return <CalendarPageClient />;
}
""".lstrip(),

  "app/(dashboard)/calendar/CalendarPageClient.tsx": r"""
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
""".lstrip(),

  "app/(dashboard)/calendar/ClientSelectedDay.tsx": r"""
'use client';
import { useEffect, useState } from 'react';
import WorkoutDayPanel from '../../../components/WorkoutDayPanel';

export default function ClientSelectedDay() {
  const [day, setDay] = useState<any | null>(null);
  useEffect(() => {
    const onSelectDay = (e: any) => {
      const payload = e.detail;
      if (payload && payload.id) setDay(payload);
      else setDay(null);
    };
    const onSelectDate = (e: any) => {
      const { workouts } = e.detail || {};
      if (Array.isArray(workouts) && workouts.length > 0) setDay(workouts[0]);
      else setDay(null);
    };
    window.addEventListener('select-day', onSelectDay);
    window.addEventListener('select-date', onSelectDate);
    return () => {
      window.removeEventListener('select-day', onSelectDay);
      window.removeEventListener('select-date', onSelectDate);
    };
  }, []);
  if (!day) return <div className="text-gray-500">Επίλεξε μια μέρα από το ημερολόγιο.</div>;
  return <WorkoutDayPanel day={day} />;
}
""".lstrip(),

  "components/Calendar.tsx": r"""
'use client';
import { useEffect, useMemo, useState } from 'react';

function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function endOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0); }

export default function Calendar({ onSelect }: { onSelect: (day: any | null) => void }) {
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [workouts, setWorkouts] = useState<any[]>([]);

  const range = useMemo(() => {
    const from = new Date(month.getFullYear(), month.getMonth(), 1);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    return { from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) };
  }, [month]);

  useEffect(() => {
    fetch(`/api/workouts?from=${range.from}&to=${range.to}`).then(r => r.json()).then(setWorkouts);
  }, [range.from, range.to]);

  const daysInMonth = useMemo(() => endOfMonth(month).getDate(), [month]);

  const byDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const w of workouts) {
      const key = new Date(w.date).toISOString().slice(0,10);
      map[key] ||= [];
      map[key].push(w);
    }
    return map;
  }, [workouts]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button className="px-2 py-1 border rounded" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>◀</button>
        <div className="font-semibold">{month.toLocaleString('el-GR', { month: 'long', year: 'numeric' })}</div>
        <button className="px-2 py-1 border rounded" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>▶</button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const iso = new Date(month.getFullYear(), month.getMonth(), d).toISOString().slice(0,10);
          const has = byDate[iso]?.length || 0;
          return (
            <button key={d} onClick={() => onSelect(byDate[iso]?.[0] || null)} className={`h-24 rounded-2xl border flex flex-col justify-between p-2 ${has ? 'bg-gray-50' : ''}`}>
              <span className="self-end text-sm text-gray-500">{d}</span>
              {has > 0 && <span className="text-xs font-medium">{has} προπόνηση(εις)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
""".lstrip(),

  "components/CollapsibleCard.tsx": r"""
'use client';
import { useState, PropsWithChildren } from 'react';

export default function CollapsibleCard({ title, subtitle, defaultOpen = false, children }: PropsWithChildren<{ title: string; subtitle?: string; defaultOpen?: boolean; }>) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl shadow p-4 bg-white border">
      <button className="w-full text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{title}</div>
            {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
          </div>
          <div className="text-sm text-gray-500">{open ? '−' : '+'}</div>
        </div>
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}
""".lstrip(),

  "components/InlineField.tsx": r"""
'use client';
import { useState } from 'react';

export default function InlineField({ value: initial, onSave, placeholder }: { value: string; onSave: (v: string) => void; placeholder?: string; }) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);

  return (
    <div className="inline-flex items-center gap-2">
      {editing ? (
        <input
          className="px-2 py-1 border rounded"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => { setEditing(false); if (value !== initial) onSave(value); }}
          autoFocus
          placeholder={placeholder}
        />
      ) : (
        <span onClick={() => setEditing(true)} className="cursor-text hover:bg-gray-50 px-1 rounded">
          {value || placeholder}
        </span>
      )}
    </div>
  );
}
""".lstrip(),

  "components/WorkoutDayPanel.tsx": r"""
'use client';
import { useEffect, useRef, useState } from 'react';
import CollapsibleCard from './CollapsibleCard';
import InlineField from './InlineField';

type EditMap = Record<string, boolean>;

function foldMap(src: string) {
  let folded = '';
  const map: number[] = [];
  for (let i = 0; i < src.length; i++) {
    const f = src[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    folded += f;
    for (let j = 0; j < f.length; j++) map.push(i);
  }
  return { folded, map };
}
function renderHighlighted(name: string, query: string) {
  const q = query.trim();
  if (!q) return name;
  const { folded, map } = foldMap(name);
  const fq = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const idx = folded.indexOf(fq);
  if (idx === -1) return name;
  const end = idx + fq.length;
  const startOrig = map[idx];
  const endOrig = map[end - 1] + 1;
  return (
    <>
      {name.slice(0, startOrig)}
      <mark className="rounded px-0.5 bg-m3-primary/15 text-inherit">{name.slice(startOrig, endOrig)}</mark>
      {name.slice(endOrig)}
    </>
  );
}

export default function WorkoutDayPanel({ day }: { day: any }) {
  const [data, setData] = useState<any>(day);
  const [editFor, setEditFor] = useState<EditMap>({});

  useEffect(() => {
    setData(day);
    setEditFor({});
  }, [day?.id]);

  async function refresh() {
    const r = await fetch(`/api/workouts/${day.id}`, { cache: 'no-store' });
    if (r.ok) setData(await r.json());
  }

  // Add Exercise + typeahead
  const [addingExercise, setAddingExercise] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [sugs, setSugs] = useState<string[]>([]);
  const [sugsOpen, setSugsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!addingExercise) return;
    const q = exerciseName.trim();
    if (q.length === 0) { setSugs([]); setActiveIdx(-1); setSugsOpen(false); return; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/exercises/suggest?q=${encodeURIComponent(q)}&limit=8`, { signal: ctrl.signal })
        .then(r => r.json())
        .then((list: string[]) => { setSugs(list); setSugsOpen(true); setActiveIdx(-1); })
        .catch(() => {});
    }, 150);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [exerciseName, addingExercise]);

  function chooseSuggestion(name: string) {
    setExerciseName(name);
    setSugsOpen(false);
    inputRef.current?.focus();
  }
  function onTypeaheadKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!sugsOpen || sugs.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => (i + 1) % sugs.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => (i - 1 + sugs.length) % sugs.length); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); chooseSuggestion(sugs[activeIdx]); }
    else if (e.key === 'Escape') { setSugsOpen(false); }
  }

  async function createExercise() {
    const nameGr = exerciseName.trim();
    if (!nameGr) return;
    const r = await fetch(`/api/workouts/${data.id}/exercises`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameGr }),
    });
    if (r.ok) { setExerciseName(''); setAddingExercise(false); await refresh(); }
  }

  // Exercise actions
  const toggleEdit = (id: string) => setEditFor(m => ({ ...m, [id]: !m[id] }));
  async function renameExercise(ex: any, newName: string) {
    const r = await fetch(`/api/exercises/${ex.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameGr: newName }),
    });
    if (r.ok) refresh();
  }
  async function deleteExercise(ex: any) {
    const r = await fetch(`/api/exercises/${ex.id}`, { method: 'DELETE' });
    if (r.ok) refresh();
  }

  // Add Set
  const [newSetKg, setNewSetKg] = useState<string>('');
  const [newSetReps, setNewSetReps] = useState<string>('10');
  const [newSetNotes, setNewSetNotes] = useState<string>('');
  async function createSet(ex: any) {
    const reps = Number(newSetReps);
    if (!Number.isFinite(reps) || reps <= 0) return;
    const kg = newSetKg.trim() === '' ? null : Number(newSetKg);
    if (newSetKg.trim() !== '' && !Number.isFinite(kg as number)) return;
    const r = await fetch(`/api/exercises/${ex.id}/sets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kg, reps, notes: newSetNotes.trim() || null }),
    });
    if (r.ok) { setNewSetKg(''); setNewSetReps('10'); setNewSetNotes(''); await refresh(); }
  }

  // Set actions
  async function saveSetField(s: any, patch: any) {
    const r = await fetch(`/api/sets/${s.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (r.ok) refresh();
  }
  async function deleteSet(s: any) {
    const r = await fetch(`/api/sets/${s.id}`, { method: 'DELETE' });
    if (r.ok) refresh();
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Add exercise */}
      <div className="flex flex-col gap-2">
        {!addingExercise ? (
          <div>
            <button
              onClick={() => setAddingExercise(true)}
              className="px-3 py-2 rounded-lg bg-m3-accent text-white hover:opacity-95 shadow-sm"
            >
              + Άσκηση
            </button>
          </div>
        ) : (
          <div className="p-3 bg-m3-surface border border-m3-outline rounded-xl shadow-card flex flex-col md:flex-row gap-3 items-end relative">
            <div className="flex-1">
              <label className="text-sm text-m3-muted">Όνομα άσκησης</label>
              <input
                ref={inputRef}
                className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                placeholder="π.χ. Πίεση στήθους σε πάγκο"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                onKeyDown={onTypeaheadKeyDown}
                onFocus={() => { if (sugs.length) setSugsOpen(true); }}
                onBlur={() => setTimeout(() => setSugsOpen(false), 120)}
              />
              {sugsOpen && sugs.length > 0 && (
                <div className="absolute left-3 right-3 mt-1 z-10 rounded-xl border border-m3-outline bg-m3-surface shadow-card max-h-60 overflow-auto">
                  {sugs.map((name, i) => (
                    <button
                      key={name + i}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => chooseSuggestion(name)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-m3-surfaceVariant ${i === activeIdx ? 'bg-m3-surfaceVariant' : ''}`}
                    >
                      {renderHighlighted(name, exerciseName)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => createSet} className="hidden" />
              <button onClick={createExercise} className="px-3 py-2 rounded-lg bg-m3-primary text-m3-onprimary hover:opacity-90">
                Προσθήκη
              </button>
              <button
                onClick={() => { setAddingExercise(false); setExerciseName(''); setSugs([]); setSugsOpen(false); }}
                className="px-3 py-2 rounded-lg border border-m3-outline bg-m3-surface hover:bg-m3-surfaceVariant"
              >
                Άκυρο
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exercises list */}
      {data.exercises.map((ex: any) => {
        const isEditing = !!editFor[ex.id];
        return (
          <CollapsibleCard key={ex.id} title={ex.nameGr} defaultOpen={false}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs text-m3-muted">Άσκηση</span>
              {isEditing ? (
                <InlineField value={ex.nameGr} onSave={(v) => renameExercise(ex, v)} placeholder="Όνομα άσκησης" />
              ) : (
                <span className="font-medium">{ex.nameGr}</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setEditFor(m => ({ ...m, [ex.id]: !m[ex.id] }))}
                  className={`text-sm px-2 py-1 rounded border ${
                    isEditing ? 'border-m3-outline bg-m3-surface text-m3-muted hover:bg-m3-surfaceVariant'
                              : 'border-m3-outline bg-m3-surface hover:bg-m3-surfaceVariant'
                  }`}
                  title={isEditing ? 'Κλείδωμα επεξεργασίας' : 'Επεξεργασία'}
                >
                  {isEditing ? '🔒 Κλείδωμα' : '✏️ Επεξεργασία'}
                </button>
                {isEditing && (
                  <button
                    onClick={() => deleteExercise(ex)}
                    className="text-sm px-2 py-1 rounded border border-m3-outline bg-m3-surface text-red-600 hover:bg-red-50"
                  >
                    Διαγραφή άσκησης
                  </button>
                )}
              </div>
            </div>

            {/* Add Set (μόνο σε edit mode) */}
            {isEditing && (
              <div className="p-3 bg-m3-surface border border-m3-outline rounded-xl shadow-card mb-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className="text-sm text-m3-muted">Κιλά</label>
                  <input
                    type="number"
                    className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                    placeholder="(σωμ. βάρος)"
                    value={newSetKg}
                    onChange={(e) => setNewSetKg(e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-sm text-m3-muted">Επαναλήψεις</label>
                  <input
                    type="number"
                    className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                    placeholder="10"
                    value={newSetReps}
                    onChange={(e) => setNewSetReps(e.target.value)}
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-sm text-m3-muted">Σχόλιο</label>
                  <input
                    className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                    placeholder="π.χ. κοντά σε αποτυχία"
                    value={newSetNotes}
                    onChange={(e) => setNewSetNotes(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <button onClick={() => createSet(ex)} className="w-full px-3 py-2 rounded-lg bg-m3-ok text-white hover:opacity-95">
                    Προσθήκη
                  </button>
                  <button
                    onClick={() => { setNewSetKg(''); setNewSetReps('10'); setNewSetNotes(''); }}
                    className="w-full px-3 py-2 rounded-lg border border-m3-outline bg-m3-surface hover:bg-m3-surfaceVariant"
                  >
                    Καθάρισμα
                  </button>
                </div>
              </div>
            )}

            {/* Sets list */}
            <div className="space-y-2">
              {ex.sets.map((s: any) => (
                <CollapsibleCard key={s.id} title={`Σετ #${s.order}`} subtitle={`${s.kg ?? 'Σωματικό βάρος'} kg • ${(s.reps ?? '—')} επ.`} defaultOpen={false}>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-2">
                        <label className="text-sm text-m3-muted">Κιλά</label>
                        <input
                          type="number"
                          defaultValue={s.kg ?? ''}
                          placeholder="(σωμ. βάρος)"
                          className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                          onBlur={(e) => {
                            const val = e.currentTarget.value.trim();
                            const kg = val === '' ? null : Number(val);
                            if (val !== '' && !Number.isFinite(kg)) return;
                            saveSetField(s, { kg });
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-m3-muted">Επαναλήψεις</label>
                        <input
                          type="number"
                          defaultValue={s.reps ?? ''}
                          className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                          onBlur={(e) => {
                            const val = e.currentTarget.value.trim();
                            const reps = val === '' ? null : Number(val);
                            if (val !== '' && (!Number.isFinite(reps as number) || (reps as number) <= 0)) return;
                            saveSetField(s, { reps });
                          }}
                        />
                      </div>
                      <div className="md:col-span-7">
                        <label className="text-sm text-m3-muted">Σχόλιο</label>
                        <input
                          type="text"
                          defaultValue={s.notes ?? ''}
                          className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                          onBlur={(e) => saveSetField(s, { notes: e.currentTarget.value })}
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <button onClick={() => deleteSet(s)} className="text-sm px-2 py-1 rounded border border-m3-outline bg-m3-surface text-red-600 hover:bg-red-50">
                          Διαγραφή
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-m3-outline bg-m3-surface p-3">
                      <div className="text-sm text-m3-muted">Σετ #{s.order}</div>
                      <div className="text-sm mt-1">
                        <span className="font-medium">{s.kg ?? 'Σωματικό βάρος'} kg</span> • {(s.reps ?? '—')} επαναλήψεις
                      </div>
                      {s.notes && <div className="text-xs text-m3-muted mt-1">{s.notes}</div>}
                    </div>
                  )}
                </CollapsibleCard>
              ))}
            </div>
          </CollapsibleCard>
        );
      })}
    </div>
  );
}
""".lstrip(),

  # ---------------- Prisma + seed ----------------
  "prisma/schema.prisma": r"""
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String      @id @default(cuid())
  username  String      @unique
  email     String?     @unique
  name      String?
  workouts  WorkoutDay[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model WorkoutDay {
  id         String     @id @default(cuid())
  user       User?      @relation(fields: [userId], references: [id])
  userId     String?
  date       DateTime
  program    String
  exercises  Exercise[]
  notes      String?
  deletedAt  DateTime?
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@index([userId, date])
}

model Exercise {
  id           String     @id @default(cuid())
  workoutDay   WorkoutDay @relation(fields: [workoutDayId], references: [id])
  workoutDayId String
  order        Int
  nameGr       String
  nameEn       String?
  sets         Set[]
  deletedAt    DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([workoutDayId, order])
}

model Set {
  id         String   @id @default(cuid())
  exercise   Exercise @relation(fields: [exerciseId], references: [id])
  exerciseId String
  order      Int
  kg         Float?
  reps       Int?
  notes      String?
  deletedAt  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([exerciseId, order])
}
""".lstrip(),

  "lib/db.ts": r"""
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn']
  });

if (process.env.NODE_ENV !== 'production') (globalForPrisma as any).prisma = prisma;
""".lstrip(),

  "lib/utils.ts": r"""
export const toISODate = (grDate: string) => {
  const [dd, mm, yyyy] = grDate.split("/");
  return `${yyyy}-${mm}-${dd}`;
};

export const weightToNumber = (kg: string | number | null) => {
  if (kg === null) return null;
  if (typeof kg === 'number') return kg;
  const lower = kg.toLowerCase();
  if (lower.includes('σωματικό')) return null;
  const num = parseFloat(lower.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : null;
};
""".lstrip(),

  "scripts/seed.ts": r"""
/*
  Seed με δύο μέρες (όπως είχες δώσει).
  Run:  npx tsx scripts/seed.ts
*/
import { prisma } from '../lib/db';
import { toISODate, weightToNumber } from '../lib/utils';

const data = [
  {
    dateGR: '22/09/2025',
    program: 'Πόδια',
    exercises: [
      {
        order: 1,
        nameGr: 'Μηχάνημα Πιέσεων Ποδιών (Leg Press)',
        sets: [
          { order: 1, kg: 100, reps: 15, notes: 'Ζέσταμα' },
          { order: 2, kg: 140, reps: 12, notes: 'Καλή ένταση' },
          { order: 3, kg: 180, reps: 10, notes: 'Δύσκολο σετ, κοντά σε αποτυχία' }
        ]
      },
      {
        order: 2,
        nameGr: 'Καθίσματα με Μπάρα (Barbell Squat)',
        sets: [
          { order: 1, kg: 60, reps: 12, notes: 'Εύκολο ξεκίνημα' },
          { order: 2, kg: 80, reps: 10, notes: 'Καλή τεχνική' },
          { order: 3, kg: 100, reps: 8, notes: 'Αποτυχία στο τέλος' }
        ]
      }
    ]
  },
  {
    dateGR: '22/09/2025',
    program: 'Στήθος & Κοιλιακοί',
    exercises: [
      {
        order: 1,
        nameGr: 'Μηχάνημα Κάθετης Πίεσης Στήθους (Vertical Chest Press)',
        sets: [
          { order: 1, kg: 30, reps: 12, notes: 'Καλή εκκίνηση' },
          { order: 2, kg: 30, reps: 12, notes: 'Καλά κιλά, ανεβάζω στο επόμενο' }
        ]
      }
    ]
  }
];

async function main() {
  for (const day of data) {
    const dateISO = toISODate(day.dateGR);
    const created = await prisma.workoutDay.create({
      data: {
        date: new Date(dateISO),
        program: day.program,
        exercises: {
          create: day.exercises.map(ex => ({
            order: ex.order,
            nameGr: ex.nameGr,
            sets: {
              create: ex.sets.map(s => ({
                order: s.order,
                kg: weightToNumber(s.kg as any),
                reps: s.reps,
                notes: s.notes ?? undefined
              }))
            }
          }))
        }
      }
    });
    console.log('Seeded workout:', created.id, created.program, created.date.toISOString().slice(0,10));
  }
}

main().then(() => prisma.$disconnect());
""".lstrip(),
}

def write_files():
    for path, content in FILES.items():
        d = os.path.dirname(path)
        if d and not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
    print("✅ Wrote all files.")

if __name__ == "__main__":
    write_files()

