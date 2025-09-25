-- HARD RESET (optional):
-- BEGIN;
-- TRUNCATE TABLE "Set" RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE "Exercise" RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE "WorkoutDay" RESTART IDENTITY CASCADE;
-- COMMIT;

-- Day 2025-09-23 — Πλάτη & Δικέφαλοι
BEGIN;
WITH day AS (
  INSERT INTO "WorkoutDay" ("id","userId","date","program","notes","deletedAt")
  VALUES ('d588399cd246b50f23d6d0a3d8f73272', NULL, '2025-09-23', 'Πλάτη & Δικέφαλοι', NULL, NULL::timestamp)
  ON CONFLICT ("id") DO UPDATE SET "program" = EXCLUDED."program"
  RETURNING id
)
, ex1 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '0b0438e5bb31136bd591e75dad7cd280', d.id, 1, 'Μηχάνημα Έλξεων (Lat Pulldown)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex1_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT '6b8f24301a6bd998038362bcd0f27313', e.id, 1, 39.0::float8, 12::int, '', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT '64b0e90eb2a459ac5efdbd01cf352862', e.id, 2, 45.0::float8, 12::int, 'Με δυσκολία', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT 'a41564e59256ad08a5075ef3ce9831a8', e.id, 3, 52.0::float8, 10::int, 'Αποτυχία', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT '545ad79bc9d58711dcca1b9b1cfaaf55', e.id, 4, 59.0::float8, 9::int, 'Αποτυχία', NULL::timestamp FROM ex1 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex2 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '00d63952ebf76e0013a031088a30fdff', d.id, 2, 'Μηχάνημα Κωπηλατικής (Low Row) με V-Bar', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex2_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT '44b077fce2b9ee1600078030bfa30bf3', e.id, 1, 52.0::float8, 12::int, '', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '2f9916b2a02108a89a1a971578cb6f17', e.id, 2, 59.0::float8, 12::int, '', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '06678ae5096198f8cc1c53b3a7d41f27', e.id, 3, 66.0::float8, 12::int, 'Αποτυχία', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '12bf8e2f6adc0d553705e3adb5fb5717', e.id, 4, 66.0::float8, 12::int, 'Αποτυχία', NULL::timestamp FROM ex2 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex3 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '5dff83a0224341f7578a6f8d11446923', d.id, 3, 'Κωπηλατική με Μπάρα (Barbell Row)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex3_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT 'fcd446865d808ad82cc20fc657ffbbb9', e.id, 1, 20.0::float8, 12::int, '', NULL::timestamp FROM ex3 e
  UNION ALL
    SELECT '0fe9e2a77cd715996ffa45829641a7da', e.id, 2, 30.0::float8, 10::int, 'Με δυσκολία', NULL::timestamp FROM ex3 e
  UNION ALL
    SELECT '67ad08113773ac31533281cb2b710466', e.id, 3, 30.0::float8, 10::int, 'Αποτυχία', NULL::timestamp FROM ex3 e
  UNION ALL
    SELECT '653abfec42a612bf5837bb25cceebe70', e.id, 4, 30.0::float8, 10::int, 'Αποτυχία', NULL::timestamp FROM ex3 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex4 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '08ce3d74b75de37bfe3f37ef6ce73e00', d.id, 4, 'Κάμψεις Δικεφάλων με Στραβομπάρα (EZ Bar Curl)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex4_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT 'acbf6f56229414d0aa963e4e62ffb059', e.id, 1, 20.0::float8, 12::int, 'Εύκολο', NULL::timestamp FROM ex4 e
  UNION ALL
    SELECT 'dea6fa77cceb3cfb6a3c694ffe91768c', e.id, 2, 20.0::float8, 12::int, 'Εύκολο', NULL::timestamp FROM ex4 e
  UNION ALL
    SELECT '79690bc4a044f4e639aa3f830a772a05', e.id, 3, 20.0::float8, 12::int, 'Εύκολο', NULL::timestamp FROM ex4 e
  UNION ALL
    SELECT '780d1bfca1610f930696d3e1845a9b2f', e.id, 4, 20.0::float8, 12::int, 'Εύκολο', NULL::timestamp FROM ex4 e
  UNION ALL
    SELECT 'ba7ecaa57978e564eb26a59329162730', e.id, 5, 20.0::float8, 12::int, 'Εύκολο', NULL::timestamp FROM ex4 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex5 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '424d710af2c223b999ef006f51367bc7', d.id, 5, 'Κοιλιακοί (Abs)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex5_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT 'a0e084db1a8c3bec8d3d23d059445062', e.id, 1, NULL::float8, 20::int, '', NULL::timestamp FROM ex5 e
  UNION ALL
    SELECT '604e59fc5354dc6099ed79915e472de5', e.id, 2, NULL::float8, 20::int, '', NULL::timestamp FROM ex5 e
  UNION ALL
    SELECT 'dab5656060806476ce6df8f2016c20a5', e.id, 3, NULL::float8, 20::int, '', NULL::timestamp FROM ex5 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
