import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// GET /api/workouts?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: any = { deletedAt: null };
  if (from && to) where.date = { gte: new Date(from), lt: new Date(to) };

  // Φέρνουμε ΟΛΕΣ τις μέρες του εύρους με ασκήσεις/σετ.
  // Σειρά: πρώτα η ημερομηνία, μετά createdAt ώστε να μπορούμε να κρατήσουμε τον πιο πρόσφατο ανά ημέρα.
  const days = await prisma.workoutDay.findMany({
    where,
    orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    include: {
      exercises: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        include: {
          sets: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        },
      },
    },
  });

  // DEDUPE ανά YYYY-MM-DD: κρατάμε το ΤΕΛΕΥΤΑΙΟ για κάθε μέρα (άρα τον πιο πρόσφατο createdAt).
  const byDate = new Map<string, any>();
  for (const d of days) {
    const key = d.date.toISOString().slice(0, 10); // YYYY-MM-DD
    byDate.set(key, d); // overwrite => στο τέλος μένει ο πιο πρόσφατος για την ημέρα
  }

  const deduped = Array.from(byDate.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return NextResponse.json(deduped);
}

// (Προαιρετικό, όπως το είχες)
export async function POST(req: Request) {
  const body = await req.json();
  const { date, program, exercises } = body;
  const created = await prisma.workoutDay.create({
    data: {
      date: new Date(date),
      program,
      exercises: {
        create: (exercises || []).map((ex: any, i: number) => ({
          order: ex.order ?? i + 1,
          nameGr: ex.nameGr,
          nameEn: ex.nameEn,
          sets: {
            create: (ex.sets || []).map((s: any, j: number) => ({
              order: s.order ?? j + 1,
              kg: s.kg,
              reps: s.reps,
              notes: s.notes,
            })),
          },
        })),
      },
    },
  });
  return NextResponse.json(created, { status: 201 });
}

