import type { Muscle, Exercise, Variant, Routine, HistoryEntry } from '@/types';

export const muscles: Muscle[] = [
  { id: 'pecho',    name: 'Pecho',    icon: 'fitness-outline',  color: '#E53935', image: require('@/assets/musculos/pecho.png') },
  { id: 'espalda',  name: 'Espalda',  icon: 'body-outline',     color: '#8E24AA', image: require('@/assets/musculos/espalda.png') },
  { id: 'piernas',  name: 'Piernas',  icon: 'walk-outline',     color: '#00897B', image: require('@/assets/musculos/cuadriceceps.png') },
  { id: 'hombros',  name: 'Hombros',  icon: 'barbell-outline',  color: '#F57C00', image: require('@/assets/musculos/hombros.png') },
  { id: 'biceps',   name: 'Bíceps',   icon: 'barbell-outline',  color: '#1565C0', image: require('@/assets/musculos/brazos.png') },
  { id: 'triceps',  name: 'Tríceps',  icon: 'barbell-outline',  color: '#2E7D32', image: require('@/assets/musculos/brazos.png') },
  { id: 'abdomen',  name: 'Abdomen',  icon: 'body-outline',     color: '#D32F2F', image: require('@/assets/musculos/abdomen.png') },
];

export const exercises: Record<string, Exercise[]> = {
  pecho: [
    { id: 'press-banca',       muscleId: 'pecho', name: 'Press Banca',           description: 'Ejercicio compuesto para pecho con barra.' },
    { id: 'aperturas',         muscleId: 'pecho', name: 'Aperturas',             description: 'Aislamiento de pecho con mancuernas.' },
    { id: 'flexiones',         muscleId: 'pecho', name: 'Flexiones',             description: 'Ejercicio de peso corporal para pecho.' },
    { id: 'press-inclinado',   muscleId: 'pecho', name: 'Press Inclinado',       description: 'Trabaja el pecho superior con barra o mancuernas.' },
  ],
  espalda: [
    { id: 'dominadas',         muscleId: 'espalda', name: 'Dominadas',           description: 'Ejercicio de peso corporal, tracción vertical.' },
    { id: 'remo-barra',        muscleId: 'espalda', name: 'Remo con Barra',      description: 'Compuesto de tracción horizontal.' },
    { id: 'jalones',           muscleId: 'espalda', name: 'Jalones en Polea',    description: 'Polea alta, tracción vertical.' },
    { id: 'remo-mancuerna',    muscleId: 'espalda', name: 'Remo con Mancuerna',  description: 'Unilateral, buen control muscular.' },
  ],
  piernas: [
    { id: 'sentadilla',        muscleId: 'piernas', name: 'Sentadilla',          description: 'Ejercicio compuesto fundamental del tren inferior.' },
    { id: 'prensa',            muscleId: 'piernas', name: 'Prensa de Piernas',   description: 'Máquina de piernas, menor carga lumbar.' },
    { id: 'extension-cuad',    muscleId: 'piernas', name: 'Extensión de Cuád.',  description: 'Aislamiento de cuádriceps en máquina.' },
    { id: 'curl-femoral',      muscleId: 'piernas', name: 'Curl Femoral',        description: 'Aislamiento de isquiotibiales.' },
  ],
  hombros: [
    { id: 'press-militar',     muscleId: 'hombros', name: 'Press Militar',       description: 'Compuesto de hombros con barra.' },
    { id: 'elev-laterales',    muscleId: 'hombros', name: 'Elevaciones Later.',  description: 'Aislamiento del deltoides lateral.' },
    { id: 'vuelos-frontales',  muscleId: 'hombros', name: 'Vuelos Frontales',    description: 'Trabaja el deltoides anterior.' },
    { id: 'press-mancuernas-h',muscleId: 'hombros', name: 'Press Mancuernas',   description: 'Variante del press militar con mancuernas.' },
  ],
  biceps: [
    { id: 'curl-barra',        muscleId: 'biceps', name: 'Curl con Barra',       description: 'Ejercicio básico de bíceps.' },
    { id: 'curl-martillo',     muscleId: 'biceps', name: 'Curl Martillo',        description: 'Trabaja bíceps y braquial.' },
    { id: 'curl-concentrado',  muscleId: 'biceps', name: 'Curl Concentrado',     description: 'Máximo aislamiento del bíceps.' },
    { id: 'curl-predicador',   muscleId: 'biceps', name: 'Curl Predicador',      description: 'En banco Scott, elimina el balanceo.' },
  ],
  triceps: [
    { id: 'press-frances',     muscleId: 'triceps', name: 'Press Francés',       description: 'Ejercicio clásico de tríceps con barra.' },
    { id: 'fondos',            muscleId: 'triceps', name: 'Fondos en Paralelas', description: 'Peso corporal, carga alta.' },
    { id: 'extension-polea',   muscleId: 'triceps', name: 'Extensión Polea',     description: 'Control del movimiento en polea alta.' },
    { id: 'patada-triceps',    muscleId: 'triceps', name: 'Patada de Tríceps',   description: 'Unilateral con mancuerna.' },
  ],
  abdomen: [
    { id: 'crunch',            muscleId: 'abdomen', name: 'Crunch',              description: 'Ejercicio básico de abdomen.' },
    { id: 'plancha',           muscleId: 'abdomen', name: 'Plancha',             description: 'Isométrico de core, muy completo.' },
    { id: 'rodillo',           muscleId: 'abdomen', name: 'Rodillo Abdominal',   description: 'Alta dificultad, exige todo el core.' },
    { id: 'elevacion-piernas', muscleId: 'abdomen', name: 'Elevación de Piernas',description: 'Trabaja el abdomen inferior.' },
  ],
};

