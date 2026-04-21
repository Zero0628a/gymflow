import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGymColors } from '@/hooks/use-gym-colors';
import { Fonts } from '@/constants/theme';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  closeIcon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  style?: ViewStyle;
}

export function ModalHeader({
  title,
  onClose,
  closeIcon = 'close',
  actionLabel,
  onAction,
  actionDisabled = false,
  style,
}: ModalHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = useGymColors();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
          backgroundColor: colors.bgSurface,
          borderBottomColor: colors.border,
        },
        style,
      ]}>
      <Pressable onPress={onClose} hitSlop={8}>
        <Ionicons name={closeIcon} size={24} color={colors.textSecondary} />
      </Pressable>

      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
        {title}
      </Text>

      {actionLabel && onAction ? (
        <Pressable onPress={onAction} disabled={actionDisabled} hitSlop={8}>
          <Text
            style={[
              styles.action,
              { color: actionDisabled ? colors.textMuted : colors.accent },
            ]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  action: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  placeholder: {
    width: 24,
  },
});
