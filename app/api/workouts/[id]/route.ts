import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const id = params.id;
    // Hard delete children first for FK safety
    await prisma.set.deleteMany({ where: { exercise: { workoutDayId: id } } });
    await prisma.exercise.deleteMany({ where: { workoutDayId: id } });
    await prisma.workoutDay.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
