#!/usr/bin/env python3
# patch_gym_app_fix_day_fetch.py — Normalize Day fetch & endpoints for your gym app.
# - fetchDay(): returns first item of /api/workouts?from=DATE&to=DATE+1 and maps fields.
# - addExercise(): POST /api/workouts/{dayId}/exercises  (body { nameGr })
# - addSet(): POST /api/exercises/{exerciseId}/sets      (body { kg, reps, notes })

import argparse, re
from pathlib import Path
from datetime import datetime

def write_backup(p: Path, content: str):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = p.with_suffix(p.suffix + f".bak.{ts}")
    bak.write_text(content, encoding="utf-8")
    return bak

def replace_fn(src: str, fn_name: str, new_body: str) -> str:
    # Replace whole exported async function by name (simple brace matching)
    import re
    pattern = rf'export\s+async\s+function\s+{fn_name}\s*\([^\)]*\)\s*:[^\{{]*\{{'
    m = re.search(pattern, src)
    if not m:
        pattern = rf'export\s+async\s+function\s+{fn_name}\s*\([^\)]*\)\s*\{{'
        m = re.search(pattern, src)
    if not m:
        return src
    start = m.start()
    i = m.end() - 1
    depth = 1
    while i < len(src) - 1:
        i += 1
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    else:
        return src
    return src[:start] + new_body + src[end:]

def run(project: Path):
    # locate lib/api.ts
    lib_api = (project / "lib/api.ts") if (project / "lib/api.ts").exists() else (project / "src/lib/api.ts")
    if not lib_api.exists():
        print("ERROR: lib/api.ts not found")
        return

    src = lib_api.read_text(encoding="utf-8")

    new_fetch = r'''
export async function fetchDay(date: string): Promise<WorkoutDayModel | null> {
  const from = date;
  const to = nextDay(date);
  const url = `/api/workouts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  const days = (await res.json()) as any[];
  const d = days && days.length ? days[0] : null;
  if (!d) return null;
  const iso = new Date(d.date).toISOString().slice(0, 10);
  return {
    id: d.id,
    date: iso,
    exercises: (d.exercises || [])
      .filter((e: any) => !e.deletedAt)
      .map((e: any) => ({
        id: e.id,
        name: e.nameGr || e.nameEn || "—",
        sets: (e.sets || []).map((s: any) => ({
          id: s.id,
          weight: s.kg ?? 0,
          reps: s.reps ?? 0,
          note: s.notes ?? null,
        })),
      })),
  };
}
'''.strip()

    new_add_ex = r'''
export async function addExercise(dayId: string, name: string): Promise<ExerciseModel> {
  const res = await fetch(`/api/workouts/${dayId}/exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nameGr: name }),
  });
  if (!res.ok) throw new Error(await res.text());
  const e = await res.json();
  return { id: e.id, name: e.nameGr || e.nameEn || "—", sets: (e.sets || []).map((s: any) => ({ id: s.id, weight: s.kg ?? 0, reps: s.reps ?? 0, note: s.notes ?? null })) };
}
'''.strip()

    new_add_set = r'''
export async function addSet(exerciseId: string, input: SetInput) {
  const res = await fetch(`/api/exercises/${exerciseId}/sets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kg: input.weight, reps: input.reps, notes: input.note ?? null }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json().catch(() => ({}));
}
'''.strip()

    out = src
    out = replace_fn(out, "fetchDay", new_fetch)
    out = replace_fn(out, "addExercise", new_add_ex)
    out = replace_fn(out, "addSet", new_add_set)

    if out != src:
        bak = write_backup(lib_api, src)
        lib_api.write_text(out, encoding="utf-8")
        print(f"Patched lib/api.ts (backup -> {bak.name})")
    else:
        print("No changes made to lib/api.ts (functions not found?)")

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", default=".", help="project root")
    args = ap.parse_args()
    run(Path(args.project).resolve())
