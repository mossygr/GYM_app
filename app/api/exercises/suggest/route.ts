// app/api/exercises/suggest/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// Accent-insensitive "fold"
function fold(input: string) {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Number(searchParams.get('limit') || 8);

  // Παίρνουμε ΜΟΝΑΔΙΚΑ ονόματα (distinct) χωρίς groupBy/filters που σπάνε
  const rows = await prisma.exercise.findMany({
    where: { deletedAt: null },
    select: { nameGr: true },
    distinct: ['nameGr'],
  });

  const fq = fold(q);
  const list = rows
    .map(r => r.nameGr)
    .filter(Boolean)
    .filter(name => (q ? fold(name!).includes(fq) : true))
    .slice(0, limit);

  return NextResponse.json(list);
}

