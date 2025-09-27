// components/DayHeader.tsx
import { formatDateHuman } from "@/lib/format";

export default function DayHeader({ date, setsCount, volume }: { date: string; setsCount: number; volume: number; }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
      <div>
        <h1 className="text-2xl font-semibold">Ημέρα προπόνησης</h1>
        <div className="text-neutral-500">{formatDateHuman(date)}</div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="badge">Σετ: {setsCount}</span>
        <span className="badge">Όγκος: {volume.toLocaleString()}</span>
      </div>
    </div>
  );
}
