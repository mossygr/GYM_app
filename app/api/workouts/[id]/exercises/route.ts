import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

// POST /api/workouts/:id/exercises
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { nameGr } = body;
  const workoutDayId = params.id;

  // next order
  const maxOrder = await prisma.exercise.aggregate({
    _max: { order: true },
    where: { workoutDayId, deletedAt: null }
  });

  const ex = await prisma.exercise.create({
    data: {
      workoutDayId,
      nameGr,
      order: (maxOrder._max.order || 0) + 1
    },
    include: { sets: true }
  });

  return NextResponse.json(ex, { status: 201 });
}
