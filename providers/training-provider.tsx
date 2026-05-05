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
  countWeekPostpones,
  createEmptyTrainingStore,
  formatHistoryLabel,
  getWeekDays,
  getWeekLabel,
  getWeekStart,
  resolveTrainingDay,
  toLocalDateKey,
  fromLocalDateKey,
  type PersistedTrainingDay,
  type TrainingCalendarStore,
} from '@/lib/training-calendar';
import { useAuth } from '@/providers/auth-provider';
import type { TrainingActionFailure, TrainingDay } from '@/types';

type TrainingContextValue = {
  loading: boolean;
  todayKey: string;
  currentWeek: TrainingDay[];
  weekLabel: string;
  postponedCount: number;
  recentHistory: Array<TrainingDay & { historyLabel: string }>;
  toggleExercise: (dateKey: string, exerciseId: string) => Promise<TrainingActionFailure | null>;
  postponeDay: (dateKey: string) => Promise<TrainingActionFailure | null>;
  resetTraining: () => Promise<void>;
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<TrainingCalendarStore>(createEmptyTrainingStore());
  const [todayKey, setTodayKey] = useState(() => toLocalDateKey(new Date()));

  useEffect(() => {
    if (authLoading) {
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

        setStore({
          version: 1,
          days,
        });
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
  }, [authLoading, user]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTodayKey(toLocalDateKey(new Date()));
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  const value = useMemo<TrainingContextValue>(() => {
    const now = new Date();
    const currentWeek = getWeekDays(store, now);
    const postponedCount = countWeekPostpones(store, now);
    const todayKeyForHistory = toLocalDateKey(now);
    const weekStart = getWeekStart(now);
    const historyMap = new Map<string, TrainingDay>();

    Object.keys(store.days).forEach((dateKey) => {
      historyMap.set(
        dateKey,
        resolveTrainingDay({
          date: fromLocalDateKey(dateKey),
          todayKey: todayKeyForHistory,
          persisted: store.days[dateKey],
        })
      );
    });

    for (let index = 0; index < 7; index += 1) {
      const date = addLocalDays(weekStart, index);
      const dateKey = toLocalDateKey(date);

      if (dateKey >= todayKeyForHistory || historyMap.has(dateKey)) {
        continue;
      }

      const resolvedDay = resolveTrainingDay({
        date,
        todayKey: todayKeyForHistory,
        persisted: store.days[dateKey],
      });

      if (resolvedDay.status !== 'pending') {
        historyMap.set(dateKey, resolvedDay);
      }
    }

    const recentHistory = Array.from(historyMap.values())
      .sort((left, right) => right.dateKey.localeCompare(left.dateKey))
      .slice(0, 21)
      .map((day) => ({
      ...day,
      historyLabel: formatHistoryLabel(day.dateKey),
    }));

    return {
      loading,
      todayKey,
      currentWeek,
      weekLabel: getWeekLabel(now),
      postponedCount,
      recentHistory,
      async toggleExercise(dateKey: string, exerciseId: string) {
        if (!user) {
          return 'not_today';
        }

        const currentTodayKey = toLocalDateKey(new Date());
        const day = getWeekDays(store, new Date()).find((item) => item.dateKey === dateKey);

        if (!day || dateKey !== currentTodayKey) {
          return 'not_today';
        }

        if (day.status === 'missed') {
          return 'closed_missed';
        }

        if (day.status === 'postponed') {
          return 'closed_postponed';
        }

        const existing = store.days[dateKey];
        const completedExerciseIds = existing?.completedExerciseIds ?? [];
        const nextExerciseIds = completedExerciseIds.includes(exerciseId)
          ? completedExerciseIds.filter((id) => id !== exerciseId)
          : [...completedExerciseIds, exerciseId];

        await setDoc(
          doc(db, 'users', user.uid, 'training_days', dateKey),
          {
            dateKey,
            status: nextExerciseIds.length > 0 ? 'completed' : 'pending',
            completedExerciseIds: nextExerciseIds,
            completedAt: nextExerciseIds.length > 0 ? new Date().toISOString() : null,
            postponedAt: null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return null;
      },
      async postponeDay(dateKey: string) {
        if (!user) {
          return 'not_today';
        }

        const currentTodayKey = toLocalDateKey(new Date());
        const day = getWeekDays(store, new Date()).find((item) => item.dateKey === dateKey);

        if (!day || dateKey !== currentTodayKey) {
          return 'not_today';
        }

        if (day.status === 'missed') {
          return 'closed_missed';
        }

        if (day.status === 'completed') {
          return 'already_completed';
        }

        if (day.status === 'postponed') {
          return 'closed_postponed';
        }

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
        if (!user) {
          return;
        }

        const trainingDaysRef = collection(db, 'users', user.uid, 'training_days');
        const snapshot = await getDocs(trainingDaysRef);

        await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
      },
    };
  }, [loading, store, todayKey, user]);

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
    status: data.status === 'completed' || data.status === 'postponed' ? data.status : 'pending',
    completedExerciseIds: Array.isArray(data.completedExerciseIds) ? data.completedExerciseIds : [],
    completedAt: typeof data.completedAt === 'string' ? data.completedAt : undefined,
    postponedAt: typeof data.postponedAt === 'string' ? data.postponedAt : undefined,
  } satisfies PersistedTrainingDay;
}
