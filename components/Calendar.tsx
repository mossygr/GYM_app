'use client';
import { useEffect, useMemo, useState } from 'react';

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export default function Calendar() {
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [workouts, setWorkouts] = useState<any[]>([]);

  const range = useMemo(() => {
    const from = new Date(month.getFullYear(), month.getMonth(), 1);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }, [month]);

  useEffect(() => {
    fetch(`/api/workouts?from=${range.from}&to=${range.to}`)
      .then((r) => r.json())
      .then((list: any[]) => {
        // Προστασία client-side: αν για κάποιο λόγο επιστρέψουν πολλαπλά για την ίδια μέρα,
        // κράτα τον πιο πρόσφατο createdAt.
        const map = new Map<string, any>();
        for (const d of list || []) {
          const key = new Date(d.date).toISOString().slice(0, 10);
          const prev = map.get(key);
          if (!prev) {
            map.set(key, d);
          } else {
            const a = new Date(prev.createdAt).getTime();
            const b = new Date(d.createdAt).getTime();
            map.set(key, b >= a ? d : prev);
          }
        }
        setWorkouts(Array.from(map.values()));
      })
      .catch(() => setWorkouts([]));
  }, [range.from, range.to]);

  const daysInMonth = useMemo(
    () => endOfMonth(month).getDate(),
    [month]
  );

  // index workouts by date
  const byDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const w of workouts) {
      const key = new Date(w.date).toISOString().slice(0, 10);
      (map[key] ||= []).push(w); // εδώ θα είναι 1 στοιχείο ανά ημέρα, αλλά κρατάμε array για συμβατότητα
    }
    return map;
  }, [workouts]);

  function selectDay(iso: string) {
    const arr = byDate[iso] || [];
    // Safety: αν για οποιονδήποτε λόγο έχει πολλά, κράτα τον πιο πρόσφατο
    let chosen = arr[0] ?? null;
    if (arr.length > 1) {
      chosen = arr.reduce((best, cur) => {
        const a = new Date(best.createdAt).getTime();
        const b = new Date(cur.createdAt).getTime();
        return b >= a ? cur : best;
      });
    }
    const payload = { date: iso, workouts: chosen ? [chosen] : [] };
    window.dispatchEvent(new CustomEvent('select-day', { detail: payload }));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          className="px-2 py-1 border rounded"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        >
          ◀
        </button>
        <div className="font-semibold">
          {month.toLocaleString('el-GR', { month: 'long', year: 'numeric' })}
        </div>
        <button
          className="px-2 py-1 border rounded"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const iso = new Date(
            month.getFullYear(),
            month.getMonth(),
            d
          ).toISOString().slice(0, 10);
          const count = byDate[iso]?.length || 0;
          return (
            <button
              key={d}
              onClick={() => selectDay(iso)}
              className={`h-24 rounded-2xl border flex flex-col justify-between p-2 ${
                count ? 'bg-gray-50' : ''
              }`}
              title={count ? `${count} προπόνηση(εις)` : '—'}
            >
              <span className="self-end text-sm text-gray-500">{d}</span>
              {count > 0 && (
                <span className="text-xs font-medium">
                  {count} προπόνηση(εις)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

