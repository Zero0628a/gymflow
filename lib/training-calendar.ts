import type {
  PlannedDay,
  PlannedExercise,
  Routine,
  TrainingDay,
  TrainingDayStatus,
} from '@/types';
import { getTrainingWeekdays } from '@/lib/routine-planner';

// Estado persistido por dia. dateKey = 'YYYY-MM-DD' local.
export type PersistedTrainingDay = {
  dateKey: string;
  status: Exclude<TrainingDayStatus, 'missed' | 'rest'> | 'pending';
  completedExerciseIds: string[];
  // Sets marcados por ejercicio (exerciseId -> indices 0-based). Opcional para
  // ser compatible con docs antiguos que solo guardaban completedExerciseIds.
  completedSets?: Record<string, number[]>;
  completedAt?: string;
  postponedAt?: string;
  routineId?: string;
  routineName?: string;
  sessionLabel?: string;
  sessionFocus?: string;
  plannedExercises?: PlannedExercise[];
};

export type PersistedWorkoutSession = {
  dateKey: string;
  status: Extract<TrainingDayStatus, 'partial' | 'completed' | 'postponed' | 'missed'>;
  completedExerciseIds: string[];
  completedSets?: Record<string, number[]>;
  completedAt?: string;
  postponedAt?: string;
  routineId?: string;
  routineName?: string;
  sessionLabel?: string;
  sessionFocus?: string;
  plannedExercises?: PlannedExercise[];
  updatedAt?: string;
};

export type TrainingCalendarStore = {
  version: 1;
  days: Record<string, PersistedTrainingDay>;
};

export const TRAINING_STORAGE_KEY = 'gymflow.training-calendar.v1';

const shortDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
});

const longDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dayNameFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'long' });

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function capitalize(value: string) {
  if (!value.length) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// =============================================================
// Fechas locales (date keys)
// =============================================================

export function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromLocalDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addLocalDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function diffInDays(from: Date, to: Date) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function createEmptyTrainingStore(): TrainingCalendarStore {
  return {
    version: 1,
    days: {},
  };
}

// =============================================================
// Patrones de entrenamiento anclados a la semana calendario.
// `Date.getDay()` usa 0 = domingo, 1 = lunes, ... 6 = sabado.
// =============================================================

// Para una fecha dada, dado el cycleStartedAt, devolvemos:
//   - cycleDayIndex (1-based) dentro de la semana calendario actual (lunes..domingo)
//   - sessionIndex en weeklyPlan segun el orden de los dias entrenables de esa semana
// =============================================================

export type RoutineSessionInfo = {
  cycleDayIndex: number; // 1..7
  sessionIndex: number | null; // null si descanso
  isTrainingDay: boolean;
};

export function getRoutineSessionInfo(
  date: Date,
  routine: Routine | null,
  sessionOffset = 0,
  preferredTrainingWeekdays?: number[]
): RoutineSessionInfo | null {
  if (!routine || !routine.cycleStartedAt) {
    return null;
  }

  const activationDate = fromLocalDateKey(toLocalDateKey(new Date(routine.cycleStartedAt)));
  if (date < activationDate) {
    return null;
  }

  const dateKey = toLocalDateKey(date);
  const activationKey = toLocalDateKey(activationDate);
  const daysPerWeek = routine.daysPerWeek ?? Math.max(routine.weeklyPlan?.length ?? 3, 1);
  const trainingWeekdays =
    preferredTrainingWeekdays && preferredTrainingWeekdays.length > 0
      ? preferredTrainingWeekdays
      : getTrainingWeekdays(daysPerWeek);
  const weekday = date.getDay();
  const planLength = routine.weeklyPlan?.length ?? 0;

  if (dateKey === activationKey && planLength > 0) {
    return {
      cycleDayIndex: ((weekday + 6) % 7) + 1,
      sessionIndex: 0,
      isTrainingDay: true,
    };
  }

  const isTrainingDay = trainingWeekdays.includes(weekday);
  const cycleDayIndex = ((weekday + 6) % 7) + 1;

  if (!isTrainingDay) {
    return {
      cycleDayIndex,
      sessionIndex: null,
      isTrainingDay: false,
    };
  }

  // Mapeamos a sessionIndex del weeklyPlan con modulo.
  if (planLength === 0) {
    return {
      cycleDayIndex,
      sessionIndex: null,
      isTrainingDay: true,
    };
  }

  const baseSessionIndex = trainingWeekdays.indexOf(weekday);
  const sessionIndex = ((baseSessionIndex - sessionOffset) % planLength + planLength) % planLength;

  return {
    cycleDayIndex,
    sessionIndex,
    isTrainingDay: true,
  };
}

// =============================================================
// Resolver un TrainingDay completo para una fecha dada
// =============================================================

export function resolveTrainingDay(input: {
  date: Date;
  todayKey: string;
  activeRoutine: Routine | null;
  persisted?: PersistedTrainingDay;
  sessionOffset?: number;
  trainingWeekdays?: number[];
}): TrainingDay {
  const { date, todayKey, activeRoutine, persisted, sessionOffset = 0, trainingWeekdays } = input;
  const dateKey = toLocalDateKey(date);
  const session = getRoutineSessionInfo(date, activeRoutine, sessionOffset, trainingWeekdays);

  const dayLabel = capitalize(dayNameFormatter.format(date));
  const shortDateLabel = capitalize(shortDateFormatter.format(date));
  const isToday = dateKey === todayKey;
  const isPast = dateKey < todayKey;
  const isFuture = dateKey > todayKey;

  // Sin rutina activa: el dia no entra al sistema, lo tratamos como descanso "sin rutina".
  if (!session) {
    const persistedStatus = persisted?.status === 'completed' || persisted?.status === 'partial' || persisted?.status === 'postponed'
      ? persisted.status
      : 'rest';

    const fallbackPlanned = persisted?.plannedExercises ?? [];
    const fallbackSets = expandCompletedSets(persisted, fallbackPlanned);

    return {
      dateKey,
      dayLabel,
      shortDateLabel,
      status: persistedStatus,
      isToday,
      isPast,
      isFuture,
      cycleDayIndex: 0,
      sessionIndex: null,
      routineId: persisted?.routineId,
      routineName: persisted?.routineName,
      sessionLabel: 'Sin rutina activa',
      sessionFocus: '',
      plannedExercises: fallbackPlanned,
      completedExerciseIds: deriveCompletedExerciseIds(fallbackPlanned, fallbackSets),
      completedSets: fallbackSets,
      accentColor: '#2F6BFF',
    };
  }

  // Dia de descanso programado.
  if (!session.isTrainingDay) {
    return {
      dateKey,
      dayLabel,
      shortDateLabel,
      status: 'rest',
      isToday,
      isPast,
      isFuture,
      cycleDayIndex: session.cycleDayIndex,
      sessionIndex: null,
      routineId: activeRoutine?.id,
      routineName: activeRoutine?.name,
      sessionLabel: 'Descanso',
      sessionFocus: 'Dia de recuperacion',
      plannedExercises: [],
      completedExerciseIds: [],
      completedSets: {},
      accentColor: '#2F6BFF',
    };
  }

  // Dia de entrenamiento: agarramos la sesion correspondiente del weeklyPlan.
  const planDay: PlannedDay | undefined =
    session.sessionIndex !== null && activeRoutine?.weeklyPlan
      ? activeRoutine.weeklyPlan[session.sessionIndex]
      : undefined;

  const plannedExercises: PlannedExercise[] = persisted?.plannedExercises ?? planDay?.exercises ?? [];
  const completedSets = expandCompletedSets(persisted, plannedExercises);
  const completedExerciseIds = deriveCompletedExerciseIds(plannedExercises, completedSets);

  // Status:
  //   - postponed se mantiene si esta persistido
  //   - completed cuando TODOS los ejercicios tienen todos sus sets marcados
  //   - partial si hay al menos un set marcado pero no todo
  //   - pending por defecto
  //   - missed solo si la fecha ya paso y no se completo ni se pospuso
  const anySetMarked = Object.values(completedSets).some((sets) => sets.length > 0);
  let status: TrainingDayStatus = 'pending';

  if (persisted?.status === 'postponed') {
    status = 'postponed';
  } else if (plannedExercises.length > 0 && completedExerciseIds.length >= plannedExercises.length) {
    status = 'completed';
  } else if (anySetMarked) {
    status = 'partial';
  } else {
    status = 'pending';
  }

  if (isPast && status === 'pending') {
    status = 'missed';
  }

  return {
    dateKey,
    dayLabel,
    shortDateLabel,
    status,
    isToday,
    isPast,
    isFuture,
    cycleDayIndex: session.cycleDayIndex,
    sessionIndex: session.sessionIndex,
    routineId: persisted?.routineId ?? activeRoutine?.id,
    routineName: persisted?.routineName ?? activeRoutine?.name,
    sessionLabel: persisted?.sessionLabel ?? planDay?.label ?? `Sesion ${(session.sessionIndex ?? 0) + 1}`,
    sessionFocus: persisted?.sessionFocus ?? planDay?.focus ?? '',
    plannedExercises,
    completedExerciseIds,
    completedSets,
    accentColor: '#2F6BFF',
  };
}

// Reconstruye completedSets a partir del estado persistido. Si el doc viejo
// tenia solo completedExerciseIds (sin completedSets), asumimos que todos los
// sets de ese ejercicio estan marcados (compat con sesiones antiguas).
function expandCompletedSets(
  persisted: PersistedTrainingDay | PersistedWorkoutSession | undefined,
  planned: PlannedExercise[]
): Record<string, number[]> {
  const out: Record<string, number[]> = {};

  if (persisted?.completedSets) {
    for (const [exerciseId, indexes] of Object.entries(persisted.completedSets)) {
      out[exerciseId] = Array.isArray(indexes) ? [...indexes].sort((a, b) => a - b) : [];
    }
  }

  const completedIds = persisted?.completedExerciseIds ?? [];
  for (const exerciseId of completedIds) {
    if (out[exerciseId] && out[exerciseId].length > 0) continue;
    const plan = planned.find((exercise) => exercise.exerciseId === exerciseId);
    const totalSets = plan?.sets ?? 1;
    out[exerciseId] = Array.from({ length: totalSets }, (_, index) => index);
  }

  return out;
}

function deriveCompletedExerciseIds(
  planned: PlannedExercise[],
  completedSets: Record<string, number[]>
): string[] {
  return planned
    .filter((exercise) => {
      const marked = completedSets[exercise.exerciseId];
      if (!marked) return false;
      return marked.length >= (exercise.sets ?? 1);
    })
    .map((exercise) => exercise.exerciseId);
}

// =============================================================
// Helpers de fechas para UI
// =============================================================

export function formatHistoryLabel(dateKey: string) {
  return capitalize(longDateFormatter.format(fromLocalDateKey(dateKey)));
}

export function getWeekLabel(date: Date) {
  const start = addLocalDays(date, -((date.getDay() + 6) % 7));
  const end = addLocalDays(start, 6);
  return `${capitalize(shortDateFormatter.format(start))} - ${capitalize(shortDateFormatter.format(end))}`;
}
