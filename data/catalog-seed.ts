import type { Exercise, Muscle, Routine, Variant } from '@/types';

export const seedMuscles: Muscle[] = [
  { id: 'pecho', name: 'Pecho', icon: 'fitness-outline', color: '#E53935', imageKey: 'pecho', sortOrder: 1 },
  { id: 'espalda', name: 'Espalda', icon: 'body-outline', color: '#8E24AA', imageKey: 'espalda', sortOrder: 2 },
  { id: 'piernas', name: 'Piernas', icon: 'walk-outline', color: '#00897B', imageKey: 'piernas', sortOrder: 3 },
  { id: 'gluteos', name: 'Gluteos', icon: 'body-outline', color: '#C2185B', imageKey: 'piernas', sortOrder: 4 },
  { id: 'hombros', name: 'Hombros', icon: 'barbell-outline', color: '#F57C00', imageKey: 'hombros', sortOrder: 5 },
  { id: 'biceps', name: 'Biceps', icon: 'barbell-outline', color: '#1565C0', imageKey: 'brazos', sortOrder: 6 },
  { id: 'triceps', name: 'Triceps', icon: 'barbell-outline', color: '#2E7D32', imageKey: 'brazos', sortOrder: 7 },
  { id: 'abdomen', name: 'Abdomen', icon: 'body-outline', color: '#D32F2F', imageKey: 'abdomen', sortOrder: 8 },
];

