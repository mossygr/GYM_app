import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const day = await prisma.workoutDay.findUnique({
    where: { id: params.id },
    include: {
      exercises: { include: { sets: true }, orderBy: { order: 'asc' } }
    }
  });
  if (!day || day.deletedAt) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(day);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.workoutDay.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const updated = await prisma.workoutDay.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json(updated);
}
