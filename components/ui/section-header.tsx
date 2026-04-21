import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useGymColors } from '@/hooks/use-gym-colors';
import { Fonts } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode | string;
  style?: ViewStyle;
}

export function SectionHeader({ title, right, style }: SectionHeaderProps) {
  const colors = useGymColors();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {typeof right === 'string' ? (
        <Text style={[styles.rightText, { color: colors.textSecondary }]}>{right}</Text>
      ) : (
        right
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rightText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
