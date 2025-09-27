// app/(dashboard)/calendar/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchWorkouts } from "@/lib/api";

// date utils
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const firstOfMonth = (y: number, m: number) => new Date(y, m, 1);
const lastOfMonth  = (y: number, m: number) => new Date(y, m + 1, 0);
const prevMonth = (y: number, m: number) => (m === 0  ? { y: y - 1, m: 11 } : { y, m: m - 1 });
const nextMonth = (y: number, m: number) => (m === 11 ? { y: y + 1, m: 0 }  : { y, m: m + 1 });

const DOW = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"]; // Δευτέρα πρώτη

type DayInfo = { count: number; programs: string[] };

function extractFromRow(row: any): { date?: string; count: number; program?: string } {
  if (!row) return { count: 0 };
  // Ημερομηνία ως ISO string
  const dateISO: string | undefined = row.date ?? row.day ?? row.d ?? row.dateString ?? row.workoutDate;
  const date = typeof dateISO === "string" ? dateISO.slice(0, 10) : undefined;

  // Πλήθος: άθροισμα sets σε exercises (fallback σε exercises.length ή 1)
  let count =
    row.setsCount ??
    row.totalSets ??
    (Array.isArray(row.exercises)
      ? row.exercises.reduce(
          (acc: number, ex: any) =>
            acc +
            (Array.isArray(ex?.sets)
              ? ex.sets.filter((s: any) => s?.kg != null || s?.reps != null || (s?.notes ?? "") !== "").length
              : 0),
          0
        ) || row.exercises.length || 1
      : 1);
  count = Number(count) || 1;

  // Program label (π.χ. "Πόδια")
  const program: string | undefined = row.program ?? row.plan ?? row.label;

  return { date, count, program };
}

function heat(count: number) {
  if (!count) return "bg-base-100 border-base-300";     // empty
  if (count === 1) return "bg-emerald-50 border-emerald-100";
  if (count <= 3)  return "bg-emerald-100 border-emerald-200";
  if (count <= 6)  return "bg-emerald-200 border-emerald-300";
  return "bg-emerald-300 border-emerald-400";
}

