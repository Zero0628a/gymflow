import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AuthScreen } from '@/components/ui/auth-screen';
import { Button }     from '@/components/ui/button';
import { FormError }  from '@/components/ui/form-error';
import { Input }      from '@/components/ui/input';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useAuth } from '@/providers/auth-provider';
import { Fonts } from '@/constants/theme';

export default function RegisterScreen() {
  const colors = useGymColors();
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    let valid = true;

    if (!name.trim()) {
      setNameError('Ingresa tu nombre.');
      valid = false;
    } else {
      setNameError('');
    }

    if (!email.trim()) {
      setEmailError('Ingresa tu correo.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    return valid;
  }

  async function handleRegister() {
    if (!validate()) return;

    setSubmitError('');
    setLoading(true);

    try {
      await register({ name, email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
      const code = error?.code ?? '';
      console.error('Error al registrar usuario:', error);
      if (code.includes('email-already-in-use')) {
        setEmailError('Ese correo ya está registrado.');
      } else if (code.includes('invalid-email')) {
        setEmailError('El correo no es válido.');
      } else if (code.includes('weak-password')) {
        setPasswordError('La contraseña es demasiado débil.');
      } else if (code.includes('operation-not-allowed')) {
        setSubmitError('Firebase no tiene habilitado Email/Password en Authentication.');
      } else if (code.includes('network-request-failed')) {
        setSubmitError('No se pudo conectar con Firebase. Revisa tu internet.');
      } else {
        setSubmitError(`No se pudo crear la cuenta (${code || 'error-desconocido'}).`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Acceso</Text>
      </Pressable>

      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: colors.primaryDark }]}>Crear cuenta</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Configura tu acceso
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
        <Input
          label="Nombre completo"
          placeholder="Tu nombre"
          value={name}
          onChangeText={setName}
          icon="person-outline"
          autoCapitalize="words"
          style={styles.field}
          error={nameError}
        />
        <Input
          label="Correo electrónico"
          placeholder="correo@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.field}
          error={emailError}
        />
        <Input
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          icon="lock-closed-outline"
          secureTextEntry
          style={styles.field}
          error={passwordError}
        />
        <Input
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          icon="shield-checkmark-outline"
          secureTextEntry
          style={styles.field}
          error={confirmPasswordError}
        />

        <FormError message={submitError} style={styles.formError} />

        <Button onPress={handleRegister} size="lg" style={styles.btn} loading={loading}>
          Crear cuenta
        </Button>

        <Pressable style={styles.loginLink} onPress={() => router.back()}>
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>
            ¿Ya tienes acceso?{' '}
            <Text style={{ color: colors.primary, fontWeight: '700', fontFamily: Fonts.bodyBold }}>
              Inicia sesión
            </Text>
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  backText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  titleBlock: {
    marginBottom: 28,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  field: {
    marginBottom: 16,
  },
  formError: {
    marginBottom: 8,
  },
  btn: {
    marginTop: 8,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
  },
});
