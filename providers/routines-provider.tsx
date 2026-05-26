import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
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
import { useAuth } from '@/providers/auth-provider';
import type {
  PlannedDay,
  Routine,
  RoutineEquipmentSetup,
  RoutineGoal,
  RoutineLevel,
  RoutineSource,
  RoutineSplit,
  RoutineStatus,
} from '@/types';

type CreateRoutineInput = {
  name: string;
  exerciseIds: string[];
  status?: RoutineStatus;
  source?: RoutineSource;
  focusLabel?: string;
  description?: string;
  level?: RoutineLevel;
  goal?: RoutineGoal;
  daysPerWeek?: number;
  equipment?: RoutineEquipmentSetup;
  split?: RoutineSplit;
  weeklyPlan?: PlannedDay[];
};

type UpdateRoutineInput = {
  name: string;
  exerciseIds: string[];
  daysPerWeek?: number;
  weeklyPlan?: import('@/types').PlannedDay[];
  focusLabel?: string;
};

type RoutinesContextValue = {
  loading: boolean;
  routines: Routine[];
  createRoutine: (input: CreateRoutineInput) => Promise<void>;
  updateRoutine: (routineId: string, input: UpdateRoutineInput) => Promise<void>;
  activateRoutine: (routineId: string) => Promise<void>;
  archiveRoutine: (routineId: string) => Promise<void>;
  duplicateRoutine: (routineId: string) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
};

const RoutinesContext = createContext<RoutinesContextValue | null>(null);

