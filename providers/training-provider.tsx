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
import { CACHE_SCOPES, loadCache, saveCache } from '@/lib/offline-cache';
import { adaptWeeklyPlanToWeekdays } from '@/lib/routine-planner';
import {
  addLocalDays,
  createEmptyTrainingStore,
  formatHistoryLabel,
  fromLocalDateKey,
  getWeekLabel,
  type PersistedWorkoutSession,
  resolveTrainingDay,
  toLocalDateKey,
  type PersistedTrainingDay,
  type TrainingCalendarStore,
} from '@/lib/training-calendar';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';
import { useRoutines } from '@/providers/routines-provider';
import type { ExerciseLog, LoggedSet, PlannedExercise, Routine, TrainingActionFailure, TrainingDay } from '@/types';

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
  replaceExercise: (
    dateKey: string,
    currentExerciseId: string,
    replacement: { exerciseId: string; name: string }
  ) => Promise<TrainingActionFailure | null>;
  saveExerciseLog: (
    dateKey: string,
    exerciseId: string,
    input: { sets: LoggedSet[]; note?: string }
  ) => Promise<TrainingActionFailure | null>;
  postponeDay: (dateKey: string) => Promise<TrainingActionFailure | null>;
  undoPostponeDay: (dateKey: string) => Promise<TrainingActionFailure | null>;
  getExerciseLog: (dateKey: string, exerciseId: string) => ExerciseLog | null;
  resetTraining: () => Promise<void>;
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const { loading: routinesLoading, routines } = useRoutines();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<TrainingCalendarStore>(createEmptyTrainingStore());
  const [todayKey, setTodayKey] = useState(() => toLocalDateKey(new Date()));
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>({});
  const [workoutSessions, setWorkoutSessions] = useState<Record<string, PersistedWorkoutSession>>({});

  const activeRoutine = useMemo(
    () => routines.find((routine) => routine.status === 'active') ?? null,
    [routines]
  );

  const scheduledRoutine = useMemo(() => {
    if (!activeRoutine) {
      return null;
    }

    const trainingWeekdays = profile?.trainingWeekdays;
    if (!trainingWeekdays?.length) {
      return activeRoutine;
    }

    return {
      ...activeRoutine,
      daysPerWeek: trainingWeekdays.length,
      weeklyPlan: adaptWeeklyPlanToWeekdays(activeRoutine.weeklyPlan, trainingWeekdays),
    };
  }, [activeRoutine, profile?.trainingWeekdays]);

  useEffect(() => {
    if (authLoading || routinesLoading) {
      return;
    }

    if (!user) {
      setStore(createEmptyTrainingStore());
      setExerciseLogs({});
      setWorkoutSessions({});
      setLoading(false);
      return;
    }

    setLoading(true);

    // Pre-hidratacion offline-first. El dia de hoy y su sesion son lo primero
    // que el usuario espera ver al abrir la app en el gimnasio aunque no haya
    // internet. Despues Firestore actualiza con datos frescos.
    let cancelled = false;
    Promise.all([
      loadCache<TrainingCalendarStore>(CACHE_SCOPES.trainingDays, user.uid),
      loadCache<Record<string, ExerciseLog>>(CACHE_SCOPES.exerciseLogs, user.uid),
      loadCache<Record<string, PersistedWorkoutSession>>(CACHE_SCOPES.workoutSessions, user.uid),
    ]).then(([cachedStore, cachedLogs, cachedSessions]) => {
      if (cancelled) return;
      if (cachedStore && cachedStore.days) {
        setStore(cachedStore);
        setLoading(false);
      }
      if (cachedLogs) setExerciseLogs(cachedLogs);
      if (cachedSessions) setWorkoutSessions(cachedSessions);
    });

    const trainingDaysRef = collection(db, 'users', user.uid, 'training_days');
    const unsubDays = onSnapshot(
      query(trainingDaysRef),
      (snapshot) => {
        const days = snapshot.docs.reduce<Record<string, PersistedTrainingDay>>((acc, item) => {
          const data = fromTrainingDayDoc(item);
          acc[data.dateKey] = data;
          return acc;
        }, {});

        const nextStore: TrainingCalendarStore = { version: 1, days };
        setStore(nextStore);
        setTodayKey(toLocalDateKey(new Date()));
        setLoading(false);
        void saveCache(CACHE_SCOPES.trainingDays, user.uid, nextStore);
      },
      (error) => {
        console.error('No se pudo cargar training_days:', error);
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
        void saveCache(CACHE_SCOPES.exerciseLogs, user.uid, logs);
      },
      (error) => {
        console.error('No se pudo cargar exercise_logs:', error);
      }
    );

    const workoutSessionsRef = collection(db, 'users', user.uid, 'workout_sessions');
    const unsubSessions = onSnapshot(
      query(workoutSessionsRef),
      (snapshot) => {
        const sessions = snapshot.docs.reduce<Record<string, PersistedWorkoutSession>>((acc, item) => {
          const data = fromWorkoutSessionDoc(item);
          acc[data.dateKey] = data;
          return acc;
        }, {});
        setWorkoutSessions(sessions);
        void saveCache(CACHE_SCOPES.workoutSessions, user.uid, sessions);
      },
      (error) => {
        console.error('No se pudo cargar workout_sessions:', error);
      }
    );

    return () => {
      cancelled = true;
      unsubDays();
      unsubLogs();
      unsubSessions();
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
        activeRoutine: scheduledRoutine,
        persisted: store.days[dateKey],
        sessionOffset: getPostponedSessionOffset(dateKey, scheduledRoutine, store.days),
        trainingWeekdays: profile?.trainingWeekdays,
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

    Object.values(workoutSessions).forEach((session) => {
      const date = fromLocalDateKey(session.dateKey);
      historyMap.set(
        session.dateKey,
        resolveTrainingDay({
          date,
          todayKey: currentTodayKey,
          activeRoutine: scheduledRoutine,
          persisted: session as PersistedTrainingDay,
          sessionOffset: getPostponedSessionOffset(session.dateKey, scheduledRoutine, store.days),
          trainingWeekdays: profile?.trainingWeekdays,
        })
      );
    });

    Object.keys(store.days).forEach((dateKey) => {
      if (historyMap.has(dateKey)) return;
      historyMap.set(dateKey, resolveDay(fromLocalDateKey(dateKey)));
    });

    // Si hay rutina activa: incluir dias de la semana activa que esten en el pasado y no marcados
    if (scheduledRoutine?.cycleStartedAt) {
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
      activeRoutine: scheduledRoutine,
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
            ...buildTrainingDaySnapshot(dayResolved, scheduledRoutine),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        if (nextStatus === 'pending') {
          await deleteDoc(doc(db, 'users', user.uid, 'workout_sessions', dateKey));
        } else {
          await upsertWorkoutSession(user.uid, {
            ...dayResolved,
            status: nextStatus,
            completedExerciseIds: nextExerciseIds,
          });
        }

        return null;
      },
      async replaceExercise(dateKey, currentExerciseId, replacement) {
        if (!user) return 'not_today';
        if (dateKey !== currentTodayKey) return 'not_today';

        const dayResolved = resolveDay(now);
        if (dayResolved.status === 'rest') return 'not_today';
        if (dayResolved.status === 'postponed') return 'closed_postponed';
        if (dayResolved.status === 'missed') return 'closed_missed';

        const plannedExercises = dayResolved.plannedExercises.map((exercise) => {
          if (exercise.exerciseId !== currentExerciseId) return exercise;

          return {
            ...exercise,
            exerciseId: replacement.exerciseId,
            originalExerciseId: exercise.originalExerciseId ?? currentExerciseId,
            replacementName: replacement.name,
          };
        });

        const wasCompleted = dayResolved.completedExerciseIds.includes(currentExerciseId);
        const completedExerciseIds = dayResolved.completedExerciseIds.map((id) =>
          id === currentExerciseId ? replacement.exerciseId : id
        );

        const nextStatus =
          completedExerciseIds.length === 0
            ? 'pending'
            : completedExerciseIds.length >= plannedExercises.length
              ? 'completed'
              : 'partial';

        await setDoc(
          doc(db, 'users', user.uid, 'training_days', dateKey),
          {
            dateKey,
            status: nextStatus,
            completedExerciseIds,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
            postponedAt: null,
            ...buildTrainingDaySnapshot({ ...dayResolved, plannedExercises, completedExerciseIds }, scheduledRoutine),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        if (wasCompleted && nextStatus !== 'pending') {
          await upsertWorkoutSession(user.uid, {
            ...dayResolved,
            status: nextStatus,
            plannedExercises,
            completedExerciseIds,
          });
        }

        return null;
      },
      async saveExerciseLog(dateKey, exerciseId, input) {
        if (!user) return 'not_today';
        if (dateKey !== currentTodayKey) return 'not_today';

        const dayResolved = resolveDay(now);
        if (dayResolved.status === 'rest') return 'not_today';
        if (dayResolved.status === 'postponed') return 'closed_postponed';
        if (dayResolved.status === 'missed') return 'closed_missed';

        const validSets = input.sets
          .filter((set) => Number.isFinite(set.reps) && set.reps > 0)
          .map((set, index) => ({
            setNumber: index + 1,
            reps: set.reps,
            ...(typeof set.weight === 'number' && Number.isFinite(set.weight) ? { weight: set.weight } : {}),
            ...(typeof set.rpe === 'number' && Number.isFinite(set.rpe) ? { rpe: set.rpe } : {}),
          }));

        await setDoc(
          doc(db, 'users', user.uid, 'exercise_logs', `${dateKey}_${exerciseId}`),
          {
            dateKey,
            exerciseId,
            sets: validSets,
            note: input.note?.trim() || null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        const isPlanned = dayResolved.plannedExercises.some((exercise) => exercise.exerciseId === exerciseId);
        if (isPlanned && !dayResolved.completedExerciseIds.includes(exerciseId)) {
          const completedExerciseIds = [...dayResolved.completedExerciseIds, exerciseId];
          const nextStatus =
            completedExerciseIds.length >= dayResolved.plannedExercises.length ? 'completed' : 'partial';

          await setDoc(
            doc(db, 'users', user.uid, 'training_days', dateKey),
            {
              dateKey,
              status: nextStatus,
              completedExerciseIds,
              completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
              postponedAt: null,
              ...buildTrainingDaySnapshot(dayResolved, scheduledRoutine),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );

          await upsertWorkoutSession(user.uid, {
            ...dayResolved,
            status: nextStatus,
            completedExerciseIds,
          });
        }

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
            ...buildTrainingDaySnapshot(dayResolved, scheduledRoutine),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        await upsertWorkoutSession(user.uid, {
          ...dayResolved,
          status: 'postponed',
          completedExerciseIds: [],
          postponedAt: new Date().toISOString(),
        });

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
            ...buildTrainingDaySnapshot(resolveDay(now), scheduledRoutine),
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
  }, [exerciseLogs, loading, profile?.trainingWeekdays, scheduledRoutine, store, todayKey, user, workoutSessions]);

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

function fromWorkoutSessionDoc(snapshot: QueryDocumentSnapshot): PersistedWorkoutSession {
  const data = snapshot.data() as Partial<PersistedWorkoutSession>;
  const status =
    data.status === 'completed' ||
    data.status === 'partial' ||
    data.status === 'postponed' ||
    data.status === 'missed'
      ? data.status
      : 'partial';

  return {
    dateKey: typeof data.dateKey === 'string' ? data.dateKey : snapshot.id,
    status,
    completedExerciseIds: Array.isArray(data.completedExerciseIds) ? data.completedExerciseIds : [],
    completedAt: typeof data.completedAt === 'string' ? data.completedAt : undefined,
    postponedAt: typeof data.postponedAt === 'string' ? data.postponedAt : undefined,
    routineId: typeof data.routineId === 'string' ? data.routineId : undefined,
    routineName: typeof data.routineName === 'string' ? data.routineName : undefined,
    sessionLabel: typeof data.sessionLabel === 'string' ? data.sessionLabel : undefined,
    sessionFocus: typeof data.sessionFocus === 'string' ? data.sessionFocus : undefined,
    plannedExercises: parsePlannedExercises(data.plannedExercises),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  };
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

async function upsertWorkoutSession(
  uid: string,
  day: TrainingDay & {
    status: Extract<TrainingDay['status'], 'partial' | 'completed' | 'postponed' | 'missed'>;
    completedAt?: string;
    postponedAt?: string;
  }
) {
  const now = new Date().toISOString();

  await setDoc(
    doc(db, 'users', uid, 'workout_sessions', day.dateKey),
    {
      dateKey: day.dateKey,
      status: day.status,
      completedExerciseIds: day.completedExerciseIds,
      completedAt: day.status === 'completed' ? day.completedAt ?? now : null,
      postponedAt: day.status === 'postponed' ? day.postponedAt ?? now : null,
      routineId: day.routineId ?? null,
      routineName: day.routineName ?? null,
      sessionLabel: day.sessionLabel,
      sessionFocus: day.sessionFocus,
      plannedExercises: sanitizePlannedExercises(day.plannedExercises),
      updatedAt: now,
    },
    { merge: true }
  );
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
        originalExerciseId: typeof candidate.originalExerciseId === 'string' ? candidate.originalExerciseId : undefined,
        replacementName: typeof candidate.replacementName === 'string' ? candidate.replacementName : undefined,
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
    ...(exercise.originalExerciseId ? { originalExerciseId: exercise.originalExerciseId } : {}),
    ...(exercise.replacementName ? { replacementName: exercise.replacementName } : {}),
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
