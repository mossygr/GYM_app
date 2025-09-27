// components/SetRow.tsx
"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import type { SetInput } from "@/lib/types";
import EffortStepper, { EffortValue } from "@/components/EffortStepper";

export default function SetRow({
  lastSet,
  history,
  onSubmit,
}: {
  lastSet?: { weight: number; reps: number };
  history: { weight: number; reps: number; note: string }[];
  onSubmit: (data: SetInput) => void | Promise<void>;
}) {
  const [w, setW] = useState<string>(() => (lastSet?.weight ?? 0).toString());
  const [r, setR] = useState<string>(() => (lastSet?.reps ?? 0).toString());
  const [effort, setEffort] = useState<EffortValue>(null);
  const effortRef = useRef<EffortValue>(null);
  const [busy, setBusy] = useState(false);

  const wRef = useRef<HTMLInputElement|null>(null);
  useEffect(() => {
    effortRef.current = effort;
  }, [effort]);

  useEffect(() => {
    if (lastSet) {
      setW(String(lastSet.weight ?? 0));
      setR(String(lastSet.reps ?? 0));
    }
  }, [lastSet?.weight, lastSet?.reps]);

  const combos = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; w: number; r: number }[] = [];
    for (let i = history.length - 1; i >= 0 && out.length < 4; i--) {
      const h = history[i];
      const key = `${h.weight}x${h.reps}`;
      if (h.weight != null && h.reps != null && !seen.has(key)) {
        seen.add(key);
        out.push({ label: `${h.weight}×${h.reps}`, w: h.weight, r: h.reps });
      }
    }
    return out;
  }, [history]);

  async function handleAdd() {
    const wNum = Number(w), rNum = Number(r);
    if (!Number.isFinite(wNum) || !Number.isFinite(rNum)) {
      alert("Δώσε έγκυρα κιλά/επαν."); return;
    }
    setBusy(true);
    try {
      await onSubmit({ weight: wNum, reps: rNum, note: effortRef.current ?? "" });
      // optional reset effort
      setEffort(null); effortRef.current = null;
      wRef.current?.focus();
    } finally { setBusy(false); }
  }

  return (
    <div className="sr">
      <div className="row">
        <input
          ref={wRef}
          className="input cell"
          placeholder="Κιλά"
          inputMode="decimal"
          value={w}
          onChange={(e)=>setW(e.target.value)}
        />
        <input
          className="input cell"
          placeholder="Επαν."
          inputMode="numeric"
          value={r}
          onChange={(e)=>setR(e.target.value)}
        />

        <EffortStepper value={effort} onChange={setEffort} size="sm" />

        <button type="button" className="btn-add" disabled={busy} onClick={handleAdd} aria-label="Πρόσθεσε σετ">
          {busy ? "…" : "＋"}
        </button>
      </div>

      {combos.length > 0 && (
        <div className="combos">
          {combos.map((c, i) => (
            <button key={i} type="button" className="chip"
              onClick={() => { setW(String(c.w)); setR(String(c.r)); }}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .sr { background:rgba(0,0,0,0.02); border:1px solid var(--border); border-radius:14px; padding:10px; }
        .row { display:flex; align-items:center; gap:10px; }
        .cell { width:120px; }
        .btn-add{
          min-width:52px; height:44px; border-radius:12px; border:1px solid var(--primary);
          background:var(--primary); color:#fff; font-size:22px; line-height:1;
          display:inline-flex; align-items:center; justify-content:center;
        }
        .btn-add:disabled { opacity:.6 }
        .combos{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px }
        .chip{ border:1px solid var(--border); background:var(--card); padding:6px 10px; border-radius:999px; }
        @media (max-width:640px){
          .cell{ width:110px; }
          .btn-add{ min-width:48px; height:44px; font-size:20px }
        }
      `}</style>
    </div>
  );
}