export const seedExercises: Exercise[] = [
  // ============ PECHO ============
  { id: 'press-banca', muscleId: 'pecho', name: 'Press banca', description: 'Compuesto fundamental para pecho con barra.', equipment: ['barbell'], sortOrder: 1 },
  { id: 'press-inclinado', muscleId: 'pecho', name: 'Press inclinado con barra', description: 'Enfasis en pecho superior, banca a 30-45 grados.', equipment: ['barbell'], sortOrder: 2 },
  { id: 'press-banca-mancuernas', muscleId: 'pecho', name: 'Press banca con mancuernas', description: 'Mayor rango de movimiento que la barra.', equipment: ['dumbbell'], sortOrder: 3 },
  { id: 'press-inclinado-mancuernas', muscleId: 'pecho', name: 'Press inclinado con mancuernas', description: 'Pecho superior con trabajo unilateral.', equipment: ['dumbbell'], sortOrder: 4 },
  { id: 'aperturas-mancuernas', muscleId: 'pecho', name: 'Aperturas con mancuernas', description: 'Aislamiento de pecho en banco plano.', equipment: ['dumbbell'], sortOrder: 5 },
  { id: 'cruce-poleas', muscleId: 'pecho', name: 'Cruce en poleas', description: 'Aislamiento con tension constante.', equipment: ['cable'], sortOrder: 6 },
  { id: 'flexiones', muscleId: 'pecho', name: 'Flexiones', description: 'Empuje horizontal con peso corporal.', equipment: ['bodyweight'], sortOrder: 7 },
  { id: 'flexiones-declinadas', muscleId: 'pecho', name: 'Flexiones declinadas', description: 'Pies elevados, mas carga en pecho superior.', equipment: ['bodyweight'], sortOrder: 8 },
  { id: 'fondos-pecho', muscleId: 'pecho', name: 'Fondos en paralelas (pecho)', description: 'Tronco inclinado adelante para acentuar pecho.', equipment: ['bodyweight'], sortOrder: 9 },
  { id: 'press-maquina', muscleId: 'pecho', name: 'Press en maquina', description: 'Empuje guiado, ideal para principiantes.', equipment: ['machine'], sortOrder: 10 },

  // ============ ESPALDA ============
  { id: 'dominadas', muscleId: 'espalda', name: 'Dominadas', description: 'Traccion vertical con peso corporal.', equipment: ['bodyweight'], sortOrder: 1 },
  { id: 'dominadas-asistidas', muscleId: 'espalda', name: 'Dominadas asistidas', description: 'Con banda o maquina, ideal para progresar.', equipment: ['machine', 'band'], sortOrder: 2 },
  { id: 'jalon-polea', muscleId: 'espalda', name: 'Jalon al pecho en polea', description: 'Traccion vertical con carga ajustable.', equipment: ['cable'], sortOrder: 3 },
  { id: 'remo-barra', muscleId: 'espalda', name: 'Remo con barra', description: 'Traccion horizontal compuesta, alta carga.', equipment: ['barbell'], sortOrder: 4 },
  { id: 'remo-pendlay', muscleId: 'espalda', name: 'Remo Pendlay', description: 'Variante explosiva del remo, desde el piso.', equipment: ['barbell'], sortOrder: 5 },
  { id: 'remo-mancuerna', muscleId: 'espalda', name: 'Remo unilateral con mancuerna', description: 'Buen control y rango, brazo a la vez.', equipment: ['dumbbell'], sortOrder: 6 },
  { id: 'remo-sentado', muscleId: 'espalda', name: 'Remo sentado en polea', description: 'Polea baja, traccion horizontal estable.', equipment: ['cable'], sortOrder: 7 },
  { id: 'remo-maquina', muscleId: 'espalda', name: 'Remo en maquina', description: 'Guiado, foco en dorsales y romboides.', equipment: ['machine'], sortOrder: 8 },
  { id: 'peso-muerto', muscleId: 'espalda', name: 'Peso muerto convencional', description: 'Compuesto total: espalda baja, gluteos y femorales.', equipment: ['barbell'], sortOrder: 9 },
  { id: 'peso-muerto-rumano', muscleId: 'espalda', name: 'Peso muerto rumano', description: 'Foco en femorales y espalda baja con bisagra de cadera.', equipment: ['barbell', 'dumbbell'], sortOrder: 10 },
  { id: 'hiperextensiones', muscleId: 'espalda', name: 'Hiperextensiones', description: 'Espalda baja en banco romano.', equipment: ['bodyweight'], sortOrder: 11 },
  { id: 'remo-invertido', muscleId: 'espalda', name: 'Remo invertido', description: 'Peso corporal en barra baja, traccion horizontal.', equipment: ['bodyweight'], sortOrder: 12 },

  // ============ PIERNAS ============
  { id: 'sentadilla', muscleId: 'piernas', name: 'Sentadilla con barra', description: 'Compuesto rey del tren inferior.', equipment: ['barbell'], sortOrder: 1 },
  { id: 'sentadilla-frontal', muscleId: 'piernas', name: 'Sentadilla frontal', description: 'Barra al frente, mas foco en cuadriceps.', equipment: ['barbell'], sortOrder: 2 },
  { id: 'sentadilla-goblet', muscleId: 'piernas', name: 'Sentadilla goblet', description: 'Con mancuerna al pecho, buena tecnica para empezar.', equipment: ['dumbbell', 'kettlebell'], sortOrder: 3 },
  { id: 'prensa', muscleId: 'piernas', name: 'Prensa de piernas', description: 'Compuesto guiado, menor carga lumbar.', equipment: ['machine'], sortOrder: 4 },
  { id: 'extension-cuad', muscleId: 'piernas', name: 'Extension de cuadriceps', description: 'Aislamiento de cuadriceps en maquina.', equipment: ['machine'], sortOrder: 5 },
  { id: 'curl-femoral-tumbado', muscleId: 'piernas', name: 'Curl femoral tumbado', description: 'Aislamiento de isquiotibiales.', equipment: ['machine'], sortOrder: 6 },
  { id: 'curl-femoral-sentado', muscleId: 'piernas', name: 'Curl femoral sentado', description: 'Variante sentada para isquiotibiales.', equipment: ['machine'], sortOrder: 7 },
  { id: 'zancadas', muscleId: 'piernas', name: 'Zancadas', description: 'Unilateral, equilibrio y fuerza.', equipment: ['dumbbell', 'barbell', 'bodyweight'], sortOrder: 8 },
  { id: 'sentadilla-bulgara', muscleId: 'piernas', name: 'Sentadilla bulgara', description: 'Unilateral con pie elevado, gran intensidad.', equipment: ['dumbbell', 'bodyweight'], sortOrder: 9 },
  { id: 'gemelos-de-pie', muscleId: 'piernas', name: 'Elevacion de gemelos de pie', description: 'Aislamiento de gastrocnemio.', equipment: ['machine', 'bodyweight'], sortOrder: 10 },
  { id: 'gemelos-sentado', muscleId: 'piernas', name: 'Elevacion de gemelos sentado', description: 'Foco en soleo, rodillas a 90.', equipment: ['machine'], sortOrder: 11 },
  { id: 'sentadilla-aire', muscleId: 'piernas', name: 'Sentadilla al aire', description: 'Peso corporal, base de todo entrenamiento.', equipment: ['bodyweight'], sortOrder: 12 },

  // ============ GLUTEOS ============
  { id: 'hip-thrust', muscleId: 'gluteos', name: 'Hip thrust', description: 'Empuje de cadera con barra, gold standard de gluteos.', equipment: ['barbell'], sortOrder: 1 },
  { id: 'glute-bridge', muscleId: 'gluteos', name: 'Puente de gluteos', description: 'Variante en piso, peso corporal o mancuerna.', equipment: ['bodyweight', 'dumbbell'], sortOrder: 2 },
  { id: 'patada-gluteo', muscleId: 'gluteos', name: 'Patada de gluteo en polea', description: 'Aislamiento unilateral en polea baja.', equipment: ['cable'], sortOrder: 3 },
  { id: 'abductor-maquina', muscleId: 'gluteos', name: 'Abductor en maquina', description: 'Aislamiento de gluteo medio.', equipment: ['machine'], sortOrder: 4 },
  { id: 'sentadilla-sumo', muscleId: 'gluteos', name: 'Sentadilla sumo', description: 'Pies abiertos, mas activacion de gluteos y aductores.', equipment: ['dumbbell', 'barbell'], sortOrder: 5 },
  { id: 'step-up', muscleId: 'gluteos', name: 'Step up', description: 'Subida a banco con mancuernas, unilateral.', equipment: ['dumbbell', 'bodyweight'], sortOrder: 6 },

  // ============ HOMBROS ============
  { id: 'press-militar', muscleId: 'hombros', name: 'Press militar con barra', description: 'Empuje vertical compuesto.', equipment: ['barbell'], sortOrder: 1 },
  { id: 'press-mancuernas-h', muscleId: 'hombros', name: 'Press de hombros con mancuernas', description: 'Empuje vertical con mayor rango.', equipment: ['dumbbell'], sortOrder: 2 },
  { id: 'press-arnold', muscleId: 'hombros', name: 'Press Arnold', description: 'Con rotacion, trabaja todos los deltoides.', equipment: ['dumbbell'], sortOrder: 3 },
  { id: 'elev-laterales', muscleId: 'hombros', name: 'Elevaciones laterales', description: 'Aislamiento del deltoides lateral.', equipment: ['dumbbell'], sortOrder: 4 },
  { id: 'elev-laterales-polea', muscleId: 'hombros', name: 'Elevaciones laterales en polea', description: 'Tension constante en deltoides lateral.', equipment: ['cable'], sortOrder: 5 },
  { id: 'pajaros', muscleId: 'hombros', name: 'Pajaros (rear delt fly)', description: 'Aislamiento del deltoides posterior.', equipment: ['dumbbell'], sortOrder: 6 },
  { id: 'face-pull', muscleId: 'hombros', name: 'Face pull', description: 'Polea alta, deltoides posterior y rotadores.', equipment: ['cable'], sortOrder: 7 },
  { id: 'vuelos-frontales', muscleId: 'hombros', name: 'Vuelos frontales', description: 'Aislamiento del deltoides anterior.', equipment: ['dumbbell'], sortOrder: 8 },
  { id: 'encogimientos', muscleId: 'hombros', name: 'Encogimientos para trapecio', description: 'Trapecio superior con mancuernas o barra.', equipment: ['dumbbell', 'barbell'], sortOrder: 9 },
  { id: 'pike-pushup', muscleId: 'hombros', name: 'Flexion pike', description: 'Empuje vertical con peso corporal.', equipment: ['bodyweight'], sortOrder: 10 },

  // ============ BICEPS ============
  { id: 'curl-barra', muscleId: 'biceps', name: 'Curl con barra', description: 'Ejercicio basico de biceps.', equipment: ['barbell'], sortOrder: 1 },
  { id: 'curl-barra-z', muscleId: 'biceps', name: 'Curl con barra Z', description: 'Menor estres de muneca que la barra recta.', equipment: ['barbell'], sortOrder: 2 },
  { id: 'curl-mancuernas', muscleId: 'biceps', name: 'Curl con mancuernas', description: 'Movimiento independiente por brazo.', equipment: ['dumbbell'], sortOrder: 3 },
  { id: 'curl-martillo', muscleId: 'biceps', name: 'Curl martillo', description: 'Agarre neutro, trabaja biceps y braquial.', equipment: ['dumbbell'], sortOrder: 4 },
  { id: 'curl-concentrado', muscleId: 'biceps', name: 'Curl concentrado', description: 'Maximo aislamiento, brazo apoyado en muslo.', equipment: ['dumbbell'], sortOrder: 5 },
  { id: 'curl-predicador', muscleId: 'biceps', name: 'Curl predicador', description: 'En banco Scott, elimina balanceo.', equipment: ['barbell', 'dumbbell'], sortOrder: 6 },
  { id: 'curl-polea', muscleId: 'biceps', name: 'Curl en polea baja', description: 'Tension constante en todo el recorrido.', equipment: ['cable'], sortOrder: 7 },
  { id: 'curl-banda', muscleId: 'biceps', name: 'Curl con banda', description: 'Tension creciente, ideal para casa.', equipment: ['band'], sortOrder: 8 },

  // ============ TRICEPS ============
  { id: 'press-frances', muscleId: 'triceps', name: 'Press frances', description: 'Extension tras la nuca con barra Z.', equipment: ['barbell'], sortOrder: 1 },
  { id: 'extension-polea', muscleId: 'triceps', name: 'Extension en polea alta', description: 'Polea con cuerda o barra, gran rango.', equipment: ['cable'], sortOrder: 2 },
  { id: 'fondos-paralelas', muscleId: 'triceps', name: 'Fondos en paralelas (triceps)', description: 'Tronco vertical, foco en triceps.', equipment: ['bodyweight'], sortOrder: 3 },
  { id: 'fondos-banco', muscleId: 'triceps', name: 'Fondos en banco', description: 'Variante mas facil, manos en banco.', equipment: ['bodyweight'], sortOrder: 4 },
  { id: 'patada-triceps', muscleId: 'triceps', name: 'Patada de triceps', description: 'Unilateral con mancuerna, aislamiento.', equipment: ['dumbbell'], sortOrder: 5 },
  { id: 'extension-mancuerna', muscleId: 'triceps', name: 'Extension con mancuerna sobre la cabeza', description: 'Estiramiento maximo de cabeza larga.', equipment: ['dumbbell'], sortOrder: 6 },
  { id: 'press-cerrado', muscleId: 'triceps', name: 'Press banca agarre cerrado', description: 'Compuesto que enfatiza triceps.', equipment: ['barbell'], sortOrder: 7 },
  { id: 'flexion-diamante', muscleId: 'triceps', name: 'Flexion diamante', description: 'Manos juntas, peso corporal foco triceps.', equipment: ['bodyweight'], sortOrder: 8 },

  // ============ ABDOMEN ============
  { id: 'crunch', muscleId: 'abdomen', name: 'Crunch', description: 'Recto del abdomen, ejercicio basico.', equipment: ['bodyweight'], sortOrder: 1 },
  { id: 'crunch-polea', muscleId: 'abdomen', name: 'Crunch en polea', description: 'Con carga ajustable, mayor resistencia.', equipment: ['cable'], sortOrder: 2 },
  { id: 'plancha', muscleId: 'abdomen', name: 'Plancha isometrica', description: 'Core completo, isometrico.', equipment: ['bodyweight'], sortOrder: 3 },
  { id: 'plancha-lateral', muscleId: 'abdomen', name: 'Plancha lateral', description: 'Oblicuos y estabilidad lumbar.', equipment: ['bodyweight'], sortOrder: 4 },
  { id: 'elevacion-piernas', muscleId: 'abdomen', name: 'Elevacion de piernas colgado', description: 'Abdomen inferior, requiere barra.', equipment: ['bodyweight'], sortOrder: 5 },
  { id: 'rodillo', muscleId: 'abdomen', name: 'Rueda abdominal', description: 'Alta dificultad, exige todo el core.', equipment: ['bodyweight'], sortOrder: 6 },
  { id: 'mountain-climbers', muscleId: 'abdomen', name: 'Mountain climbers', description: 'Core dinamico, tambien cardio.', equipment: ['bodyweight'], sortOrder: 7 },
  { id: 'russian-twist', muscleId: 'abdomen', name: 'Russian twist', description: 'Oblicuos con disco o mancuerna.', equipment: ['dumbbell', 'bodyweight'], sortOrder: 8 },
];

