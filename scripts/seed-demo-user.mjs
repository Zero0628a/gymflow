// Crea un usuario demo con mas de un mes de historial progresivo.
//
// Uso:
//   npm run seed:demo-user
//
// Credenciales creadas:
//   Email: defensa.final@gymflow.demo
//   Password: Defensa2026!

const firebaseConfig = {
  apiKey: 'AIzaSyALOEzxJbAIE1WhSRpawqehqksMpoOPnHM',
  projectId: 'gymflow-7d764',
};

const DEMO_USER = {
  email: 'defensa.final@gymflow.demo',
  password: 'Defensa2026!',
  displayName: 'Usuario Defensa Final',
};

const routineId = 'demo-fuerza-hipertrofia-4d';
const routineName = 'Progreso fuerza e hipertrofia 4 dias';
const createdAt = '2026-04-20T12:00:00.000Z';
const updatedAt = '2026-06-01T12:00:00.000Z';

const weeklyPlan = [
  {
    label: 'Upper fuerza',
    focus: 'Pecho y espalda pesado',
    exercises: [
      { exerciseId: 'press-banca', sets: 4, reps: '5', rest: '2-3 min' },
      { exerciseId: 'remo-barra', sets: 4, reps: '6', rest: '2 min' },
      { exerciseId: 'press-militar', sets: 3, reps: '6', rest: '2 min' },
      { exerciseId: 'dominadas', sets: 3, reps: 'maximas', rest: '90 s' },
    ],
  },
  {
    label: 'Lower fuerza',
    focus: 'Sentadilla y cadena posterior',
    exercises: [
      { exerciseId: 'sentadilla', sets: 4, reps: '5', rest: '2-3 min' },
      { exerciseId: 'peso-muerto-rumano', sets: 3, reps: '8', rest: '2 min' },
      { exerciseId: 'prensa', sets: 3, reps: '10', rest: '90 s' },
      { exerciseId: 'plancha', sets: 3, reps: '45 s', rest: '45 s' },
    ],
  },
  {
    label: 'Upper volumen',
    focus: 'Hipertrofia superior',
    exercises: [
      { exerciseId: 'press-inclinado-mancuernas', sets: 3, reps: '10', rest: '90 s' },
      { exerciseId: 'jalon-polea', sets: 3, reps: '10', rest: '90 s' },
      { exerciseId: 'elev-laterales', sets: 3, reps: '15', rest: '60 s' },
      { exerciseId: 'curl-barra', sets: 3, reps: '12', rest: '60 s' },
    ],
  },
  {
    label: 'Lower volumen',
    focus: 'Piernas y gluteos',
    exercises: [
      { exerciseId: 'hip-thrust', sets: 4, reps: '8', rest: '2 min' },
      { exerciseId: 'sentadilla-bulgara', sets: 3, reps: '10 por pierna', rest: '90 s' },
      { exerciseId: 'curl-femoral-sentado', sets: 3, reps: '12', rest: '60 s' },
      { exerciseId: 'gemelos-de-pie', sets: 4, reps: '15', rest: '45 s' },
    ],
  },
];

const sessions = [
  ['2026-04-20', 0, 0, 'completed'],
  ['2026-04-21', 1, 0, 'completed'],
  ['2026-04-23', 2, 0, 'completed'],
  ['2026-04-25', 3, 0, 'partial'],
  ['2026-04-27', 0, 1, 'completed'],
  ['2026-04-28', 1, 1, 'completed'],
  ['2026-04-30', 2, 1, 'completed'],
  ['2026-05-02', 3, 1, 'completed'],
  ['2026-05-04', 0, 2, 'completed'],
  ['2026-05-05', 1, 2, 'completed'],
  ['2026-05-07', 2, 2, 'postponed'],
  ['2026-05-09', 3, 2, 'completed'],
  ['2026-05-11', 0, 3, 'completed'],
  ['2026-05-12', 1, 3, 'partial'],
  ['2026-05-14', 2, 3, 'completed'],
  ['2026-05-16', 3, 3, 'completed'],
  ['2026-05-18', 0, 4, 'completed'],
  ['2026-05-19', 1, 4, 'completed'],
  ['2026-05-21', 2, 4, 'completed'],
  ['2026-05-23', 3, 4, 'completed'],
  ['2026-05-25', 0, 5, 'completed'],
  ['2026-05-26', 1, 5, 'completed'],
  ['2026-05-28', 2, 5, 'completed'],
  ['2026-05-30', 3, 5, 'completed'],
];

