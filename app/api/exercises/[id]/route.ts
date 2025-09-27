import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const exercise = await prisma.exercise.update({
      where: { id: params.id },
      data: { nameGr: name }, // προσαρμογή αν χρησιμοποιείς 'name'
      include: { sets: true },
    });
    return NextResponse.json(exercise);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    // Αν κάνεις soft-delete, άλλαξε σε: data: { deletedAt: new Date() }
    // και prisma.exercise.update(...)
    await prisma.set.deleteMany({ where: { exerciseId: params.id } });
    await prisma.exercise.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
