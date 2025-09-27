// lib/format.ts
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