const firestoreBase =
  `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}` +
  '/databases/(default)/documents';

function isoForDate(dateKey, hour = 19) {
  return `${dateKey}T${String(hour).padStart(2, '0')}:20:00.000Z`;
}

function completedSetsFor(plannedExercises, completedCount = plannedExercises.length) {
  return plannedExercises.slice(0, completedCount).reduce((acc, exercise) => {
    acc[exercise.exerciseId] = Array.from({ length: exercise.sets }, (_, index) => index);
    return acc;
  }, {});
}

function logSets(weight, reps, sets, rpe = 8) {
  return Array.from({ length: sets }, (_, index) => ({
    setNumber: index + 1,
    weight,
    reps,
    rpe: index === sets - 1 ? rpe + 0.5 : rpe,
  }));
}

function buildLogsForSession(sessionIndex, weekIndex) {
  const w = weekIndex;
  if (sessionIndex === 0) {
    return {
      'press-banca': logSets(45 + w * 2.5, 5, 4),
      'remo-barra': logSets(40 + w * 2.5, 6, 4),
      'press-militar': logSets(25 + w * 1.5, 6, 3),
      dominadas: logSets(0, 6 + w, 3),
    };
  }

  if (sessionIndex === 1) {
    return {
      sentadilla: logSets(55 + w * 5, 5, 4),
      'peso-muerto-rumano': logSets(50 + w * 4, 8, 3),
      prensa: logSets(90 + w * 7.5, 10, 3),
      plancha: logSets(0, 45 + w * 5, 3, 7),
    };
  }

  if (sessionIndex === 2) {
    return {
      'press-inclinado-mancuernas': logSets(16 + w, 10, 3),
      'jalon-polea': logSets(45 + w * 2.5, 10, 3),
      'elev-laterales': logSets(7 + w * 0.5, 15, 3, 7),
      'curl-barra': logSets(20 + w * 1.5, 12, 3),
    };
  }

  return {
    'hip-thrust': logSets(70 + w * 5, 8, 4),
    'sentadilla-bulgara': logSets(12 + w, 10, 3),
    'curl-femoral-sentado': logSets(35 + w * 2.5, 12, 3),
    'gemelos-de-pie': logSets(45 + w * 3, 15, 4, 7),
  };
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, nestedValue]) => [key, toFirestoreValue(nestedValue)])
        ),
      },
    };
  }
  throw new Error(`Valor Firestore no soportado: ${value}`);
}

