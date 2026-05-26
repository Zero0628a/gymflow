import type { ImageSourcePropType } from 'react-native';

export interface Muscle {
  id: string;
  name: string;
  icon: string;
  color: string;
  image?: ImageSourcePropType;
  imageKey?: string;
  sortOrder?: number;
}

export type EquipmentTag =
  | 'bodyweight'
  | 'dumbbell'
  | 'barbell'
  | 'machine'
  | 'cable'
  | 'band'
  | 'kettlebell';

export interface Exercise {
  id: string;
  muscleId: string;
  name: string;
  description: string;
  equipment?: EquipmentTag[];
  sortOrder?: number;
}

export interface Variant {
  id: string;
  exerciseId: string;
  name: string;
  description: string;
  replacementExerciseId?: string;
  sortOrder?: number;
}

export type RoutineStatus = 'draft' | 'ready' | 'active' | 'archived';
export type RoutineSource = 'custom' | 'template';

export type RoutineLevel = 'beginner' | 'intermediate' | 'advanced';
export type RoutineGoal = 'strength' | 'hypertrophy' | 'endurance' | 'general';
export type RoutineEquipmentSetup = 'home' | 'gym';
export type RoutineSplit =
  | 'full-body'
  | 'upper-lower'
  | 'ppl'
  | 'bro-split'
  | 'home-circuit';

export interface PlannedExercise {
  exerciseId: string;
  originalExerciseId?: string;
  replacementName?: string;
  sets: number;
  reps: string;
  rest?: string;
  note?: string;
}

export interface PlannedDay {
  label: string;
  focus: string;
  exercises: PlannedExercise[];
}

export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
  createdAt: string;
  updatedAt?: string;
  lastUsedAt?: string;
  status: RoutineStatus;
  source: RoutineSource;
  focusLabel?: string;
  sortOrder?: number;
  level?: RoutineLevel;
  goal?: RoutineGoal;
  daysPerWeek?: number;
  equipment?: RoutineEquipmentSetup;
  split?: RoutineSplit;
  description?: string;
  weeklyPlan?: PlannedDay[];
  // Marca el inicio del ciclo semanal del usuario. Se setea cuando la rutina se activa
  // y se usa para calcular el dia de sesion / descanso de cada fecha.
  cycleStartedAt?: string;
}

export interface UserProfile {
  goal: RoutineGoal;
  level: RoutineLevel;
  daysPerWeek: number;
  trainingWeekdays?: number[];
  equipment: RoutineEquipmentSetup;
  completedOnboarding: boolean;
  updatedAt?: string;
}

export interface HistoryEntry {
  id: string;
  routineName: string;
  date: string;
  exerciseCount: number;
}

export type TrainingDayStatus =
  | 'pending'
  | 'partial'
  | 'completed'
  | 'missed'
  | 'postponed'
  | 'rest';

export interface TrainingDay {
  dateKey: string;
  dayLabel: string;
  shortDateLabel: string;
  status: TrainingDayStatus;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  // Indice del dia dentro del ciclo (1-based) y la sesion del weeklyPlan asignada (si entrena).
  cycleDayIndex: number;
  sessionIndex: number | null;
  routineId?: string;
  routineName?: string;
  sessionLabel: string;
  sessionFocus: string;
  // Solo presente si NO es dia de descanso. Lista de ejercicios planificados.
  plannedExercises: PlannedExercise[];
  // Ids de ejercicios cuyos sets estan TODOS marcados. Derivado de completedSets.
  completedExerciseIds: string[];
  // Sets marcados por ejercicio. Las claves son exerciseId; el valor es un
  // array de indices 0-based de los sets completados. Permite marcar serie a serie.
  completedSets: Record<string, number[]>;
  // Color asociado (lo derivamos de la sesion). Se mantiene por compatibilidad visual.
  accentColor: string;
}

export type TrainingActionFailure =
  | 'closed_missed'
  | 'closed_postponed'
  | 'not_today'
  | 'already_completed'
  | 'exercise_already_started';

// Un set registrado por el usuario durante la sesion
export interface LoggedSet {
  setNumber: number;
  weight?: number;
  reps: number;
  rpe?: number;
}

// Todos los sets de un ejercicio en un dia dado
export interface ExerciseLog {
  exerciseId: string;
  dateKey: string;
  sets: LoggedSet[];
  note?: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id: string;
  dateKey: string;
  status: Extract<TrainingDayStatus, 'partial' | 'completed' | 'postponed' | 'missed'>;
  completedExerciseIds: string[];
  completedAt?: string;
  postponedAt?: string;
  routineId?: string;
  routineName?: string;
  sessionLabel?: string;
  sessionFocus?: string;
  plannedExercises: PlannedExercise[];
  updatedAt?: string;
}