export const seedVariants: Variant[] = [
  { id: 'v-press-manc', exerciseId: 'press-banca', name: 'Press con mancuernas', description: 'Mayor rango de movimiento.', sortOrder: 1 },
  { id: 'v-flexiones', exerciseId: 'press-banca', name: 'Flexiones', description: 'Sin equipamiento, mismo patron de empuje.', sortOrder: 2 },
  { id: 'v-press-incl', exerciseId: 'press-banca', name: 'Press inclinado', description: 'Enfasis en pecho superior.', sortOrder: 3 },

  { id: 'v-prensa', exerciseId: 'sentadilla', name: 'Prensa de piernas', description: 'Menor carga en la espalda.', sortOrder: 1 },
  { id: 'v-sentadilla-g', exerciseId: 'sentadilla', name: 'Sentadilla goblet', description: 'Con mancuerna, buena tecnica.', sortOrder: 2 },
  { id: 'v-zancadas', exerciseId: 'sentadilla', name: 'Zancadas', description: 'Unilateral, equilibrio y fuerza.', sortOrder: 3 },

  { id: 'v-jalones', exerciseId: 'dominadas', name: 'Jalones en polea', description: 'Mismo patron con carga ajustable.', sortOrder: 1 },
  { id: 'v-remo-manc', exerciseId: 'dominadas', name: 'Remo con mancuerna', description: 'Traccion horizontal complementaria.', sortOrder: 2 },
  { id: 'v-dominadas-a', exerciseId: 'dominadas', name: 'Dominadas asistidas', description: 'Con banda para reducir peso corporal.', sortOrder: 3 },

  { id: 'v-curl-manc', exerciseId: 'curl-barra', name: 'Curl con mancuernas', description: 'Movimiento independiente por brazo.', sortOrder: 1 },
  { id: 'v-curl-mart', exerciseId: 'curl-barra', name: 'Curl martillo', description: 'Agarre neutro, biceps y braquial.', sortOrder: 2 },
  { id: 'v-curl-polea', exerciseId: 'curl-barra', name: 'Curl en polea', description: 'Tension constante.', sortOrder: 3 },

  { id: 'v-ext-polea', exerciseId: 'press-frances', name: 'Extension en polea', description: 'Control mas estable.', sortOrder: 1 },
  { id: 'v-fondos', exerciseId: 'press-frances', name: 'Fondos en paralelas', description: 'Peso corporal, alta intensidad.', sortOrder: 2 },
  { id: 'v-patada', exerciseId: 'press-frances', name: 'Patada de triceps', description: 'Unilateral, pico del musculo.', sortOrder: 3 },

  { id: 'v-press-manc-h', exerciseId: 'press-militar', name: 'Press con mancuernas', description: 'Mayor rango, trabajo unilateral.', sortOrder: 1 },
  { id: 'v-elev-lat', exerciseId: 'press-militar', name: 'Elevaciones laterales', description: 'Aisla deltoides lateral.', sortOrder: 2 },
  { id: 'v-press-arnold', exerciseId: 'press-militar', name: 'Press Arnold', description: 'Con rotacion, todos los deltoides.', sortOrder: 3 },

  { id: 'v-plancha', exerciseId: 'crunch', name: 'Plancha', description: 'Isometrico completo para el core.', sortOrder: 1 },
  { id: 'v-elevacion', exerciseId: 'crunch', name: 'Elevacion de piernas', description: 'Abdomen inferior.', sortOrder: 2 },
  { id: 'v-crunch-polea', exerciseId: 'crunch', name: 'Crunch en polea', description: 'Mayor resistencia.', sortOrder: 3 },

  { id: 'v-pm-rumano', exerciseId: 'peso-muerto', name: 'Peso muerto rumano', description: 'Bisagra de cadera, foco femorales.', sortOrder: 1 },
  { id: 'v-pm-sumo', exerciseId: 'peso-muerto', name: 'Peso muerto sumo', description: 'Postura ancha, mas gluteos y aductores.', sortOrder: 2 },

  { id: 'v-ht-glute-bridge', exerciseId: 'hip-thrust', name: 'Puente de gluteos', description: 'Variante en piso sin banco.', sortOrder: 1 },
  { id: 'v-ht-step-up', exerciseId: 'hip-thrust', name: 'Step up', description: 'Subida a banco unilateral.', sortOrder: 2 },
];

// =============================================================
//                  CATALOGO PROFESIONAL DE RUTINAS
// =============================================================
// Estructura: 26 rutinas curadas cubriendo:
//   - 3 niveles (beginner, intermediate, advanced)
//   - 4 objetivos (strength, hypertrophy, endurance, general)
//   - 3 a 6 dias por semana
//   - Equipamiento: home / gym
//   - Splits: full-body, upper-lower, ppl, bro-split, home-circuit
//
// Cada rutina trae un weeklyPlan con sets/reps recomendados.
// Las referencias siguen estandares de programacion clasicos
// (5x5, GZCL-lite, PPL clasico, Stronglifts, Couch-to-gym).
// =============================================================

const TEMPLATE_TIMESTAMP = '2026-05-01T00:00:00.000Z';

function template(routine: Omit<Routine, 'createdAt' | 'updatedAt' | 'status' | 'source'>): Routine {
  return {
    ...routine,
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
    status: 'ready',
    source: 'template',
  };
}

