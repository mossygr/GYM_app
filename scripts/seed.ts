/*
  Seed με δύο μέρες (όπως είχες δώσει).
  Run:  npx tsx scripts/seed.ts
*/
import { prisma } from '../lib/db';
import { toISODate, weightToNumber } from '../lib/utils';

const data = [
  {
    dateGR: '22/09/2025',
    program: 'Πόδια',
    exercises: [
      {
        order: 1,
        nameGr: 'Μηχάνημα Πιέσεων Ποδιών (Leg Press)',
        sets: [
          { order: 1, kg: 100, reps: 15, notes: 'Ζέσταμα' },
          { order: 2, kg: 140, reps: 12, notes: 'Καλή ένταση' },
          { order: 3, kg: 180, reps: 10, notes: 'Δύσκολο σετ, κοντά σε αποτυχία' }
        ]
      },
      {
        order: 2,
        nameGr: 'Καθίσματα με Μπάρα (Barbell Squat)',
        sets: [
          { order: 1, kg: 60, reps: 12, notes: 'Εύκολο ξεκίνημα' },
          { order: 2, kg: 80, reps: 10, notes: 'Καλή τεχνική' },
          { order: 3, kg: 100, reps: 8, notes: 'Αποτυχία στο τέλος' }
        ]
      }
    ]
  },
  {
    dateGR: '22/09/2025',
    program: 'Στήθος & Κοιλιακοί',
    exercises: [
      {
        order: 1,
        nameGr: 'Μηχάνημα Κάθετης Πίεσης Στήθους (Vertical Chest Press)',
        sets: [
          { order: 1, kg: 30, reps: 12, notes: 'Καλή εκκίνηση' },
          { order: 2, kg: 30, reps: 12, notes: 'Καλά κιλά, ανεβάζω στο επόμενο' }
        ]
      }
    ]
  }
];

async function main() {
  for (const day of data) {
    const dateISO = toISODate(day.dateGR);
    const created = await prisma.workoutDay.create({
      data: {
        date: new Date(dateISO),
        program: day.program,
        exercises: {
          create: day.exercises.map(ex => ({
            order: ex.order,
            nameGr: ex.nameGr,
            sets: {
              create: ex.sets.map(s => ({
                order: s.order,
                kg: weightToNumber(s.kg as any),
                reps: s.reps,
                notes: s.notes ?? undefined
              }))
            }
          }))
        }
      }
    });
    console.log('Seeded workout:', created.id, created.program, created.date.toISOString().slice(0,10));
  }
}

main().then(() => prisma.$disconnect());
