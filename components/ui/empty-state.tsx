import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGymColors } from '@/hooks/use-gym-colors';
import { Fonts } from '@/constants/theme';
import { Button } from './button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon = 'document-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const colors = useGymColors();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.border,
          },
        ]}>
        <Ionicons name={icon} size={36} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction} size="md" style={styles.action}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    gap: 12,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  description: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: 8,
  },
});
