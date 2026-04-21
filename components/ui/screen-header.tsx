import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGymColors } from '@/hooks/use-gym-colors';
import { Fonts } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenHeader({ title, subtitle, left, right, style }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = useGymColors();

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top + 12,
        backgroundColor: colors.bgSurface,
        borderBottomColor: colors.border,
      },
      style,
    ]}>
      {left && <View style={styles.side}>{left}</View>}

      <View style={styles.center}>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      </View>

      {right && <View style={styles.side}>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  center:   { flex: 1 },
  side:     { alignItems: 'center', justifyContent: 'center' },
  subtitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
