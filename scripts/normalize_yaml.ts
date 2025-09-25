import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

// helpers
const fold = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function toISODate(gr: string) {
  // Δέχεται "2025-09-19" ή "22/09/2025"
  if (!gr) return gr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(gr)) return gr;
  const m = gr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return gr; // άστο όπως είναι αν δεν αναγνωρίζεται
}

// χαρτογράφηση κλειδιών αντικειμένων άσκησης
function normalizeExercise(ex: any, idx: number) {
  // όνομα: μπορεί να είναι σε κλειδί "όνομα", "ονομα", "name", "namegr", ή "άσκηση"
  const name =
    ex['όνομα'] ?? ex['ονομα'] ?? ex['name'] ?? ex['namegr'] ?? ex['άσκηση'] ?? `Άσκηση ${idx + 1}`;

  // σετ: λίστα από αντικείμενα
  let sets = ex['σετ'] ?? ex['sets'] ?? [];

  if (!Array.isArray(sets)) {
    // αν (κακώς) είναι object του τύπου {1:{...},2:{...}}
    sets = Object.values(sets);
  }

  const normSets = sets
    .filter(Boolean)
    .map((s: any, j: number) => {
      // order / αριθμός
      const order = s['order'] ?? s['αριθμός'] ?? s['αριθμος'] ?? j + 1;

      // κιλά: κιλά|kg|βάρος|βαρος, και null για “σωματικό βάρος”
      let kg = s['κιλά'];
      if (kg === undefined) kg = s['kg'];
      if (kg === undefined) kg = s['βάρος'];
      if (kg === undefined) kg = s['βαρος'];

      if (typeof kg === 'string') {
        const f = fold(kg);
        if (f.includes('σωματικ') || f.includes('somat') || f.includes('body')) kg = null;
        else {
          const num = parseFloat(kg.replace(',', '.').replace(/[^0-9.]/g, ''));
          kg = Number.isFinite(num) ? num : null;
        }
      }

      // επαναλήψεις: επαναλήψεις|reps
      let reps = s['επαναλήψεις'];
      if (reps === undefined) reps = s['reps'];
      if (typeof reps === 'string') {
        const num = parseInt(reps.replace(/[^0-9]/g, ''), 10);
        reps = Number.isFinite(num) ? num : null;
      }

      // σημείωση: σχόλιο|notes
      const notes = s['σχόλιο'] ?? s['σχολιο'] ?? s['notes'] ?? null;

      return { order, κιλά: kg, επαναλήψεις: reps, σχόλιο: notes };
    });

  return {
    όνομα: name,
    σετ: normSets,
  };
}

function normalizeDoc(src: any) {
  const out: any = {};

  out['ημερομηνία'] = toISODate(
    src['ημερομηνία'] ?? src['ημερoμηνία'] ?? src['date'] ?? src['ημερομηνια']
  );
  out['πρόγραμμα'] = src['πρόγραμμα'] ?? src['προγραμμα'] ?? src['program'] ?? '';

  // ασκήσεις
  let exs = src['ασκήσεις'] ?? src['ασκησεις'] ?? src['exercises'] ?? [];
  if (!Array.isArray(exs)) exs = Object.values(exs);

  const norm = exs
    .filter(Boolean)
    // πετάμε τυχόν placeholders τύπου "..." που κατέληξαν strings
    .filter((it: any) => !(typeof it === 'string' && it.trim() === '...'))
    .map((ex: any, i: number) => normalizeExercise(ex, i));

  out['ασκήσεις'] = norm;
  return out;
}

function stripDots(text: string) {
  // βγάζει γραμμές που είναι ΜΟΝΟ "..." (σπάνε το YAML)
  return text
    .split(/\r?\n/)
    .filter((ln) => ln.trim() !== '...')
    .join('\n');
}

function main() {
  const inDir = process.argv[2] || '/mnt/data';
  const outDir = process.argv[3] || path.join(inDir, 'normalized');
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs
    .readdirSync(inDir)
    .filter((f) => /\.ya?ml$/i.test(f))
    .map((f) => path.join(inDir, f));

  if (files.length === 0) {
    console.error('❌ Δεν βρέθηκαν YAML στο', inDir);
    process.exit(1);
  }

  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const cleaned = stripDots(raw);
      const doc = YAML.parse(cleaned);
      const norm = normalizeDoc(doc);
      const outText = YAML.stringify(norm);
      const outPath = path.join(outDir, path.basename(file));
      fs.writeFileSync(outPath, outText, 'utf8');
      console.log('✔ Καθαρίστηκε →', outPath);
    } catch (e) {
      console.error('✖ Απέτυχε:', file, e);
    }
  }
}

main();

