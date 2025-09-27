# UX Upgrade – TL;DR
- Inline προσθήκες σετ με validation (Zod + RHF)
- Optimistic updates και καθαρά empty/loading/error states
- Σταθερό layout: max-w-5xl, σωστά gaps, κάρτες με σκιές
- Keyboard: `A` για add exercise, (reserve) `Mod+S` για save-all

## Endpoints που περιμένει το UI
- `GET /api/day?date=YYYY-MM-DD` → `WorkoutDayModel` (εδώ κάνουμε fallback σε `/api/workouts?from=...&to=...`)
- `GET /api/workouts?from=YYYY-MM-DD&to=YYYY-MM-DD` → `WorkoutDayModel[]`
- `POST /api/exercises` { dayId, name } → `ExerciseModel`
- `POST /api/sets` { exerciseId, weight, reps, note? } → 200 OK
