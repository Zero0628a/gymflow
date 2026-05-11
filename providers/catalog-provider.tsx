import {
  collection,
  doc,
  onSnapshot,
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
import { getMuscleImage } from '@/lib/catalog-assets';
import {
  seedExercises,
  seedMuscles,
  seedRoutineTemplates,
  seedVariants,
} from '@/data/catalog-seed';
import type {
  EquipmentTag,
  Exercise,
  Muscle,
  PlannedDay,
  Routine,
  RoutineEquipmentSetup,
  RoutineGoal,
  RoutineLevel,
  RoutineSplit,
  Variant,
} from '@/types';

type CatalogContextValue = {
  loading: boolean;
  muscles: Muscle[];
  exercises: Exercise[];
  variants: Variant[];
  routineTemplates: Routine[];
  getMuscleById: (muscleId: string) => Muscle | undefined;
  getExercisesByMuscle: (muscleId: string) => Exercise[];
  getExerciseById: (exerciseId: string) => Exercise | undefined;
  getVariantsByExercise: (exerciseId: string) => Variant[];
  seedCatalog: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [routineTemplates, setRoutineTemplates] = useState<Routine[]>([]);

  useEffect(() => {
    const readyState = {
      muscles: false,
      exercises: false,
      variants: false,
      templates: false,
    };

    function markReady(key: keyof typeof readyState) {
      readyState[key] = true;
      if (Object.values(readyState).every(Boolean)) {
        setLoading(false);
      }
    }

    const unsubscribes = [
      onSnapshot(
        collection(db, 'muscles'),
        (snapshot) => {
          const remote = snapshot.docs.map(fromMuscleDoc).sort(bySortOrderThenName);
          setMuscles(remote.length > 0 ? remote : withMuscleImages(seedMuscles));
          markReady('muscles');
        },
        (error) => {
          console.error('No se pudo cargar muscles:', error);
          setMuscles(withMuscleImages(seedMuscles));
          markReady('muscles');
        }
      ),
      onSnapshot(
        collection(db, 'exercises'),
        (snapshot) => {
          const remote = snapshot.docs.map(fromExerciseDoc).sort(bySortOrderThenName);
          setExercises(remote.length > 0 ? remote : seedExercises);
          markReady('exercises');
        },
        (error) => {
          console.error('No se pudo cargar exercises:', error);
          setExercises(seedExercises);
          markReady('exercises');
        }
      ),
      onSnapshot(
        collection(db, 'variants'),
        (snapshot) => {
          const remote = snapshot.docs.map(fromVariantDoc).sort(bySortOrderThenName);
          setVariants(remote.length > 0 ? remote : seedVariants);
          markReady('variants');
        },
        (error) => {
          console.error('No se pudo cargar variants:', error);
          setVariants(seedVariants);
          markReady('variants');
        }
      ),
      onSnapshot(
        collection(db, 'routine_templates'),
        (snapshot) => {
          const remote = snapshot.docs.map(fromRoutineTemplateDoc).sort(bySortOrderThenName);
          // Fallback a seed local cuando Firestore no esta poblada todavia.
          // Garantiza que el onboarding tenga rutinas que ofrecer al primer usuario.
          setRoutineTemplates(remote.length > 0 ? remote : seedRoutineTemplates);
          markReady('templates');
        },
        (error) => {
          console.error('No se pudo cargar routine_templates:', error);
          setRoutineTemplates(seedRoutineTemplates);
          markReady('templates');
        }
      ),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      loading,
      muscles,
      exercises,
      variants,
      routineTemplates,
      getMuscleById(muscleId: string) {
        return muscles.find((muscle) => muscle.id === muscleId);
      },
      getExercisesByMuscle(muscleId: string) {
        return exercises.filter((exercise) => exercise.muscleId === muscleId);
      },
      getExerciseById(exerciseId: string) {
        return exercises.find((exercise) => exercise.id === exerciseId);
      },
      getVariantsByExercise(exerciseId: string) {
        return variants.filter((variant) => variant.exerciseId === exerciseId);
      },
      async seedCatalog() {
        const batch = writeBatch(db);

        seedMuscles.forEach((muscle) => {
          batch.set(doc(db, 'muscles', muscle.id), {
            name: muscle.name,
            icon: muscle.icon,
            color: muscle.color,
            imageKey: muscle.imageKey ?? null,
            sortOrder: muscle.sortOrder ?? 0,
          });
        });

        seedExercises.forEach((exercise) => {
          batch.set(doc(db, 'exercises', exercise.id), {
            muscleId: exercise.muscleId,
            name: exercise.name,
            description: exercise.description,
            equipment: exercise.equipment ?? [],
            sortOrder: exercise.sortOrder ?? 0,
          });
        });

        seedVariants.forEach((variant) => {
          batch.set(doc(db, 'variants', variant.id), {
            exerciseId: variant.exerciseId,
            name: variant.name,
            description: variant.description,
            sortOrder: variant.sortOrder ?? 0,
          });
        });

        seedRoutineTemplates.forEach((routine) => {
          batch.set(doc(db, 'routine_templates', routine.id), {
            name: routine.name,
            description: routine.description ?? null,
            exerciseIds: routine.exerciseIds,
            focusLabel: routine.focusLabel ?? null,
            status: routine.status,
            source: routine.source,
            createdAt: routine.createdAt,
            updatedAt: routine.updatedAt ?? routine.createdAt,
            level: routine.level ?? null,
            goal: routine.goal ?? null,
            daysPerWeek: routine.daysPerWeek ?? null,
            equipment: routine.equipment ?? null,
            split: routine.split ?? null,
            weeklyPlan: routine.weeklyPlan ?? [],
            sortOrder: routine.sortOrder ?? 0,
          });
        });

        await batch.commit();
      },
    }),
    [loading, muscles, exercises, variants, routineTemplates]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error('useCatalog debe usarse dentro de CatalogProvider');
  }

  return context;
}

function fromMuscleDoc(snapshot: QueryDocumentSnapshot): Muscle {
  const data = snapshot.data() as Partial<Muscle>;

  return {
    id: snapshot.id,
    name: typeof data.name === 'string' ? data.name : 'Musculo',
    icon: typeof data.icon === 'string' ? data.icon : 'barbell-outline',
    color: typeof data.color === 'string' ? data.color : '#2F6BFF',
    imageKey: typeof data.imageKey === 'string' ? data.imageKey : undefined,
    image: getMuscleImage(typeof data.imageKey === 'string' ? data.imageKey : undefined),
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : undefined,
  };
}

const EQUIPMENT_VALUES: ReadonlyArray<EquipmentTag> = [
  'bodyweight',
  'dumbbell',
  'barbell',
  'machine',
  'cable',
  'band',
  'kettlebell',
];

function fromExerciseDoc(snapshot: QueryDocumentSnapshot): Exercise {
  const data = snapshot.data() as Partial<Exercise> & { equipment?: unknown };

  return {
    id: snapshot.id,
    muscleId: typeof data.muscleId === 'string' ? data.muscleId : '',
    name: typeof data.name === 'string' ? data.name : 'Ejercicio',
    description: typeof data.description === 'string' ? data.description : '',
    equipment: Array.isArray(data.equipment)
      ? (data.equipment.filter((tag): tag is EquipmentTag =>
          typeof tag === 'string' && EQUIPMENT_VALUES.includes(tag as EquipmentTag)
        ))
      : undefined,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : undefined,
  };
}

function fromVariantDoc(snapshot: QueryDocumentSnapshot): Variant {
  const data = snapshot.data() as Partial<Variant>;

  return {
    id: snapshot.id,
    exerciseId: typeof data.exerciseId === 'string' ? data.exerciseId : '',
    name: typeof data.name === 'string' ? data.name : 'Variante',
    description: typeof data.description === 'string' ? data.description : '',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : undefined,
  };
}

const LEVELS: ReadonlyArray<RoutineLevel> = ['beginner', 'intermediate', 'advanced'];
const GOALS: ReadonlyArray<RoutineGoal> = ['strength', 'hypertrophy', 'endurance', 'general'];
const EQUIPMENT_SETUPS: ReadonlyArray<RoutineEquipmentSetup> = ['home', 'gym'];
const SPLITS: ReadonlyArray<RoutineSplit> = ['full-body', 'upper-lower', 'ppl', 'bro-split', 'home-circuit'];

function parseEnum<T extends string>(value: unknown, allowed: ReadonlyArray<T>): T | undefined {
  return typeof value === 'string' && (allowed as ReadonlyArray<string>).includes(value)
    ? (value as T)
    : undefined;
}

function parseWeeklyPlan(value: unknown): PlannedDay[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((entry): PlannedDay | null => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const candidate = entry as Partial<PlannedDay>;
      const exercises = Array.isArray(candidate.exercises)
        ? candidate.exercises
            .map((item) => {
              if (!item || typeof item !== 'object') return null;
              const exercise = item as unknown as Record<string, unknown>;
              if (typeof exercise.exerciseId !== 'string') return null;
              return {
                exerciseId: exercise.exerciseId,
                sets: typeof exercise.sets === 'number' ? exercise.sets : 3,
                reps: typeof exercise.reps === 'string' ? exercise.reps : '10',
                rest: typeof exercise.rest === 'string' ? exercise.rest : undefined,
                note: typeof exercise.note === 'string' ? exercise.note : undefined,
              };
            })
            .filter((value): value is NonNullable<typeof value> => value !== null)
        : [];

      return {
        label: typeof candidate.label === 'string' ? candidate.label : 'Sesion',
        focus: typeof candidate.focus === 'string' ? candidate.focus : '',
        exercises,
      };
    })
    .filter((entry): entry is PlannedDay => entry !== null);
}