export const variants: Record<string, Variant[]> = {
  'press-banca': [
    { id: 'v-press-manc',   exerciseId: 'press-banca',     name: 'Press con Mancuernas',  description: 'Mayor rango de movimiento. Puedes hacerlo en cualquier banco.' },
    { id: 'v-flexiones',    exerciseId: 'press-banca',     name: 'Flexiones',             description: 'Sin equipamiento. Mismo patrón de empuje.' },
    { id: 'v-press-incl',   exerciseId: 'press-banca',     name: 'Press Inclinado',       description: 'Énfasis en pecho superior.' },
  ],
  'sentadilla': [
    { id: 'v-prensa',       exerciseId: 'sentadilla',      name: 'Prensa de Piernas',     description: 'Menor carga en la espalda, ideal si está ocupada la barra.' },
    { id: 'v-sentadilla-g', exerciseId: 'sentadilla',      name: 'Sentadilla Goblet',     description: 'Con mancuerna o kettlebell, buena técnica.' },
    { id: 'v-zancadas',     exerciseId: 'sentadilla',      name: 'Zancadas',              description: 'Unilateral, trabaja equilibrio y fuerza.' },
  ],
  'dominadas': [
    { id: 'v-jalones',      exerciseId: 'dominadas',       name: 'Jalones en Polea',      description: 'Mismo patrón de movimiento con carga ajustable.' },
    { id: 'v-remo-manc',    exerciseId: 'dominadas',       name: 'Remo con Mancuerna',    description: 'Tracción horizontal como complemento.' },
    { id: 'v-dominadas-a',  exerciseId: 'dominadas',       name: 'Dominadas Asistidas',   description: 'Con banda elástica para reducir el peso corporal.' },
  ],
  'curl-barra': [
    { id: 'v-curl-manc',    exerciseId: 'curl-barra',      name: 'Curl con Mancuernas',   description: 'Movimiento independiente por brazo, mayor rango.' },
    { id: 'v-curl-mart',    exerciseId: 'curl-barra',      name: 'Curl Martillo',         description: 'Variante neutral, trabaja también el braquial.' },
    { id: 'v-curl-polea',   exerciseId: 'curl-barra',      name: 'Curl en Polea',         description: 'Tensión constante durante todo el recorrido.' },
  ],
  'press-frances': [
    { id: 'v-ext-polea',    exerciseId: 'press-frances',   name: 'Extensión en Polea',    description: 'Control más estable del movimiento.' },
    { id: 'v-fondos',       exerciseId: 'press-frances',   name: 'Fondos en Paralelas',   description: 'Peso corporal, alta intensidad.' },
    { id: 'v-patada',       exerciseId: 'press-frances',   name: 'Patada de Tríceps',     description: 'Unilateral, buena para el pico del músculo.' },
  ],
  'press-militar': [
    { id: 'v-press-manc-h', exerciseId: 'press-militar',   name: 'Press Mancuernas',      description: 'Mayor rango de movimiento y trabajo unilateral.' },
    { id: 'v-elev-lat',     exerciseId: 'press-militar',   name: 'Elevaciones Laterales', description: 'Aísla el deltoides lateral.' },
    { id: 'v-press-arnold', exerciseId: 'press-militar',   name: 'Press Arnold',          description: 'Variante con rotación, trabaja todos los deltoides.' },
  ],
  'crunch': [
    { id: 'v-plancha',      exerciseId: 'crunch',          name: 'Plancha',               description: 'Isométrico completo para el core.' },
    { id: 'v-elevacion',    exerciseId: 'crunch',          name: 'Elevación de Piernas',  description: 'Enfocado en abdomen inferior.' },
    { id: 'v-crunch-polea', exerciseId: 'crunch',          name: 'Crunch en Polea',       description: 'Con carga ajustable, mayor resistencia.' },
  ],
};

export const mockRoutines: Routine[] = [
  { id: 'r1', name: 'Empuje - Pecho y Hombros', exerciseIds: ['press-banca', 'press-inclinado', 'press-militar', 'elev-laterales'], createdAt: '2026-04-10' },
  { id: 'r2', name: 'Jalón - Espalda y Bíceps',  exerciseIds: ['dominadas', 'remo-barra', 'curl-barra', 'curl-martillo'],          createdAt: '2026-04-11' },
  { id: 'r3', name: 'Piernas Completo',           exerciseIds: ['sentadilla', 'prensa', 'extension-cuad', 'curl-femoral'],         createdAt: '2026-04-12' },
];

export const mockHistory: HistoryEntry[] = [
  { id: 'h1', routineName: 'Empuje - Pecho y Hombros', date: 'hoy',     exerciseCount: 4 },
  { id: 'h2', routineName: 'Jalón - Espalda y Bíceps',  date: 'ayer',   exerciseCount: 4 },
  { id: 'h3', routineName: 'Piernas Completo',           date: '12 abr', exerciseCount: 4 },
  { id: 'h4', routineName: 'Empuje - Pecho y Hombros',  date: '10 abr', exerciseCount: 4 },
];
