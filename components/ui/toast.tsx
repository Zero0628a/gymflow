import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';

export type ToastVariant = 'error' | 'warning' | 'info';

type Props = {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  onHide: () => void;
  duration?: number;
};

export function Toast({ visible, message, variant = 'error', onHide, duration = 3000 }: Props) {
  const colors = useGymColors();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const palette = {
    error: { bg: colors.danger, icon: 'alert-circle' as const },
    warning: { bg: colors.warning, icon: 'warning' as const },
    info: { bg: colors.accent, icon: 'information-circle' as const },
  }[variant];

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withDelay(
        duration,
        withTiming(-100, { duration: 250 }, (finished) => {
          if (finished) runOnJS(onHide)();
        })
      );
      opacity.value = withDelay(duration, withTiming(0, { duration: 250 }));
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 12, backgroundColor: palette.bg },
        animStyle,
      ]}>
      <Ionicons name={palette.icon} size={18} color="#fff" />
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: '#fff',
    lineHeight: 18,
  },
});
