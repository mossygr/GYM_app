import React from "react";
import { MdFitnessCenter } from "react-icons/md";

export type EffortValue = null | "" | "Καθαρό" | "Με δυσκολία" | "Δύσκολο" | "Αποτυχία";

const ORDER: EffortValue[] = ["", "Καθαρό", "Με δυσκολία", "Δύσκολο", "Αποτυχία"];

function nextEffort(v: EffortValue): EffortValue {
  const i = ORDER.indexOf((v ?? "") as EffortValue);
  return ORDER[(i + 1) % ORDER.length];
}

function clsFor(v: EffortValue) {
  switch ((v ?? "") as EffortValue) {
    case "Καθαρό": return "eff-green";
    case "Με δυσκολία": return "eff-amber";
    case "Δύσκολο": return "eff-red";
    case "Αποτυχία": return "eff-fail";
    default: return "eff-none";
  }
}

export default function EffortStepper({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: EffortValue;
  onChange?: (v: EffortValue) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}) {
  const label = (value && String(value)) || "—";

  const handleClick = () => {
    if (readOnly || !onChange) return;
    const next = nextEffort(value ?? "");
    onChange(next);
    try { (navigator as any)?.vibrate?.(10); } catch {}
  };

  return (
    <button
      type="button"
      className={`eff-icon ${clsFor(value)} ${size === "sm" ? "sm" : ""}`}
      title={label}
      aria-label={`Αίσθηση: ${label}`}
      onClick={handleClick}
      disabled={readOnly}
    >
      <MdFitnessCenter />
      <style jsx>{`
        .eff-icon{
          display:inline-flex; align-items:center; justify-content:center;
          width:40px; height:32px; border-radius:10px;
          background:#f8fafc; border:1px solid #e5e7eb; cursor:pointer;
        }
        .eff-icon.sm{ width:34px; height:28px; border-radius:8px; }
        .eff-icon:disabled{ opacity:.85; cursor:default; }
        .eff-none{ color:#94a3b8; }
        .eff-green{ color:#16a34a; }   /* Καθαρό */
        .eff-amber{ color:#d97706; }   /* Με δυσκολία */
        .eff-red{ color:#ef4444; }     /* Δύσκολο */
        .eff-fail{ color:#000; background:#fee2e2; border-color:#fecaca; } /* Αποτυχία */
      `}</style>
    </button>
  );
}
