import { View, StyleSheet, ViewStyle } from 'react-native';
import { useGymColors } from '@/hooks/use-gym-colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function Screen({ children, style, padded = false }: ScreenProps) {
  const colors = useGymColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bgCanvas },
        padded && styles.padded,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
    padding: 20,
  },
});
