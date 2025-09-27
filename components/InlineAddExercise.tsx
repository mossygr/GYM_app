// components/InlineAddExercise.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Suggest = { label: string; hint?: string };

// Μικρό curated seed ώστε να προτείνει και χωρίς ιστορικό
const BODY_PARTS: Suggest[] = [
  { label: "Πόδια" }, { label: "Στήθος" }, { label: "Πλάτη" }, { label: "Ώμοι" },
  { label: "Δικέφαλοι" }, { label: "Τρικέφαλοι" }, { label: "Γλουτοί" }, { label: "Κοιλιακοί" },
];
const EXERCISES: Suggest[] = [
  { label: "Καθίσματα (Squat)", hint: "Πόδια" },
  { label: "Άρσεις θανάτου (Deadlift)", hint: "Πλάτη/Πόδια" },
  { label: "Πιέσεις στήθους (Bench Press)", hint: "Στήθος" },
  { label: "Κωπηλατική με μπάρα (Barbell Row)", hint: "Πλάτη" },
  { label: "Πιέσεις ώμων (Overhead Press)", hint: "Ώμοι" },
  { label: "Τροχαλία Στήθους (Cable Crossover)", hint: "Στήθος" }, // << σημαντικό
  { label: "Κοιλιακοί (Crunch)", hint: "Κοιλιακοί" },
];
const CURATED: Suggest[] = [...BODY_PARTS, ...EXERCISES];

function stripAccents(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
const LAT_TO_GR: Record<string, string> = {
  th:"θ", ch:"χ", ps:"ψ",
  a:"α", b:"β", g:"γ", d:"δ", e:"ε", z:"ζ", h:"η", i:"ι",
  k:"κ", l:"λ", m:"μ", n:"ν", x:"ξ", o:"ο", p:"π", r:"ρ",
  s:"σ", t:"τ", y:"υ", f:"φ", w:"ω", v:"β", c:"ξ", j:"ζ", u:"υ", q:"θ"
};
function latinToGreek(input: string) {
  let s = input.toLowerCase();
  s = s.replace(/th/g,"θ").replace(/ch/g,"χ").replace(/ps/g,"ψ");
  return s.split("").map(ch => LAT_TO_GR[ch] ?? ch).join("");
}
function normAll(s: string) {
  const raw = s.toLowerCase().trim();
  return Array.from(new Set([raw, stripAccents(raw), latinToGreek(raw)]));
}
function matchSuggest(q: string, s: Suggest) {
  if (!q) return true;
  const needles = normAll(q);
  const hay = normAll(`${s.label} ${s.hint ?? ""}`);
  return needles.some(n => hay.some(h => h.includes(n)));
}
function uniqueByLabel(items: Suggest[]) {
  const map = new Map<string, Suggest>();
  for (const it of items) if (!map.has(it.label)) map.set(it.label, it);
  return Array.from(map.values());
}

export default function InlineAddExercise({ onAdd }: { onAdd: (name: string) => Promise<void> | void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [remote, setRemote] = useState<Suggest[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // fetch δυναμικές προτάσεις από DB
  useEffect(() => {
    const q = name.trim();
    if (q.length < 1) { setRemote([]); return; }
    const ctrl = new AbortController();
    fetch(`/api/exercises/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : [])
      .then((rows: Suggest[]) => setRemote(Array.isArray(rows) ? rows : []))
      .catch(() => {});
    return () => ctrl.abort();
  }, [name]);

  const filtered = useMemo(() => {
    const merged = uniqueByLabel([...remote, ...CURATED]);
    const f = merged.filter(s => matchSuggest(name, s)).slice(0, 12);
    setHi(0);
    return f;
  }, [name, remote]);

  useEffect(() => {
    setOpen(!!name && filtered.length > 0);
  }, [name, filtered.length]);

  async function submit(value?: string) {
    const val = (value ?? name).trim();
    if (!val) return;
    setBusy(true);
    try {
      await onAdd(val);
      setName("");
      setOpen(false);
      setHi(0);
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHi(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { if (filtered[hi]) { e.preventDefault(); submit(filtered[hi].label); } }
    else if (e.key === "Tab") { if (filtered[hi]) { e.preventDefault(); setName(filtered[hi].label); } }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div className="relative flex-1">
      <div className="flex gap-2">
        <input
          id="add-exercise-input"
          ref={inputRef}
          className="input flex-1"
          placeholder="Πρόσθεσε άσκηση… (π.χ. 'tr' → Τροχαλία)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(!!name && filtered.length > 0)}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="exercise-suggest-list"
        />
        <button onClick={() => submit()} disabled={busy} className="btn-primary">{busy ? "…" : "+"}</button>
      </div>

      {open && (
        <div
          id="exercise-suggest-list"
          ref={listRef}
          className="suggest-list"
          role="listbox"
          aria-label="Προτάσεις άσκησης"
        >
          {filtered.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              role="option"
              aria-selected={i === hi}
              className={`suggest-item ${i === hi ? "is-active" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHi(i)}
              onClick={() => submit(s.label)}
              title={s.hint ? `${s.label} — ${s.hint}` : s.label}
            >
              <div className="suggest-title">{s.label}</div>
              {s.hint && <div className="suggest-hint">{s.hint}</div>}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .suggest-list {
          position: absolute; z-index: 50; margin-top: 6px;
          width: 100%; max-height: 280px; overflow: auto;
          background: var(--card); border: 1px solid var(--border); border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,.10);
        }
        .suggest-item {
          display: flex; align-items: baseline; gap: 8px;
          padding: 10px 12px; cursor: pointer; color: var(--text);
          background: transparent;
        }
        .suggest-item:hover, .suggest-item.is-active { background: rgba(0,0,0,.04); }
        html[data-theme="dark"] .suggest-item:hover,
        html.dark .suggest-item:hover,
        html[data-theme="dark"] .suggest-item.is-active,
        html.dark .suggest-item.is-active { background: rgba(255,255,255,.06); }

        .suggest-title { font-size: 14px; font-weight: 600; color: var(--text); }
        .suggest-hint { font-size: 12px; color: var(--muted); }
      `}</style>
    </div>
  );
}
