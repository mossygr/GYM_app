'use client';

import { useEffect, useState } from 'react';
import CollapsibleCard from './CollapsibleCard';
import InlineField from './InlineField';
import { Plus } from 'lucide-react';
import AddExerciseInline from './gym/AddExerciseInline';

type SetType = {
  id: string;
  order: number;
  kg: number | null;
  reps: number | null;
  notes: string | null;
};

type ExerciseType = {
  id: string;
  order: number;
  nameGr: string;
  nameEn?: string | null;
  sets: SetType[];
};

type DayType = {
  id: string;
  date: string;
  program: string;
  notes?: string | null;
  exercises: ExerciseType[];
};

export default function WorkoutDayPanel({
  day,
  singleOpen = true, // αν false, επιτρέπει πολλαπλές ανοιχτές ασκήσεις
}: {
  day: DayType;
  singleOpen?: boolean;
}) {
  // local state για γρήγορο/αισθητό UX
  const [state, setState] = useState<DayType>(day);
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // id set/exercise που κάνει save
  const [adding, setAdding] = useState(false); // inline προσθήκη άσκησης

  useEffect(() => {
    setState(day);
    setOpenExerciseId(null); // νέα μέρα -> όλα κλειστά
    setAdding(false);
  }, [day?.id]);

  // ---------- helpers ----------
  const updateSetLocal = (exerciseId: string, setId: string, patch: Partial<SetType>) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
      ),
    }));
  };

  const appendSetLocal = (exerciseId: string, newSet: SetType) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id !== exerciseId ? ex : { ...ex, sets: [...ex.sets, newSet].sort((a, b) => a.order - b.order) }
      ),
    }));
  };

  const nextSetOrder = (ex: ExerciseType) =>
    (ex.sets?.length ? Math.max(...ex.sets.map((s) => s.order)) : 0) + 1;

  // ---------- API ----------
  const patchSet = async (setId: string, body: Partial<SetType>) => {
    setBusy(setId);
    try {
      const res = await fetch(`/api/sets/${setId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Patch failed');
    } finally {
      setBusy(null);
    }
  };

  const postSet = async (exerciseId: string, draft: { order: number }) => {
    setBusy(exerciseId);
    try {
      const res = await fetch(`/api/exercises/${exerciseId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = (await res.json()) as SetType | { id: string };
      return created;
    } finally {
      setBusy(null);
    }
  };

  // ---------- UI actions ----------
  const parseNum = (v: any): number | null =>
    v === '' || v === null || typeof v === 'undefined' ? null : Number(v);

  const onChangeSetField = (exId: string, setObj: SetType, field: keyof SetType, value: any) => {
    const parsed =
      field === 'kg' || field === 'reps'
        ? parseNum(value)
        : (value ?? null);
    updateSetLocal(exId, setObj.id, { [field]: parsed } as any);
  };

  const onSaveField = async (exId: string, setObj: SetType, field: keyof SetType, raw: any) => {
    // νέα τιμή
    const parsed =
      field === 'kg' || field === 'reps'
        ? parseNum(raw)
        : (raw ?? null);

    // ενημέρωσε local (ώστε να patchάρουμε την πιο φρέσκια εκδοχή)
    const newSet: SetType = { ...setObj, [field]: parsed } as SetType;
    updateSetLocal(exId, setObj.id, { [field]: parsed } as any);

    // σώσε **ολόκληρη** τη γραμμή
    await patchSet(setObj.id, {
      kg: newSet.kg,
      reps: newSet.reps,
      notes: newSet.notes,
    });
  };

  const onAddSet = async (ex: ExerciseType) => {
    const order = nextSetOrder(ex);
    const tempId = `temp-${ex.id}-${order}`;
    const optimistic: SetType = { id: tempId, order, kg: null, reps: null, notes: null };
    appendSetLocal(ex.id, optimistic);

    try {
      const created = await postSet(ex.id, { order });
      const newId = (created as any).id ?? tempId;
      // αντικατάσταση temp id με πραγματικό
      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id !== ex.id ? e : { ...e, sets: e.sets.map((s) => (s.id === tempId ? { ...s, id: newId } : s)) }
        ),
      }));
    } catch {
      // αν αποτύχει, rollback το temp row
      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.map((e) =>
          e.id !== ex.id ? e : { ...e, sets: e.sets.filter((s) => s.id !== tempId) }
        ),
      }));
    }
  };

  // ---------- render ----------
  return (
    <div className="space-y-4">
      {/* header actions (χωρίς διπλή εμφάνιση του "Πρόγραμμα") */}
      <div className="flex items-center justify-end">
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50"
          >
            <Plus className="h-4 w-4" />
            + Άσκηση
          </button>
        ) : null}
      </div>

      {adding && (
        <AddExerciseInline
          dayId={state.id}
          onAdded={(ex) => {
            setState((prev) => ({
              ...prev,
              exercises: [...prev.exercises, { ...ex, sets: [] }],
            }));
            setAdding(false);
            setOpenExerciseId(ex.id); // άνοιξε αυτόματα τη νέα άσκηση
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {state.exercises.length === 0 && !adding && (
        <div className="text-neutral-500 text-sm">Δεν υπάρχουν ασκήσεις για αυτό το πρόγραμμα.</div>
      )}

      <div className="space-y-3">
        {state.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((ex) => {
            const subtitle = ex.nameEn ? ex.nameEn : undefined;
            const isOpen = openExerciseId ? openExerciseId === ex.id : false;

            return (
              <CollapsibleCard
                key={ex.id}
                title={ex.nameGr}
                subtitle={subtitle}
                open={isOpen}
                onToggle={(next) => {
                  if (singleOpen) {
                    setOpenExerciseId(next ? ex.id : null);
                  } else {
                    setOpenExerciseId((curr) => (next ? ex.id : curr === ex.id ? null : curr));
                  }
                }}
              >
                {/* Πίνακας σετ: mobile-friendly */}
                <div className="overflow-x-auto">
                  <div className="min-w-[480px]">
                    <div className="grid grid-cols-[64px_1fr_1fr_2fr] items-center gap-2 text-xs font-medium text-neutral-500 px-1">
                      <div>#</div>
                      <div>Kg</div>
                      <div>Reps</div>
                      <div>Σχόλια</div>
                    </div>

                    <div className="divide-y">
                      {ex.sets
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((s) => (
                          <div
                            key={s.id}
                            className="grid grid-cols-[64px_1fr_1fr_2fr] items-center gap-2 py-2 px-1"
                          >
                            <div className="text-sm text-neutral-600">Σετ {s.order}</div>

                            <InlineField
                              value={s.kg ?? ''}
                              placeholder="κιλά"
                              type="number"
                              min="0"
                              step="0.5"
                              busy={busy === s.id}
                              onChange={(v) => onChangeSetField(ex.id, s, 'kg', v)}
                              onSave={(v) => onSaveField(ex.id, s, 'kg', v)}
                            />

                            <InlineField
                              value={s.reps ?? ''}
                              placeholder="επαν."
                              type="number"
                              min="0"
                              step="1"
                              busy={busy === s.id}
                              onChange={(v) => onChangeSetField(ex.id, s, 'reps', v)}
                              onSave={(v) => onSaveField(ex.id, s, 'reps', v)}
                            />

                            <InlineField
                              value={s.notes ?? ''}
                              placeholder="σχόλιο"
                              type="text"
                              busy={busy === s.id}
                              onChange={(v) => onChangeSetField(ex.id, s, 'notes', v)}
                              onSave={(v) => onSaveField(ex.id, s, 'notes', v)}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onAddSet(ex)}
                    disabled={busy === ex.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    Προσθήκη σετ
                  </button>
                </div>
              </CollapsibleCard>
            );
          })}
      </div>
    </div>
  );
}