export function RoutinesProvider({ children }: PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setRoutines([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Pre-hidratacion desde cache local por usuario. Da algo visible al instante
    // y mientras tanto Firestore sincroniza.
    let cancelled = false;
    loadCache<Routine[]>(CACHE_SCOPES.routines, user.uid).then((cached) => {
      if (!cancelled && cached?.length) {
        setRoutines(cached);
        setLoading(false);
      }
    });

    const routinesRef = collection(db, 'users', user.uid, 'routines');
    const unsubscribe = onSnapshot(
      query(routinesRef, orderBy('createdAt', 'desc')),
      (snapshot) => {
        const fresh = snapshot.docs.map(fromRoutineDoc);
        setRoutines(fresh);
        setLoading(false);
        void saveCache(CACHE_SCOPES.routines, user.uid, fresh);
      },
      (error) => {
        console.error('No se pudo cargar routines:', error);
        // Si Firestore falla y no hubo cache previa, no pisamos lo que ya esta.
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authLoading, user]);

  const value = useMemo<RoutinesContextValue>(
    () => ({
      loading,
      routines,
      async createRoutine(input: CreateRoutineInput) {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        const now = new Date();
        const willBeActive = input.status === 'active';

        // Si esta rutina se crea como activa, las demas activas pasan a 'ready'
        // y reseteamos training_days (semana nueva).
        if (willBeActive) {
          const currentlyActive = routines.filter((routine) => routine.status === 'active');
          await Promise.all(
            currentlyActive.map((routine) =>
              updateDoc(doc(db, 'users', user.uid, 'routines', routine.id), {
                status: 'ready',
                updatedAt: now.toISOString(),
              })
            )
          );
          await resetTrainingDaysForUser(user.uid);
        }

        await addDoc(collection(db, 'users', user.uid, 'routines'), {
          name: input.name.trim(),
          exerciseIds: input.exerciseIds,
          focusLabel: input.focusLabel?.trim() || null,
          source: input.source ?? 'custom',
          status: input.status ?? 'ready',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          lastUsedAt: willBeActive ? now.toISOString() : null,
          cycleStartedAt: willBeActive ? now.toISOString() : null,
          description: input.description ?? null,
          level: input.level ?? null,
          goal: input.goal ?? null,
          daysPerWeek: input.daysPerWeek ?? null,
          equipment: input.equipment ?? null,
          split: input.split ?? null,
          weeklyPlan: sanitizeWeeklyPlan(input.weeklyPlan),
        });
      },
      async updateRoutine(routineId: string, input: UpdateRoutineInput) {
        if (!user) throw new Error('Usuario no autenticado');

        const currentRoutine = routines.find((routine) => routine.id === routineId);
        const nextUpdatedAt = new Date().toISOString();
        const isActiveRoutine = currentRoutine?.status === 'active';

        if (isActiveRoutine) {
          await resetTrainingDaysForUser(user.uid);
        }

        await updateDoc(doc(db, 'users', user.uid, 'routines', routineId), {
          name: input.name.trim(),
          exerciseIds: input.exerciseIds,
          ...(input.daysPerWeek != null && { daysPerWeek: input.daysPerWeek }),
          ...(input.focusLabel != null && { focusLabel: input.focusLabel }),
          ...(input.weeklyPlan != null && { weeklyPlan: sanitizeWeeklyPlan(input.weeklyPlan) }),
          ...(isActiveRoutine && { cycleStartedAt: nextUpdatedAt, lastUsedAt: nextUpdatedAt }),
          updatedAt: nextUpdatedAt,
        });
      },
      async activateRoutine(routineId: string) {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        const now = new Date().toISOString();
        const otherActive = routines.filter((routine) => routine.status === 'active' && routine.id !== routineId);

        // Resetear training_days ANTES de cambiar la rutina: semana nueva limpia.
        await resetTrainingDaysForUser(user.uid);

        await Promise.all([
          ...otherActive.map((routine) =>
            updateDoc(doc(db, 'users', user.uid, 'routines', routine.id), {
              status: 'ready',
              updatedAt: now,
            })
          ),
          updateDoc(doc(db, 'users', user.uid, 'routines', routineId), {
            status: 'active',
            lastUsedAt: now,
            updatedAt: now,
            cycleStartedAt: now,
          }),
        ]);
      },
      async archiveRoutine(routineId: string) {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        await updateDoc(doc(db, 'users', user.uid, 'routines', routineId), {
          status: 'archived',
          updatedAt: new Date().toISOString(),
        });
      },
      async duplicateRoutine(routineId: string) {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        const routine = routines.find((entry) => entry.id === routineId);
        if (!routine) {
          throw new Error('Rutina no encontrada');
        }

        const now = new Date().toISOString();
        await addDoc(collection(db, 'users', user.uid, 'routines'), {
          name: `${routine.name} copia`,
          exerciseIds: routine.exerciseIds,
          focusLabel: routine.focusLabel ?? null,
          source: 'custom',
          status: 'ready',
          createdAt: now,
          updatedAt: now,
          lastUsedAt: null,
          cycleStartedAt: null,
          description: routine.description ?? null,
          level: routine.level ?? null,
          goal: routine.goal ?? null,
          daysPerWeek: routine.daysPerWeek ?? null,
          equipment: routine.equipment ?? null,
          split: routine.split ?? null,
          weeklyPlan: sanitizeWeeklyPlan(routine.weeklyPlan),
        });
      },
      async deleteRoutine(routineId: string) {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        await deleteDoc(doc(db, 'users', user.uid, 'routines', routineId));
      },
    }),
    [loading, routines, user]
  );

  return <RoutinesContext.Provider value={value}>{children}</RoutinesContext.Provider>;
}

export function useRoutines() {
  const context = useContext(RoutinesContext);

  if (!context) {
    throw new Error('useRoutines debe usarse dentro de RoutinesProvider');
  }

  return context;
}

function fromRoutineDoc(snapshot: QueryDocumentSnapshot): Routine {
  const data = snapshot.data() as Partial<Routine> & { weeklyPlan?: unknown };

  return {
    id: snapshot.id,
    name: typeof data.name === 'string' ? data.name : 'Rutina',
    exerciseIds: Array.isArray(data.exerciseIds) ? data.exerciseIds : [],
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    lastUsedAt: typeof data.lastUsedAt === 'string' ? data.lastUsedAt : undefined,
    status: isRoutineStatus(data.status) ? data.status : 'ready',
    source: data.source === 'template' ? 'template' : 'custom',
    focusLabel: typeof data.focusLabel === 'string' ? data.focusLabel : undefined,
    description: typeof data.description === 'string' ? data.description : undefined,
    level:
      data.level === 'beginner' || data.level === 'intermediate' || data.level === 'advanced'
        ? data.level
        : undefined,
    goal:
      data.goal === 'strength' || data.goal === 'hypertrophy' || data.goal === 'endurance' || data.goal === 'general'
        ? data.goal
        : undefined,
    daysPerWeek: typeof data.daysPerWeek === 'number' ? data.daysPerWeek : undefined,
    equipment: data.equipment === 'home' || data.equipment === 'gym' ? data.equipment : undefined,
    split:
      data.split === 'full-body' ||
      data.split === 'upper-lower' ||
      data.split === 'ppl' ||
      data.split === 'bro-split' ||
      data.split === 'home-circuit'
        ? data.split
        : undefined,
    weeklyPlan: Array.isArray(data.weeklyPlan) ? (data.weeklyPlan as Routine['weeklyPlan']) : undefined,
    cycleStartedAt: typeof data.cycleStartedAt === 'string' ? data.cycleStartedAt : undefined,
  };
}

async function resetTrainingDaysForUser(uid: string) {
  const trainingDaysRef = collection(db, 'users', uid, 'training_days');
  const snapshot = await getDocs(trainingDaysRef);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => {
    const data = item.data();
    const status = data.status;

    if (status === 'completed' || status === 'partial' || status === 'postponed') {
      batch.set(
        doc(db, 'users', uid, 'workout_sessions', item.id),
        {
          dateKey: typeof data.dateKey === 'string' ? data.dateKey : item.id,
          status,
          completedExerciseIds: Array.isArray(data.completedExerciseIds) ? data.completedExerciseIds : [],
          completedAt: typeof data.completedAt === 'string' ? data.completedAt : null,
          postponedAt: typeof data.postponedAt === 'string' ? data.postponedAt : null,
          routineId: typeof data.routineId === 'string' ? data.routineId : null,
          routineName: typeof data.routineName === 'string' ? data.routineName : null,
          sessionLabel: typeof data.sessionLabel === 'string' ? data.sessionLabel : null,
          sessionFocus: typeof data.sessionFocus === 'string' ? data.sessionFocus : null,
          plannedExercises: Array.isArray(data.plannedExercises) ? data.plannedExercises : [],
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    batch.delete(item.ref);
  });
  await batch.commit();
}

function sanitizeWeeklyPlan(weeklyPlan: PlannedDay[] | undefined): PlannedDay[] {
  if (!Array.isArray(weeklyPlan)) {
    return [];
  }

  // Firestore rechaza `undefined`. Sustituimos campos opcionales por null
  // y nos aseguramos de que todo sea serializable.
  return weeklyPlan.map((day) => ({
    label: day.label ?? '',
    focus: day.focus ?? '',
    exercises: (day.exercises ?? []).map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      rest: exercise.rest ?? null,
      note: exercise.note ?? null,
    })) as PlannedDay['exercises'],
  }));
}

function isRoutineStatus(value: unknown): value is RoutineStatus {
  return value === 'draft' || value === 'ready' || value === 'active' || value === 'archived';
}
