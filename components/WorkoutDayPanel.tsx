'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import InlineField from './InlineField';
import AddExerciseInline from './gym/AddExerciseInline';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';

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
  deletedAt?: string | null;
};

type DayType = {
  id: string;
  date: string; // ISO
  program: string;
  exercises: ExerciseType[];
};

type Props = { day: DayType };

const SINGLE_OPEN = true;

// μικρό debounce
function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function WorkoutDayPanel({ day }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 200);

  // focus στο search σε desktop όταν αλλάζει μέρα
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setOpenId(null);
    setQuery('');
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      searchRef.current?.focus();
    }
  }, [day?.id]);

  const exercises = useMemo(
    () => (day?.exercises ?? []).filter((e) => !e.deletedAt),
    [day]
  );

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((ex) => {
      const name = (ex.nameGr || '').toLowerCase();
      const nameEn = (ex.nameEn || '').toLowerCase();
      const inName = name.includes(q) || nameEn.includes(q);
      const inSets =
        ex.sets?.some(
          (s) =>
            (s.notes || '').toLowerCase().includes(q) ||
            String(s.kg ?? '').toLowerCase().includes(q) ||
            String(s.reps ?? '').toLowerCase().includes(q)
        ) ?? false;
      return inName || inSets;
    });
  }, [exercises, debouncedQuery]);

  function toggle(id: string) {
    if (!SINGLE_OPEN) {
      setOpenId((prev) => (prev === id ? null : id));
      return;
    }
    setOpenId((prev) => (prev === id ? null : id));
  }

  async function addSet(exId: string) {
    try {
      const res = await fetch(`/api/exercises/${exId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kg: null, reps: null, notes: null }),
      });
      if (!res.ok) throw new Error('failed');
      window.dispatchEvent(new CustomEvent('refresh-day', { detail: { id: day.id } }));
    } catch (e) {
      console.error('addSet error', e);
      alert('Δεν μπόρεσα να προσθέσω σετ.');
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Header / πρόγραμμα ημέρας */}
      <div className="mb-3">
        <div className="text-sm text-neutral-500">
          {new Date(day.date).toLocaleDateString('el-GR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className="mt-1 text-lg font-semibold">{day.program}</div>
      </div>

      {/* Action Bar: αναζήτηση + προσθήκη άσκησης */}
      <div className="sticky top-[68px] z-10 mb-3 flex gap-2 rounded-xl border bg-white/85 backdrop-blur px-3 py-2 shadow-sm">
        <div className="flex-1">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Αναζήτηση ασκήσεων ή σετ (κιλά/επαναλήψεις/σχόλια)…"
            className="w-full rounded-lg border px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-neutral-500/30"
          />
        </div>
        <div className="shrink-0">
          <AddExerciseInline
            dayId={day.id}
            onAdded={(ex) => {
              setQuery('');
              setOpenId(ex.id);
              window.dispatchEvent(new CustomEvent('refresh-day', { detail: { id: day.id } }));
            }}
            renderTrigger={(open) => (
              <button
                onClick={open}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[15px] hover:bg-neutral-50"
                aria-label="Προσθήκη άσκησης"
              >
                <Plus className="h-4 w-4" />
                <span>+ Άσκηση</span>
              </button>
            )}
          />
        </div>
      </div>

      {/* Λίστα ασκήσεων */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border bg-white p-4 text-neutral-500">
            Δεν βρέθηκαν ασκήσεις για «{debouncedQuery}».
          </div>
        )}

        {filtered.map((ex) => {
          const isOpen = openId === ex.id;
          return (
            <div
              key={ex.id}
              className="rounded-2xl border bg-white shadow-sm overflow-hidden"
            >
              {/* header άσκησης */}
              <button
                onClick={() => toggle(ex.id)}
                className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-neutral-50"
                aria-expanded={isOpen}
                aria-controls={`ex-${ex.id}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">#{ex.order}</span>
                    <h3 className="truncate text-[16px] font-semibold leading-6">
                      {ex.nameGr}
                    </h3>
                  </div>
                  {ex.nameEn ? (
                    <div className="mt-0.5 truncate text-[13px] text-neutral-500">
                      {ex.nameEn}
                    </div>
                  ) : null}
                </div>
                <div className="shrink-0 text-neutral-500 group-hover:text-neutral-700">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </button>

              {/* περιεχόμενο άσκησης */}
              {isOpen && (
                <div id={`ex-${ex.id}`} className="border-t px-4 py-3">
                  {/* headers sets */}
                  <div className="grid grid-cols-12 items-center gap-2 sm:gap-3">
                    <div className="col-span-3 sm:col-span-2 text-[13px] font-medium text-neutral-500">
                      Σετ #
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-[13px] font-medium text-neutral-500">
                      Κιλά
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-[13px] font-medium text-neutral-500">
                      Επαναλήψεις
                    </div>
                    <div className="col-span-3 sm:col-span-6 text-[13px] font-medium text-neutral-500">
                      Σχόλια
                    </div>
                  </div>

                  <div className="mt-1 space-y-2">
                    {ex.sets?.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-12 items-center gap-2 rounded-xl border px-2 py-2 sm:gap-3"
                      >
                        <div className="col-span-3 sm:col-span-2 text-[15px]">
                          #{s.order}
                        </div>

                        {/* Κιλά */}
                        <div className="col-span-3 sm:col-span-2">
                          <InlineField
                            initial={s.kg ?? ''}
                            placeholder="κιλά"
                            onSave={async (val: string) => {
                              const kg =
                                val.trim() === '' ? null : Number(val.replace(',', '.'));
                              await fetch(`/api/sets/${s.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ kg }),
                              });
                              window.dispatchEvent(
                                new CustomEvent('refresh-day', { detail: { id: day.id } })
                              );
                            }}
                          />
                        </div>

                        {/* Επαναλήψεις */}
                        <div className="col-span-3 sm:col-span-2">
                          <InlineField
                            initial={s.reps ?? ''}
                            placeholder="reps"
                            onSave={async (val: string) => {
                              const reps = val.trim() === '' ? null : Number(val);
                              await fetch(`/api/sets/${s.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reps }),
                              });
                              window.dispatchEvent(
                                new CustomEvent('refresh-day', { detail: { id: day.id } })
                              );
                            }}
                          />
                        </div>

                        {/* Σχόλια */}
                        <div className="col-span-12 sm:col-span-6">
                          <InlineField
                            initial={s.notes ?? ''}
                            placeholder="Σχόλια…"
                            onSave={async (val: string) => {
                              const notes = val.trim() === '' ? null : val.trim();
                              await fetch(`/api/sets/${s.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ notes }),
                              });
                              window.dispatchEvent(
                                new CustomEvent('refresh-day', { detail: { id: day.id } })
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* add set */}
                  <div className="mt-3">
                    <button
                      onClick={() => addSet(ex.id)}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[15px] hover:bg-neutral-50"
                    >
                      <Plus className="h-4 w-4" />
                      Προσθήκη σετ
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

