import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const BASE = process.env.BASE_URL || "http://localhost:3000";

// dd/mm/yyyy -> yyyy-mm-dd
function toISODate(gr) {
  const m = String(gr).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) throw new Error(`Bad date format (χρειάζεται dd/mm/yyyy): ${gr}`);
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeKg(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s.includes("σωματικ")) return null; // "Σωματικό βάρος"
    const num = Number(s.replace(",", "."));
    return Number.isFinite(num) ? num : null;
  }
  if (typeof v === "number") return v;
  return null;
}

// Επιστρέφει { reps, noteAppend, skipped }
// - δέχεται "8", "8-10", "x12", "12x", "12", "μέχρι", "max", "amrap", "failure"
function parseReps(v) {
  const res = { reps: null, noteAppend: "", skipped: false };
  if (v === null || v === undefined || v === "") {
    res.skipped = true;
    return res;
  }
  if (typeof v === "number") {
    res.reps = Number.isFinite(v) && v > 0 ? Math.floor(v) : null;
    if (!res.reps) res.skipped = true;
    return res;
  }
  const raw = String(v).trim().toLowerCase();

  // amrap / μέχρι αποτυχίας
  if (/(amrap|failure|αποτυχ|μεχρι)/.test(raw)) {
    res.reps = 1; // min valid για το API
    res.noteAppend = "AMRAP/μέχρι αποτυχίας";
    return res;
  }

  // 8-10 -> παίρνουμε το upper bound (ή average, αλλά προτιμώ upper)
  const range = raw.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const hi = parseInt(range[2], 10);
    res.reps = hi > 0 ? hi : null;
    if (!res.reps) res.skipped = true;
    return res;
  }

  // x12, 12x, ή σκέτο 12
  const nx = raw.match(/^(?:x\s*)?(\d+)$|^(\d+)\s*x$/);
  if (nx) {
    const n = parseInt(nx[1] || nx[2], 10);
    res.reps = n > 0 ? n : null;
    if (!res.reps) res.skipped = true;
    return res;
  }

  // σκέτο 12 (γενική περίπτωση)
  const only = raw.match(/^(\d+)$/);
  if (only) {
    const n = parseInt(only[1], 10);
    res.reps = n > 0 ? n : null;
    if (!res.reps) res.skipped = true;
    return res;
  }

  // δεν καταλάβαμε -> skip
  res.skipped = true;
  return res;
}

async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`HTTP ${r.status} ${url}\n${text.slice(0, 600)}`);
  }
  return await r.json();
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Χρήση: node scripts/import_gr_yaml.mjs <αρχείο.yaml>");
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(file), "utf8");
  const y = yaml.load(raw);

  const dateGR = y["ημερομηνία"] ?? y["date"];
  const program = (y["πρόγραμμα"] ?? y["program"] ?? "Γενικό").toString().trim();
  const exercises = y["ασκήσεις"] ?? y["exercises"] ?? [];

  const dateISO = toISODate(dateGR);

  console.log(`→ Δημιουργία ημέρας ${dateISO} [${program}]`);
  const day = await postJSON(`${BASE}/api/workouts`, {
    date: dateISO,
    program,
  });

  for (const ex of exercises) {
    const name = ex["όνομα"] ?? ex["name"];
    if (!name) {
      console.warn("  ⚠ Παράλειψη άσκησης χωρίς όνομα");
      continue;
    }
    console.log(`  → Άσκηση: ${name}`);
    const exRes = await postJSON(`${BASE}/api/exercises`, {
      workoutDayId: day.id,
      name,
    });

    const sets = ex["σετ"] ?? ex["sets"] ?? [];
    let index = 0;
    for (const s of sets) {
      index++;
      const kg = normalizeKg(s["κιλά"] ?? s["kg"]);
      const { reps, noteAppend, skipped } = parseReps(s["επαναλήψεις"] ?? s["reps"]);
      const baseNote = (s["σχόλιο"] ?? s["notes"] ?? "").toString().trim();
      const notes =
        baseNote && noteAppend ? `${baseNote}; ${noteAppend}` :
        (baseNote || noteAppend);

      if (skipped || !reps) {
        console.warn(`    ⚠ Παράλειψη set #${index} (μη έγκυρες επαναλήψεις: ${s["επαναλήψεις"] ?? s["reps"]})`);
        continue; // δεν κάνουμε POST για να μη σκάσει το API
      }

      await postJSON(`${BASE}/api/exercises/${exRes.id}/sets`, {
        kg,
        reps,
        notes,
      });
    }
  }

  console.log(`✔ Ολοκληρώθηκε. Άνοιξε: ${BASE}/day/${dateISO}`);
}

main().catch((e) => {
  console.error("✖ Απέτυχε το import:", e.message);
  process.exit(1);
});
