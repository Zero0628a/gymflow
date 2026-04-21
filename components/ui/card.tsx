import { Pressable, View, ViewStyle } from 'react-native';
import { useGymColors } from '@/hooks/use-gym-colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({ children, onPress, style, variant = 'elevated' }: CardProps) {
  const colors = useGymColors();

  const variantStyle: ViewStyle = {
    elevated: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    outlined: {
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    flat: {
      borderWidth: 1,
      borderColor: colors.border,
    },
  }[variant];

  const baseStyle: ViewStyle = {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.bgSurface,
  };

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [baseStyle, variantStyle, pressed && { opacity: 0.92 }, style]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[baseStyle, variantStyle, style]}>
      {children}
    </View>
  );
}
