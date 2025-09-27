#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# patch_gym_app.py — Auto‑apply UX upgrades to your Next.js gym app.

'''
What it does:
- Detects whether your project uses `src/` or not.
- Ensures alias "@/ *" in tsconfig/jsconfig.
- Creates/updates the following files (with backups):
    lib/types.ts
    lib/api.ts
    lib/format.ts
    hooks/use-shortcuts.ts
    components/EmptyState.tsx
    components/Skeletons.tsx
    components/ExerciseCard.tsx
    components/SetRow.tsx
    components/InlineAddExercise.tsx
    components/DayHeader.tsx
    app/(dashboard)/day/[date]/page.tsx
    app/(dashboard)/calendar/page.tsx
    styles/globals.css (appends utility classes with marker)
    README_UX.md

- Optionally installs deps: zod, react-hook-form, @hookform/resolvers

Usage:
  python patch_gym_app.py --project . [--no-install]

Run from your project root (folder with package.json).
'''

import argparse, json, os, re, shutil, subprocess, sys
from pathlib import Path
from datetime import datetime

MARKER_BEGIN = "/* === UX-UPGRADE-AUTO-BEGIN === */"
MARKER_END   = "/* === UX-UPGRADE-AUTO-END === */"

def ts_strip_comments(s: str) -> str:
    # remove // and /* */ comments to be able to parse tsconfig as JSON
    s = re.sub(r"(?m)^\s*//.*$", "", s)
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    return s

def backup_file(p: Path):
    if p.exists():
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        bak = p.with_suffix(p.suffix + f".bak.{ts}")
        shutil.copy2(p, bak)
        print(f"  backup -> {bak.name}")

