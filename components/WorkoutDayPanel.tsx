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

export default function WorkoutDayPanel({ day, singleOpen = true }: { day: any; singleOpen?: boolean }) {
  const [data, setData] = useState<any>(day);
  const [editFor, setEditFor] = useState<EditMap>({});

  useEffect(() => {
    setData(day);
    setEditFor({});
  }, [day?.id]);

  async function refresh() {
    if (!day?.id) return;
    const r = await fetch(`/api/days/${day.id}`);
    if (r.ok) setData(await r.json());
  }

  // === ΜΟΝΟ ΓΙΑ UI: “μία ανοιχτή τη φορά” με toggle ===
  const [singleOpen, setSingleOpen] = useState<boolean>(true); // default: μία ανοιχτή — όπως ζήτησες

  // Add Exercise + typeahead (όπως ήταν)
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
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, sugs.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); chooseSuggestion(sugs[activeIdx]); }
    else if (e.key === 'Escape') { setSugsOpen(false); }
  }

  async function createExercise() {
    const nameGr = exerciseName.trim();
    if (!nameGr) return;
    const r = await fetch(`/api/days/${day.id}/exercises`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameGr }),
    });
    if (r.ok) { setExerciseName(''); setAddingExercise(false); await refresh(); }
  }

  // Exercise actions (όπως ήταν)
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

  // Add Set (όπως ήταν)
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

  // Set actions (όπως ήταν)
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
      {/* Header: toggle “1 ανοιχτή/πολλαπλές” */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setSingleOpen(v => !v)}
          className="px-3 py-1.5 rounded-lg border border-m3-outline bg-m3-surface text-sm hover:bg-m3-surfaceVariant"
          title="Εναλλαγή πολιτικής ανοίγματος"
        >
          {singleOpen ? '1 ανοιχτή' : 'πολλαπλές'}
        </button>
      </div>

      {/* Add exercise */}
      <div className="flex flex-col gap-2">
        {!addingExercise ? (
          <div>
            <button
              type="button"
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
                type="text"
                className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                placeholder="π.χ. Μηχάνημα Πιέσεων Ποδιών"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                onKeyDown={onTypeaheadKeyDown}
                onFocus={() => { if (sugs.length) setSugsOpen(true); }}
                onBlur={() => setTimeout(() => setSugsOpen(false), 120)}
              />
              {sugsOpen && sugs.length > 0 && (
                <div className="absolute left-3 right-3 mt-1 z-10 rounded-lg border border-m3-outline bg-m3-surface shadow-card max-h-60 overflow-auto">
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
              <button
                type="button"
                onClick={createExercise}
                className="px-3 py-2 rounded-lg bg-m3-primary text-m3-onprimary hover:opacity-90"
              >
                Προσθήκη
              </button>
              <button
                type="button"
                onClick={() => { setAddingExercise(false); setExerciseName(''); setSugs([]); setSugsOpen(false); }}
                className="px-3 py-2 rounded-lg border border-m3-outline bg-m3-surface hover:bg-m3-surfaceVariant"
              >
                Άκυρο
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exercises */}
      {data.exercises.map((ex: any) => {
        const isEditing = !!editFor[ex.id];
        return (
          <CollapsibleCard
            key={ex.id}
            title={ex.nameGr}
            defaultOpen={false}
            // ΝΕΟ: group για “μία ανοιχτή τη φορά”
            groupId="exercises"
            selfId={ex.id}
            singleInGroup={singleOpen}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs text-m3-muted">Άσκηση</span>
              {isEditing ? (
                <InlineField value={ex.nameGr} onSave={(v) => renameExercise(ex, v)} placeholder="Όνομα άσκησης" />
              ) : (
                <span className="font-medium">{ex.nameGr}</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditFor(m => ({ ...m, [ex.id]: !m[ex.id] }))}
                  className={`text-sm px-2 py-1 rounded border ${
                    isEditing ? 'border-m3-outline bg-m3-surface text-m3-muted hover:bg-m3-surfaceVariant'
                              : 'border-m3-outline bg-m3-surface hover:bg-m3-surfaceVariant'
                  }`}
                >
                  {isEditing ? 'Κλείσιμο επεξεργασίας' : 'Επεξεργασία'}
                </button>
                {isEditing && (
                  <button
                    type="button"
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
                    placeholder="π.χ. 100"
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
                  <button
                    type="button"
                    onClick={() => createSet(ex)}
                    className="w-full px-3 py-2 rounded-lg bg-m3-ok text-white hover:opacity-95"
                  >
                    Προσθήκη
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewSetKg(''); setNewSetReps('10'); setNewSetNotes(''); }}
                    className="w-full px-3 py-2 rounded-lg border border-m3-outline bg-m3-surface hover:bg-m3-surfaceVariant"
                  >
                    Καθάρισμα
                  </button>
                </div>
              </div>
            )}

            {/* Sets */}
            <div className="space-y-2">
              {ex.sets.map((s: any) => (
                <CollapsibleCard
                  key={s.id}
                  title={`Σετ #${s.order ?? s.index ?? ''}`}
                  defaultOpen={!isEditing} // όταν ΔΕΝ είμαι σε edit mode: δείξε compact view ανοικτό
                >
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-3">
                        <label className="text-sm text-m3-muted">Κιλά</label>
                        <input
                          type="number"
                          defaultValue={s.kg ?? ''}
                          className="mt-1 w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface"
                          onBlur={(e) => {
                            const val = e.currentTarget.value.trim();
                            const kg = val === '' ? null : Number(val);
                            if (val !== '' && !Number.isFinite(kg as number)) return;
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
                        <button
                          type="button"
                          onClick={() => deleteSet(s)}
                          className="text-sm px-2 py-1 rounded border border-m3-outline bg-m3-surface text-red-600 hover:bg-red-50"
                        >
                          Διαγραφή
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-m3-outline bg-m3-surface p-3">
                      <div className="text-sm">
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