function toFirestoreDocument(data) {
  return {
    fields: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)])
    ),
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.error?.message ?? response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function authRequest(endpoint, body) {
  return requestJson(
    `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

async function signInOrCreateDemoUser() {
  try {
    const result = await authRequest('accounts:signUp', {
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      returnSecureToken: true,
    });
    await authRequest('accounts:update', {
      idToken: result.idToken,
      displayName: DEMO_USER.displayName,
      returnSecureToken: false,
    });
    return result;
  } catch (error) {
    if (error.message !== 'EMAIL_EXISTS') throw error;
    const result = await authRequest('accounts:signInWithPassword', {
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      returnSecureToken: true,
    });
    await authRequest('accounts:update', {
      idToken: result.idToken,
      displayName: DEMO_USER.displayName,
      returnSecureToken: false,
    });
    return result;
  }
}

async function firestoreRequest(idToken, method, path, data) {
  return requestJson(`${firestoreBase}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${idToken}` },
    body: data ? JSON.stringify(toFirestoreDocument(data)) : undefined,
  });
}

async function listCollection(idToken, path) {
  try {
    const payload = await requestJson(`${firestoreBase}/${path}?pageSize=300`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    return payload?.documents ?? [];
  } catch (error) {
    if (error.status === 404) return [];
    throw error;
  }
}

async function deleteDocumentByName(idToken, documentName) {
  const response = await fetch(`https://firestore.googleapis.com/v1/${documentName}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
}

async function deleteCollection(idToken, uid, collectionName) {
  const documents = await listCollection(idToken, `users/${uid}/${collectionName}`);
  await Promise.all(documents.map((document) => deleteDocumentByName(idToken, document.name)));
}

async function seedDemoData(user) {
  const uid = user.localId;
  const idToken = user.idToken;

  await Promise.all([
    deleteCollection(idToken, uid, 'routines'),
    deleteCollection(idToken, uid, 'training_days'),
    deleteCollection(idToken, uid, 'workout_sessions'),
    deleteCollection(idToken, uid, 'exercise_logs'),
  ]);

  await firestoreRequest(idToken, 'PATCH', `users/${uid}`, {
    email: DEMO_USER.email,
    displayName: DEMO_USER.displayName,
    purpose: 'defensa-final-demo',
    updatedAt,
  });

  await firestoreRequest(idToken, 'PATCH', `users/${uid}/profile/main`, {
    goal: 'hypertrophy',
    level: 'intermediate',
    daysPerWeek: 4,
    trainingWeekdays: [1, 2, 4, 6],
    equipment: 'gym',
    completedOnboarding: true,
    updatedAt,
  });

  await firestoreRequest(idToken, 'PATCH', `users/${uid}/routines/${routineId}`, {
    name: routineName,
    exerciseIds: Array.from(new Set(weeklyPlan.flatMap((day) => day.exercises.map((ex) => ex.exerciseId)))),
    createdAt,
    updatedAt,
    lastUsedAt: updatedAt,
    cycleStartedAt: createdAt,
    status: 'active',
    source: 'custom',
    focusLabel: 'Fuerza + hipertrofia',
    description: 'Rutina demo con progresion semanal de cargas para defensa final.',
    level: 'intermediate',
    goal: 'hypertrophy',
    daysPerWeek: 4,
    equipment: 'gym',
    split: 'upper-lower',
    weeklyPlan,
  });

  for (const [dateKey, sessionIndex, weekIndex, status] of sessions) {
    const plan = weeklyPlan[sessionIndex];
    const completedCount =
      status === 'completed' ? plan.exercises.length : status === 'partial' ? 2 : 0;
    const completedExerciseIds = plan.exercises
      .slice(0, completedCount)
      .map((exercise) => exercise.exerciseId);
    const completedSets = status === 'postponed'
      ? {}
      : completedSetsFor(plan.exercises, completedCount);
    const baseDoc = {
      dateKey,
      status,
      completedExerciseIds,
      completedSets,
      completedAt: status === 'completed' ? isoForDate(dateKey) : null,
      postponedAt: status === 'postponed' ? isoForDate(dateKey, 9) : null,
      routineId,
      routineName,
      sessionLabel: plan.label,
      sessionFocus: plan.focus,
      plannedExercises: plan.exercises,
      updatedAt: isoForDate(dateKey),
    };

    await Promise.all([
      firestoreRequest(idToken, 'PATCH', `users/${uid}/training_days/${dateKey}`, baseDoc),
      firestoreRequest(idToken, 'PATCH', `users/${uid}/workout_sessions/${dateKey}`, baseDoc),
    ]);

    if (status !== 'postponed') {
      const logs = buildLogsForSession(sessionIndex, weekIndex);
      await Promise.all(completedExerciseIds.map((exerciseId) =>
        firestoreRequest(idToken, 'PATCH', `users/${uid}/exercise_logs/${dateKey}_${exerciseId}`, {
          dateKey,
          exerciseId,
          sets: logs[exerciseId],
          note: weekIndex >= 4 ? 'Mejor control y cierre fuerte de la sesion.' : null,
          updatedAt: isoForDate(dateKey),
        })
      ));
    }
  }
}

async function main() {
  console.log('Creando usuario demo para defensa final...');
  const user = await signInOrCreateDemoUser();
  await seedDemoData(user);

  console.log('\nDemo listo.');
  console.log(`Email: ${DEMO_USER.email}`);
  console.log(`Password: ${DEMO_USER.password}`);
  console.log(`UID: ${user.localId}`);
  console.log(`Historial: ${sessions[0][0]} a ${sessions.at(-1)[0]} (${sessions.length} sesiones)`);
}

main().catch((error) => {
  console.error('\nNo se pudo crear el usuario demo:', error);
  process.exit(1);
});
