import { PrismaClient } from '@prisma/client';

declare global {
  // για να μην δημιουργεί νέο PrismaClient σε κάθε hot reload στο dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query', 'error', 'warn'], // προαιρετικό
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

