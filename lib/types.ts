export type SetModel = {
  id: string;
  weight: number;
  reps: number;
  note: string | null;
  /** 0=Αποτυχία, 1=Δύσκολο, 2=Με δυσκολία, 3=Καθαρό, null=κανένα */
  effort?: 0 | 1 | 2 | 3 | null;
};

export type ExerciseModel = {
  id: string;
  name: string;
  sets: SetModel[];
};

export type WorkoutDayModel = {
  id: string;
  date: string; // ISO (YYYY-MM-DD... ή Date string)
  program?: string | null;
  notes?: string | null;
  exercises: ExerciseModel[];
};

export type SetInput = {
  weight: number;
  reps: number;
  note?: string;
  effort?: 0 | 1 | 2 | 3 | null;
};