SELECT 'OK';
COMMIT;

-- Day 2025-09-22 — Στήθος & Κοιλιακοί
BEGIN;
WITH day AS (
  INSERT INTO "WorkoutDay" ("id","userId","date","program","notes","deletedAt")
  VALUES ('c8f2180ea1af795650c6391bc64917e7', NULL, '2025-09-22', 'Στήθος & Κοιλιακοί', NULL, NULL::timestamp)
  ON CONFLICT ("id") DO UPDATE SET "program" = EXCLUDED."program"
  RETURNING id
)
, ex1 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '6e13f64c2f6f2e897c6e61c56c8476c6', d.id, 1, 'Μηχάνημα Κάθετης Πίεσης Στήθους (Vertical Chest Press)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex1_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT '5b52c16707b67c42ea2a8db7d647032d', e.id, 1, 30.0::float8, 12::int, 'Καλή εκκίνηση', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT '18eadcf4567ee3247898ce4717235126', e.id, 2, 30.0::float8, 12::int, 'Καλά κιλά, ανεβάζω στο επόμενο', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT '0518a8e3062b42fd9d687d909183297a', e.id, 3, 40.0::float8, 12::int, 'Καλά κιλά, βάζω παραπάνω', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT '79a3119531f9bf4c696a950ebbd7c64b', e.id, 4, 50.0::float8, 12::int, 'Καλά κιλά, αλλά πρέπει να βάλω παραπάνω για αποτυχία στα 10', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT 'f1b0c98127843a9a299b1968b7693cec', e.id, 5, 60.0::float8, 10::int, 'Αποτυχία στο σετ', NULL::timestamp FROM ex1 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex2 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '891425704dcfa6e1c5056c41a67a6fb6', d.id, 2, 'Μηχάνημα Οριζόντιας Πίεσης Στήθους (Supine Press)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex2_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT 'e51a983fe0d0dd126bee05dec1a7a4d5', e.id, 1, 40.0::float8, 12::int, 'Εύκολο', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '21e81265d03bf76c81ac104ca1eab0f3', e.id, 2, 80.0::float8, 10::int, 'Αποτυχία στο σετ', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT 'c698ae51baab575fe90c4b43c07fedcf', e.id, 3, 80.0::float8, 9::int, 'Αποτυχία στο σετ', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '44170672264a41f50b12a30bee068685', e.id, 4, 80.0::float8, 5::int, 'Αποτυχία στο σετ', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '435d8bc161f31cec281b90343c7d29c8', e.id, 5, 80.0::float8, 7::int, 'Αποτυχία στο σετ', NULL::timestamp FROM ex2 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex3 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT 'cb834ee25ac9c06bd20df7d95816e213', d.id, 3, 'Κοιλιακοί (Ab Crunches)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex3_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT '36ea4cfd5449f81e9d7a94b295e3bd1b', e.id, 1, NULL::float8, 20::int, '', NULL::timestamp FROM ex3 e
  UNION ALL
    SELECT 'e4339fc242d5271221b1cea582f0489f', e.id, 2, NULL::float8, 20::int, '', NULL::timestamp FROM ex3 e
  UNION ALL
    SELECT '7cb3cd02a32e237b1df3b35f3d58d4e7', e.id, 3, NULL::float8, 20::int, '', NULL::timestamp FROM ex3 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
SELECT 'OK';
COMMIT;

