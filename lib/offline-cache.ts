import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache simple sobre AsyncStorage para datos de Firestore. Permite que la app
// muestre algo coherente cuando arranca sin internet o cuando la conexion se
// cae. Cada clave guarda un envoltorio con version + payload para poder
// invalidar caches viejas si cambia el formato.

const CACHE_VERSION = 1;
const PREFIX = '@gymflow/cache/v1';

type CacheEnvelope<T> = {
  version: number;
  savedAt: string;
  payload: T;
};

function makeKey(scope: string, ownerId?: string | null) {
  return ownerId ? `${PREFIX}/${scope}/${ownerId}` : `${PREFIX}/${scope}`;
}

export async function saveCache<T>(scope: string, ownerId: string | null, payload: T): Promise<void> {
  try {
    const envelope: CacheEnvelope<T> = {
      version: CACHE_VERSION,
      savedAt: new Date().toISOString(),
      payload,
    };
    await AsyncStorage.setItem(makeKey(scope, ownerId), JSON.stringify(envelope));
  } catch (error) {
    console.warn(`[offline-cache] no se pudo guardar ${scope}:`, error);
  }
}

export async function loadCache<T>(scope: string, ownerId: string | null): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(makeKey(scope, ownerId));
    if (!raw) return null;
    const envelope = JSON.parse(raw) as CacheEnvelope<T>;
    if (!envelope || envelope.version !== CACHE_VERSION) return null;
    return envelope.payload;
  } catch (error) {
    console.warn(`[offline-cache] no se pudo leer ${scope}:`, error);
    return null;
  }
}

export async function clearCache(scope: string, ownerId?: string | null): Promise<void> {
  try {
    await AsyncStorage.removeItem(makeKey(scope, ownerId ?? null));
  } catch (error) {
    console.warn(`[offline-cache] no se pudo borrar ${scope}:`, error);
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((key) => key.startsWith(PREFIX));
    if (ours.length > 0) await AsyncStorage.multiRemove(ours);
  } catch (error) {
    console.warn('[offline-cache] no se pudo limpiar:', error);
  }
}

export const CACHE_SCOPES = {
  muscles: 'catalog/muscles',
  exercises: 'catalog/exercises',
  variants: 'catalog/variants',
  routineTemplates: 'catalog/routineTemplates',
  routines: 'user/routines',
  trainingDays: 'user/trainingDays',
  exerciseLogs: 'user/exerciseLogs',
  workoutSessions: 'user/workoutSessions',
} as const;
