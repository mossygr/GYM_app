// app/(dashboard)/day/[date]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { WorkoutDayModel, ExerciseModel, SetInput } from "@/lib/types";
import { fetchDay, addExercise, addSet, renameExercise, deleteExercise, updateSet, deleteSet } from "@/lib/api";
import { computeTotals } from "@/lib/format";
import DayHeader from "@/components/DayHeader";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Skeletons";
import ExerciseCard from "@/components/ExerciseCard";
import SetRow from "@/components/SetRow";
import InlineAddExercise from "@/components/InlineAddExercise";
import EffortStepper, { EffortValue } from "@/components/EffortStepper";

type EditingSetState = { id: string; weight: number; reps: number; note: string | null } | null;

/** Σειρά δυσκολιών (tap → επόμενο) */
const EFFORTS = ["", "Καθαρό", "Με δυσκολία", "Δύσκολο", "Αποτυχία"] as const;
type EffortStr = (typeof EFFORTS)[number];
const nextEffort = (curr: string | null | undefined): EffortStr => {
  const i = EFFORTS.indexOf((curr ?? "") as EffortStr);
  return EFFORTS[(i + 1) % EFFORTS.length];
};
const effortClass = (note: string | null | undefined) => {
  const v = (note ?? "").trim();
  if (v === "Καθαρό") return "ok";
  if (v === "Με δυσκολία") return "warn";
  if (v === "Δύσκολο") return "hard";
  if (v === "Αποτυχία") return "fail";
  return "none";
};

