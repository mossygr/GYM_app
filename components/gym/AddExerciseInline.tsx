'use client';

import { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

type SuggestItem = { id: string; name: string };

export default function AddExerciseInline({
  dayId,
  onAdded,
  onCancel,
}: {
  dayId: string;
  onAdded: (ex: { id: string; order: number; nameGr: string; nameEn?: string | null }) => void;
  onCancel?: () => void;
}) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggests, setSuggests] = useState<SuggestItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // fetch suggestions
  useEffect(() => {
    let alive = true;
    const run = async () => {
      const term = q.trim();
      if (!term) {
        setSuggests([]);
        return;
      }
      try {
        const res = await fetch(`/api/exercises/suggest?q=${encodeURIComponent(term)}&limit=8`);
        if (!res.ok) throw new Error('suggest failed');
        const data = await res.json();

        // δέξου διάφορα σχήματα από το API:
        // 1) { items: [{id,name}, ...] }
        // 2) [{id,name}, ...]
        // 3) { suggestions: [...] }
        let arr: any[] = [];
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data?.items)) arr = data.items;
        else if (Array.isArray(data?.suggestions)) arr = data.suggestions;

        const items = arr.map((x: any) => ({
          id: String(x.id ?? x.value ?? x.name ?? Math.random()),
          name: String(x.name ?? x.value ?? ''),
        })).filter((x: any) => x.name);

        if (alive) setSuggests(items);
      } catch {
        if (alive) setSuggests([]);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [q]);

  const createExercise = async (name: string) => {
    const finalName = name.trim();
    if (!finalName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workouts/${dayId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameGr: finalName }),
      });
      if (!res.ok) throw new Error('create failed');
      const created = await res.json();
      onAdded(created);
    } catch (e: any) {
      setError('Αποτυχία δημιουργίας άσκησης');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Γράψε όνομα άσκησης…"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
        />
        <button
          onClick={() => q.trim() && createExercise(q)}
          disabled={loading || !q.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 disabled:opacity-60"
          title="Προσθήκη"
        >
          <Plus className="h-4 w-4" />
          Προσθήκη
        </button>
        <button
          onClick={() => onCancel?.()}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
          title="Άκυρο"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {suggests.length > 0 && (
        <div className="mt-2 rounded-lg border border-neutral-200 bg-white">
          {suggests.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2"
              onClick={() => createExercise(s.name)}
            >
              <Check className="h-4 w-4 opacity-60" />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}

