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
import { GymFlowColors } from '@/constants/theme';

export default function RegisterScreen() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleRegister() {
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={GymFlowColors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a GymFlow y entrena mejor</Text>
        </View>

        <View style={styles.card}>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={GymFlowColors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={GymFlowColors.textMuted}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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
                placeholder="Mínimo 6 caracteres"
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

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginLinkText}>
              ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
            </Text>
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
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  backText: {
    color: GymFlowColors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  titleBlock: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: GymFlowColors.primaryDark,
  },
  subtitle: {
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
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: GymFlowColors.textSecondary,
  },
  loginLinkBold: {
    color: GymFlowColors.primary,
    fontWeight: '700',
  },
});
