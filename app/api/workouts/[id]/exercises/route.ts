import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

/**
 * POST /api/workouts/:id/exercises
 * body: { nameGr: string, nameEn?: string }
 * returns: created exercise (id, order, nameGr, nameEn)
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dayId = params.id;
    const { nameGr, nameEn } = await req.json();

    if (!nameGr || typeof nameGr !== 'string') {
      return NextResponse.json({ error: 'nameGr is required' }, { status: 400 });
    }

    const last = await prisma.exercise.findFirst({
      where: { workoutDayId: dayId, deletedAt: null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? 0) + 1;

    const created = await prisma.exercise.create({
      data: {
        workoutDayId: dayId,
        order: nextOrder,
        nameGr,
        nameEn: nameEn ?? null,
        deletedAt: null,
      },
      select: { id: true, order: true, nameGr: true, nameEn: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('Error creating exercise:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

