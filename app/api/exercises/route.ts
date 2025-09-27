import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { workoutDayId, name } = await req.json();
    if (!workoutDayId || !name) {
      return NextResponse.json({ error: "Missing workoutDayId or name" }, { status: 400 });
    }
    // Υπολογίζουμε order (στο τέλος)
    const count = await prisma.exercise.count({ where: { workoutDayId } });
    const exercise = await prisma.exercise.create({
      data: {
        workoutDayId,
        order: count + 1,
        nameGr: name,  // αν το schema σου έχει 'name' αντί για nameGr, άλλαξέ το εδώ
      },
      include: { sets: true },
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
