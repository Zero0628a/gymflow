import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GymFlowColors } from '@/constants/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleLogin() {
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 32 }]} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="barbell" size={40} color={GymFlowColors.white} />
          </View>
          <Text style={styles.appName}>GymFlow</Text>
          <Text style={styles.tagline}>Entrena sin interrupciones</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar sesión</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={GymFlowColors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={GymFlowColors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={GymFlowColors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="••••••••"
                placeholderTextColor={GymFlowColors.textMuted}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeButton}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={GymFlowColors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.75}>
            <Text style={styles.secondaryButtonText}>Crear cuenta nueva</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GymFlowColors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GymFlowColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: GymFlowColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: GymFlowColors.primaryDark,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: GymFlowColors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: GymFlowColors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: GymFlowColors.textPrimary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: GymFlowColors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GymFlowColors.border,
    borderRadius: 12,
    backgroundColor: GymFlowColors.surfaceAlt,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: GymFlowColors.textPrimary,
  },
  inputFlex: {
    flex: 1,
  },
  eyeButton: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: GymFlowColors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: GymFlowColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: GymFlowColors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: GymFlowColors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: GymFlowColors.textMuted,
    fontSize: 13,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: GymFlowColors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: GymFlowColors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
