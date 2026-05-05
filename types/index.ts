import type { ImageSourcePropType } from 'react-native';

export interface Muscle {
  id: string;
  name: string;
  icon: string;
  color: string;
  image: ImageSourcePropType;
}

export interface Exercise {
  id: string;
  muscleId: string;
  name: string;
  description: string;
}

export interface Variant {
  id: string;
  exerciseId: string;
  name: string;
  description: string;
}

export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  routineName: string;
  date: string;
  exerciseCount: number;
}

export type TrainingDayStatus = 'pending' | 'completed' | 'missed' | 'postponed';

export interface TrainingDay {
  dateKey: string;
  dayLabel: string;
  shortDateLabel: string;
  muscleId: string;
  muscleName: string;
  muscleColor: string;
  status: TrainingDayStatus;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  exerciseIds: string[];
  completedExerciseIds: string[];
}

export type TrainingActionFailure =
  | 'closed_missed'
  | 'closed_postponed'
  | 'not_today'
  | 'already_completed';