export const seedRoutineTemplates: Routine[] = [
  // ---------- PRINCIPIANTE / FULL-BODY / GYM ----------
  template({
    id: 'tpl-fb-beg-str-3-gym',
    name: 'Fuerza base 3 dias',
    description: 'Programa tipo Stronglifts: tres sesiones full-body alternadas, foco en ejercicios compuestos. Ideal para los primeros 3-6 meses.',
    level: 'beginner',
    goal: 'strength',
    daysPerWeek: 3,
    equipment: 'gym',
    split: 'full-body',
    focusLabel: 'Cuerpo completo · Fuerza',
    exerciseIds: ['sentadilla', 'press-banca', 'remo-barra', 'press-militar', 'peso-muerto'],
    sortOrder: 1,
    weeklyPlan: [
      {
        label: 'Dia A',
        focus: 'Sentadilla · Empuje',
        exercises: [
          { exerciseId: 'sentadilla', sets: 5, reps: '5', rest: '2-3 min' },
          { exerciseId: 'press-banca', sets: 5, reps: '5', rest: '2-3 min' },
          { exerciseId: 'remo-barra', sets: 5, reps: '5', rest: '2 min' },
        ],
      },
      {
        label: 'Dia B',
        focus: 'Sentadilla · Vertical',
        exercises: [
          { exerciseId: 'sentadilla', sets: 5, reps: '5', rest: '2-3 min' },
          { exerciseId: 'press-militar', sets: 5, reps: '5', rest: '2 min' },
          { exerciseId: 'peso-muerto', sets: 1, reps: '5', rest: '3 min', note: 'Una sola serie pesada con tecnica limpia.' },
        ],
      },
    ],
  }),
  template({
    id: 'tpl-fb-beg-hyp-3-gym',
    name: 'Hipertrofia inicial 3 dias',
    description: 'Full-body con foco en hipertrofia para principiantes. Volumen moderado, rangos de 8-12 reps.',
    level: 'beginner',
    goal: 'hypertrophy',
    daysPerWeek: 3,
    equipment: 'gym',
    split: 'full-body',
    focusLabel: 'Cuerpo completo · Hipertrofia',
    exerciseIds: ['sentadilla-goblet', 'press-banca-mancuernas', 'jalon-polea', 'curl-mancuernas', 'extension-polea', 'plancha'],
    sortOrder: 2,
    weeklyPlan: [
      {
        label: 'Sesion full-body',
        focus: 'Empuje · Traccion · Pierna',
        exercises: [
          { exerciseId: 'sentadilla-goblet', sets: 3, reps: '10-12', rest: '90 s' },
          { exerciseId: 'press-banca-mancuernas', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'jalon-polea', sets: 3, reps: '10-12', rest: '90 s' },
          { exerciseId: 'curl-mancuernas', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'extension-polea', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'plancha', sets: 3, reps: '30-45 s' },
        ],
      },
    ],
  }),
  template({
    id: 'tpl-fb-beg-gen-3-gym',
    name: 'Acondicionamiento general 3 dias',
    description: 'Mezcla balanceada de fuerza basica y trabajo accesorio. Buena para retomar despues de inactividad.',
    level: 'beginner',
    goal: 'general',
    daysPerWeek: 3,
    equipment: 'gym',
    split: 'full-body',
    focusLabel: 'Cuerpo completo · General',
    exerciseIds: ['prensa', 'press-maquina', 'remo-maquina', 'elev-laterales', 'crunch'],
    sortOrder: 3,
    weeklyPlan: [
      {
        label: 'Sesion tipo',
        focus: 'Trabajo guiado',
        exercises: [
          { exerciseId: 'prensa', sets: 3, reps: '12', rest: '90 s' },
          { exerciseId: 'press-maquina', sets: 3, reps: '12', rest: '90 s' },
          { exerciseId: 'remo-maquina', sets: 3, reps: '12', rest: '90 s' },
          { exerciseId: 'elev-laterales', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'crunch', sets: 3, reps: '15' },
        ],
      },
    ],
  }),

  // ---------- PRINCIPIANTE / CASA ----------
  template({
    id: 'tpl-home-beg-gen-3',
    name: 'Casa basica 3 dias',
    description: 'Rutina full-body en casa sin equipamiento. Pensada para arrancar desde cero.',
    level: 'beginner',
    goal: 'general',
    daysPerWeek: 3,
    equipment: 'home',
    split: 'home-circuit',
    focusLabel: 'Casa · General',
    exerciseIds: ['sentadilla-aire', 'flexiones', 'remo-invertido', 'plancha', 'glute-bridge'],
    sortOrder: 10,
    weeklyPlan: [
      {
        label: 'Circuito completo',
        focus: 'Peso corporal',
        exercises: [
          { exerciseId: 'sentadilla-aire', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'flexiones', sets: 3, reps: '8-12', rest: '60 s' },
          { exerciseId: 'remo-invertido', sets: 3, reps: '8-10', rest: '60 s' },
          { exerciseId: 'glute-bridge', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'plancha', sets: 3, reps: '30 s' },
        ],
      },
    ],
  }),
  template({
    id: 'tpl-home-beg-end-4',
    name: 'Resistencia en casa 4 dias',
    description: 'Cuatro circuitos cortos enfocados en resistencia muscular y cardio. Sin equipamiento.',
    level: 'beginner',
    goal: 'endurance',
    daysPerWeek: 4,
    equipment: 'home',
    split: 'home-circuit',
    focusLabel: 'Casa · Resistencia',
    exerciseIds: ['sentadilla-aire', 'flexiones', 'mountain-climbers', 'plancha', 'zancadas'],
    sortOrder: 11,
    weeklyPlan: [
      {
        label: 'Circuito A',
        focus: 'Tren inferior y core',
        exercises: [
          { exerciseId: 'sentadilla-aire', sets: 4, reps: '20', rest: '40 s' },
          { exerciseId: 'zancadas', sets: 4, reps: '12 por pierna', rest: '40 s' },
          { exerciseId: 'plancha', sets: 4, reps: '45 s' },
        ],
      },
      {
        label: 'Circuito B',
        focus: 'Tren superior y cardio',
        exercises: [
          { exerciseId: 'flexiones', sets: 4, reps: '10-15', rest: '40 s' },
          { exerciseId: 'mountain-climbers', sets: 4, reps: '40 toques', rest: '40 s' },
          { exerciseId: 'plancha-lateral', sets: 4, reps: '30 s por lado' },
        ],
      },
    ],
  }),

  // ---------- INTERMEDIO / UPPER-LOWER / GYM ----------
  template({
    id: 'tpl-ul-int-str-4-gym',
    name: 'Upper / Lower fuerza 4 dias',
    description: 'Split clasico de fuerza intermedia: dos sesiones de tren superior y dos de tren inferior por semana.',
    level: 'intermediate',
    goal: 'strength',
    daysPerWeek: 4,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'Upper · Lower · Fuerza',
    exerciseIds: ['press-banca', 'remo-barra', 'sentadilla', 'peso-muerto', 'press-militar', 'dominadas'],
    sortOrder: 20,
    weeklyPlan: [
      {
        label: 'Upper A',
        focus: 'Empuje pesado',
        exercises: [
          { exerciseId: 'press-banca', sets: 4, reps: '5', rest: '3 min' },
          { exerciseId: 'remo-barra', sets: 4, reps: '6', rest: '2-3 min' },
          { exerciseId: 'press-militar', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'dominadas', sets: 3, reps: 'maximas', rest: '2 min' },
        ],
      },
      {
        label: 'Lower A',
        focus: 'Sentadilla',
        exercises: [
          { exerciseId: 'sentadilla', sets: 4, reps: '5', rest: '3 min' },
          { exerciseId: 'peso-muerto-rumano', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'curl-femoral-tumbado', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'gemelos-de-pie', sets: 4, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Upper B',
        focus: 'Traccion pesada',
        exercises: [
          { exerciseId: 'press-inclinado', sets: 4, reps: '6', rest: '2-3 min' },
          { exerciseId: 'jalon-polea', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'press-mancuernas-h', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'remo-mancuerna', sets: 3, reps: '10', rest: '90 s' },
        ],
      },
      {
        label: 'Lower B',
        focus: 'Peso muerto',
        exercises: [
          { exerciseId: 'peso-muerto', sets: 4, reps: '5', rest: '3 min' },
          { exerciseId: 'sentadilla-frontal', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'prensa', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'plancha', sets: 3, reps: '60 s' },
        ],
      },
    ],
  }),
  template({
    id: 'tpl-ul-int-hyp-4-gym',
    name: 'Upper / Lower hipertrofia 4 dias',
    description: 'Volumen intermedio enfocado en hipertrofia. Compuestos primero y accesorios para detalle.',
    level: 'intermediate',
    goal: 'hypertrophy',
    daysPerWeek: 4,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'Upper · Lower · Hipertrofia',
    exerciseIds: ['press-inclinado', 'remo-sentado', 'sentadilla', 'hip-thrust', 'curl-mancuernas', 'extension-polea'],
    sortOrder: 21,
    weeklyPlan: [
      {
        label: 'Upper A',
        focus: 'Pecho · Espalda · Brazos',
        exercises: [
          { exerciseId: 'press-inclinado', sets: 4, reps: '8-10', rest: '2 min' },
          { exerciseId: 'remo-sentado', sets: 4, reps: '10', rest: '2 min' },
          { exerciseId: 'aperturas-mancuernas', sets: 3, reps: '12', rest: '90 s' },
          { exerciseId: 'curl-mancuernas', sets: 3, reps: '10-12', rest: '60 s' },
          { exerciseId: 'extension-polea', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Lower A',
        focus: 'Cuadriceps · Gluteos',
        exercises: [
          { exerciseId: 'sentadilla', sets: 4, reps: '8', rest: '2-3 min' },
          { exerciseId: 'hip-thrust', sets: 4, reps: '10', rest: '2 min' },
          { exerciseId: 'extension-cuad', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'gemelos-sentado', sets: 4, reps: '15', rest: '45 s' },
        ],
      },
      {
        label: 'Upper B',
        focus: 'Hombros · Espalda alta',
        exercises: [
          { exerciseId: 'press-arnold', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'jalon-polea', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'elev-laterales', sets: 4, reps: '12-15', rest: '60 s' },
          { exerciseId: 'face-pull', sets: 4, reps: '15', rest: '60 s' },
          { exerciseId: 'curl-martillo', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Lower B',
        focus: 'Femorales · Gluteos',
        exercises: [
          { exerciseId: 'peso-muerto-rumano', sets: 4, reps: '8-10', rest: '2 min' },
          { exerciseId: 'sentadilla-bulgara', sets: 3, reps: '10 por pierna', rest: '90 s' },
          { exerciseId: 'curl-femoral-sentado', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'russian-twist', sets: 3, reps: '20', rest: '45 s' },
        ],
      },
    ],
  }),

  // ---------- INTERMEDIO / PPL / GYM ----------
  template({
    id: 'tpl-ppl-int-hyp-6-gym',
    name: 'PPL hipertrofia 6 dias',
    description: 'Push / Pull / Legs clasico, 2 vueltas por semana. Volumen alto para hipertrofia intermedia.',
    level: 'intermediate',
    goal: 'hypertrophy',
    daysPerWeek: 6,
    equipment: 'gym',
    split: 'ppl',
    focusLabel: 'Push · Pull · Legs',
    exerciseIds: ['press-banca', 'press-inclinado-mancuernas', 'press-militar', 'elev-laterales', 'extension-polea', 'dominadas', 'remo-barra', 'curl-barra', 'sentadilla', 'peso-muerto-rumano', 'hip-thrust'],
    sortOrder: 30,
    weeklyPlan: [
      {
        label: 'Push',
        focus: 'Pecho · Hombros · Triceps',
        exercises: [
          { exerciseId: 'press-banca', sets: 4, reps: '6-8', rest: '2 min' },
          { exerciseId: 'press-inclinado-mancuernas', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'press-militar', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'elev-laterales', sets: 4, reps: '12-15', rest: '60 s' },
          { exerciseId: 'extension-polea', sets: 4, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Pull',
        focus: 'Espalda · Biceps',
        exercises: [
          { exerciseId: 'dominadas', sets: 4, reps: '6-10', rest: '2 min' },
          { exerciseId: 'remo-barra', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'remo-sentado', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'face-pull', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'curl-barra', sets: 4, reps: '10', rest: '60 s' },
        ],
      },
      {
        label: 'Legs',
        focus: 'Cuadriceps · Gluteos · Femorales',
        exercises: [
          { exerciseId: 'sentadilla', sets: 4, reps: '6-8', rest: '2-3 min' },
          { exerciseId: 'peso-muerto-rumano', sets: 4, reps: '8-10', rest: '2 min' },
          { exerciseId: 'hip-thrust', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'extension-cuad', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'gemelos-de-pie', sets: 4, reps: '15', rest: '45 s' },
        ],
      },
    ],
  }),
  template({
    id: 'tpl-ppl-adv-hyp-6-gym',
    name: 'PPL avanzado 6 dias',
    description: 'Push / Pull / Legs con A/B para evitar estancamiento. Pensado para nivel avanzado.',
    level: 'advanced',
    goal: 'hypertrophy',
    daysPerWeek: 6,
    equipment: 'gym',
    split: 'ppl',
    focusLabel: 'PPL Heavy / Volume',
    exerciseIds: ['press-banca', 'press-inclinado', 'press-cerrado', 'press-militar', 'press-arnold', 'dominadas', 'peso-muerto', 'remo-pendlay', 'sentadilla', 'sentadilla-frontal', 'hip-thrust'],
    sortOrder: 31,
    weeklyPlan: [
      {
        label: 'Push pesado',
        focus: 'Fuerza en empuje',
        exercises: [
          { exerciseId: 'press-banca', sets: 5, reps: '4-6', rest: '3 min' },
          { exerciseId: 'press-militar', sets: 4, reps: '6', rest: '2-3 min' },
          { exerciseId: 'press-cerrado', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'elev-laterales', sets: 4, reps: '15', rest: '45 s' },
        ],
      },
      {
        label: 'Pull pesado',
        focus: 'Fuerza en traccion',
        exercises: [
          { exerciseId: 'peso-muerto', sets: 4, reps: '4-6', rest: '3 min' },
          { exerciseId: 'dominadas', sets: 4, reps: 'maximas', rest: '2-3 min' },
          { exerciseId: 'remo-pendlay', sets: 4, reps: '6-8', rest: '2 min' },
          { exerciseId: 'curl-barra-z', sets: 3, reps: '8', rest: '60 s' },
        ],
      },
      {
        label: 'Legs pesado',
        focus: 'Fuerza en pierna',
        exercises: [
          { exerciseId: 'sentadilla', sets: 5, reps: '4-6', rest: '3 min' },
          { exerciseId: 'peso-muerto-rumano', sets: 4, reps: '6-8', rest: '2-3 min' },
          { exerciseId: 'hip-thrust', sets: 3, reps: '8', rest: '90 s' },
          { exerciseId: 'gemelos-de-pie', sets: 4, reps: '10-12', rest: '45 s' },
        ],
      },
      {
        label: 'Push volumen',
        focus: 'Hipertrofia empuje',
        exercises: [
          { exerciseId: 'press-inclinado', sets: 4, reps: '8-10', rest: '90 s' },
          { exerciseId: 'press-arnold', sets: 3, reps: '12', rest: '90 s' },
          { exerciseId: 'aperturas-mancuernas', sets: 3, reps: '12-15', rest: '60 s' },
          { exerciseId: 'extension-polea', sets: 4, reps: '12-15', rest: '60 s' },
        ],
      },
      {
        label: 'Pull volumen',
        focus: 'Hipertrofia traccion',
        exercises: [
          { exerciseId: 'jalon-polea', sets: 4, reps: '10-12', rest: '90 s' },
          { exerciseId: 'remo-sentado', sets: 4, reps: '12', rest: '90 s' },
          { exerciseId: 'face-pull', sets: 4, reps: '15', rest: '60 s' },
          { exerciseId: 'curl-mancuernas', sets: 4, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Legs volumen',
        focus: 'Hipertrofia pierna',
        exercises: [
          { exerciseId: 'sentadilla-frontal', sets: 4, reps: '8-10', rest: '2 min' },
          { exerciseId: 'prensa', sets: 4, reps: '12', rest: '90 s' },
          { exerciseId: 'curl-femoral-sentado', sets: 4, reps: '12', rest: '60 s' },
          { exerciseId: 'gemelos-sentado', sets: 4, reps: '15-20', rest: '45 s' },
        ],
      },
    ],
  }),

  // ---------- INTERMEDIO / BRO SPLIT / GYM ----------
  template({
    id: 'tpl-bro-int-hyp-5-gym',
    name: 'Bro split clasico 5 dias',
    description: 'Un musculo por dia: pecho, espalda, hombros, pierna, brazos. Volumen alto por grupo.',
    level: 'intermediate',
    goal: 'hypertrophy',
    daysPerWeek: 5,
    equipment: 'gym',
    split: 'bro-split',
    focusLabel: 'Un musculo por dia',
    exerciseIds: ['press-banca', 'press-inclinado', 'aperturas-mancuernas', 'dominadas', 'remo-barra', 'press-militar', 'elev-laterales', 'sentadilla', 'prensa', 'curl-barra', 'press-frances'],
    sortOrder: 40,
    weeklyPlan: [
      {
        label: 'Dia 1 · Pecho',
        focus: 'Pecho completo',
        exercises: [
          { exerciseId: 'press-banca', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'press-inclinado', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'aperturas-mancuernas', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'cruce-poleas', sets: 3, reps: '15', rest: '60 s' },
        ],
      },
      {
        label: 'Dia 2 · Espalda',
        focus: 'Anchura y grosor',
        exercises: [
          { exerciseId: 'dominadas', sets: 4, reps: '8-10', rest: '2 min' },
          { exerciseId: 'remo-barra', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'remo-sentado', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'jalon-polea', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Dia 3 · Hombros',
        focus: 'Deltoides 360',
        exercises: [
          { exerciseId: 'press-militar', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'press-arnold', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'elev-laterales', sets: 4, reps: '12-15', rest: '60 s' },
          { exerciseId: 'pajaros', sets: 4, reps: '15', rest: '45 s' },
        ],
      },
      {
        label: 'Dia 4 · Pierna',
        focus: 'Tren inferior completo',
        exercises: [
          { exerciseId: 'sentadilla', sets: 4, reps: '8', rest: '2-3 min' },
          { exerciseId: 'prensa', sets: 4, reps: '12', rest: '90 s' },
          { exerciseId: 'curl-femoral-tumbado', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'gemelos-de-pie', sets: 4, reps: '15', rest: '45 s' },
        ],
      },
      {
        label: 'Dia 5 · Brazos',
        focus: 'Biceps y triceps',
        exercises: [
          { exerciseId: 'curl-barra', sets: 4, reps: '10', rest: '60 s' },
          { exerciseId: 'curl-martillo', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'press-frances', sets: 4, reps: '10', rest: '60 s' },
          { exerciseId: 'extension-polea', sets: 4, reps: '12', rest: '60 s' },
        ],
      },
    ],
  }),

  // ---------- AVANZADO / UPPER-LOWER / GYM ----------
  template({
    id: 'tpl-ul-adv-str-4-gym',
    name: 'Upper / Lower fuerza avanzada',
    description: 'Periodizacion lineal, semanas pesadas y de descarga. Para atletas con base solida.',
    level: 'advanced',
    goal: 'strength',
    daysPerWeek: 4,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'Upper · Lower · 5x5',
    exerciseIds: ['press-banca', 'remo-pendlay', 'sentadilla', 'peso-muerto', 'press-militar', 'press-cerrado'],
    sortOrder: 50,
    weeklyPlan: [
      {
        label: 'Upper pesado',
        focus: 'Fuerza maxima',
        exercises: [
          { exerciseId: 'press-banca', sets: 5, reps: '3-5', rest: '3-4 min' },
          { exerciseId: 'remo-pendlay', sets: 5, reps: '5', rest: '3 min' },
          { exerciseId: 'press-militar', sets: 4, reps: '5', rest: '3 min' },
          { exerciseId: 'dominadas', sets: 3, reps: 'maximas', rest: '2 min' },
        ],
      },
      {
        label: 'Lower pesado',
        focus: 'Fuerza maxima',
        exercises: [
          { exerciseId: 'sentadilla', sets: 5, reps: '3-5', rest: '3-4 min' },
          { exerciseId: 'peso-muerto', sets: 3, reps: '3', rest: '3-4 min' },
          { exerciseId: 'sentadilla-frontal', sets: 3, reps: '6', rest: '2 min' },
        ],
      },
      {
        label: 'Upper accesorio',
        focus: 'Hipertrofia auxiliar',
        exercises: [
          { exerciseId: 'press-inclinado', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'remo-sentado', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'press-cerrado', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'face-pull', sets: 4, reps: '15', rest: '60 s' },
        ],
      },
      {
        label: 'Lower accesorio',
        focus: 'Volumen y unilateral',
        exercises: [
          { exerciseId: 'peso-muerto-rumano', sets: 4, reps: '6-8', rest: '2 min' },
          { exerciseId: 'sentadilla-bulgara', sets: 3, reps: '8 por pierna', rest: '90 s' },
          { exerciseId: 'hip-thrust', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'plancha', sets: 3, reps: '60 s' },
        ],
      },
    ],
  }),

  // ---------- INTERMEDIO / 5 DIAS / FUERZA ----------
  template({
    id: 'tpl-mix-int-str-5-gym',
    name: 'Fuerza mixta 5 dias',
    description: 'Tres dias de fuerza compuesta + dos de accesorios. Equilibrio entre carga y volumen.',
    level: 'intermediate',
    goal: 'strength',
    daysPerWeek: 5,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'Fuerza · Accesorios',
    exerciseIds: ['sentadilla', 'peso-muerto', 'press-banca', 'press-militar', 'remo-barra', 'dominadas'],
    sortOrder: 51,
    weeklyPlan: [
      {
        label: 'Sentadilla',
        focus: 'Fuerza pierna',
        exercises: [
          { exerciseId: 'sentadilla', sets: 5, reps: '5', rest: '3 min' },
          { exerciseId: 'prensa', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'gemelos-de-pie', sets: 4, reps: '12', rest: '45 s' },
        ],
      },
      {
        label: 'Press banca',
        focus: 'Fuerza empuje',
        exercises: [
          { exerciseId: 'press-banca', sets: 5, reps: '5', rest: '3 min' },
          { exerciseId: 'press-inclinado-mancuernas', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'extension-polea', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Peso muerto',
        focus: 'Fuerza traccion',
        exercises: [
          { exerciseId: 'peso-muerto', sets: 4, reps: '5', rest: '3 min' },
          { exerciseId: 'remo-barra', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'dominadas', sets: 3, reps: 'maximas', rest: '2 min' },
        ],
      },
      {
        label: 'Press militar',
        focus: 'Hombros y brazos',
        exercises: [
          { exerciseId: 'press-militar', sets: 5, reps: '5', rest: '2-3 min' },
          { exerciseId: 'elev-laterales', sets: 4, reps: '12', rest: '60 s' },
          { exerciseId: 'curl-barra', sets: 3, reps: '10', rest: '60 s' },
        ],
      },
      {
        label: 'Accesorios',
        focus: 'Detalle',
        exercises: [
          { exerciseId: 'hip-thrust', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'curl-femoral-sentado', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'face-pull', sets: 4, reps: '15', rest: '60 s' },
          { exerciseId: 'plancha', sets: 3, reps: '60 s' },
        ],
      },
    ],
  }),

  // ---------- AVANZADO / 6 DIAS / FUERZA ----------
  template({
    id: 'tpl-arnold-adv-hyp-6-gym',
    name: 'Arnold split 6 dias',
    description: 'Pecho/espalda - hombros/brazos - pierna, dos vueltas por semana. Volumen alto.',
    level: 'advanced',
    goal: 'hypertrophy',
    daysPerWeek: 6,
    equipment: 'gym',
    split: 'bro-split',
    focusLabel: 'Pecho + Espalda · Brazos · Pierna',
    exerciseIds: ['press-banca', 'press-inclinado', 'dominadas', 'remo-barra', 'press-militar', 'curl-barra', 'press-frances', 'sentadilla', 'peso-muerto-rumano'],
    sortOrder: 52,
    weeklyPlan: [
      {
        label: 'Pecho + Espalda',
        focus: 'Antagonistas superiores',
        exercises: [
          { exerciseId: 'press-banca', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'dominadas', sets: 4, reps: '8-10', rest: '2 min' },
          { exerciseId: 'press-inclinado', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'remo-barra', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'aperturas-mancuernas', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Hombros + Brazos',
        focus: 'Detalle superior',
        exercises: [
          { exerciseId: 'press-militar', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'elev-laterales', sets: 4, reps: '12-15', rest: '60 s' },
          { exerciseId: 'curl-barra', sets: 4, reps: '10', rest: '60 s' },
          { exerciseId: 'press-frances', sets: 4, reps: '10', rest: '60 s' },
          { exerciseId: 'face-pull', sets: 3, reps: '15', rest: '45 s' },
        ],
      },
      {
        label: 'Pierna',
        focus: 'Tren inferior',
        exercises: [
          { exerciseId: 'sentadilla', sets: 5, reps: '8', rest: '2-3 min' },
          { exerciseId: 'peso-muerto-rumano', sets: 4, reps: '10', rest: '2 min' },
          { exerciseId: 'extension-cuad', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'curl-femoral-tumbado', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'gemelos-sentado', sets: 4, reps: '15', rest: '45 s' },
        ],
      },
    ],
  }),

  // ---------- INTERMEDIO / CASA ----------
  template({
    id: 'tpl-home-int-hyp-4',
    name: 'Hipertrofia en casa 4 dias',
    description: 'Upper / lower en casa con mancuernas o banda. Volumen suficiente para ganar masa.',
    level: 'intermediate',
    goal: 'hypertrophy',
    daysPerWeek: 4,
    equipment: 'home',
    split: 'upper-lower',
    focusLabel: 'Casa · Mancuernas',
    exerciseIds: ['flexiones', 'remo-mancuerna', 'press-mancuernas-h', 'curl-mancuernas', 'sentadilla-goblet', 'peso-muerto-rumano', 'glute-bridge'],
    sortOrder: 60,
    weeklyPlan: [
      {
        label: 'Upper A',
        focus: 'Empuje + traccion',
        exercises: [
          { exerciseId: 'press-mancuernas-h', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'remo-mancuerna', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'flexiones', sets: 3, reps: '12-15', rest: '60 s' },
          { exerciseId: 'curl-mancuernas', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'extension-mancuerna', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Lower A',
        focus: 'Sentadilla',
        exercises: [
          { exerciseId: 'sentadilla-goblet', sets: 4, reps: '10', rest: '2 min' },
          { exerciseId: 'sentadilla-bulgara', sets: 3, reps: '10 por pierna', rest: '90 s' },
          { exerciseId: 'glute-bridge', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'plancha', sets: 3, reps: '45 s' },
        ],
      },
      {
        label: 'Upper B',
        focus: 'Hombros + brazos',
        exercises: [
          { exerciseId: 'press-arnold', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'remo-invertido', sets: 4, reps: '10-12', rest: '90 s' },
          { exerciseId: 'elev-laterales', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'curl-martillo', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'flexion-diamante', sets: 3, reps: '10-15', rest: '60 s' },
        ],
      },
      {
        label: 'Lower B',
        focus: 'Femorales + gluteos',
        exercises: [
          { exerciseId: 'peso-muerto-rumano', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'zancadas', sets: 3, reps: '12 por pierna', rest: '90 s' },
          { exerciseId: 'step-up', sets: 3, reps: '12 por pierna', rest: '60 s' },
          { exerciseId: 'crunch', sets: 3, reps: '20' },
        ],
      },
    ],
  }),
  template({
    id: 'tpl-home-int-end-5',
    name: 'Resistencia atletica casa 5 dias',
    description: 'Cinco sesiones cortas de circuito metabolico. Foco en resistencia muscular y cardio.',
    level: 'intermediate',
    goal: 'endurance',
    daysPerWeek: 5,
    equipment: 'home',
    split: 'home-circuit',
    focusLabel: 'Casa · Metabolico',
    exerciseIds: ['sentadilla-aire', 'flexiones', 'mountain-climbers', 'plancha', 'zancadas', 'glute-bridge'],
    sortOrder: 61,
    weeklyPlan: [
      {
        label: 'Full body metabolico',
        focus: 'Circuito x 4 rondas',
        exercises: [
          { exerciseId: 'sentadilla-aire', sets: 4, reps: '25', rest: '30 s' },
          { exerciseId: 'flexiones', sets: 4, reps: '15', rest: '30 s' },
          { exerciseId: 'mountain-climbers', sets: 4, reps: '40', rest: '30 s' },
          { exerciseId: 'plancha', sets: 4, reps: '40 s' },
          { exerciseId: 'zancadas', sets: 4, reps: '20 totales', rest: '30 s' },
        ],
      },
    ],
  }),

  // ---------- AVANZADO / CASA ----------
  template({
    id: 'tpl-home-adv-hyp-5',
    name: 'Calistenia avanzada 5 dias',
    description: 'Progresiones avanzadas de peso corporal: dominadas, fondos, pike, plancha completa.',
    level: 'advanced',
    goal: 'hypertrophy',
    daysPerWeek: 5,
    equipment: 'home',
    split: 'ppl',
    focusLabel: 'Calistenia · Maestria',
    exerciseIds: ['dominadas', 'fondos-paralelas', 'pike-pushup', 'flexion-diamante', 'remo-invertido', 'sentadilla-bulgara', 'glute-bridge'],
    sortOrder: 70,
    weeklyPlan: [
      {
        label: 'Push',
        focus: 'Empuje calistenia',
        exercises: [
          { exerciseId: 'fondos-paralelas', sets: 5, reps: '8-10', rest: '2 min' },
          { exerciseId: 'pike-pushup', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'flexiones-declinadas', sets: 4, reps: '12', rest: '60 s' },
          { exerciseId: 'flexion-diamante', sets: 3, reps: '15', rest: '60 s' },
        ],
      },
      {
        label: 'Pull',
        focus: 'Traccion calistenia',
        exercises: [
          { exerciseId: 'dominadas', sets: 5, reps: '8-10', rest: '2 min' },
          { exerciseId: 'remo-invertido', sets: 4, reps: '10-12', rest: '90 s' },
          { exerciseId: 'curl-banda', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'face-pull', sets: 3, reps: '20 con banda', rest: '60 s' },
        ],
      },
      {
        label: 'Legs',
        focus: 'Tren inferior unilateral',
        exercises: [
          { exerciseId: 'sentadilla-bulgara', sets: 5, reps: '10 por pierna', rest: '2 min' },
          { exerciseId: 'glute-bridge', sets: 4, reps: '20', rest: '60 s' },
          { exerciseId: 'zancadas', sets: 3, reps: '12 por pierna', rest: '60 s' },
          { exerciseId: 'plancha-lateral', sets: 3, reps: '45 s por lado' },
        ],
      },
    ],
  }),

  // ---------- AVANZADO / GYM / FUERZA 5 DIAS ----------
  template({
    id: 'tpl-mix-adv-str-5-gym',
    name: 'Fuerza pura 5 dias',
    description: 'Bloque de fuerza maxima al estilo GZCL: T1 (compuesto pesado), T2 (volumen) y T3 (accesorios).',
    level: 'advanced',
    goal: 'strength',
    daysPerWeek: 5,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'GZCL · T1 / T2 / T3',
    exerciseIds: ['sentadilla', 'press-banca', 'peso-muerto', 'press-militar', 'remo-barra', 'press-inclinado', 'sentadilla-frontal'],
    sortOrder: 71,
    weeklyPlan: [
      {
        label: 'Sentadilla',
        focus: 'T1 pesado',
        exercises: [
          { exerciseId: 'sentadilla', sets: 5, reps: '3', rest: '3-4 min' },
          { exerciseId: 'sentadilla-frontal', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'extension-cuad', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Press banca',
        focus: 'T1 pesado',
        exercises: [
          { exerciseId: 'press-banca', sets: 5, reps: '3', rest: '3-4 min' },
          { exerciseId: 'press-inclinado', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'extension-polea', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Peso muerto',
        focus: 'T1 pesado',
        exercises: [
          { exerciseId: 'peso-muerto', sets: 5, reps: '3', rest: '3-4 min' },
          { exerciseId: 'remo-barra', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'curl-barra', sets: 3, reps: '10', rest: '60 s' },
        ],
      },
      {
        label: 'Press militar',
        focus: 'T2 volumen',
        exercises: [
          { exerciseId: 'press-militar', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'dominadas', sets: 4, reps: '8', rest: '2 min' },
          { exerciseId: 'elev-laterales', sets: 4, reps: '15', rest: '45 s' },
        ],
      },
      {
        label: 'Accesorios',
        focus: 'T3 detalle',
        exercises: [
          { exerciseId: 'hip-thrust', sets: 4, reps: '8', rest: '90 s' },
          { exerciseId: 'face-pull', sets: 4, reps: '15', rest: '45 s' },
          { exerciseId: 'plancha', sets: 3, reps: '60 s' },
        ],
      },
    ],
  }),

  // ---------- PRINCIPIANTE / 4 DIAS / UPPER-LOWER ----------
  template({
    id: 'tpl-ul-beg-hyp-4-gym',
    name: 'Upper / Lower inicial 4 dias',
    description: 'Primer split despues de full-body. Cuatro sesiones cortas con rangos para hipertrofia.',
    level: 'beginner',
    goal: 'hypertrophy',
    daysPerWeek: 4,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'Upper · Lower inicial',
    exerciseIds: ['press-banca-mancuernas', 'jalon-polea', 'sentadilla', 'curl-mancuernas', 'extension-polea', 'hip-thrust'],
    sortOrder: 4,
    weeklyPlan: [
      {
        label: 'Upper A',
        focus: 'Pecho · Espalda',
        exercises: [
          { exerciseId: 'press-banca-mancuernas', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'jalon-polea', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'elev-laterales', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'curl-mancuernas', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'extension-polea', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Lower A',
        focus: 'Cuadriceps · Gluteos',
        exercises: [
          { exerciseId: 'sentadilla', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'hip-thrust', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'extension-cuad', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'plancha', sets: 3, reps: '30 s' },
        ],
      },
      {
        label: 'Upper B',
        focus: 'Hombros · Espalda alta',
        exercises: [
          { exerciseId: 'press-mancuernas-h', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'remo-sentado', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'face-pull', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'curl-martillo', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
      {
        label: 'Lower B',
        focus: 'Femorales · Core',
        exercises: [
          { exerciseId: 'peso-muerto-rumano', sets: 3, reps: '10', rest: '2 min' },
          { exerciseId: 'prensa', sets: 3, reps: '12', rest: '90 s' },
          { exerciseId: 'curl-femoral-tumbado', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'crunch', sets: 3, reps: '20' },
        ],
      },
    ],
  }),

  // ---------- GLUTEOS / MUJERES (popular) ----------
  template({
    id: 'tpl-glute-int-hyp-4-gym',
    name: 'Tren inferior glute focus 4 dias',
    description: 'Programa centrado en gluteos e isquios con dos sesiones de tren inferior y dos de superior corto.',
    level: 'intermediate',
    goal: 'hypertrophy',
    daysPerWeek: 4,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'Gluteos · Femorales',
    exerciseIds: ['hip-thrust', 'sentadilla-sumo', 'peso-muerto-rumano', 'abductor-maquina', 'patada-gluteo', 'press-banca-mancuernas', 'remo-mancuerna'],
    sortOrder: 80,
    weeklyPlan: [
      {
        label: 'Lower glute A',
        focus: 'Gluteos pesado',
        exercises: [
          { exerciseId: 'hip-thrust', sets: 5, reps: '8', rest: '2 min' },
          { exerciseId: 'sentadilla-sumo', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'abductor-maquina', sets: 4, reps: '15', rest: '60 s' },
          { exerciseId: 'patada-gluteo', sets: 3, reps: '12 por pierna', rest: '60 s' },
        ],
      },
      {
        label: 'Upper corto',
        focus: 'Mantenimiento superior',
        exercises: [
          { exerciseId: 'press-banca-mancuernas', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'remo-mancuerna', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'elev-laterales', sets: 3, reps: '15', rest: '60 s' },
        ],
      },
      {
        label: 'Lower glute B',
        focus: 'Femoral y unilateral',
        exercises: [
          { exerciseId: 'peso-muerto-rumano', sets: 4, reps: '10', rest: '2 min' },
          { exerciseId: 'sentadilla-bulgara', sets: 4, reps: '10 por pierna', rest: '90 s' },
          { exerciseId: 'curl-femoral-sentado', sets: 4, reps: '12', rest: '60 s' },
          { exerciseId: 'step-up', sets: 3, reps: '12 por pierna', rest: '60 s' },
        ],
      },
      {
        label: 'Upper corto 2',
        focus: 'Pull dominante',
        exercises: [
          { exerciseId: 'jalon-polea', sets: 3, reps: '12', rest: '90 s' },
          { exerciseId: 'face-pull', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'curl-mancuernas', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'plancha', sets: 3, reps: '60 s' },
        ],
      },
    ],
  }),

  // ---------- PRINCIPIANTE / FUERZA / CASA ----------
  template({
    id: 'tpl-home-beg-str-3',
    name: 'Fuerza basica en casa 3 dias',
    description: 'Patrones basicos de empuje, traccion y sentadilla con peso corporal. Construye base sin gimnasio.',
    level: 'beginner',
    goal: 'strength',
    daysPerWeek: 3,
    equipment: 'home',
    split: 'home-circuit',
    focusLabel: 'Casa · Patrones basicos',
    exerciseIds: ['flexiones', 'remo-invertido', 'sentadilla-aire', 'plancha', 'glute-bridge'],
    sortOrder: 12,
    weeklyPlan: [
      {
        label: 'Sesion patron',
        focus: 'Fuerza con peso corporal',
        exercises: [
          { exerciseId: 'flexiones', sets: 5, reps: '5-8', rest: '90 s', note: 'Progresion: inclinadas si es necesario.' },
          { exerciseId: 'remo-invertido', sets: 5, reps: '5-8', rest: '90 s' },
          { exerciseId: 'sentadilla-aire', sets: 5, reps: '10-15', rest: '90 s' },
          { exerciseId: 'plancha', sets: 3, reps: '30 s' },
          { exerciseId: 'glute-bridge', sets: 3, reps: '15' },
        ],
      },
    ],
  }),

  // ---------- INTERMEDIO / GENERAL / 3 DIAS / GYM ----------
  template({
    id: 'tpl-fb-int-gen-3-gym',
    name: 'Full body sostenible 3 dias',
    description: 'Para personas con tiempo limitado: cubre todo el cuerpo cada sesion con variantes rotativas.',
    level: 'intermediate',
    goal: 'general',
    daysPerWeek: 3,
    equipment: 'gym',
    split: 'full-body',
    focusLabel: 'Full body · 3 sesiones',
    exerciseIds: ['sentadilla', 'press-banca', 'remo-barra', 'press-militar', 'curl-barra', 'plancha'],
    sortOrder: 22,
    weeklyPlan: [
      {
        label: 'Lunes',
        focus: 'Empuje',
        exercises: [
          { exerciseId: 'press-banca', sets: 3, reps: '6-8', rest: '2 min' },
          { exerciseId: 'sentadilla', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'remo-barra', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'plancha', sets: 3, reps: '45 s' },
        ],
      },
      {
        label: 'Miercoles',
        focus: 'Traccion',
        exercises: [
          { exerciseId: 'press-militar', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'peso-muerto-rumano', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'dominadas', sets: 3, reps: 'maximas', rest: '2 min' },
          { exerciseId: 'curl-barra', sets: 3, reps: '10', rest: '60 s' },
        ],
      },
      {
        label: 'Viernes',
        focus: 'Mix',
        exercises: [
          { exerciseId: 'press-inclinado-mancuernas', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'remo-sentado', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'sentadilla-frontal', sets: 3, reps: '8', rest: '2 min' },
          { exerciseId: 'extension-polea', sets: 3, reps: '12', rest: '60 s' },
        ],
      },
    ],
  }),

  // ---------- AVANZADO / 4 DIAS / GENERAL ----------
  template({
    id: 'tpl-ul-adv-gen-4-gym',
    name: 'Salud y rendimiento 4 dias',
    description: 'Para atletas avanzados que priorizan estar en forma y prevenir lesiones, no maximizar fuerza.',
    level: 'advanced',
    goal: 'general',
    daysPerWeek: 4,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'Mantenimiento atletico',
    exerciseIds: ['sentadilla-frontal', 'peso-muerto-rumano', 'press-inclinado-mancuernas', 'remo-mancuerna', 'face-pull', 'hip-thrust'],
    sortOrder: 72,
    weeklyPlan: [
      {
        label: 'Upper movilidad',
        focus: 'Hombro sano + empuje',
        exercises: [
          { exerciseId: 'press-inclinado-mancuernas', sets: 4, reps: '8-10', rest: '90 s' },
          { exerciseId: 'remo-mancuerna', sets: 4, reps: '10', rest: '90 s' },
          { exerciseId: 'face-pull', sets: 4, reps: '15', rest: '45 s' },
          { exerciseId: 'pajaros', sets: 3, reps: '15', rest: '45 s' },
        ],
      },
      {
        label: 'Lower control',
        focus: 'Cadera sana',
        exercises: [
          { exerciseId: 'sentadilla-frontal', sets: 4, reps: '6-8', rest: '2 min' },
          { exerciseId: 'peso-muerto-rumano', sets: 4, reps: '10', rest: '2 min' },
          { exerciseId: 'hip-thrust', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'plancha-lateral', sets: 3, reps: '45 s por lado' },
        ],
      },
      {
        label: 'Upper potencia',
        focus: 'Traccion',
        exercises: [
          { exerciseId: 'dominadas', sets: 4, reps: '6-8', rest: '2 min' },
          { exerciseId: 'press-arnold', sets: 3, reps: '10', rest: '90 s' },
          { exerciseId: 'curl-martillo', sets: 3, reps: '12', rest: '60 s' },
          { exerciseId: 'fondos-paralelas', sets: 3, reps: '10', rest: '90 s' },
        ],
      },
      {
        label: 'Lower potencia',
        focus: 'Unilateral',
        exercises: [
          { exerciseId: 'sentadilla-bulgara', sets: 4, reps: '8 por pierna', rest: '90 s' },
          { exerciseId: 'step-up', sets: 3, reps: '10 por pierna', rest: '60 s' },
          { exerciseId: 'gemelos-de-pie', sets: 4, reps: '15', rest: '45 s' },
          { exerciseId: 'rodillo', sets: 3, reps: '8-10' },
        ],
      },
    ],
  }),

  // ---------- INTERMEDIO / 5 DIAS / RESISTENCIA ----------
  template({
    id: 'tpl-mix-int-end-5-gym',
    name: 'Resistencia muscular 5 dias',
    description: 'Combina compuestos a reps altas con metabolico final. Buena para preparacion fisica general.',
    level: 'intermediate',
    goal: 'endurance',
    daysPerWeek: 5,
    equipment: 'gym',
    split: 'upper-lower',
    focusLabel: 'Reps altas · Metabolico',
    exerciseIds: ['sentadilla-goblet', 'remo-mancuerna', 'press-mancuernas-h', 'mountain-climbers', 'plancha', 'zancadas'],
    sortOrder: 62,
    weeklyPlan: [
      {
        label: 'Upper alta rep',
        focus: 'Resistencia superior',
        exercises: [
          { exerciseId: 'press-mancuernas-h', sets: 4, reps: '15', rest: '60 s' },
          { exerciseId: 'remo-mancuerna', sets: 4, reps: '15', rest: '60 s' },
          { exerciseId: 'press-inclinado-mancuernas', sets: 3, reps: '15', rest: '60 s' },
          { exerciseId: 'face-pull', sets: 3, reps: '20', rest: '45 s' },
        ],
      },
      {
        label: 'Lower alta rep',
        focus: 'Resistencia inferior',
        exercises: [
          { exerciseId: 'sentadilla-goblet', sets: 4, reps: '15', rest: '60 s' },
          { exerciseId: 'zancadas', sets: 4, reps: '12 por pierna', rest: '60 s' },
          { exerciseId: 'glute-bridge', sets: 4, reps: '20', rest: '45 s' },
          { exerciseId: 'gemelos-de-pie', sets: 4, reps: '20', rest: '30 s' },
        ],
      },
      {
        label: 'Metabolico',
        focus: 'Circuito',
        exercises: [
          { exerciseId: 'mountain-climbers', sets: 5, reps: '40', rest: '30 s' },
          { exerciseId: 'plancha', sets: 5, reps: '45 s' },
          { exerciseId: 'flexiones', sets: 5, reps: '15', rest: '30 s' },
          { exerciseId: 'sentadilla-aire', sets: 5, reps: '20', rest: '30 s' },
        ],
      },
      {
        label: 'Upper accesorio',
        focus: 'Detalle',
        exercises: [
          { exerciseId: 'curl-polea', sets: 4, reps: '15', rest: '45 s' },
          { exerciseId: 'extension-polea', sets: 4, reps: '15', rest: '45 s' },
          { exerciseId: 'elev-laterales', sets: 4, reps: '20', rest: '30 s' },
        ],
      },
      {
        label: 'Lower accesorio',
        focus: 'Core',
        exercises: [
          { exerciseId: 'russian-twist', sets: 4, reps: '30', rest: '30 s' },
          { exerciseId: 'crunch', sets: 4, reps: '20' },
          { exerciseId: 'plancha-lateral', sets: 3, reps: '45 s por lado' },
        ],
      },
    ],
  }),
];
