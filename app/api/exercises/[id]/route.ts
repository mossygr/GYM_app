import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// PATCH name, DELETE soft
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.exercise.update({
    where: { id: params.id },
    data: { nameGr: body.nameGr }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const updated = await prisma.exercise.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });
  return NextResponse.json(updated);
}
