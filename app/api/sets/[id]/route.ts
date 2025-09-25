import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.set.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const updated = await prisma.set.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json(updated);
}
