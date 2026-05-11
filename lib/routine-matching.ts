import type { Routine, UserProfile } from '@/types';

type ScoredRoutine = {
  routine: Routine;
  score: number;
};

// Pesos del matching. Ajustar aca si una dimension importa mas.
const WEIGHTS = {
  equipment: 40,
  daysPerWeek: 25,
  goal: 20,
  level: 15,
} as const;

const LEVEL_DISTANCE: Record<UserProfile['level'], Record<UserProfile['level'], number>> = {
  beginner:    { beginner: 0, intermediate: 1, advanced: 2 },
  intermediate:{ beginner: 1, intermediate: 0, advanced: 1 },
  advanced:    { beginner: 2, intermediate: 1, advanced: 0 },
};

function scoreRoutine(routine: Routine, profile: UserProfile): number {
  let score = 0;

  // Equipment: gym es compatible con todo, casa solo con rutinas marcadas como home.
  if (routine.equipment === profile.equipment) {
    score += WEIGHTS.equipment;
  } else if (profile.equipment === 'gym' && routine.equipment === 'home') {
    // Tener gym permite hacer una rutina de casa, pero pierde puntos.
    score += WEIGHTS.equipment * 0.4;
  } else {
    // Casa NO puede hacer rutinas de gym: penalizacion fuerte.
    score -= WEIGHTS.equipment;
  }

  // Dias por semana: exact match es mejor, +/- 1 acepta.
  if (typeof routine.daysPerWeek === 'number') {
    const diff = Math.abs(routine.daysPerWeek - profile.daysPerWeek);
    if (diff === 0) score += WEIGHTS.daysPerWeek;
    else if (diff === 1) score += WEIGHTS.daysPerWeek * 0.5;
    else if (diff === 2) score += WEIGHTS.daysPerWeek * 0.15;
    else score -= WEIGHTS.daysPerWeek * 0.3;
  }

  // Objetivo: match exacto o 'general' como comodin.
  if (routine.goal === profile.goal) {
    score += WEIGHTS.goal;
  } else if (routine.goal === 'general' || profile.goal === 'general') {
    score += WEIGHTS.goal * 0.5;
  }

  // Nivel: distancia 0 / 1 / 2.
  if (routine.level) {
    const distance = LEVEL_DISTANCE[profile.level][routine.level];
    if (distance === 0) score += WEIGHTS.level;
    else if (distance === 1) score += WEIGHTS.level * 0.4;
    // distance 2 (avanzado vs principiante o viceversa): sin bono.
  }

  return score;
}

export function rankRoutinesForProfile(
  templates: Routine[],
  profile: UserProfile
): ScoredRoutine[] {
  return templates
    .map((routine) => ({ routine, score: scoreRoutine(routine, profile) }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return (left.routine.sortOrder ?? 0) - (right.routine.sortOrder ?? 0);
    });
}

export function pickRoutinesForProfile(
  templates: Routine[],
  profile: UserProfile,
  limit = 5
): Routine[] {
  return rankRoutinesForProfile(templates, profile)
    .filter((entry) => entry.score > 0)
    .slice(0, limit)
    .map((entry) => entry.routine);
}

// Filtro mas permisivo: usado en la pantalla "Sugeridas" para que muestre
// algo aunque ninguna haga match perfecto (descarta solo las muy malas).
export function filterRoutinesForProfile(
  templates: Routine[],
  profile: UserProfile | null
): Routine[] {
  if (!profile) {
    return [...templates].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
  }

  return rankRoutinesForProfile(templates, profile)
    .filter((entry) => entry.score >= 0)
    .map((entry) => entry.routine);
}

export const GOAL_LABEL: Record<UserProfile['goal'], string> = {
  strength: 'Fuerza',
  hypertrophy: 'Hipertrofia',
  endurance: 'Resistencia',
  general: 'Forma general',
};

export const LEVEL_LABEL: Record<UserProfile['level'], string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export const EQUIPMENT_LABEL: Record<UserProfile['equipment'], string> = {
  home: 'En casa',
  gym: 'Gimnasio',
};
