import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGymColors } from '@/hooks/use-gym-colors';
import { Fonts } from '@/constants/theme';
import { Card } from './card';

interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  showChevron = false,
  onPress,
  children,
  style,
  variant = 'elevated',
}: ListItemProps) {
  const colors = useGymColors();

  return (
    <Card onPress={onPress} variant={variant} style={style}>
      <View style={styles.row}>
        {left && <View style={styles.left}>{left}</View>}

        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {children}
        </View>

        {right && <View style={styles.right}>{right}</View>}

        {!right && showChevron && (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    marginRight: 12,
  },
  right: {
    marginLeft: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  subtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
  },
});
