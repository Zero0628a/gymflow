import { exercises, muscles } from '@/data/mock';
import type { Exercise, Muscle, TrainingDay, TrainingDayStatus } from '@/types';

type ScheduledDay = {
  weekdayIndex: number;
  muscleId: string;
  dayLabel: string;
};

type PersistedTrainingDay = {
  dateKey: string;
  status: Exclude<TrainingDayStatus, 'missed'> | 'pending';
  completedExerciseIds: string[];
  completedAt?: string;
  postponedAt?: string;
};

export type TrainingCalendarStore = {
  version: 1;
  days: Record<string, PersistedTrainingDay>;
};

export const TRAINING_STORAGE_KEY = 'gymflow.training-calendar.v1';

export const WEEKLY_SCHEDULE: ScheduledDay[] = [
  { weekdayIndex: 0, dayLabel: 'Lunes', muscleId: 'pecho' },
  { weekdayIndex: 1, dayLabel: 'Martes', muscleId: 'espalda' },
  { weekdayIndex: 2, dayLabel: 'Miércoles', muscleId: 'piernas' },
  { weekdayIndex: 3, dayLabel: 'Jueves', muscleId: 'hombros' },
  { weekdayIndex: 4, dayLabel: 'Viernes', muscleId: 'biceps' },
  { weekdayIndex: 5, dayLabel: 'Sábado', muscleId: 'triceps' },
  { weekdayIndex: 6, dayLabel: 'Domingo', muscleId: 'abdomen' },
];

const shortDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
});

const longDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function pad(value: number) {
  return String(value).padStart(2, '0');
}

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

export function getMondayWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function getWeekStart(date: Date) {
  return addLocalDays(date, -getMondayWeekdayIndex(date));
}

export function getWeekKey(date: Date) {
  return toLocalDateKey(getWeekStart(date));
}

export function getWeekLabel(date: Date) {
  const start = getWeekStart(date);
  const end = addLocalDays(start, 6);
  return `${capitalize(shortDateFormatter.format(start))} - ${capitalize(shortDateFormatter.format(end))}`;
}

export function createEmptyTrainingStore(): TrainingCalendarStore {
  return {
    version: 1,
    days: {},
  };
}

export function getScheduledDay(date: Date) {
  return WEEKLY_SCHEDULE[getMondayWeekdayIndex(date)];
}

export function getMuscleById(muscleId: string) {
  return muscles.find((muscle) => muscle.id === muscleId);
}

export function getExercisesByMuscle(muscleId: string) {
  return exercises[muscleId] ?? [];
}

export function resolveTrainingDay(input: {
  date: Date;
  todayKey: string;
  persisted?: PersistedTrainingDay;
}): TrainingDay {
  const dateKey = toLocalDateKey(input.date);
  const scheduledDay = getScheduledDay(input.date);
  const muscle = getMuscleById(scheduledDay.muscleId) as Muscle;
  const persisted = input.persisted;

  let status: TrainingDayStatus = persisted?.status ?? 'pending';
  if (dateKey < input.todayKey && status === 'pending') {
    status = 'missed';
  }

  return {
    dateKey,
    dayLabel: scheduledDay.dayLabel,
    shortDateLabel: capitalize(shortDateFormatter.format(input.date)),
    muscleId: scheduledDay.muscleId,
    muscleName: muscle.name,
    muscleColor: muscle.color,
    status,
    isToday: dateKey === input.todayKey,
    isPast: dateKey < input.todayKey,
    isFuture: dateKey > input.todayKey,
    exerciseIds: getExercisesByMuscle(scheduledDay.muscleId).map((exercise) => exercise.id),
    completedExerciseIds: persisted?.completedExerciseIds ?? [],
  };
}

export function getWeekDays(store: TrainingCalendarStore, referenceDate = new Date()) {
  const todayKey = toLocalDateKey(referenceDate);
  const weekStart = getWeekStart(referenceDate);

  return Array.from({ length: 7 }, (_, index) =>
    resolveTrainingDay({
      date: addLocalDays(weekStart, index),
      todayKey,
      persisted: store.days[toLocalDateKey(addLocalDays(weekStart, index))],
    })
  );
}

export function getRecentDays(
  store: TrainingCalendarStore,
  options?: { referenceDate?: Date; days?: number; includePendingToday?: boolean }
) {
  const referenceDate = options?.referenceDate ?? new Date();
  const totalDays = options?.days ?? 21;
  const todayKey = toLocalDateKey(referenceDate);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = addLocalDays(referenceDate, -index);
    return resolveTrainingDay({
      date,
      todayKey,
      persisted: store.days[toLocalDateKey(date)],
    });
  }).filter((day) => options?.includePendingToday || day.status !== 'pending');
}

export function countWeekPostpones(store: TrainingCalendarStore, referenceDate = new Date()) {
  const weekKey = getWeekKey(referenceDate);

  return Object.values(store.days).filter((day) => {
    if (day.status !== 'postponed') {
      return false;
    }

    return getWeekKey(fromLocalDateKey(day.dateKey)) === weekKey;
  }).length;
}

export function formatHistoryLabel(dateKey: string) {
  return capitalize(longDateFormatter.format(fromLocalDateKey(dateKey)));
}

export function setDayRecord(
  store: TrainingCalendarStore,
  record: PersistedTrainingDay
): TrainingCalendarStore {
  return {
    ...store,
    days: {
      ...store.days,
      [record.dateKey]: record,
    },
  };
}

function capitalize(value: string) {
  if (!value.length) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export type { Exercise, PersistedTrainingDay };
