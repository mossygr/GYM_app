import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Μετατροπές DB → UI σχήμα */
function mapDay(db: any) {
  return {
    id: db.id,
    userId: db.userId ?? null,
    date: db.date,
    program: db.program ?? null,
    notes: db.notes ?? null,
    deletedAt: db.deletedAt ?? null,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
    exercises: (db.exercises ?? []).map((ex: any) => ({
      id: ex.id,
      workoutDayId: ex.workoutDayId,
      order: ex.order,
      // ενιαίο όνομα για το UI
      name: ex.nameGr ?? ex.name ?? "",
      deletedAt: ex.deletedAt ?? null,
      createdAt: ex.createdAt,
      updatedAt: ex.updatedAt,
      sets: (ex.sets ?? []).map((s: any) => ({
        id: s.id,
        exerciseId: s.exerciseId,
        order: s.order,
        // ενιαία ονόματα πεδίων για το UI
        weight: s.kg,          // DB: kg → UI: weight
        reps: s.reps,
        note: s.notes ?? null, // DB: notes → UI: note
        deletedAt: s.deletedAt ?? null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    })),
  };
}

/** Κάνει normalize την ημερομηνία σε 00:00:00 UTC */
function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    if (!fromStr || !toStr) {
      return NextResponse.json({ error: "Missing from/to" }, { status: 400 });
    }

    const from = startOfDayUTC(new Date(fromStr));
    const to = startOfDayUTC(new Date(toStr));
    // inclusive εύρος: [from, toEnd)
    const toEnd = new Date(to);
    toEnd.setUTCDate(toEnd.getUTCDate() + 1);

    const rows = await prisma.workoutDay.findMany({
      where: {
        date: {
          gte: from,
          lt: toEnd,
        },
      },
      orderBy: { date: "asc" },
      include: { exercises: { orderBy: { order: "asc" }, include: { sets: { orderBy: { order: "asc" } } } } },
    });

    return NextResponse.json(rows.map(mapDay));
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dateStr: string | undefined = body?.date;
    const program: string | null = body?.program ?? null;

    if (!dateStr) return NextResponse.json({ error: "Missing date" }, { status: 400 });

    const date = startOfDayUTC(new Date(dateStr));

    const day = await prisma.workoutDay.create({
      data: {
        date,
        program, // required στο schema σου – αν είναι NOT NULL, δώσε default αν λείπει
        exercises: { create: [] },
      },
      include: { exercises: { include: { sets: true } } },
    });

    return NextResponse.json(mapDay(day), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
