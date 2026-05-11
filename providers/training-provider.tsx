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
import type { Routine, TrainingActionFailure, TrainingDay } from '@/types';

type TrainingContextValue = {
  loading: boolean;
  todayKey: string;
  today: TrainingDay | null;
  activeRoutine: Routine | null;
  weekLabel: string;
  weekDays: TrainingDay[];
  postponedCount: number;
  recentHistory: Array<TrainingDay & { historyLabel: string }>;
  toggleExercise: (dateKey: string, exerciseId: string) => Promise<TrainingActionFailure | null>;
  postponeDay: (dateKey: string) => Promise<TrainingActionFailure | null>;
  resetTraining: () => Promise<void>;
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const { loading: routinesLoading, routines } = useRoutines();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<TrainingCalendarStore>(createEmptyTrainingStore());
  const [todayKey, setTodayKey] = useState(() => toLocalDateKey(new Date()));

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
    const unsubscribe = onSnapshot(
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

    return unsubscribe;
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

    const today = resolveTrainingDay({
      date: now,
      todayKey: currentTodayKey,
      activeRoutine,
      persisted: store.days[currentTodayKey],
    });

    // Semana visible: 7 dias desde el inicio del ciclo de la rutina activa
    // (o desde hoy si no hay rutina, para que la app no se vea vacia).
    const weekStart = activeRoutine?.cycleStartedAt
      ? fromLocalDateKey(toLocalDateKey(new Date(activeRoutine.cycleStartedAt)))
      : addLocalDays(now, -((now.getDay() + 6) % 7));

    const weekDays: TrainingDay[] = Array.from({ length: 7 }, (_, index) => {
      const date = addLocalDays(weekStart, index);
      const dateKey = toLocalDateKey(date);
      return resolveTrainingDay({
        date,
        todayKey: currentTodayKey,
        activeRoutine,
        persisted: store.days[dateKey],
      });
    });

    const postponedCount = weekDays.filter((day) => day.status === 'postponed').length;

    // Historial: dias persistidos + dias pasados que quedaron missed
    const historyMap = new Map<string, TrainingDay>();

    Object.keys(store.days).forEach((dateKey) => {
      historyMap.set(
        dateKey,
        resolveTrainingDay({
          date: fromLocalDateKey(dateKey),
          todayKey: currentTodayKey,
          activeRoutine,
          persisted: store.days[dateKey],
        })
      );
    });

    // Si hay rutina activa: incluir dias del ciclo que esten en el pasado y no marcados
    if (activeRoutine?.cycleStartedAt) {
      const cycleStart = fromLocalDateKey(toLocalDateKey(new Date(activeRoutine.cycleStartedAt)));
      for (let index = 0; index < 7; index += 1) {
        const date = addLocalDays(cycleStart, index);
        const dateKey = toLocalDateKey(date);
        if (dateKey >= currentTodayKey || historyMap.has(dateKey)) continue;

        const resolved = resolveTrainingDay({
          date,
          todayKey: currentTodayKey,
          activeRoutine,
          persisted: store.days[dateKey],
        });

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
      async toggleExercise(dateKey: string, exerciseId: string) {
        if (!user) return 'not_today';
        if (dateKey !== currentTodayKey) return 'not_today';

        // Resuelvo el dia de hoy con la rutina activa para validar
        const dayResolved = resolveTrainingDay({
          date: now,
          todayKey: currentTodayKey,
          activeRoutine,
          persisted: store.days[dateKey],
        });

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
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return null;
      },
      async postponeDay(dateKey: string) {
        if (!user) return 'not_today';
        if (dateKey !== currentTodayKey) return 'not_today';

        const dayResolved = resolveTrainingDay({
          date: now,
          todayKey: currentTodayKey,
          activeRoutine,
          persisted: store.days[dateKey],
        });

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
  }, [activeRoutine, loading, store, todayKey, user]);

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
  } satisfies PersistedTrainingDay;
}
