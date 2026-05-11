import type { ImageSourcePropType } from 'react-native';

const muscleImages: Record<string, ImageSourcePropType> = {
  pecho: require('@/assets/musculos/pecho.png'),
  espalda: require('@/assets/musculos/espalda.png'),
  piernas: require('@/assets/musculos/cuadriceceps.png'),
  hombros: require('@/assets/musculos/hombros.png'),
  brazos: require('@/assets/musculos/brazos.png'),
  abdomen: require('@/assets/musculos/abdomen.png'),
};

export function getMuscleImage(imageKey?: string) {
  if (!imageKey) {
    return undefined;
  }

  return muscleImages[imageKey];
}
