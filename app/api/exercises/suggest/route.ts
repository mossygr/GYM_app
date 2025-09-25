import { NextResponse } from 'next/server';
// relative import για να μην σκάει με το alias @
import { prisma } from '../../../../lib/db';

/**
 * GET /api/exercises/suggest?q=term&limit=8
 * Response shape: { items: [{ id: string, name: string }] }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQ = (searchParams.get('q') ?? '').trim();
  const rawLimit = Number(searchParams.get('limit') ?? 8);

  // απλό guard
  if (!rawQ) return NextResponse.json({ items: [] });

  const q = rawQ;
  const limit = Number.isFinite(rawLimit)
    ? Math.min(50, Math.max(1, rawLimit))
    : 8;

  // φέρε μέχρι 200 γραμμές, πάρε μοναδικά ονόματα, κράτα τα πρώτα 'limit'
  const rows = await prisma.exercise.findMany({
    where: {
      deletedAt: null,
      nameGr: { contains: q, mode: 'insensitive' },
    },
    select: { nameGr: true },
    orderBy: { nameGr: 'asc' },
    take: 200,
  });

  const uniqueNames = Array.from(new Set(rows.map(r => r.nameGr))).slice(0, limit);
  const items = uniqueNames.map(name => ({ id: name, name }));

  return NextResponse.json({ items }, { status: 200 });
}

