import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGymColors } from '@/hooks/use-gym-colors';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'soft' | 'solid' | 'tinted';

interface IconCircleProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: Size;
  variant?: Variant;
  color?: string;
  style?: ViewStyle;
}

const sizeMap: Record<Size, { box: number; icon: number }> = {
  sm: { box: 32, icon: 16 },
  md: { box: 44, icon: 20 },
  lg: { box: 52, icon: 26 },
};

export function IconCircle({
  icon,
  size = 'md',
  variant = 'soft',
  color,
  style,
}: IconCircleProps) {
  const colors = useGymColors();
  const tint = color ?? colors.primary;
  const s = sizeMap[size];

  const variantStyle: { bg: string; fg: string } = {
    soft: { bg: tint + '20', fg: tint },
    solid: { bg: tint, fg: colors.textInverse },
    tinted: { bg: colors.bgSurfaceAlt, fg: tint },
  }[variant];

  return (
    <View
      style={[
        styles.base,
        {
          width: s.box,
          height: s.box,
          borderRadius: s.box / 2,
          backgroundColor: variantStyle.bg,
        },
        style,
      ]}>
      <Ionicons name={icon} size={s.icon} color={variantStyle.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