function fromRoutineTemplateDoc(snapshot: QueryDocumentSnapshot): Routine {
  const data = snapshot.data() as Partial<Routine> & {
    weeklyPlan?: unknown;
    description?: unknown;
    level?: unknown;
    goal?: unknown;
    daysPerWeek?: unknown;
    equipment?: unknown;
    split?: unknown;
  };

  return {
    id: snapshot.id,
    name: typeof data.name === 'string' ? data.name : 'Rutina sugerida',
    exerciseIds: Array.isArray(data.exerciseIds) ? data.exerciseIds : [],
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    lastUsedAt: typeof data.lastUsedAt === 'string' ? data.lastUsedAt : undefined,
    status: data.status === 'active' || data.status === 'draft' || data.status === 'archived' ? data.status : 'ready',
    source: data.source === 'custom' ? 'custom' : 'template',
    focusLabel: typeof data.focusLabel === 'string' ? data.focusLabel : undefined,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : undefined,
    description: typeof data.description === 'string' ? data.description : undefined,
    level: parseEnum(data.level, LEVELS),
    goal: parseEnum(data.goal, GOALS),
    daysPerWeek: typeof data.daysPerWeek === 'number' ? data.daysPerWeek : undefined,
    equipment: parseEnum(data.equipment, EQUIPMENT_SETUPS),
    split: parseEnum(data.split, SPLITS),
    weeklyPlan: parseWeeklyPlan(data.weeklyPlan),
  };
}

function withMuscleImages(muscles: Muscle[]): Muscle[] {
  return muscles.map((muscle) => ({
    ...muscle,
    image: getMuscleImage(muscle.imageKey),
  }));
}

function bySortOrderThenName<T extends { sortOrder?: number; name?: string }>(left: T, right: T) {
  const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return (left.name ?? '').localeCompare(right.name ?? '');
}