-- Day 2025-09-19 — Πόδια
BEGIN;
WITH day AS (
  INSERT INTO "WorkoutDay" ("id","userId","date","program","notes","deletedAt")
  VALUES ('a2ade43beba7e7546161277ff2848495', NULL, '2025-09-19', 'Πόδια', NULL, NULL::timestamp)
  ON CONFLICT ("id") DO UPDATE SET "program" = EXCLUDED."program"
  RETURNING id
)
, ex1 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT 'bdb027c0a3eb09f65eee4ff7d84a2b4c', d.id, 1, 'Μηχάνημα Έσω Μηριαίων (Adductor)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex1_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT '7431b8d35b0380563f7603f83f4480e4', e.id, 1, 36.0::float8, 12::int, '', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT '1b50038f657d092d0ca1e7c971d19a3f', e.id, 2, 43.0::float8, 8::int, 'Δυσκολεύτηκα', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT 'cb5f209e7913bdcb73115e1a8452d80f', e.id, 3, 43.0::float8, 6::int, 'Ρίχνω κιλά', NULL::timestamp FROM ex1 e
  UNION ALL
    SELECT 'bf89f468259f7bf38be98809591a137c', e.id, 4, 36.0::float8, 12::int, '', NULL::timestamp FROM ex1 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex2 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '656332e8dc2d61cfb308a233863eabd5', d.id, 2, 'Μηχάνημα Έξω Μηριαίων (Abductor)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex2_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT '54fe0bc71fe5f44f7da1bbc6c78f1252', e.id, 1, 36.0::float8, 12::int, 'Εύκολο', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '7650633ec56fd492f7ed17c22be96f98', e.id, 2, 43.0::float8, 12::int, 'Εύκολο', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '8066f2c4794883f65261342b10de8b69', e.id, 3, 50.0::float8, 12::int, '', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT 'ddb0ea6165f35fd53279aca5596d7510', e.id, 4, 63.0::float8, 10::int, 'Πρέπει να ανεβάσω', NULL::timestamp FROM ex2 e
  UNION ALL
    SELECT '84fec322e2a7d69aac3a82f4c68b4383', e.id, 5, 70.0::float8, 10::int, '', NULL::timestamp FROM ex2 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex3 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '1adfa0a0f4132b8726c6a17490f35b7f', d.id, 3, 'Μηχάνημα Εκτάσεις Τετρακεφάλων (Leg Extension) [θέση εκκίνησης: 3 | γόνατα: 2]', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex3_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT 'b5687fcadbe79ec4b15baf03776a2a8b', e.id, 1, 36.0::float8, 12::int, '', NULL::timestamp FROM ex3 e
  UNION ALL
    SELECT '4ce83a99fde8703f3465a75ee14b07c6', e.id, 2, 43.0::float8, 12::int, '', NULL::timestamp FROM ex3 e
  UNION ALL
    SELECT '5a61e2cf297c7f87b0094aedd595b953', e.id, 3, 50.0::float8, 10::int, 'Καλό βάρος', NULL::timestamp FROM ex3 e
  UNION ALL
    SELECT '3caae3d71d266d812b78e4c6378ea110', e.id, 4, 63.0::float8, 10::int, '', NULL::timestamp FROM ex3 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex4 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '5c6901de0acd41b7eba7b358f7a01ec5', d.id, 4, 'Μηχάνημα Κάμψεις Ποδιών (Leg Curl) [πλάτη: 3 | μαξιλάρι αστραγάλων: 4]', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex4_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT '66587401455c20c99274aa7e8bb55ef7', e.id, 1, 23.0::float8, 12::int, '', NULL::timestamp FROM ex4 e
  UNION ALL
    SELECT '2e1fcaf2b5575d33e852ff39ced6e2b9', e.id, 2, 36.0::float8, 10::int, '', NULL::timestamp FROM ex4 e
  UNION ALL
    SELECT '503babcf9f224b38cc3614fbf5a5e5be', e.id, 3, 43.0::float8, 10::int, '', NULL::timestamp FROM ex4 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
, ex5 AS (
  INSERT INTO "Exercise" ("id","workoutDayId","order","nameGr","nameEn","deletedAt")
  SELECT '58790612d9ba00f1dea4e6fa9c8aae02', d.id, 5, 'Μηχάνημα Κοιλιακών (Ab Crunch)', NULL, NULL::timestamp FROM day d
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "nameGr" = EXCLUDED."nameGr", "nameEn" = EXCLUDED."nameEn"
  RETURNING id
)
, ex5_sets AS (
  INSERT INTO "Set" ("id","exerciseId","order","kg","reps","notes","deletedAt")
      SELECT 'a8ed8eae24dfd2e6e0fe7a25a0513a8b', e.id, 1, NULL::float8, 20::int, '', NULL::timestamp FROM ex5 e
  UNION ALL
    SELECT '947f36ca751083e34ce4475a5e8e0731', e.id, 2, NULL::float8, 20::int, '', NULL::timestamp FROM ex5 e
  UNION ALL
    SELECT '8e177aa270607887da97171c93eb5425', e.id, 3, NULL::float8, 20::int, '', NULL::timestamp FROM ex5 e
  ON CONFLICT ("id") DO UPDATE SET "order" = EXCLUDED."order", "kg" = EXCLUDED."kg", "reps" = EXCLUDED."reps", "notes" = EXCLUDED."notes"
)
SELECT 'OK';
COMMIT;
