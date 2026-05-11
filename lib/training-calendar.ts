import type {
  PlannedDay,
  PlannedExercise,
  Routine,
  TrainingDay,
  TrainingDayStatus,
} from '@/types';

// Estado persistido por dia. dateKey = 'YYYY-MM-DD' local.
export type PersistedTrainingDay = {
  dateKey: string;
  status: Exclude<TrainingDayStatus, 'missed' | 'rest'> | 'pending';
  completedExerciseIds: string[];
  completedAt?: string;
  postponedAt?: string;
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
// Patrones de dias de entrenamiento dentro de una semana de 7 dias.
// El indice 0 = primer dia del ciclo (NO es lunes; es el dia de activacion).
// true = dia de entrenamiento, false = descanso.
// =============================================================

const TRAINING_PATTERN: Record<number, boolean[]> = {
  3: [true, false, true, false, true, false, false],
  4: [true, true, false, true, true, false, false],
  5: [true, true, true, true, true, false, false],
  6: [true, true, true, true, true, true, false],
  7: [true, true, true, true, true, true, true],
};

function getPatternForDays(daysPerWeek: number): boolean[] {
  if (TRAINING_PATTERN[daysPerWeek]) {
    return TRAINING_PATTERN[daysPerWeek];
  }
  // Fallback razonable: si daysPerWeek < 3, entrenar dias seguidos al inicio.
  return Array.from({ length: 7 }, (_, i) => i < Math.max(1, Math.min(daysPerWeek, 7)));
}

// =============================================================
// Para una fecha dada, dado el cycleStartedAt, devolvemos:
//   - cycleDayIndex (1-based) dentro de la semana actual (1..7)
//   - sessionIndex en weeklyPlan (rotando con modulo) o null si descanso
// =============================================================

export type RoutineSessionInfo = {
  cycleDayIndex: number; // 1..7
  sessionIndex: number | null; // null si descanso
  isTrainingDay: boolean;
};

export function getRoutineSessionInfo(
  date: Date,
  routine: Routine | null
): RoutineSessionInfo | null {
  if (!routine || !routine.cycleStartedAt) {
    return null;
  }

  const start = fromLocalDateKey(toLocalDateKey(new Date(routine.cycleStartedAt)));
  const daysSinceStart = diffInDays(start, date);
  if (daysSinceStart < 0) {
    // Fecha anterior al inicio del ciclo: no aplicamos rutina.
    return null;
  }

  const daysPerWeek = routine.daysPerWeek ?? Math.max(routine.weeklyPlan?.length ?? 3, 1);
  const pattern = getPatternForDays(daysPerWeek);

  const weekday = daysSinceStart % 7;
  const isTrainingDay = pattern[weekday];

  if (!isTrainingDay) {
    return {
      cycleDayIndex: weekday + 1,
      sessionIndex: null,
      isTrainingDay: false,
    };
  }

  // Cuantos dias de entrenamiento hubo desde el inicio hasta este dia (inclusive).
  let trainingCount = 0;
  for (let i = 0; i <= weekday; i += 1) {
    if (pattern[i]) trainingCount += 1;
  }

  // Mapeamos a sessionIndex del weeklyPlan con modulo.
  const planLength = routine.weeklyPlan?.length ?? 0;
  if (planLength === 0) {
    return {
      cycleDayIndex: weekday + 1,
      sessionIndex: null,
      isTrainingDay: true,
    };
  }

  const sessionIndex = (trainingCount - 1) % planLength;

  return {
    cycleDayIndex: weekday + 1,
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
}): TrainingDay {
  const { date, todayKey, activeRoutine, persisted } = input;
  const dateKey = toLocalDateKey(date);
  const session = getRoutineSessionInfo(date, activeRoutine);

  const dayLabel = capitalize(dayNameFormatter.format(date));
  const shortDateLabel = capitalize(shortDateFormatter.format(date));
  const isToday = dateKey === todayKey;
  const isPast = dateKey < todayKey;
  const isFuture = dateKey > todayKey;

  // Sin rutina activa: el dia no entra al sistema, lo tratamos como descanso "sin rutina".
  if (!session) {
    return {
      dateKey,
      dayLabel,
      shortDateLabel,
      status: persisted?.status === 'postponed' ? 'postponed' : 'rest',
      isToday,
      isPast,
      isFuture,
      cycleDayIndex: 0,
      sessionIndex: null,
      sessionLabel: 'Sin rutina activa',
      sessionFocus: '',
      plannedExercises: [],
      completedExerciseIds: [],
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
      sessionLabel: 'Descanso',
      sessionFocus: 'Dia de recuperacion',
      plannedExercises: [],
      completedExerciseIds: [],
      accentColor: '#2F6BFF',
    };
  }

  // Dia de entrenamiento: agarramos la sesion correspondiente del weeklyPlan.
  const planDay: PlannedDay | undefined =
    session.sessionIndex !== null && activeRoutine?.weeklyPlan
      ? activeRoutine.weeklyPlan[session.sessionIndex]
      : undefined;

  const plannedExercises: PlannedExercise[] = planDay?.exercises ?? [];
  const completedExerciseIds = persisted?.completedExerciseIds ?? [];

  // Status:
  //   - postponed se mantiene si esta persistido
  //   - completed cuando completedExerciseIds.length === plannedExercises.length (TODOS)
  //   - partial cuando hay algunos pero no todos
  //   - pending por defecto
  //   - missed solo si la fecha ya paso y no se complete ni se pospuso
  let status: TrainingDayStatus = 'pending';

  if (persisted?.status === 'postponed') {
    status = 'postponed';
  } else if (plannedExercises.length > 0 && completedExerciseIds.length >= plannedExercises.length) {
    status = 'completed';
  } else if (completedExerciseIds.length > 0) {
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
    sessionLabel: planDay?.label ?? `Sesion ${(session.sessionIndex ?? 0) + 1}`,
    sessionFocus: planDay?.focus ?? '',
    plannedExercises,
    completedExerciseIds,
    accentColor: '#2F6BFF',
  };
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
