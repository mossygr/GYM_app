import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sets
// body: { exerciseId: string, weight?: number|null, kg?: number|null, reps?: number|null, note?: string|null, notes?: string|null }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const exerciseId: string | undefined = body?.exerciseId;
    if (!exerciseId) {
      return NextResponse.json({ error: "Missing exerciseId" }, { status: 400 });
    }

    // Back-compat: δέξου weight ή kg, note ή notes
    const rawW = (body?.weight ?? body?.kg);
    const rawR = body?.reps;
    const rawN = (body?.note ?? body?.notes);

    const weight = (rawW === null || rawW === "" || rawW === undefined) ? null : Number(rawW);
    const reps   = (rawR === null || rawR === "" || rawR === undefined) ? null : Number(rawR);
    const note: string | null = (rawN === undefined || rawN === "") ? null : String(rawN);

    if (weight !== null && !Number.isFinite(weight)) {
      return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
    }
    if (reps !== null && (!Number.isInteger(reps) || reps < 0)) {
      return NextResponse.json({ error: "Invalid reps" }, { status: 400 });
    }

    // order → τελευταίο
    const nextOrder = (await prisma.set.count({ where: { exerciseId } })) + 1;

    const created = await prisma.set.create({
      data: {
        exerciseId,
        order: nextOrder,
        kg: weight,
        reps: reps,
        notes: note,
      },
    });

    // Επιστροφή με UI-friendly ονόματα
    return NextResponse.json({
      id: created.id,
      exerciseId: created.exerciseId,
      order: created.order,
      weight: created.kg,
      reps: created.reps,
      note: created.notes ?? null,
      deletedAt: created.deletedAt ?? null,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    }, { status: 201 });

  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
