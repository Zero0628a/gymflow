import { Linking } from 'react-native';

export function buildExerciseVideoSearchUrl(exerciseName: string) {
  const query = `${exerciseName} tecnica correcta ejercicio`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export async function openExerciseVideoSearch(exerciseName: string) {
  const url = buildExerciseVideoSearchUrl(exerciseName);
  await Linking.openURL(url);
}
