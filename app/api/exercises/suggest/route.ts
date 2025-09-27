import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Αφαιρεί τόνους (Greek accents) */
function stripAccents(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Χαρτογράφηση latin → greek (για inputs τύπου "tr", "po" κλπ) */
const LAT_TO_GR: Record<string, string> = {
  th: "θ", ch: "χ", ps: "ψ",
  a:"α", b:"β", g:"γ", d:"δ", e:"ε", z:"ζ", h:"η", i:"ι",
  k:"κ", l:"λ", m:"μ", n:"ν", x:"ξ", o:"ο", p:"π", r:"ρ",
  s:"σ", t:"τ", y:"υ", f:"φ", w:"ω", v:"β", c:"ξ", j:"ζ", u:"υ", q:"θ"
};
function latinToGreek(input: string) {
  let s = input.toLowerCase();
  // διγράμματα πρώτα
  s = s.replace(/th/g, "θ").replace(/ch/g, "χ").replace(/ps/g, "ψ");
  return s.split("").map(ch => LAT_TO_GR[ch] ?? ch).join("");
}

function needlesFrom(q: string) {
  const raw = q.toLowerCase().trim();
  const a = stripAccents(raw);
  const g = latinToGreek(raw);
  const set = new Set([raw, a, g].filter(Boolean));
  return Array.from(set);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").slice(0, 64);
  if (!q) return NextResponse.json([]);

  const needles = needlesFrom(q);

  const rows = await prisma.exercise.findMany({
    where: {
      deletedAt: null,
      OR: needles.flatMap(n => ([
        { nameGr: { contains: n, mode: "insensitive" as const } },
        { nameEn: { contains: n, mode: "insensitive" as const } },
      ])),
    },
    select: { nameGr: true, nameEn: true },
    take: 50,
  });

  // unique by label
  const uniq = new Map<string, { label: string; hint?: string }>();
  for (const r of rows) {
    const label = r.nameGr || r.nameEn || "";
    if (!label) continue;
    if (!uniq.has(label)) {
      uniq.set(label, { label, hint: r.nameGr && r.nameEn ? r.nameEn : undefined });
    }
  }

  return NextResponse.json(Array.from(uniq.values()).slice(0, 12));
}
