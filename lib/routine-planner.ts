import type { Exercise, Muscle, PlannedDay } from '@/types';

const DEFAULT_SETS = 3;
const DEFAULT_REPS = '10';
const DEFAULT_REST = '60s';

type MuscleMap = Map<string, Muscle>;
type SessionDraft = {
  label: string;
  muscleIds: string[];
};

const TRAINING_WEEKDAYS: Record<number, number[]> = {
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

const WEEKDAY_LABEL: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

const THREE_DAY_BLUEPRINT = [
  { weekday: 1, anchorMuscles: ['pecho'], supportMuscles: ['hombros', 'triceps'] },
  { weekday: 3, anchorMuscles: ['piernas', 'gluteos'], supportMuscles: ['abdomen'] },
  { weekday: 5, anchorMuscles: ['espalda'], supportMuscles: ['biceps'] },
] as const;

export function getTrainingWeekdays(daysPerWeek: number): number[] {
  if (TRAINING_WEEKDAYS[daysPerWeek]) {
    return TRAINING_WEEKDAYS[daysPerWeek];
  }

  return Array.from({ length: Math.max(1, Math.min(daysPerWeek, 7)) }, (_, index) => index + 1).map((value) =>
    value === 7 ? 0 : value
  );
}

export function getWeekdayLabel(weekday: number): string {
  return WEEKDAY_LABEL[weekday] ?? `Sesión ${weekday + 1}`;
}

export function buildWeeklyPlan(
  exercises: Exercise[],
  daysPerWeek: number,
  muscles: Muscle[]
): PlannedDay[] {
  if (exercises.length === 0) return [];

  const normalizedDays = Math.max(1, daysPerWeek);
  const muscleMap = new Map(muscles.map((muscle) => [muscle.id, muscle] as const));
  const groupedExercises = groupExercisesByMuscle(exercises);

  if (normalizedDays === 3) {
    return buildThreeDayPlan(groupedExercises, muscleMap);
  }

  return buildBalancedPlan(groupedExercises, normalizedDays, muscleMap);
}

export function buildFocusLabel(exercises: Exercise[], muscles: Muscle[]): string | undefined {
  if (exercises.length === 0) return undefined;

  const muscleMap = new Map(muscles.map((muscle) => [muscle.id, muscle] as const));
  const counts = new Map<string, number>();

  for (const exercise of exercises) {
    counts.set(exercise.muscleId, (counts.get(exercise.muscleId) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([muscleId]) => muscleMap.get(muscleId)?.name ?? muscleId)
    .join(' · ');
}

function buildThreeDayPlan(groupedExercises: Map<string, Exercise[]>, muscleMap: MuscleMap): PlannedDay[] {
  const assignedMuscles = new Set<string>();
  const sessions: SessionDraft[] = THREE_DAY_BLUEPRINT.map((entry) => ({
    label: getWeekdayLabel(entry.weekday),
    muscleIds: [],
  }));

  THREE_DAY_BLUEPRINT.forEach((entry, sessionIndex) => {
    for (const muscleId of [...entry.anchorMuscles, ...entry.supportMuscles]) {
      if (!groupedExercises.has(muscleId) || assignedMuscles.has(muscleId)) continue;
      sessions[sessionIndex].muscleIds.push(muscleId);
      assignedMuscles.add(muscleId);
    }
  });

  const remainingMuscles = [...groupedExercises.entries()]
    .filter(([muscleId]) => !assignedMuscles.has(muscleId))
    .sort((left, right) => right[1].length - left[1].length);

  for (const [muscleId] of remainingMuscles) {
    const targetSession = sessions.reduce((best, current) =>
      getSessionExerciseCount(current, groupedExercises) < getSessionExerciseCount(best, groupedExercises) ? current : best
    );
    targetSession.muscleIds.push(muscleId);
  }

  return sessions.map((session) => toPlannedDay(session.label, session.muscleIds, groupedExercises, muscleMap));
}

function buildBalancedPlan(
  groupedExercises: Map<string, Exercise[]>,
  daysPerWeek: number,
  muscleMap: MuscleMap
): PlannedDay[] {
  const weekdays = getTrainingWeekdays(daysPerWeek);
  const sessions: SessionDraft[] = weekdays.map((weekday) => ({
    label: getWeekdayLabel(weekday),
    muscleIds: [],
  }));

  const sortedGroups = [...groupedExercises.entries()].sort((left, right) => {
    if (right[1].length !== left[1].length) {
      return right[1].length - left[1].length;
    }

    return left[0].localeCompare(right[0]);
  });

  for (const [muscleId] of sortedGroups) {
    const targetSession = sessions.reduce((best, current) =>
      getSessionExerciseCount(current, groupedExercises) < getSessionExerciseCount(best, groupedExercises) ? current : best
    );
    targetSession.muscleIds.push(muscleId);
  }

  return sessions.map((session) => toPlannedDay(session.label, session.muscleIds, groupedExercises, muscleMap));
}

function toPlannedDay(
  label: string,
  muscleIds: string[],
  groupedExercises: Map<string, Exercise[]>,
  muscleMap: MuscleMap
): PlannedDay {
  const exercises = muscleIds.flatMap((muscleId) => groupedExercises.get(muscleId) ?? []);
  const focus = muscleIds
    .slice(0, 3)
    .map((muscleId) => muscleMap.get(muscleId)?.name ?? muscleId)
    .join(' + ');

  return {
    label,
    focus: focus || 'Entrenamiento',
    exercises: exercises.map((exercise) => ({
      exerciseId: exercise.id,
      sets: DEFAULT_SETS,
      reps: DEFAULT_REPS,
      rest: DEFAULT_REST,
    })),
  };
}

function groupExercisesByMuscle(exercises: Exercise[]): Map<string, Exercise[]> {
  const grouped = new Map<string, Exercise[]>();

  for (const exercise of exercises) {
    const list = grouped.get(exercise.muscleId);
    if (list) {
      list.push(exercise);
      continue;
    }

    grouped.set(exercise.muscleId, [exercise]);
  }

  return grouped;
}

function getSessionExerciseCount(session: SessionDraft, groupedExercises: Map<string, Exercise[]>): number {
  return session.muscleIds.reduce((total, muscleId) => total + (groupedExercises.get(muscleId)?.length ?? 0), 0);
}
