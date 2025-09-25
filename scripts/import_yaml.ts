// scripts/import_yaml.ts
// Χρήση:
//  npx tsx scripts/import_yaml.ts /mnt/data
//  ή συγκεκριμένα αρχεία:
//  npx tsx scripts/import_yaml.ts /mnt/data/19_09_2025.yaml /mnt/data/22_09_2025.yaml ...
//  Με overwrite υπαρχόντων (ίδιο date+program): --replace

import fs from 'fs';
import path from 'path';
import { parse as parseYAML } from 'yaml';
import { prisma } from '../lib/db';

// --------- helpers ----------
function fold(input: string) {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function getFirst<T = any>(obj: any, keys: string[]): T | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  // accent/case-insensitive εύρεση κλειδιού
  const entries = Object.entries(obj);
  for (const k of keys) {
    const fk = fold(k);
    const hit = entries.find(([kk]) => fold(String(kk)) === fk);
    if (hit) return hit[1] as T;
  }
  return undefined;
}

function toISODateFromGreek(grDate: string | undefined | null) {
  if (!grDate) return null;
  const clean = String(grDate).replace(/[-.]/g, '/').trim();
  const m = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy.padStart(4,'0')}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
}
function isoFromFilename(filePath: string) {
  const base = path.basename(filePath);
  const m = base.match(/(\d{1,2})[^\d](\d{1,2})[^\d](\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
}
function weightToNumber(kg: unknown): number | null {
  if (kg == null) return null;
  if (typeof kg === 'number') return kg;
  const s = String(kg).toLowerCase();
  if (s.includes('σωματικ')) return null; // “σωματικό βάρος”
  const n = parseFloat(s.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}
function repsToNumber(reps: unknown): number | null {
  if (reps == null) return null;
  if (typeof reps === 'number') return reps;
  const s = String(reps);
  const m = s.match(/\d+/);
  return m ? Number(m[0]) : null;
}

// flags
const REPLACE = process.argv.includes('--replace');
// args
const args = process.argv.slice(2).filter(a => a !== '--replace');
if (args.length === 0) {
  console.error('Δώσε paths για .yaml αρχεία ή έναν φάκελο.\nΠαράδειγμα: npx tsx scripts/import_yaml.ts /mnt/data');
  process.exit(1);
}

function collectYamlFiles(paths: string[]): string[] {
  const files: string[] = [];
  for (const p of paths) {
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p)) {
        if (f.toLowerCase().endsWith('.yaml') || f.toLowerCase().endsWith('.yml')) {
          files.push(path.join(p, f));
        }
      }
    } else {
      files.push(p);
    }
  }
  return files;
}

type YSet = Record<string, any>;
type YExercise = Record<string, any>;
type YDoc = Record<string, any>;

function pickExerciseName(ex: YExercise, idx: number) {
  // Δεχόμαστε: όνομα / ονομα / name / namegr (accent- & case-insensitive)
  const name = getFirst<string>(ex, ['όνομα','ονομα','name','namegr']);
  return (name && String(name).trim()) || `Άσκηση ${idx + 1}`;
}
function pickExerciseSets(ex: YExercise): YSet[] {
  // Δεχόμαστε: σετ / sets
  const sets = getFirst<any[]>(ex, ['σετ','sets']);
  return Array.isArray(sets) ? sets : [];
}
function pickSetKg(s: YSet) {
  // κιλά / κιλα / kg
  const v = getFirst<any>(s, ['κιλά','κιλα','kg']);
  return weightToNumber(v ?? null);
}
function pickSetReps(s: YSet) {
  // επαναλήψεις / επαναληψεις / reps
  const v = getFirst<any>(s, ['επαναλήψεις','επαναληψεις','reps']);
  return repsToNumber(v ?? null);
}
function pickSetNotes(s: YSet) {
  // σχόλιο / σχολιο / notes
  const v = getFirst<any>(s, ['σχόλιο','σχολιο','notes']);
  return v ? String(v) : null;
}

async function importOne(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const doc = parseYAML(raw) as YDoc;

  // πρόγραμμα: πρόγραμμα / προγραμμα / program
  const program = (getFirst<string>(doc, ['πρόγραμμα','προγραμμα','program']) || 'Πρόγραμμα').toString().trim();

  // ημερομηνία: προτίμηση από YAML, αλλιώς από filename
  const isoFromYaml = toISODateFromGreek(getFirst<string>(doc, ['ημερομηνία','ημερομηνια']));
  const iso = isoFromYaml || isoFromFilename(filePath);
  if (!iso) {
    console.warn(`ΣΚΙΠ: ${path.basename(filePath)} (δεν βρέθηκε έγκυρη ημερομηνία)`);
    return;
  }
  const date = new Date(iso);
  if (isNaN(date.getTime())) {
    console.warn(`ΣΚΙΠ: ${path.basename(filePath)} (Invalid Date: ${iso})`);
    return;
  }

  // ασκήσεις: ασκήσεις / ασκησεις / exercises
  const exercisesRaw = getFirst<any[]>(doc, ['ασκήσεις','ασκησεις','exercises']) || [];
  const exercises = Array.isArray(exercisesRaw) ? exercisesRaw : [];

  if (REPLACE) {
    await prisma.workoutDay.deleteMany({
      where: {
        date: { gte: new Date(iso), lt: new Date(new Date(iso).getTime() + 24*3600*1000) },
        program,
      },
    });
  }

  const created = await prisma.workoutDay.create({
    data: {
      date,
      program,
      exercises: {
        create: exercises.map((ex, i) => ({
          order: i + 1,
          nameGr: pickExerciseName(ex, i),
          sets: {
            create: pickExerciseSets(ex).map((s, j) => ({
              order: j + 1,
              kg: pickSetKg(s),
              reps: pickSetReps(s),
              notes: pickSetNotes(s),
            })),
          },
        })),
      },
    },
  });

  console.log(`✔ Imported ${path.basename(filePath)} → ${program} @ ${created.date.toISOString().slice(0,10)} (${created.id})`);
}

async function main() {
  const files = collectYamlFiles(args);
  if (files.length === 0) {
    console.log('Δεν βρέθηκαν .yaml αρχεία στα paths:', args);
    process.exit(0);
  }
  for (const f of files) {
    try {
      await importOne(f);
    } catch (e) {
      console.error('Σφάλμα στο', f, e);
    }
  }
  await prisma.$disconnect();
}
main();

