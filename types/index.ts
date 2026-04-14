export interface Muscle {
  id: string;
  name: string;
  icon: string;
  color: string;
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
