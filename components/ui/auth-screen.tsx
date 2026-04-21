import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGymColors } from '@/hooks/use-gym-colors';

interface AuthScreenProps {
  children: React.ReactNode;
  topPadding?: number;
  contentStyle?: ViewStyle;
  centered?: boolean;
}

export function AuthScreen({
  children,
  topPadding = 16,
  contentStyle,
  centered = false,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const colors = useGymColors();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgCanvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          centered && styles.centered,
          { paddingTop: insets.top + topPadding },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  centered: {
    justifyContent: 'center',
  },
});
