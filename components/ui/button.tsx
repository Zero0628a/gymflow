import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGymColors } from '@/hooks/use-gym-colors';
import { Fonts, type ThemeColors } from '@/constants/theme';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

function getVariant(variant: Variant, c: ThemeColors) {
  return {
    default: {
      bg: c.accent,
      text: c.textInverse,
      border: 'transparent',
    },
    outline: {
      bg: 'transparent',
      text: c.textPrimary,
      border: c.borderStrong,
    },
    ghost: {
      bg: 'transparent',
      text: c.textPrimary,
      border: 'transparent',
    },
    destructive: {
      bg: c.danger,
      text: c.textInverse,
      border: 'transparent',
    },
  }[variant];
}

const sizeMap: Record<Size, { height: number; px: number; gap: number; fontSize: number; iconSize: number }> = {
  sm: { height: 36, px: 14, gap: 5,  fontSize: 13, iconSize: 14 },
  md: { height: 48, px: 18, gap: 7,  fontSize: 15, iconSize: 16 },
  lg: { height: 56, px: 22, gap: 8,  fontSize: 17, iconSize: 18 },
};

export function Button({
  children,
  onPress,
  variant  = 'default',
  size     = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading  = false,
  style,
}: ButtonProps) {
  const colors = useGymColors();
  const v      = getVariant(variant, colors);
  const s      = sizeMap[size];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.px,
          gap: s.gap,
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: v.border !== 'transparent' ? 1.5 : 0,
        },
        pressed && !disabled && !loading && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={s.iconSize} color={v.text} />
          )}
          <Text style={[styles.text, { fontSize: s.fontSize, color: v.text }]}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={s.iconSize} color={v.text} />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  text: {
    fontFamily: Fonts.bodyBold,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.86,
  },
});
