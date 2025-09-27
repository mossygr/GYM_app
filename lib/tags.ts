export type TagKey =
  | "pr" | "clean" | "fail" | "hard" | "easy"
  | "barbell" | "plate" | "bench" | "kettlebell"
  | "tempo" | "explosive" | "dropset" | "superset"
  | "rom" | "spotter" | "pain" | "amrap" | "cardio";

export const TAGS: Record<TagKey, { label: string; icon: string; cls: string }> = {
  pr:        { label: "PR",         icon: "mdi:trophy-outline",           cls: "bg-amber-50 text-amber-800 border-amber-200" },
  clean:     { label: "Καθαρό",     icon: "mdi:check-circle-outline",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  fail:      { label: "Αποτυχία",   icon: "mdi:skull-outline",            cls: "bg-rose-50 text-rose-700 border-rose-200" },
  hard:      { label: "Δύσκολο",    icon: "mdi:fire",                      cls: "bg-orange-50 text-orange-700 border-orange-200" },
  easy:      { label: "Ζέσταμα",    icon: "mdi:feather",                   cls: "bg-sky-50 text-sky-700 border-sky-200" },

  barbell:   { label: "Barbell",    icon: "mdi:barbell",                   cls: "bg-blue-50 text-blue-700 border-blue-200" },
  plate:     { label: "Plate",      icon: "mdi:weight",                    cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  bench:     { label: "Bench",      icon: "mdi:bench",                     cls: "bg-slate-50 text-slate-700 border-slate-200" },
  kettlebell:{ label: "Kettlebell", icon: "mdi:kettlebell",                cls: "bg-teal-50 text-teal-700 border-teal-200" },

  tempo:     { label: "Tempo",      icon: "mdi:timer-outline",            cls: "bg-violet-50 text-violet-700 border-violet-200" },
  explosive: { label: "Explosive",  icon: "mdi:lightning-bolt-outline",   cls: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  dropset:   { label: "Drop set",   icon: "mdi:chevrons-down",            cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  superset:  { label: "Superset",   icon: "mdi:link-variant",             cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },

  rom:       { label: "ROM↓",       icon: "mdi:arrow-collapse-vertical",  cls: "bg-slate-50 text-slate-700 border-slate-200" },
  spotter:   { label: "Spotter",    icon: "mdi:account-check-outline",    cls: "bg-slate-50 text-slate-700 border-slate-200" },
  pain:      { label: "Ενόχληση",   icon: "mdi:bandage",                  cls: "bg-rose-50 text-rose-700 border-rose-200" },
  amrap:     { label: "AMRAP",      icon: "mdi:infinity",                 cls: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  cardio:    { label: "Καρδιά",     icon: "mdi:heart-pulse",              cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export const ALL_TAG_KEYS = Object.keys(TAGS) as TagKey[];
