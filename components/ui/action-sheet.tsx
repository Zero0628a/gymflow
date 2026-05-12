import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';

export type ActionSheetOption = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'destructive';
  onPress: () => void;
};

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
  onClose: () => void;
};

export function ActionSheet({ visible, title, subtitle, options, onClose }: Props) {
  const colors = useGymColors();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(600)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 600,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, overlayOpacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>

      {/* Overlay oscuro — solo opacidad, no se mueve */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet — solo sube/baja */}
      <Animated.View
        style={[
          styles.sheetWrapper,
          { transform: [{ translateY }] },
        ]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bgSurface,
              paddingBottom: insets.bottom + 12,
            },
          ]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />

          {/* Header */}
          {(title || subtitle) && (
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              {title && (
                <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {/* Options */}
          <View style={[styles.options, { borderColor: colors.border }]}>
            {options.map((option, index) => {
              const isDestructive = option.variant === 'destructive';
              const color = isDestructive ? colors.danger : colors.textPrimary;
              const isLast = index === options.length - 1;

              return (
                <Pressable
                  key={option.label}
                  onPress={() => {
                    onClose();
                    setTimeout(option.onPress, 250);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.bgSurfaceAlt },
                  ]}>
                  {option.icon && (
                    <Ionicons name={option.icon} size={20} color={color} />
                  )}
                  <Text style={[styles.optionLabel, { color }]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Cancel */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelBtn,
              { borderColor: colors.border, backgroundColor: colors.bgSurfaceAlt },
              pressed && { opacity: 0.7 },
            ]}>
            <Text style={[styles.cancelLabel, { color: colors.textSecondary }]}>Cancelar</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 14,
    marginBottom: 4,
    gap: 4,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  options: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    flex: 1,
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
  },
});
