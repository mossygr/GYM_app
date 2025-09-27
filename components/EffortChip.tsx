// components/EffortChip.tsx
"use client";
import { useRef, useState } from "react";
import BottomSheet from "./BottomSheet";
import { toast } from "./toast";

export type Effort = 0 | 1 | 2 | 3 | null;

const COLORS = {
  0: "#ef4444", // Αποτυχία
  1: "#f97316", // Δύσκολο
  2: "#eab308", // Με δυσκολία
  3: "#10b981", // Καθαρό
} as const;

const LABEL = {
  0: "🏋️ Αποτυχία",
  1: "🏋️ Δύσκολο",
  2: "🏋️ Με δυσκολία",
  3: "🏋️ Καθαρό",
} as const;

function nextValue(v: Effort): Effort {
  if (v === null) return 0;
  if (v === 0) return 1;
  if (v === 1) return 2;
  if (v === 2) return 3;
  return null; // 3 -> clear
}

function hapticTick(short = true) {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(short ? 12 : [8, 28, 12]);
    }
  } catch {}
}

export default function EffortChip({
  value,
  onChange,
  size = "md",
}: {
  value: Effort;
  onChange: (v: Effort) => void;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);

  // long-press guard: αν ανοίξει το sheet, ο επόμενος click αγνοείται
  const longTimer = useRef<number | null>(null);
  const ignoreClickOnce = useRef(false);

  function handlePointerDown() {
    longTimer.current = window.setTimeout(() => {
      ignoreClickOnce.current = true;
      setOpen(true);
      hapticTick(false);
    }, 420);
  }
  function clearLong() {
    if (longTimer.current) { clearTimeout(longTimer.current); longTimer.current = null; }
  }

  function handleClick() {
    if (ignoreClickOnce.current) {
      ignoreClickOnce.current = false;
      return;
    }
    const nv = nextValue(value);
    onChange(nv);
    hapticTick(true);
    // ✅ Ορατό feedback σε mobile: toast στο κάτω μέρος
    const label = nv === null ? "🏋️ Χωρίς ένδειξη" : LABEL[nv as 0|1|2|3];
    toast(label);
  }

  const color = value === null ? "#d1d5db" : COLORS[value as 0|1|2|3];
  const pillClass = size === "sm" ? "h-7 px-2 text-xs" : "h-8 px-2.5 text-sm";

  return (
    <button
      type="button"
      className={`effort-chip inline-flex items-center gap-1 rounded-full border border-[var(--border,#e5e7eb)] bg-[var(--card,#fff)] ${pillClass}`}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,.06)" }}
      aria-label="Απόδοση σετ"
      onPointerDown={handlePointerDown}
      onPointerUp={clearLong}
      onPointerCancel={clearLong}
      onPointerLeave={clearLong}
      onClick={handleClick}
    >
      <span aria-hidden style={{ color }} className="text-[16px] leading-none">🏋️</span>
      <span className="flex items-center gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block h-[6px] w-[6px] rounded-[2px] bg-gray-300"
            style={{ backgroundColor: value !== null && i <= (value as number) ? color : undefined }}
          />
        ))}
      </span>

      {open && (
        <BottomSheet title="Απόδοση σετ" onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    onChange(v as 0|1|2|3);
                    hapticTick(true);
                    toast(LABEL[v as 0|1|2|3]);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm ${value === v ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                  style={{ borderColor: "var(--border,#e5e7eb)" }}
                >
                  <span className="text-lg" style={{ color: COLORS[v as 0|1|2|3] }}>🏋️</span>
                  <span>{LABEL[v as 0|1|2|3].replace("🏋️ ","")}</span>
                </button>
              ))}
            </div>
            <button
              className="w-full rounded-xl border px-4 py-2 text-sm"
              style={{ borderColor: "var(--border,#e5e7eb)" }}
              onClick={() => {
                onChange(null);
                hapticTick(true);
                toast("🏋️ Χωρίς ένδειξη");
                setOpen(false);
              }}
            >
              Καθαρισμός
            </button>
          </div>
        </BottomSheet>
      )}
    </button>
  );
}
