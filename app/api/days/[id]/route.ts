import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

// GET /api/days/:id
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const day = await prisma.workoutDay.findUnique({
      where: { id, deletedAt: null },
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

    if (!day) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(day, { status: 200 });
  } catch (err) {
    console.error('GET /api/days/[id] failed:', err);
    return NextResponse.json({ error: 'Failed to fetch day' }, { status: 500 });
  }
}

