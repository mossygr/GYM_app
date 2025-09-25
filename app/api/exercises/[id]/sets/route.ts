import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

// Βοηθητικό: να μην κάνει cache σε dev
export const dynamic = 'force-dynamic';

// -------------------------------
// POST: Δημιουργία νέου σετ
// -------------------------------
export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const exerciseId = ctx.params?.id;
    if (!exerciseId) {
      return NextResponse.json({ error: 'Missing exercise id' }, { status: 400 });
    }

    const body = await req.json();
    const rawKg = body?.kg;
    const rawReps = body?.reps;
    const notes = (body?.notes ?? null) as string | null;

    const kg = rawKg === '' || rawKg === null || rawKg === undefined ? null : Number(rawKg);
    const reps = rawReps === '' || rawReps === null || rawReps === undefined ? null : Number(rawReps);

    if (kg !== null && !Number.isFinite(kg)) return NextResponse.json({ error: 'Invalid kg' }, { status: 400 });
    if (reps !== null && (!Number.isFinite(reps) || reps <= 0)) return NextResponse.json({ error: 'Invalid reps' }, { status: 400 });

    // υπολογισμός next order
    const last = await prisma.set.findFirst({
      where: { exerciseId, deletedAt: null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? 0) + 1;

    const created = await prisma.set.create({
      data: {
        exerciseId,
        order: nextOrder,
        kg,
        reps,
        notes,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('Error creating set:', err);
    return NextResponse.json({ error: 'Failed to create set' }, { status: 500 });
  }
}

// -------------------------------
// GET: Όλα τα σετ μιας άσκησης (optional)
// -------------------------------
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const exerciseId = ctx.params?.id;
    if (!exerciseId) return NextResponse.json({ error: 'Missing exercise id' }, { status: 400 });

    const sets = await prisma.set.findMany({
      where: { exerciseId, deletedAt: null },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(sets);
  } catch (err) {
    console.error('Error fetching sets:', err);
    return NextResponse.json({ error: 'Failed to fetch sets' }, { status: 500 });
  }
}

