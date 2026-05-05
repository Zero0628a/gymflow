import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardTypeOptions, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGymColors } from '@/hooks/use-gym-colors';
import { Fonts } from '@/constants/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  style?: ViewStyle;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType    = 'default',
  autoCapitalize  = 'sentences',
  error,
  style,
}: InputProps) {
  const colors              = useGymColors();
  const [showSecret, setShowSecret] = useState(false);
  const [focused, setFocused]       = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}

      <View style={[
        styles.row,
        { borderColor: colors.border, backgroundColor: colors.bgSurfaceAlt },
        focused && { borderColor: colors.accent, backgroundColor: colors.bgSurface },
        !!error  && { borderColor: colors.danger },
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.accent : colors.textSecondary}
            style={styles.iconLeft}
          />
        )}
        <TextInput
          style={[styles.input, { color: colors.textPrimary, backgroundColor: 'transparent' }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showSecret}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          underlineColorAndroid="transparent"
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowSecret(!showSecret)} style={styles.eye}>
            <Ionicons
              name={showSecret ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  iconLeft: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.bodyRegular,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  eye:      { padding: 4 },
  error: { fontSize: 12, lineHeight: 16, fontFamily: Fonts.bodyRegular },
});
