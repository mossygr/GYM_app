"use client";
import { useEffect, useMemo, useState } from "react";
import TagIcon from "./TagIcon";
import { TAGS, TagKey } from "@/lib/tagging";

export default function TagPicker({
  open,
  initial,
  onApply,
  onClose,
}: {
  open: boolean;
  initial: TagKey[];
  onApply: (tags: TagKey[]) => void;
  onClose: () => void;
}) {
  const [sel, setSel] = useState<Set<TagKey>>(new Set(initial));
  useEffect(() => { setSel(new Set(initial)); }, [open, initial.join("|")]);

  const toggle = (k: TagKey) => {
    const s = new Set(sel);
    s.has(k) ? s.delete(k) : s.add(k);
    setSel(s);
  };

  const groups = useMemo(() => {
    const g1: TagKey[] = ["pr","clean","fail","hard","easy"];
    const g2: TagKey[] = ["barbell","plate","bench","kettlebell"];
    const g3: TagKey[] = ["tempo","explosive","dropset","superset","rom","spotter","pain","amrap","cardio"];
    return [g1,g2,g3];
  }, []);

  if (!open) return null;

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-head">
          <div>Εικονίδια σετ</div>
          <button className="btn-secondary" onClick={() => onApply(Array.from(sel))}>ΟΚ</button>
        </div>

        {groups.map((row, idx) => (
          <div key={idx} className="tag-grid">
            {row.map((k) => {
              const { label, icon } = TAGS[k];
              const active = sel.has(k);
              return (
                <button
                  key={k}
                  type="button"
                  className={`tag-btn ${active ? "is-active" : ""}`}
                  onClick={() => toggle(k)}
                  aria-pressed={active}
                  title={label}
                >
                  <TagIcon name={icon} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        ))}

        <div className="sheet-foot">
          <button className="btn-secondary" onClick={() => onApply(Array.from(sel))}>Εφαρμογή</button>
          <button className="btn-secondary" onClick={onClose}>Κλείσιμο</button>
        </div>
      </div>

      <style jsx>{`
        .sheet-backdrop{
          position:fixed; inset:0; background:rgba(0,0,0,.25); z-index:95;
        }
        .sheet{
          position:fixed; left:0; right:0; bottom:0; z-index:100;
          background:#fff; border-top-left-radius:16px; border-top-right-radius:16px;
          border:1px solid #e5e7eb; box-shadow:0 -8px 30px rgba(0,0,0,.12);
          padding:12px 12px 16px;
        }
        .sheet-head{
          display:flex; align-items:center; justify-content:space-between;
          font-weight:700; padding:6px 4px 10px;
        }
        .sheet-foot{
          margin-top:8px; display:flex; justify-content:flex-end; gap:8px;
        }
        .tag-grid{
          display:grid; grid-template-columns: repeat(4, minmax(0,1fr));
          gap:10px; margin-bottom:10px;
        }
        @media (min-width: 480px){
          .tag-grid{ grid-template-columns: repeat(6, minmax(0,1fr)); }
        }
        .tag-btn{
          display:flex; flex-direction:column; align-items:center; gap:6px;
          background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px;
          padding:10px 8px; font-size:12px; color:#111827;
        }
        .tag-btn.is-active{ background:#eef2ff; border-color:#c7d2fe }
      `}</style>
    </>
  );
}
