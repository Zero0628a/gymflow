import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
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
import { useAuth } from '@/providers/auth-provider';
import type { Routine } from '@/types';

type CreateRoutineInput = {
  name: string;
  exerciseIds: string[];
};

type RoutinesContextValue = {
  loading: boolean;
  routines: Routine[];
  createRoutine: (input: CreateRoutineInput) => Promise<void>;
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

    const routinesRef = collection(db, 'users', user.uid, 'routines');
    const unsubscribe = onSnapshot(
      query(routinesRef, orderBy('createdAt', 'desc')),
      (snapshot) => {
        setRoutines(snapshot.docs.map(fromRoutineDoc));
        setLoading(false);
      },
      (error) => {
        console.error('No se pudo cargar routines:', error);
        setRoutines([]);
        setLoading(false);
      }
    );

    return unsubscribe;
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
        await addDoc(collection(db, 'users', user.uid, 'routines'), {
          name: input.name.trim(),
          exerciseIds: input.exerciseIds,
          createdAt: now.toISOString(),
        });
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
  const data = snapshot.data() as Partial<Routine>;

  return {
    id: snapshot.id,
    name: typeof data.name === 'string' ? data.name : 'Rutina',
    exerciseIds: Array.isArray(data.exerciseIds) ? data.exerciseIds : [],
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
  };
}
