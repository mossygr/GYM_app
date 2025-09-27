// lib/api.ts — client helpers for our REST API

type SetInput = { weight: number; reps: number; note?: string };

// ----------------- Low-level fetch helper -----------------
async function req<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${txt ? ` — ${txt}` : ""}`);
  }
  // μπορεί να μην έχει σώμα (π.χ. 204)
  try { return (await res.json()) as T; } catch { return undefined as unknown as T; }
}

// ----------------- Normalizers (UI-friendly shape) -----------------
function normSet(s: any) {
  return {
    id: s.id,
    weight: s.kg ?? s.weight ?? 0,
    reps: s.reps ?? 0,
    note: s.notes ?? s.note ?? null,
  };
}
function normExercise(ex: any) {
  const name =
    ex.name ??
    ex.nameGr ??
    ex.nameEn ??
    ex.title ??
    "";
  const sets = Array.isArray(ex.sets) ? [...ex.sets].sort((a,b)=>(a.order??0)-(b.order??0)).map(normSet) : [];
  return { id: ex.id, name, sets };
}
function normDay(d: any) {
  const exercises = Array.isArray(d.exercises)
    ? [...d.exercises].sort((a,b)=>(a.order??0)-(b.order??0)).map(normExercise)
    : [];
  return {
    id: d.id,
    date: (d.date ? String(d.date).slice(0,10) : null),
    program: d.program ?? d.type ?? "Γενικό",
    notes: d.notes ?? null,
    exercises,
  };
}

// =================== CALENDAR ===================
/** GET /api/workouts?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function fetchWorkouts(from: string, to: string) {
  const url = `/api/workouts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  return req<any[]>(url);
}

// =================== DAY ===================
/** Returns normalized day for a specific date (or null). */
export async function fetchDay(date: string) {
  const rows = await fetchWorkouts(date, date);
  const raw = Array.isArray(rows)
    ? rows.find((r:any) => String(r?.date ?? "").slice(0,10) === date)
    : null;
  return raw ? normDay(raw) : null;
}

/** Create empty workout day for given date. Requires program per backend. */
export async function createDay(date: string, program = "Γενικό") {
  const payload = { date: new Date(`${date}T00:00:00.000Z`), program, exercises: [] };
  const raw = await req<any>(`/api/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normDay(raw);
}

export async function updateDay(id: string, data: { program?: string; notes?: string | null }) {
  const raw = await req<any>(`/api/workouts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return normDay(raw);
}

export async function deleteDay(id: string) {
  return req(`/api/workouts/${id}`, { method: "DELETE" });
}

// =================== EXERCISES ===================
export async function addExercise(workoutDayId: string, name: string) {
  const raw = await req<any>(`/api/exercises`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workoutDayId, name }),
  });
  return normExercise(raw);
}

export async function renameExercise(exerciseId: string, name: string) {
  const raw = await req<any>(`/api/exercises/${exerciseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return normExercise(raw);
}

export async function deleteExercise(exerciseId: string) {
  return req(`/api/exercises/${exerciseId}`, { method: "DELETE" });
}

// =================== SETS ===================
export async function addSet(exerciseId: string, data: SetInput) {
  const raw = await req<any>(`/api/sets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseId, kg: data.weight, reps: data.reps, notes: data.note ?? "" }),
  });
  return normSet(raw);
}

export async function updateSet(id: string, data: { weight: number; reps: number; note: string }) {
  const raw = await req<any>(`/api/sets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kg: data.weight, reps: data.reps, notes: data.note ?? "" }),
  });
  return normSet(raw);
}

export async function deleteSet(id: string) {
  return req(`/api/sets/${id}`, { method: "DELETE" });
}

// =================== Utils ===================
export function nextDay(dateStr: string): string {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + 1);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}