def write_file(p: Path, data: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    backup_file(p)
    p.write_text(data, encoding="utf-8")
    print(f"  wrote   {p}")

def detect_project_root(project: Path) -> Path:
    pkg = project / "package.json"
    if not pkg.exists():
        print("ERROR: package.json not found at", project)
        sys.exit(1)
    return project

def has_src(project: Path) -> bool:
    return (project / "src").is_dir()

def path_from_root(project: Path, path_no_src: str, path_with_src: str) -> Path:
    return project / (path_with_src if has_src(project) else path_no_src)

def ensure_alias(project: Path):
    # Find tsconfig.json or jsconfig.json
    ts = project / "tsconfig.json"
    js = project / "jsconfig.json"
    target = ts if ts.exists() else (js if js.exists() else ts)  # prefer tsconfig

    if not target.exists():
        # create a minimal tsconfig
        target.write_text(json.dumps({
            "compilerOptions": {
                "target": "es2022",
                "lib": ["dom", "dom.iterable", "esnext"],
                "module": "esnext",
                "moduleResolution": "bundler",
                "jsx": "preserve",
                "strict": True,
                "incremental": True,
                "baseUrl": ".",
                "paths": { "@/*": ["./src/*" if has_src(project) else "./*"] }
            },
            "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            "exclude": ["node_modules"]
        }, indent=2))
        print(f"Created minimal {target.name} with alias @/*")
        return

    raw = target.read_text(encoding="utf-8")
    try:
        cfg = json.loads(ts_strip_comments(raw) or "{}")
    except Exception as e:
        print(f"WARNING: Could not parse {target.name}. Error: {e}")
        return

    cfg.setdefault("compilerOptions", {})
    co = cfg["compilerOptions"]
    co["baseUrl"] = "."
    co.setdefault("paths", {})
    co["paths"]["@/*"] = ["./src/*" if has_src(project) else "./*"]

    target.write_text(json.dumps(cfg, indent=2))
    print(f"Updated {target.name}: baseUrl='.', paths['@/*'] -> {'./src/*' if has_src(project) else './*'}")

def maybe_remove_dark_from_layout(project: Path):
    layout = path_from_root(project, "app/layout.tsx", "src/app/layout.tsx")
    if not layout.exists(): 
        return
    txt = layout.read_text(encoding="utf-8")
    new = re.sub(r"<html\s+className=['\"]dark['\"]", "<html", txt)
    if new != txt:
        backup_file(layout)
        layout.write_text(new, encoding="utf-8")
        print("  cleaned dark class from app/layout.tsx")

def ensure_deps(project: Path, do_install: bool):
    # Try to add deps to package.json
    pkgp = project / "package.json"
    pkg = json.loads(pkgp.read_text(encoding="utf-8"))
    deps = pkg.setdefault("dependencies", {})
    changed = False
    if "zod" not in deps:
        deps["zod"] = "^3.23.8"
        changed = True
    if "react-hook-form" not in deps:
        deps["react-hook-form"] = "^7.53.0"
        changed = True
    if "@hookform/resolvers" not in deps:
        deps["@hookform/resolvers"] = "^3.9.0"
        changed = True
    if changed:
        backup_file(pkgp)
        pkgp.write_text(json.dumps(pkg, indent=2))
        print("  updated package.json dependencies")
    if do_install:
        try:
            subprocess.check_call(["npm", "i", "zod", "react-hook-form", "@hookform/resolvers"], cwd=str(project))
            print("  npm install done")
        except Exception as e:
            print("WARNING: npm install failed:", e)

# ---------- FILE CONTENTS ----------

def file_lib_types_ts():
    return '''// lib/types.ts
import { z } from "zod";

export type ID = string;

export type SetModel = {
  id: ID;
  weight: number;
  reps: number;
  note?: string | null;
};

export type ExerciseModel = {
  id: ID;
  name: string;
  sets: SetModel[];
};

export type WorkoutDayModel = {
  id: ID;
  date: string; // YYYY-MM-DD or ISO date
  exercises: ExerciseModel[];
  totals?: {
    setsCount: number;
    volume: number; // sum(weight * reps)
  };
};

export const SetSchema = z.object({
  weight: z.number().min(0).max(10000),
  reps: z.number().min(1).max(1000),
  note: z.string().max(200).optional().nullable(),
});

export type SetInput = z.infer<typeof SetSchema>;
'''

def file_lib_api_ts():
    return '''// lib/api.ts
import { WorkoutDayModel, SetInput, ExerciseModel } from "./types";

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

function nextDay(date: string): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function fetchDay(date: string): Promise<WorkoutDayModel | null> {
  // Fallback to /api/workouts range fetch for a single day
  const from = date;
  const to = nextDay(date);
  const url = `/api/workouts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  const days = (await res.json()) as WorkoutDayModel[];
  const found = days.find((w) => (w.date?.slice(0, 10) === date) || (w.date === date));
  return found ?? null;
}

export async function fetchWorkouts(from: string, to: string): Promise<WorkoutDayModel[]> {
  const url = `/api/workouts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await fetch(url, { cache: "no-store" });
  return j<WorkoutDayModel[]>(res);
}

export async function addExercise(dayId: string, name: string): Promise<ExerciseModel> {
  const res = await fetch(`/api/exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dayId, name }),
  });
  return j<ExerciseModel>(res);
}

export async function addSet(exerciseId: string, input: SetInput) {
  const res = await fetch(`/api/sets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseId, ...input }),
  });
  return j(res);
}
'''

def file_lib_format_ts():
    return '''// lib/format.ts
export function formatDateHuman(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
}

export function computeTotals(exercises: { sets: { weight: number; reps: number }[] }[]) {
  let setsCount = 0;
  let volume = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      setsCount += 1;
      volume += (s.weight || 0) * (s.reps || 0);
    }
  }
  return { setsCount, volume };
}
'''

def file_hooks_shortcuts_ts():
    return '''// hooks/use-shortcuts.ts
import { useEffect } from "react";

type Map = Record<string, (e: KeyboardEvent) => void>;

export function useShortcuts(map: Map) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const combo = [e.ctrlKey || e.metaKey ? "mod" : null, e.key.toLowerCase()]
        .filter(Boolean)
        .join("+");
      const plain = e.key.toLowerCase();
      if (map[combo]) { e.preventDefault(); map[combo](e); }
      else if (map[plain]) { map[plain](e); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [map]);
}
'''

def file_components_empty_state_tsx():
    return '''// components/EmptyState.tsx
export default function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 p-8 border rounded-2xl bg-white">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      {action}
    </div>
  );
}
'''

def file_components_skeletons_tsx():
    return '''// components/Skeletons.tsx
export function Line({ w = "w-full" }: { w?: string }) {
  return <div className={`h-4 ${w} animate-pulse rounded bg-neutral-200`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border p-4 md:p-6 shadow-sm bg-white space-y-4">
      <div className="flex items-center justify-between"><Line w="w-32" /><Line w="w-10" /></div>
      <Line /><Line w="w-3/4" />
    </div>
  );
}
'''

def file_components_exercise_card_tsx():
    return '''// components/ExerciseCard.tsx
"use client";
import { ReactNode } from "react";

export default function ExerciseCard({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="rounded-2xl border p-4 md:p-6 shadow-sm bg-white space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}
'''

def file_components_set_row_tsx():
    return '''// components/SetRow.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SetInput, SetSchema } from "@/lib/types";

export default function SetRow({ defaultValues, onSubmit, submitting }: {
  defaultValues?: Partial<SetInput>;
  onSubmit: (data: SetInput) => void | Promise<void>;
  submitting?: boolean;
}) {
  const form = useForm<SetInput>({
    resolver: zodResolver(SetSchema),
    defaultValues: {
      weight: defaultValues?.weight ?? 0,
      reps: defaultValues?.reps ?? 10,
      note: defaultValues?.note ?? "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 gap-2 items-center">
      <input type="number" step="0.5" placeholder="Κιλά" className="col-span-4 input" {...form.register("weight", { valueAsNumber: true })} />
      <input type="number" placeholder="Επαναλήψεις" className="col-span-4 input" {...form.register("reps", { valueAsNumber: true })} />
      <input type="text" placeholder="Σχόλιο" className="col-span-3 input" {...form.register("note")} />
      <button disabled={submitting} className="col-span-1 btn-primary" type="submit">{submitting ? "…" : "↵"}</button>
    </form>
  );
}
'''

def file_components_inline_add_exercise_tsx():
    return '''// components/InlineAddExercise.tsx
"use client";
import { useState } from "react";

export default function InlineAddExercise({ onAdd }: { onAdd: (name: string) => Promise<void> | void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onAdd(name.trim());
      setName("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        id="add-exercise-input"
        className="input flex-1"
        placeholder="Πρόσθεσε άσκηση…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button onClick={submit} disabled={busy} className="btn-primary">{busy ? "…" : "+"}</button>
    </div>
  );
}
'''

def file_components_day_header_tsx():
    return '''// components/DayHeader.tsx
import { formatDateHuman } from "@/lib/format";

export default function DayHeader({ date, setsCount, volume }: { date: string; setsCount: number; volume: number; }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
      <div>
        <h1 className="text-2xl font-semibold">Ημέρα προπόνησης</h1>
        <div className="text-neutral-500">{formatDateHuman(date)}</div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="badge">Σετ: {setsCount}</span>
        <span className="badge">Όγκος: {volume.toLocaleString()}</span>
      </div>
    </div>
  );
}
'''

def file_app_day_page_tsx():
    return '''// app/(dashboard)/day/[date]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { WorkoutDayModel, ExerciseModel, SetInput } from "@/lib/types";
import { fetchDay, addExercise, addSet } from "@/lib/api";
import { computeTotals } from "@/lib/format";
import { useShortcuts } from "@/hooks/use-shortcuts";
import DayHeader from "@/components/DayHeader";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Skeletons";
import ExerciseCard from "@/components/ExerciseCard";
import SetRow from "@/components/SetRow";
import InlineAddExercise from "@/components/InlineAddExercise";

export default function DayPage() {
  const params = useParams();
  const date = String((params as any).date);

  const [day, setDay] = useState<WorkoutDayModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchDay(date)
      .then((d) => { if (active) setDay(d); })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date]);

  const totals = useMemo(() => computeTotals(day?.exercises ?? []), [day]);

  useShortcuts({
    a: () => document.getElementById("add-exercise-input")?.focus(),
    "mod+s": () => {}, // reserved
  });

  async function handleAddExercise(name: string) {
    if (!day) return;
    setBusy(true);
    const tempId = `tmp-ex-${Date.now()}`;
    const optimistic: ExerciseModel = { id: tempId, name, sets: [] };
    setDay({ ...day, exercises: [...day.exercises, optimistic] });
    try {
      const saved = await addExercise(day.id, name);
      setDay((prev) =>
        prev ? { ...prev, exercises: prev.exercises.map((ex) => (ex.id === tempId ? saved : ex)) } : prev
      );
    } catch (e) {
      setDay((prev) =>
        prev ? { ...prev, exercises: prev.exercises.filter((ex) => ex.id !== tempId) } : prev
      );
      alert("Αποτυχία προσθήκης άσκησης\n" + e);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddSet(exerciseId: string, data: SetInput) {
    if (!day) return;
    const tempId = `tmp-set-${Date.now()}`;
    setDay((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((ex) =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: [...ex.sets, { id: tempId, weight: data.weight, reps: data.reps, note: data.note ?? null }],
                  }
                : ex
            ),
          }
        : prev
    );

    try {
      await addSet(exerciseId, data);
      const fresh = await fetchDay(date);
      setDay(fresh);
    } catch (e) {
      setDay((prev) =>
        prev
          ? {
              ...prev,
              exercises: prev.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((s) => s.id !== tempId) } : ex
              ),
            }
          : prev
      );
      alert("Αποτυχία προσθήκης σετ\n" + e);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {loading && (
        <>
          <div className="h-10" />
          <CardSkeleton />
          <CardSkeleton />
        </>
      )}

      {!loading && error && (
        <EmptyState
          title="Σφάλμα"
          subtitle={error}
          action={<button className="btn-secondary" onClick={() => location.reload()}>Δοκίμασε ξανά</button>}
        />
      )}

      {!loading && !error && day && (
        <>
          <DayHeader date={day.date} setsCount={totals.setsCount} volume={totals.volume} />

          <div className="flex items-center gap-2">
            <InlineAddExercise onAdd={handleAddExercise} />
            <span className="text-sm text-neutral-500">(Συντόμευση: A)</span>
          </div>

          <div className="space-y-4">
            {day.exercises.map((ex) => (
              <ExerciseCard key={ex.id} title={ex.name}>
                {ex.sets.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-neutral-500">
                        <th className="text-left py-1">#</th>
                        <th className="text-left py-1">Κιλά</th>
                        <th className="text-left py-1">Επαναλήψεις</th>
                        <th className="text-left py-1">Σχόλιο</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((s, i) => (
                        <tr key={s.id} className="border-t">
                          <td className="py-2">{i + 1}</td>
                          <td className="py-2">{s.weight}</td>
                          <td className="py-2">{s.reps}</td>
                          <td className="py-2 text-neutral-500">{s.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-sm text-neutral-500">Δεν υπάρχουν σετ για αυτή την άσκηση.</div>
                )}

                <div className="pt-3">
                  <SetRow onSubmit={(data) => handleAddSet(ex.id, data)} />
                </div>
              </ExerciseCard>
            ))}
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
'''

def file_app_calendar_page_tsx():
    return '''// app/(dashboard)/calendar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchWorkouts } from "@/lib/api";
import Link from "next/link";

function startOfMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function iso(d: Date) { return d.toISOString().slice(0,10); }

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [days, setDays] = useState<{ date: string; sets: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = iso(startOfMonth(month));
    const to = iso(endOfMonth(month));
    setLoading(true);
    fetchWorkouts(from, to).then(ws => {
      const map = new Map<string, number>();
      for (const w of ws) {
        const sets = w.exercises?.reduce((a, e) => a + (e.sets?.length || 0), 0) || 0;
        map.set(w.date?.slice(0,10) ?? w.date, sets);
      }
      const s: { date: string; sets: number }[] = [];
      for (let d = 1; d <= endOfMonth(month).getDate(); d++) {
        const dt = new Date(month.getFullYear(), month.getMonth(), d);
        const key = iso(dt);
        s.push({ date: key, sets: map.get(key) || 0 });
      }
      setDays(s);
    }).finally(() => setLoading(false));
  }, [month]);

  const label = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  function changeMonth(delta: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ημερολόγιο</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => changeMonth(-1)}>&larr;</button>
          <div className="min-w-[10ch] text-center font-medium">{label}</div>
          <button className="btn-secondary" onClick={() => changeMonth(1)}>&rarr;</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"].map(d => (
          <div key={d} className="text-center text-xs text-neutral-500">{d}</div>
        ))}
        {days.map(({ date, sets }) => {
          const active = sets > 0;
          const cell = active
            ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
            : "bg-white border-neutral-200 hover:bg-neutral-50";
          return (
            <Link href={`/day/${date}`} key={date}
              className={`border rounded-xl p-3 transition ${cell}`}>
              <div className="flex items-center justify-between text-sm text-neutral-700">
                <span>{Number(date.slice(-2))}</span>
                {sets > 0 && (
                  <span className="badge badge-solid">{sets}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {loading && <div className="text-sm text-neutral-500">Φόρτωση…</div>}
    </div>
  );
}
'''

def file_styles_globals_css_block():
    return '''
/* Light theme utilities (auto-appended by patch_gym_app.py) */
:root { color-scheme: light; }
html, body { height: 100%; }
body { background: #fafafa; color: #111827; }

.input { border: 1px solid #d1d5db; border-radius: 0.75rem; padding: 0.5rem 0.75rem; background: #fff; outline: none; }
.input:focus { box-shadow: 0 0 0 2px rgba(209,213,219,0.8); }

.btn-primary { display:inline-flex; align-items:center; justify-content:center; border-radius:0.75rem; padding:0.5rem 0.75rem; border:1px solid #111827; background:#111827; color:#fff; transition:opacity .15s; }
.btn-primary:hover { opacity:.9; }
.btn-secondary { display:inline-flex; align-items:center; justify-content:center; border-radius:0.75rem; padding:0.5rem 0.75rem; border:1px solid #d1d5db; background:#fff; }
.btn-secondary:hover { background:#f9fafb; }

.badge { display:inline-flex; align-items:center; border-radius:999px; border:1px solid #d1d5db; padding:2px 6px; font-size:12px; background:#fff; }
.badge-solid { background:#111827; color:#fff; border-color:#111827; }
'''

def file_readme():
    return '''# UX Upgrade – TL;DR
- Inline προσθήκες σετ με validation (Zod + RHF)
- Optimistic updates και καθαρά empty/loading/error states
- Σταθερό layout: max-w-5xl, σωστά gaps, κάρτες με σκιές
- Keyboard: `A` για add exercise, (reserve) `Mod+S` για save-all

## Endpoints που περιμένει το UI
- `GET /api/day?date=YYYY-MM-DD` → `WorkoutDayModel` (εδώ κάνουμε fallback σε `/api/workouts?from=...&to=...`)
- `GET /api/workouts?from=YYYY-MM-DD&to=YYYY-MM-DD` → `WorkoutDayModel[]`
- `POST /api/exercises` { dayId, name } → `ExerciseModel`
- `POST /api/sets` { exerciseId, weight, reps, note? } → 200 OK
'''

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", default=".", help="path to project root (has package.json)")
    ap.add_argument("--no-install", action="store_true", help="do not run npm install for deps")
    args = ap.parse_args()

    project = Path(args.project).resolve()
    print("== patch_gym_app.py ==")
    print("Project:", project)

    detect_project_root(project)
    src = has_src(project)
    print("Detected structure:", "with src/" if src else "no src/")

    # Ensure alias & clean layout
    ensure_alias(project)
    maybe_remove_dark_from_layout(project)

    # Write files
    lib_dir = path_from_root(project, "lib", "src/lib")
    hooks_dir = path_from_root(project, "hooks", "src/hooks")
    comps_dir = path_from_root(project, "components", "src/components")
    app_day_dir = path_from_root(project, "app/(dashboard)/day/[date]", "src/app/(dashboard)/day/[date]")
    app_cal_dir = path_from_root(project, "app/(dashboard)/calendar", "src/app/(dashboard)/calendar")
    styles_file = path_from_root(project, "styles/globals.css", "src/styles/globals.css")
    readme_file = project / "README_UX.md"

    lib_dir.mkdir(parents=True, exist_ok=True)
    hooks_dir.mkdir(parents=True, exist_ok=True)
    comps_dir.mkdir(parents=True, exist_ok=True)
    app_day_dir.mkdir(parents=True, exist_ok=True)
    app_cal_dir.mkdir(parents=True, exist_ok=True)
    styles_file.parent.mkdir(parents=True, exist_ok=True)

    write_file(lib_dir / "types.ts", file_lib_types_ts())
    write_file(lib_dir / "api.ts", file_lib_api_ts())
    write_file(lib_dir / "format.ts", file_lib_format_ts())
    write_file(hooks_dir / "use-shortcuts.ts", file_hooks_shortcuts_ts())
    write_file(comps_dir / "EmptyState.tsx", file_components_empty_state_tsx())
    write_file(comps_dir / "Skeletons.tsx", file_components_skeletons_tsx())
    write_file(comps_dir / "ExerciseCard.tsx", file_components_exercise_card_tsx())
    write_file(comps_dir / "SetRow.tsx", file_components_set_row_tsx())
    write_file(comps_dir / "InlineAddExercise.tsx", file_components_inline_add_exercise_tsx())
    write_file(comps_dir / "DayHeader.tsx", file_components_day_header_tsx())
    write_file(app_day_dir / "page.tsx", file_app_day_page_tsx())
    write_file(app_cal_dir / "page.tsx", file_app_calendar_page_tsx())

    # Append CSS utilities (with marker)
    css_add = file_styles_globals_css_block()
    if styles_file.exists():
        existing = styles_file.read_text(encoding="utf-8")
        block = f"{MARKER_BEGIN}\n{css_add}\n{MARKER_END}\n"
        if MARKER_BEGIN in existing and MARKER_END in existing:
            new = re.sub(
                re.escape(MARKER_BEGIN) + r".*?" + re.escape(MARKER_END),
                block,
                existing,
                flags=re.S,
            )
        else:
            new = existing + ("" if existing.endswith("\n") else "\n") + block
        backup_file(styles_file)
        styles_file.write_text(new, encoding="utf-8")
        print(f"  appended CSS utilities -> {styles_file}")
    else:
        write_file(styles_file, css_add)

    write_file(readme_file, file_readme())

    # Ensure deps
    ensure_deps(project, do_install=(not args.no_install))

    print("\nDone. Suggested next steps:")
    print("  1) rm -rf .next")
    print("  2) npm run dev")
    print("  3) Open /calendar and /day/YYYY-MM-DD")

if __name__ == "__main__":
    main()
