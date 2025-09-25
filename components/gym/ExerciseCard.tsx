import { useState } from "react";
import { MoreHorizontal, Plus, Pencil, Check, X } from "lucide-react";
import clsx from "clsx";

type SetItem = {
  id: string;
  weight: number | null;
  reps: number | null;
  rpe?: number | null;
  comment?: string;
};

type ExerciseCardProps = {
  title: string;
  subtitle?: string;
  sets: SetItem[];
  locked?: boolean;
  onAddSet: (s: Omit<SetItem, "id">) => void;
  onUpdateSet: (id: string, s: Partial<SetItem>) => void;
  onDeleteSet: (id: string) => void;
  onClearExercise: () => void;
  onDeleteExercise: () => void;
  onToggleLock: () => void;
};

export default function ExerciseCard({
  title, subtitle, sets, locked,
  onAddSet, onUpdateSet, onDeleteSet,
  onClearExercise, onDeleteExercise, onToggleLock
}: ExerciseCardProps) {
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addDraft, setAddDraft] = useState({ weight: "", reps: "", rpe: "", comment: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ weight: "", reps: "", rpe: "", comment: "" });

  const handleAdd = () => {
    if (locked) return;
    onAddSet({
      weight: addDraft.weight ? Number(addDraft.weight) : null,
      reps: addDraft.reps ? Number(addDraft.reps) : null,
      rpe: addDraft.rpe ? Number(addDraft.rpe) : null,
      comment: addDraft.comment?.trim() || ""
    });
    setAddDraft({ weight: "", reps: "", rpe: "", comment: "" });
  };

  const startEdit = (s: SetItem) => {
    setEditing(s.id);
    setEditDraft({
      weight: s.weight?.toString() ?? "",
      reps: s.reps?.toString() ?? "",
      rpe: s.rpe?.toString() ?? "",
      comment: s.comment ?? ""
    });
  };

  const confirmEdit = (id: string) => {
    onUpdateSet(id, {
      weight: editDraft.weight ? Number(editDraft.weight) : null,
      reps: editDraft.reps ? Number(editDraft.reps) : null,
      rpe: editDraft.rpe ? Number(editDraft.rpe) : null,
      comment: editDraft.comment?.trim() || ""
    });
    setEditing(null);
  };

  return (
    <div className="border rounded-2xl shadow-sm bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="min-w-0">
          <div className="font-semibold text-lg truncate">{title}</div>
          {subtitle && <div className="text-sm text-zinc-500 truncate">{subtitle}</div>}
        </div>

        <div className="flex items-center gap-2 relative">
          {locked && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
              Κλειδωμένο
            </span>
          )}
          <button
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            aria-label="Actions"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {/* Kebab menu */}
          {menuOpen && (
            <div
              className="absolute right-0 top-10 z-20 w-48 rounded-xl border bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
              onClick={(e)=>e.stopPropagation()}
            >
              <button className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={()=>{ onToggleLock(); setMenuOpen(false); }}>
                {locked ? "Ξεκλείδωμα" : "Κλείδωμα"}
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={()=>{ onClearExercise(); setMenuOpen(false); }}>
                Καθάρισμα άσκησης
              </button>
              <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={()=>{ onDeleteExercise(); setMenuOpen(false); }}>
                Διαγραφή άσκησης
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 pt-0">
          {/* Add Set inline */}
          <div className={clsx(
            "rounded-xl border p-3 mb-3 sticky top-2 bg-white/90 dark:bg-zinc-900/90",
            locked && "opacity-60 pointer-events-none"
          )}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Field label="Κιλά">
                <input className="w-full h-9 px-3 rounded-lg border bg-transparent"
                       inputMode="decimal" placeholder="π.χ. 100"
                       value={addDraft.weight}
                       onChange={(e)=>setAddDraft(d=>({...d, weight: e.target.value}))}/>
              </Field>
              <Field label="Επαναλήψεις">
                <input className="w-full h-9 px-3 rounded-lg border bg-transparent"
                       inputMode="numeric" placeholder="π.χ. 12"
                       value={addDraft.reps}
                       onChange={(e)=>setAddDraft(d=>({...d, reps: e.target.value}))}/>
              </Field>
              <Field label="RPE">
                <input className="w-full h-9 px-3 rounded-lg border bg-transparent"
                       inputMode="decimal" placeholder="π.χ. 8.5"
                       value={addDraft.rpe}
                       onChange={(e)=>setAddDraft(d=>({...d, rpe: e.target.value}))}/>
              </Field>
              <Field label="Σχόλιο" className="md:col-span-2">
                <input className="w-full h-9 px-3 rounded-lg border bg-transparent"
                       placeholder="π.χ. κοντά σε στοπ"
                       value={addDraft.comment}
                       onChange={(e)=>setAddDraft(d=>({...d, comment: e.target.value}))}/>
              </Field>
            </div>
            <div className="mt-2 flex justify-end">
              <button onClick={handleAdd}
                      className="h-9 px-3 inline-flex items-center gap-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                <Plus className="h-4 w-4" /> Προσθήκη σετ
              </button>
            </div>
          </div>

          {/* Sets list */}
          <div className="space-y-2">
            {sets.map((s, idx)=>(
              <div key={s.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Σετ #{idx+1}</div>
                  {editing === s.id ? (
                    <div className="flex gap-1">
                      <IconBtn onClick={()=>confirmEdit(s.id)} aria="Αποθήκευση"><Check className="h-5 w-5"/></IconBtn>
                      <IconBtn onClick={()=>setEditing(null)} aria="Άκυρο"><X className="h-5 w-5"/></IconBtn>
                    </div>
                  ) : (
                    <button
                      className={clsx("h-8 px-2 inline-flex items-center gap-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10",
                        locked && "opacity-50 pointer-events-none")}
                      onClick={()=>startEdit(s)}
                    >
                      <Pencil className="h-4 w-4" /> Επεξεργασία
                    </button>
                  )}
                </div>

                {editing === s.id ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <input className="h-9 px-3 rounded-lg border bg-transparent" placeholder="Κιλά"
                           value={editDraft.weight} onChange={(e)=>setEditDraft(d=>({...d, weight: e.target.value}))}/>
                    <input className="h-9 px-3 rounded-lg border bg-transparent" placeholder="Επ."
                           value={editDraft.reps} onChange={(e)=>setEditDraft(d=>({...d, reps: e.target.value}))}/>
                    <input className="h-9 px-3 rounded-lg border bg-transparent" placeholder="RPE"
                           value={editDraft.rpe} onChange={(e)=>setEditDraft(d=>({...d, rpe: e.target.value}))}/>
                    <input className="h-9 px-3 rounded-lg border bg-transparent md:col-span-2" placeholder="Σχόλιο"
                           value={editDraft.comment} onChange={(e)=>setEditDraft(d=>({...d, comment: e.target.value}))}/>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <Info label="Κιλά" value={s.weight ?? "—"} />
                    <Info label="Επ." value={s.reps ?? "—"} />
                    <Info label="RPE" value={s.rpe ?? "—"} />
                    <Info className="md:col-span-2" label="Σχόλιο" value={s.comment?.length ? s.comment : "—"} />
                  </div>
                )}

                <div className="mt-2 flex justify-end">
                  <button
                    className={clsx(
                      "h-8 px-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
                      locked && "opacity-50 pointer-events-none"
                    )}
                    onClick={()=>onDeleteSet(s.id)}
                  >
                    Διαγραφή σετ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({label, children, className}:{label:string; children:any; className?:string}) {
  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Info({label, value, className}:{label:string; value:any; className?:string}) {
  return (
    <div className={clsx("rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2", className)}>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function IconBtn({onClick, children, aria}:{onClick:()=>void; children:any; aria:string}) {
  return (
    <button
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
      onClick={onClick} aria-label={aria}
    >
      {children}
    </button>
  );
}