export default function CalendarPage() {
  const today = new Date();
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<Record<string, DayInfo>>({});

  const monthLabel = useMemo(
    () => new Date(y, m, 1).toLocaleDateString("el-GR", { month: "long", year: "numeric" }),
    [y, m]
  );

  // Build cells (Δευτέρα=0)
  const cells = useMemo(() => {
    const f = firstOfMonth(y, m);
    const l = lastOfMonth(y, m);
    const totalDays = l.getDate();
    const startDow = (f.getDay() + 6) % 7; // Κυρ=0 -> 6
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(new Date(y, m, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [y, m]);

  // Load workouts for the month
  useEffect(() => {
    const from = fmt(firstOfMonth(y, m));
    const to   = fmt(lastOfMonth(y, m));
    setBusy(true); setError(null);

    Promise.resolve(fetchWorkouts(from, to))
      .then((rows: any) => {
        const map: Record<string, DayInfo> = {};

        const arr: any[] = Array.isArray(rows) ? rows : Array.isArray(rows?.data) ? rows.data : [];
        for (const r of arr) {
          const { date, count, program } = extractFromRow(r);
          if (!date) continue;
          if (!map[date]) map[date] = { count: 0, programs: [] };
          map[date].count += count || 1;
          if (program) {
            if (!map[date].programs.includes(program)) map[date].programs.push(program);
          }
        }

        setInfo(map);
      })
      .catch((e) => { setInfo({}); setError(String(e)); })
      .finally(() => setBusy(false));
  }, [y, m]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft" || e.key === "PageUp")  { const p = prevMonth(y, m); setY(p.y); setM(p.m); }
      if (e.key === "ArrowRight"|| e.key === "PageDown"){ const n = nextMonth(y, m); setY(n.y); setM(n.m); }
      if (e.key.toLowerCase() === "t") { setY(today.getFullYear()); setM(today.getMonth()); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [y, m]);

  const goPrev = () => { const p = prevMonth(y, m); setY(p.y); setM(p.m); };
  const goNext = () => { const n = nextMonth(y, m); setY(n.y); setM(n.m); };
  const goToday = () => { setY(today.getFullYear()); setM(today.getMonth()); };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-3xl font-extrabold">Ημερολόγιο</h1>
        <div className="flex items-center gap-2">
          <button className="btn btn-circle btn-ghost" onClick={goPrev} aria-label="Προηγούμενος μήνας">❮</button>
          <div className="badge badge-lg badge-ghost px-4 py-3 text-base font-semibold">{monthLabel}</div>
          <button className="btn btn-circle btn-ghost" onClick={goNext} aria-label="Επόμενος μήνας">❯</button>
          <button className="btn btn-ghost" onClick={goToday} aria-label="Σήμερα">Σήμερα</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-3 text-xs text-base-content/70">
        <span className="rounded-full w-4 h-4 bg-emerald-50 border border-emerald-100 inline-block" /> 1
        <span className="rounded-full w-4 h-4 bg-emerald-100 border border-emerald-200 inline-block ms-2" /> 2–3
        <span className="rounded-full w-4 h-4 bg-emerald-200 border border-emerald-300 inline-block ms-2" /> 4–6
        <span className="rounded-full w-4 h-4 bg-emerald-300 border border-emerald-400 inline-block ms-2" /> 7+
      </div>

      {/* DOW */}
      <div className="grid grid-cols-7 gap-3 mb-2">
        {DOW.map((d) => (
          <div key={d} className="text-center text-xs text-base-content/60 select-none">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-3">
        {cells.map((d, idx) => {
          if (!d) return <div key={idx} className="opacity-0" />;
          const dateStr = fmt(d);
          const day = info[dateStr];
          const count = day?.count || 0;
          const isToday = fmt(today) === dateStr;

          return (
            <div
              key={idx}
              className={`card border shadow-sm transition relative overflow-hidden ${heat(count)} ${isToday ? "ring ring-success/40" : ""}`}
              title={count ? `Σετ: ${count}` : "Χωρίς προπόνηση"}
            >
              {/* Αριστερό accent όταν υπάρχει προπόνηση */}
              {count > 0 && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500/70" />}

              <Link href={`/day/${dateStr}`} className="block p-3 h-24 md:h-28">
                <div className="flex items-start justify-between">
                  <div className="font-semibold">{d.getDate()}</div>
                  {count > 0 && (
                    <div className="badge badge-sm badge-primary">
                      {count}
                    </div>
                  )}
                </div>

                {/* Programs (chips) για να «ξεχωρίζει» οπτικά */}
                {day?.programs?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {day.programs.slice(0, 2).map((p) => (
                      <span key={p} className="badge badge-ghost badge-xs">{p}</span>
                    ))}
                    {day.programs.length > 2 && (
                      <span className="badge badge-ghost badge-xs">+{day.programs.length - 2}</span>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-base-content/40">—</div>
                )}

                {/* Activity bar στη βάση */}
                {count > 0 ? (
                  <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-emerald-500/70" />
                ) : (
                  <div className="absolute left-0 right-0 bottom-0 h-1 bg-base-200" />
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* statuses */}
      {busy && (
        <div className="mt-4 flex items-center gap-2 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-sm" />
          Φόρτωση…
        </div>
      )}
      {!busy && !error && Object.keys(info).length === 0 && (
        <div className="mt-4 alert alert-info">
          <span>Δεν βρέθηκαν προπονήσεις για αυτόν τον μήνα.</span>
        </div>
      )}
      {error && (
        <div className="mt-4 alert alert-error">
          <span>Σφάλμα φόρτωσης: {error}</span>
        </div>
      )}
    </div>
  );
}

