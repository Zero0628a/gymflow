import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGymColors } from '@/hooks/use-gym-colors';
import { Fonts } from '@/constants/theme';

interface FormErrorProps {
  message?: string | null;
  style?: ViewStyle;
}

export function FormError({ message, style }: FormErrorProps) {
  const colors = useGymColors();

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.danger + '14', borderColor: colors.danger + '55' },
        style,
      ]}>
      <Ionicons name="alert-circle" size={16} color={colors.danger} />
      <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.bodySemiBold,
  },
});
