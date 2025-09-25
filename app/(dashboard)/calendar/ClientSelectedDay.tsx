'use client';
import { useEffect, useMemo, useState } from 'react';
import WorkoutDayPanel from '../../../components/WorkoutDayPanel';

type SelectedPayload = { date: string; workouts: any[] };

function formatDateGreek(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('el-GR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ClientSelectedDay() {
  const [payload, setPayload] = useState<SelectedPayload | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const handler = (e: any) => {
      setPayload(e.detail as SelectedPayload);
      setIdx(0);
    };
    window.addEventListener('select-day', handler);
    return () => window.removeEventListener('select-day', handler);
  }, []);

  const dayISO = payload?.date ?? null;
  const workouts = payload?.workouts ?? [];
  const current = useMemo(() => (workouts.length > 0 ? workouts[idx] : null), [workouts, idx]);

  if (!dayISO) {
    return <div className="text-gray-500">Επίλεξε μια μέρα από το ημερολόγιο.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">{formatDateGreek(dayISO)}</div>

      {workouts.length === 0 && (
        <div className="text-gray-600">
          Δεν υπάρχουν προπονήσεις για αυτή τη μέρα.
        </div>
      )}

      {workouts.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Πρόγραμμα:</label>
          <select
            className="px-3 py-2 border rounded-lg bg-white"
            value={idx}
            onChange={(e) => setIdx(Number(e.target.value))}
          >
            {workouts.map((w, i) => (
              <option key={w.id} value={i}>
                {w.program}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">({workouts.length} προγράμματα)</span>
        </div>
      )}

      {workouts.length === 1 && (
        <div className="text-sm text-gray-600">Πρόγραμμα: <span className="font-medium">{workouts[0].program}</span></div>
      )}

      {current && <WorkoutDayPanel day={current} />}
    </div>
  );
}

