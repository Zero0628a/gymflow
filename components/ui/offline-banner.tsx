import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useNetwork } from '@/providers/network-provider';

// Banner que aparece arriba de toda la app cuando no hay conexion. Se anima
// entrando desde arriba para no romper el layout al salir/entrar.
export function OfflineBanner() {
  const { isOnline } = useNetwork();
  const colors = useGymColors();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOnline ? 0 : 1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [isOnline, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -8 }],
  }));

  if (isOnline) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          paddingTop: insets.top + 6,
          backgroundColor: colors.warning + 'F2',
        },
        animatedStyle,
      ]}>
      <Ionicons name="cloud-offline-outline" size={16} color="#1a1a1a" />
      <Text style={styles.text}>Sin conexion - mostrando datos guardados</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1000,
    elevation: 1000,
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
});
