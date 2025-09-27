// components/EmptyState.tsx
export default function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 p-8 border rounded-2xl bg-white">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      {action}
    </div>
  );
}
