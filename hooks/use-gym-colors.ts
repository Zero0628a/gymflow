import { useColorScheme } from '@/hooks/use-color-scheme';
import { GymFlowColors, GymFlowDarkColors } from '@/constants/theme';

export function useGymColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? GymFlowDarkColors : GymFlowColors;
}
