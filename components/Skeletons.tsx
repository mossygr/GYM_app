// components/Skeletons.tsx
export function Line({ w = "w-full" }: { w?: string }) {
  return <div className={`h-4 ${w} animate-pulse rounded bg-neutral-200`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border p-4 md:p-6 shadow-sm bg-white space-y-4">
      <div className="flex items-center justify-between"><Line w="w-32" /><Line w="w-10" /></div>
      <Line /><Line w="w-3/4" />
    </div>
  );
}
