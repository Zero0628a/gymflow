import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
import type {
  RoutineEquipmentSetup,
  RoutineGoal,
  RoutineLevel,
  UserProfile,
} from '@/types';

type ProfileContextValue = {
  loading: boolean;
  profile: UserProfile | null;
  saveProfile: (input: Omit<UserProfile, 'completedOnboarding' | 'updatedAt'>) => Promise<void>;
  saveOnboardingProfile: (input: Omit<UserProfile, 'completedOnboarding' | 'updatedAt'>) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  resetProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const LEVELS: ReadonlyArray<RoutineLevel> = ['beginner', 'intermediate', 'advanced'];
const GOALS: ReadonlyArray<RoutineGoal> = ['strength', 'hypertrophy', 'endurance', 'general'];
const EQUIPMENT: ReadonlyArray<RoutineEquipmentSetup> = ['home', 'gym'];
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

function parseEnum<T extends string>(value: unknown, allowed: ReadonlyArray<T>): T | undefined {
  return typeof value === 'string' && (allowed as ReadonlyArray<string>).includes(value)
    ? (value as T)
    : undefined;
}

function fromProfileDoc(data: Record<string, unknown> | undefined): UserProfile | null {
  if (!data) {
    return null;
  }

  const goal = parseEnum(data.goal, GOALS);
  const level = parseEnum(data.level, LEVELS);
  const equipment = parseEnum(data.equipment, EQUIPMENT);
  const daysPerWeek = typeof data.daysPerWeek === 'number' ? data.daysPerWeek : undefined;
  const trainingWeekdays = Array.isArray(data.trainingWeekdays)
    ? data.trainingWeekdays.filter((day): day is number => typeof day === 'number' && WEEKDAYS.includes(day as typeof WEEKDAYS[number]))
    : undefined;

  if (!goal || !level || !equipment || !daysPerWeek) {
    return null;
  }

  return {
    goal,
    level,
    equipment,
    daysPerWeek,
    trainingWeekdays: trainingWeekdays && trainingWeekdays.length > 0 ? [...new Set(trainingWeekdays)] : undefined,
    completedOnboarding: data.completedOnboarding === true,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  };
}

export function ProfileProvider({ children }: PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const profileRef = doc(db, 'users', user.uid, 'profile', 'main');
    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        setProfile(fromProfileDoc(snapshot.data()));
        setLoading(false);
      },
      (error) => {
        console.error('No se pudo cargar profile:', error);
        setProfile(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [authLoading, user]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      loading,
      profile,
      async saveProfile(input) {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        const now = new Date().toISOString();
        await setDoc(
          doc(db, 'users', user.uid, 'profile', 'main'),
          {
            goal: input.goal,
            level: input.level,
            daysPerWeek: input.daysPerWeek,
            trainingWeekdays: input.trainingWeekdays ?? null,
            equipment: input.equipment,
            updatedAt: now,
          },
          { merge: true }
        );
      },
      async saveOnboardingProfile(input) {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        const now = new Date().toISOString();
        await setDoc(
          doc(db, 'users', user.uid, 'profile', 'main'),
          {
            goal: input.goal,
            level: input.level,
            daysPerWeek: input.daysPerWeek,
            trainingWeekdays: input.trainingWeekdays ?? null,
            equipment: input.equipment,
            completedOnboarding: false,
            updatedAt: now,
          },
          { merge: true }
        );
      },
      async markOnboardingComplete() {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        await setDoc(
          doc(db, 'users', user.uid, 'profile', 'main'),
          {
            completedOnboarding: true,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      },
      async resetProfile() {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        await setDoc(
          doc(db, 'users', user.uid, 'profile', 'main'),
          {
            completedOnboarding: false,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      },
    }),
    [loading, profile, user]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile debe usarse dentro de ProfileProvider');
  }
  return context;
}
