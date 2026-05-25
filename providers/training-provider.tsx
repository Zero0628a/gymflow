import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { db } from '@/lib/firebase';
import {
  addLocalDays,
  createEmptyTrainingStore,
  formatHistoryLabel,
  fromLocalDateKey,
  getWeekLabel,
  resolveTrainingDay,
  toLocalDateKey,
  type PersistedTrainingDay,
  type TrainingCalendarStore,
} from '@/lib/training-calendar';
import { useAuth } from '@/providers/auth-provider';
import { useRoutines } from '@/providers/routines-provider';
import type { ExerciseLog, PlannedExercise, Routine, TrainingActionFailure, TrainingDay } from '@/types';

type TrainingContextValue = {
  loading: boolean;
  todayKey: string;
  today: TrainingDay | null;
  activeRoutine: Routine | null;
  weekLabel: string;
  weekDays: TrainingDay[];
  postponedCount: number;
  recentHistory: Array<TrainingDay & { historyLabel: string }>;
  exerciseLogs: Record<string, ExerciseLog>;
  getTrainingDay: (dateKey: string) => TrainingDay | null;
  toggleExercise: (dateKey: string, exerciseId: string) => Promise<TrainingActionFailure | null>;
  postponeDay: (dateKey: string) => Promise<TrainingActionFailure | null>;
  undoPostponeDay: (dateKey: string) => Promise<TrainingActionFailure | null>;
  getExerciseLog: (dateKey: string, exerciseId: string) => ExerciseLog | null;
  resetTraining: () => Promise<void>;
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const { loading: routinesLoading, routines } = useRoutines();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<TrainingCalendarStore>(createEmptyTrainingStore());
  const [todayKey, setTodayKey] = useState(() => toLocalDateKey(new Date()));
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>({});

  const activeRoutine = useMemo(
    () => routines.find((routine) => routine.status === 'active') ?? null,
    [routines]
  );

  useEffect(() => {
    if (authLoading || routinesLoading) {
      return;
    }

    if (!user) {
      setStore(createEmptyTrainingStore());
      setLoading(false);
      return;
    }

    setLoading(true);

    const trainingDaysRef = collection(db, 'users', user.uid, 'training_days');
    const unsubDays = onSnapshot(
      query(trainingDaysRef),
      (snapshot) => {
        const days = snapshot.docs.reduce<Record<string, PersistedTrainingDay>>((acc, item) => {
          const data = fromTrainingDayDoc(item);
          acc[data.dateKey] = data;
          return acc;
        }, {});

        setStore({ version: 1, days });
        setTodayKey(toLocalDateKey(new Date()));
        setLoading(false);
      },
      (error) => {
        console.error('No se pudo cargar training_days:', error);
        setStore(createEmptyTrainingStore());
        setLoading(false);
      }
    );

    const exerciseLogsRef = collection(db, 'users', user.uid, 'exercise_logs');
    const unsubLogs = onSnapshot(
      query(exerciseLogsRef),
      (snapshot) => {
        const logs = snapshot.docs.reduce<Record<string, ExerciseLog>>((acc, item) => {
          const data = item.data() as ExerciseLog;
          acc[item.id] = { ...data };
          return acc;
        }, {});
        setExerciseLogs(logs);
      },
      (error) => {
        console.error('No se pudo cargar exercise_logs:', error);
      }
    );

    return () => {
      unsubDays();
      unsubLogs();
    };
  }, [authLoading, routinesLoading, user]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTodayKey(toLocalDateKey(new Date()));
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  const value = useMemo<TrainingContextValue>(() => {
    const now = new Date();
    const currentTodayKey = toLocalDateKey(now);

    const resolveDay = (date: Date) => {
      const dateKey = toLocalDateKey(date);
      return resolveTrainingDay({
        date,
        todayKey: currentTodayKey,
        activeRoutine,
        persisted: store.days[dateKey],
        sessionOffset: getPostponedSessionOffset(dateKey, activeRoutine, store.days),
      });
    };

    const today = resolveDay(now);

    // Semana visible: siempre lunes a domingo para que la distribucion
    // de sesiones coincida con el calendario que ve el usuario.
    const weekStart = addLocalDays(now, -((now.getDay() + 6) % 7));

    const weekDays: TrainingDay[] = Array.from({ length: 7 }, (_, index) => {
      const date = addLocalDays(weekStart, index);
      return resolveDay(date);
    });

    const postponedCount = weekDays.filter((day) => day.status === 'postponed').length;

    // Historial: dias persistidos + dias pasados que quedaron missed
    const historyMap = new Map<string, TrainingDay>();

    Object.keys(store.days).forEach((dateKey) => {
      historyMap.set(
        dateKey,
        resolveDay(fromLocalDateKey(dateKey))
      );
    });

    // Si hay rutina activa: incluir dias de la semana activa que esten en el pasado y no marcados
    if (activeRoutine?.cycleStartedAt) {
      for (let index = 0; index < 7; index += 1) {
        const date = addLocalDays(weekStart, index);
        const dateKey = toLocalDateKey(date);
        if (dateKey >= currentTodayKey || historyMap.has(dateKey)) continue;

        const resolved = resolveDay(date);

        if (resolved.status !== 'pending' && resolved.status !== 'rest') {
          historyMap.set(dateKey, resolved);
        }
      }
    }

    const recentHistory = Array.from(historyMap.values())
      .filter((day) => day.status !== 'rest' && day.status !== 'pending')
      .sort((left, right) => right.dateKey.localeCompare(left.dateKey))
      .slice(0, 30)
      .map((day) => ({ ...day, historyLabel: formatHistoryLabel(day.dateKey) }));

    return {
      loading,
      todayKey: currentTodayKey,
      today,
      activeRoutine,
      weekLabel: getWeekLabel(now),
      weekDays,
      postponedCount,
      recentHistory,
      exerciseLogs,
      getTrainingDay(dateKey: string) {
        if (!dateKey) return null;
        return resolveDay(fromLocalDateKey(dateKey));
      },
      getExerciseLog(dateKey: string, exerciseId: string) {
        const key = `${dateKey}_${exerciseId}`;
        return exerciseLogs[key] ?? null;
      },
      async toggleExercise(dateKey: string, exerciseId: string) {
        if (!user) return 'not_today';
        if (dateKey !== currentTodayKey) return 'not_today';

        // Resuelvo el dia de hoy con la rutina activa para validar
        const dayResolved = resolveDay(now);

        if (dayResolved.status === 'rest') return 'not_today';
        if (dayResolved.status === 'postponed') return 'closed_postponed';
        if (dayResolved.status === 'missed') return 'closed_missed';

        // Validar que el exerciseId pertenezca al plan del dia
        const isPlanned = dayResolved.plannedExercises.some((ex) => ex.exerciseId === exerciseId);
        if (!isPlanned) return 'not_today';

        const existing = store.days[dateKey];
        const completedExerciseIds = existing?.completedExerciseIds ?? [];
        const nextExerciseIds = completedExerciseIds.includes(exerciseId)
          ? completedExerciseIds.filter((id) => id !== exerciseId)
          : [...completedExerciseIds, exerciseId];

        const totalPlanned = dayResolved.plannedExercises.length;
        const nextStatus =
          nextExerciseIds.length === 0
            ? 'pending'
            : nextExerciseIds.length >= totalPlanned
              ? 'completed'
              : 'partial';

        await setDoc(
          doc(db, 'users', user.uid, 'training_days', dateKey),
          {
            dateKey,
            status: nextStatus,
            completedExerciseIds: nextExerciseIds,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
            postponedAt: null,
            ...buildTrainingDaySnapshot(dayResolved, activeRoutine),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return null;
      },
      async postponeDay(dateKey: string) {
        if (!user) return 'not_today';
        if (dateKey !== currentTodayKey) return 'not_today';

        const dayResolved = resolveDay(now);

        if (dayResolved.status === 'rest') return 'not_today';
        if (dayResolved.status === 'missed') return 'closed_missed';
        if (dayResolved.status === 'completed') return 'already_completed';
        if (dayResolved.status === 'postponed') return 'closed_postponed';

        await setDoc(
          doc(db, 'users', user.uid, 'training_days', dateKey),
          {
            dateKey,
            status: 'postponed',
            completedExerciseIds: [],
            completedAt: null,
            postponedAt: new Date().toISOString(),
            ...buildTrainingDaySnapshot(dayResolved, activeRoutine),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return null;
      },
      async undoPostponeDay(dateKey: string) {
        if (!user) return 'not_today';
        if (dateKey !== currentTodayKey) return 'not_today';

        const existing = store.days[dateKey];
        if (existing?.status !== 'postponed') return null;

        await setDoc(
          doc(db, 'users', user.uid, 'training_days', dateKey),
          {
            dateKey,
            status: 'pending',
            completedExerciseIds: [],
            completedAt: null,
            postponedAt: null,
            ...buildTrainingDaySnapshot(resolveDay(now), activeRoutine),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return null;
      },
      async resetTraining() {
        if (!user) return;

        const trainingDaysRef = collection(db, 'users', user.uid, 'training_days');
        const snapshot = await getDocs(trainingDaysRef);
        await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
      },
    };
  }, [activeRoutine, exerciseLogs, loading, store, todayKey, user]);

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining() {
  const context = useContext(TrainingContext);

  if (!context) {
    throw new Error('useTraining debe usarse dentro de TrainingProvider');
  }

  return context;
}

function fromTrainingDayDoc(snapshot: QueryDocumentSnapshot) {
  const data = snapshot.data() as Partial<PersistedTrainingDay>;

  return {
    dateKey: snapshot.id,
    status:
      data.status === 'completed' ||
      data.status === 'postponed' ||
      data.status === 'partial'
        ? data.status
        : 'pending',
    completedExerciseIds: Array.isArray(data.completedExerciseIds) ? data.completedExerciseIds : [],
    completedAt: typeof data.completedAt === 'string' ? data.completedAt : undefined,
    postponedAt: typeof data.postponedAt === 'string' ? data.postponedAt : undefined,
    routineId: typeof data.routineId === 'string' ? data.routineId : undefined,
    routineName: typeof data.routineName === 'string' ? data.routineName : undefined,
    sessionLabel: typeof data.sessionLabel === 'string' ? data.sessionLabel : undefined,
    sessionFocus: typeof data.sessionFocus === 'string' ? data.sessionFocus : undefined,
    plannedExercises: parsePlannedExercises(data.plannedExercises),
  } satisfies PersistedTrainingDay;
}

function buildTrainingDaySnapshot(day: TrainingDay, activeRoutine: Routine | null) {
  return {
    routineId: activeRoutine?.id ?? day.routineId ?? null,
    routineName: activeRoutine?.name ?? day.routineName ?? null,
    sessionLabel: day.sessionLabel,
    sessionFocus: day.sessionFocus,
    plannedExercises: sanitizePlannedExercises(day.plannedExercises),
  };
}

function parsePlannedExercises(value: unknown): PlannedExercise[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const exercises = value
    .map((item): PlannedExercise | null => {
      if (!item || typeof item !== 'object') return null;
      const candidate = item as Partial<PlannedExercise>;
      if (typeof candidate.exerciseId !== 'string') return null;

      return {
        exerciseId: candidate.exerciseId,
        sets: typeof candidate.sets === 'number' ? candidate.sets : 3,
        reps: typeof candidate.reps === 'string' ? candidate.reps : '10',
        rest: typeof candidate.rest === 'string' ? candidate.rest : undefined,
        note: typeof candidate.note === 'string' ? candidate.note : undefined,
      };
    })
    .filter((item): item is PlannedExercise => item !== null);

  return exercises.length > 0 ? exercises : undefined;
}

function sanitizePlannedExercises(exercises: PlannedExercise[]): PlannedExercise[] {
  return exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    sets: exercise.sets,
    reps: exercise.reps,
    ...(exercise.rest ? { rest: exercise.rest } : {}),
    ...(exercise.note ? { note: exercise.note } : {}),
  }));
}

function getPostponedSessionOffset(
  dateKey: string,
  activeRoutine: Routine | null,
  days: Record<string, PersistedTrainingDay>
) {
  if (!activeRoutine?.cycleStartedAt) {
    return 0;
  }

  const cycleStartKey = toLocalDateKey(new Date(activeRoutine.cycleStartedAt));

  return Object.values(days).filter(
    (day) => day.status === 'postponed' && day.dateKey >= cycleStartKey && day.dateKey < dateKey
  ).length;
}
