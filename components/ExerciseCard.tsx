// components/ExerciseCard.tsx
"use client";
import { useState, ReactNode } from "react";

type Props = {
  title: string;
  titleSlot?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  defaultOpen?: boolean;
};

export default function ExerciseCard({
  title,
  titleSlot,
  actions,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <details className="ex-card card" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="ex-summary" role="button" aria-expanded={open}>
        <div className="ex-title">
          {titleSlot ? titleSlot : <h3 className="ex-h3">{title}</h3>}
        </div>
        <div className="ex-actions">{actions}</div>
        <button
          className="ex-toggle"
          type="button"
          aria-label={open ? "Κλείσιμο" : "Άνοιγμα"}
          onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        >
          {open ? "▴" : "▾"}
        </button>
      </summary>

      <div className="ex-body">{children}</div>

      <style jsx>{`
        .ex-card{ overflow: visible; }
        .ex-summary{
          list-style: none; display: grid; grid-template-columns: 1fr auto auto; align-items: center;
          gap: 8px; cursor: pointer;
        }
        .ex-summary::-webkit-details-marker{ display:none }
        .ex-title{ min-width:0 }
        .ex-h3{ margin:0; font-size:18px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .ex-actions{ display:flex; gap:8px; align-items:center }
        .ex-toggle{
          width:40px; height:40px; border-radius:999px; border:1px solid var(--border);
          background:var(--card); line-height:1; font-size:14px;
        }
        .ex-body{ margin-top:12px }
      `}</style>
    </details>
  );
}