export default function DayPage() {
  const params = useParams();
  const date = String((params as any).date);

  const [day, setDay] = useState<WorkoutDayModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [confirmDeleteExerciseId, setConfirmDeleteExerciseId] = useState<string | null>(null);

  const [editingSet, setEditingSet] = useState<EditingSetState>(null);
  const [confirmDeleteSetId, setConfirmDeleteSetId] = useState<string | null>(null);

  /** Header toast state */
  const [effortToast, setEffortToast] = useState<{ text: string; cls: string } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    fetchDay(date)
      .then(d => { if (active) setDay(d); })
      .catch(e => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date]);

  const totals = useMemo(() => computeTotals(day?.exercises ?? []), [day]);

  async function handleAddExercise(name: string) {
    if (!day) return;
    setBusy(true);
    const tempId = `tmp-ex-${Date.now()}`;
    const optimistic: ExerciseModel = { id: tempId, name, sets: [] };
    setDay({ ...day, exercises: [...day.exercises, optimistic] });
    try {
      const saved = await addExercise(day.id, name);
      setDay(prev => prev ? { ...prev, exercises: prev.exercises.map(ex => ex.id === tempId ? saved : ex) } : prev);
    } catch (e) {
      setDay(prev => prev ? { ...prev, exercises: prev.exercises.filter(ex => ex.id !== tempId) } : prev);
      alert(`Αποτυχία προσθήκης άσκησης\n${e}`);
    } finally { setBusy(false); }
  }

  async function handleAddSet(exerciseId: string, data: SetInput) {
    if (!day) return;
    const tempId = `tmp-set-${Date.now()}`;
    setDay(prev => prev ? {
      ...prev,
      exercises: prev.exercises.map(ex => ex.id === exerciseId
        ? { ...ex, sets: [...ex.sets, { id: tempId, weight: data.weight, reps: data.reps, note: data.note ?? null }] }
        : ex),
    } : prev);
    try {
      await addSet(exerciseId, data);
      const fresh = await fetchDay(date);
      setDay(fresh);
    } catch (e) {
      setDay(prev => prev ? {
        ...prev,
        exercises: prev.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(s => s.id !== tempId) } : ex),
      } : prev);
      alert(`Αποτυχία προσθήκης σετ\n${e}`);
    }
  }

  async function handleRenameExercise(exId: string) {
    if (!day) return;
    const newName = renameVal.trim(); if (!newName) return;
    const prev = day;
    setDay({ ...day, exercises: day.exercises.map(ex => ex.id === exId ? { ...ex, name: newName } : ex) });
    setRenamingId(null); setRenameVal("");
    try { await renameExercise(exId, newName); }
    catch (e) { setDay(prev); alert(`Αποτυχία μετονομασίας\n${e}`); }
  }
  async function handleDeleteExercise(exId: string) {
    if (!day) return;
    const prev = day; setConfirmDeleteExerciseId(null);
    setDay({ ...day, exercises: day.exercises.filter(ex => ex.id !== exId) });
    try { await deleteExercise(exId); }
    catch (e) { setDay(prev); alert(`Αποτυχία διαγραφής άσκησης\n${e}`); }
  }

  async function handleSaveSet() {
    if (!day || !editingSet) return;
    const { id, weight, reps, note } = editingSet;
    const prev = day;
    setDay({
      ...day,
      exercises: day.exercises.map(ex => ({ ...ex, sets: ex.sets.map(s => s.id === id ? { ...s, weight, reps, note } : s) })),
    });
    setEditingSet(null);
    try { await updateSet(id, { weight, reps, note: note ?? "" }); }
    catch (e) { setDay(prev); alert(`Αποτυχία ενημέρωσης σετ\n${e}`); }
  }
  async function handleDeleteSet() {
    if (!day || !confirmDeleteSetId) return;
    const sid = confirmDeleteSetId; const prev = day; setConfirmDeleteSetId(null);
    setDay({ ...day, exercises: day.exercises.map(ex => ({ ...ex, sets: ex.sets.filter(s => s.id !== sid) })) });
    try { await deleteSet(sid); } catch (e) { setDay(prev); alert(`Αποτυχία διαγραφής σετ\n${e}`); }
  }

  /** Tap στο dumbbell: cycle δυσκολίας + header toast + haptics + optimistic update */
  async function handleCycleEffort(setId: string) {
    if (!day) return;

    // Βρες σετ & επόμενο value
    let exIdx = -1, setIdx = -1;
    for (let i = 0; i < day.exercises.length; i++) {
      setIdx = day.exercises[i].sets.findIndex(s => s.id === setId);
      if (setIdx >= 0) { exIdx = i; break; }
    }
    if (exIdx < 0 || setIdx < 0) return;
    const curr = day.exercises[exIdx].sets[setIdx];
    const next = nextEffort(curr.note);

    const prevDay = day;
    // optimistic
    setDay({
      ...day,
      exercises: day.exercises.map((ex, i) =>
        i !== exIdx ? ex : ({ ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, note: next } : s) })
      ),
    });

    // header toast
    const cls = effortClass(next);
    setEffortToast({ text: next || "—", cls });
    try { (navigator as any)?.vibrate?.(10); } catch {}
    setTimeout(() => setEffortToast(null), 1100);

    try {
      await updateSet(setId, { weight: curr.weight ?? 0, reps: curr.reps ?? 0, note: next });
    } catch (e) {
      setDay(prevDay);
      alert(`Αποτυχία ενημέρωσης σετ\n${e}`);
    }
  }

  return (
    <div className="day-page max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header toast (glass card) */}
      {effortToast && (
        <div className={`effort-header ${effortToast.cls}`} role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <rect x="1" y="10" width="4" height="4" rx="1"></rect>
            <rect x="19" y="10" width="4" height="4" rx="1"></rect>
            <rect x="6" y="11" width="12" height="2" rx="1"></rect>
          </svg>
          <span>{effortToast.text}</span>
        </div>
      )}

      {loading && (<><div className="h-10" /><CardSkeleton /><CardSkeleton /></>)}

      {!loading && error && (
        <EmptyState title="Σφάλμα" subtitle={error}
          action={<button className="btn-secondary" onClick={() => location.reload()}>Δοκίμασε ξανά</button>} />
      )}

      {!loading && !error && day && (
        <>
          <DayHeader date={day.date} setsCount={totals.setsCount} volume={totals.volume} />

          <div className="flex items-center gap-2">
            <InlineAddExercise onAdd={handleAddExercise} />
          </div>

          <div className="space-y-3 md:space-y-4">
            {day.exercises.map((ex) => {
              const last = ex.sets.length ? ex.sets[ex.sets.length - 1] : null;

              const isRenaming = renamingId === ex.id;
              const isConfirmDel = confirmDeleteExerciseId === ex.id;

              const actions = (
                <div className="flex items-center gap-1" onClick={(e)=>e.stopPropagation()}>
                  {!isRenaming && !isConfirmDel && (
                    <>
                      <button className="btn-icon" onClick={() => { setRenamingId(ex.id); setRenameVal(ex.name); }}
                        title="Μετονομασία" aria-label="Μετονομασία">✏️</button>
                      <button className="btn-icon danger" onClick={() => setConfirmDeleteExerciseId(ex.id)}
                        title="Διαγραφή" aria-label="Διαγραφή">🗑</button>
                    </>
                  )}
                  {isRenaming && (
                    <>
                      <button className="btn-icon" onClick={() => handleRenameExercise(ex.id)} title="Αποθήκευση" aria-label="Αποθήκευση">💾</button>
                      <button className="btn-icon" onClick={() => { setRenamingId(null); setRenameVal(""); }} title="Άκυρο" aria-label="Άκυρο">✖</button>
                    </>
                  )}
                  {isConfirmDel && (
                    <>
                      <button className="btn-icon danger" onClick={() => handleDeleteExercise(ex.id)} title="Ναι, διαγραφή" aria-label="Ναι, διαγραφή">✔</button>
                      <button className="btn-icon" onClick={() => setConfirmDeleteExerciseId(null)} title="Όχι" aria-label="Όχι">✖</button>
                    </>
                  )}
                </div>
              );

              const titleSlot = isRenaming ? (
                <div className="flex items-center gap-2" onClick={(e)=>e.stopPropagation()}>
                  <input
                    className="input"
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameExercise(ex.id);
                      if (e.key === "Escape") { setRenamingId(null); setRenameVal(""); }
                    }}
                    autoFocus
                  />
                </div>
              ) : undefined;

              return (
                <ExerciseCard key={ex.id} title={ex.name} titleSlot={titleSlot} actions={actions}>
                  {ex.sets.length > 0 ? (
                    <div className="table-wrap">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{color:"#6b7280"}}>
                            <th className="text-left py-1">#</th>
                            <th className="text-left py-1">Κιλά</th>
                            <th className="text-left py-1">Επαν.</th>
                            <th className="text-left py-1">Σχόλιο</th>
                            <th className="text-right py-1">Ενέργειες</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ex.sets.map((s, i) => {
                            const isEditing = editingSet?.id === s.id;
                            return (
                              <tr key={s.id} className="border-t align-middle" style={{borderColor:"#e5e7eb"}}>
                                <td className="py-2">{i + 1}</td>
                                <td className="py-2 metric">{isEditing ? (
                                  <input className="input w-24" type="number" step="0.5"
                                    value={editingSet?.weight ?? 0}
                                    onChange={(e) => setEditingSet(curr => curr && ({ ...curr, weight: Number(e.target.value) }))} />
                                ) : s.weight}</td>
                                <td className="py-2 metric">{isEditing ? (
                                  <input className="input w-20" type="number"
                                    value={editingSet?.reps ?? 0}
                                    onChange={(e) => setEditingSet(curr => curr && ({ ...curr, reps: Number(e.target.value) }))} />
                                ) : s.reps}</td>
                                <td className="py-2">
                                  {!isEditing ? (
                                    <button
                                      className={`effort-chip ${effortClass(s.note)}`}
                                      title={(s.note ?? "—")}
                                      aria-label="Αίσθηση"
                                      onClick={() => handleCycleEffort(s.id)}
                                    >
                                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                                        <rect x="1" y="10" width="4" height="4" rx="1"></rect>
                                        <rect x="19" y="10" width="4" height="4" rx="1"></rect>
                                        <rect x="6" y="11" width="12" height="2" rx="1"></rect>
                                      </svg>
                                    </button>
                                  ) : (
                                    <EffortStepper
                                      value={(editingSet?.note as EffortValue) ?? null}
                                      onChange={(v)=> setEditingSet(curr => curr ? ({ ...curr, note: v }) : curr)}
                                      size="sm"
                                    />
                                  )}
                                </td>
                                <td className="py-2 actions-cell">
                                  <div className="flex items-center justify-end gap-1">
                                    {!isEditing && confirmDeleteSetId !== s.id && (
                                      <>
                                        <button className="btn-icon" onClick={() => setEditingSet({ id: s.id, weight: s.weight, reps: s.reps, note: s.note ?? null })}
                                          title="Επεξεργασία" aria-label="Επεξεργασία">✏️</button>
                                        <button className="btn-icon danger" onClick={() => setConfirmDeleteSetId(s.id)}
                                          title="Διαγραφή" aria-label="Διαγραφή">🗑</button>
                                      </>
                                    )}
                                    {isEditing && (
                                      <>
                                        <button className="btn-icon" onClick={handleSaveSet} title="Αποθήκευση" aria-label="Αποθήκευση">💾</button>
                                        <button className="btn-icon" onClick={() => setEditingSet(null)} title="Άκυρο" aria-label="Άκυρο">✖</button>
                                      </>
                                    )}
                                    {confirmDeleteSetId === s.id && (
                                      <>
                                        <button className="btn-icon danger" onClick={handleDeleteSet} title="Ναι, διαγραφή" aria-label="Ναι, διαγραφή">✔</button>
                                        <button className="btn-icon" onClick={() => setConfirmDeleteSetId(null)} title="Όχι" aria-label="Όχι">✖</button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm" style={{color:"#6b7280"}}>Δεν υπάρχουν σετ για αυτή την άσκηση.</div>
                  )}

                  <div className="pt-3">
                    <SetRow
                      lastSet={last ? { weight: last.weight, reps: last.reps } : undefined}
                      history={ex.sets.map(s => ({ weight: s.weight, reps: s.reps, note: s.note ?? "" }))}
                      onSubmit={(data) => handleAddSet(ex.id, data)}
                    />
                  </div>
                </ExerciseCard>
              );
            })}
          </div>
        </>
      )}

      {!loading && !error && !day && (
        <EmptyState
          title="Δεν βρέθηκε προπόνηση για αυτή την ημέρα"
          subtitle="Δημιούργησε νέα ημέρα και πρόσθεσε ασκήσεις."
          action={<InlineAddExercise onAdd={async () => alert("Ορίστε endpoint δημιουργίας Day στο API σας και καλέστε το εδώ.")} />}
        />
      )}
    </div>
  );
}
