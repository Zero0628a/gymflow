import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'outline';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const colors = useGymColors();

  const map: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
    default: { bg: colors.bgSurfaceAlt, text: colors.accent },
    success: { bg: colors.success + '20', text: colors.success },
    danger: { bg: colors.danger + '18', text: colors.danger },
    warning: { bg: colors.warning + '20', text: colors.warning },
    outline: { bg: 'transparent', text: colors.textPrimary, border: colors.borderStrong },
  };

  const v = map[variant];

  return (
    <View style={[
      styles.base,
      { backgroundColor: v.bg },
      v.border ? { borderWidth: 1.5, borderColor: v.border } : undefined,
      style,
    ]}>
      <Text style={[styles.text, { color: v.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
