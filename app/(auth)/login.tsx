import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { AuthScreen } from '@/components/ui/auth-screen';
import { Button }     from '@/components/ui/button';
import { FormError }  from '@/components/ui/form-error';
import { IconCircle } from '@/components/ui/icon-circle';
import { Input }      from '@/components/ui/input';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useAuth } from '@/providers/auth-provider';
import { Fonts } from '@/constants/theme';

export default function LoginScreen() {
  const colors = useGymColors();
  const { signIn } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Ingresa tu correo.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Ingresa tu contraseña.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;

    setSubmitError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      const code = error?.code ?? '';
      console.error('Error al iniciar sesión:', error);
      if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        setSubmitError('Correo o contraseña incorrectos.');
      } else if (code.includes('invalid-email')) {
        setEmailError('El correo no es válido.');
      } else if (code.includes('operation-not-allowed')) {
        setSubmitError('Firebase no tiene habilitado Email/Password en Authentication.');
      } else if (code.includes('network-request-failed')) {
        setSubmitError('No se pudo conectar con Firebase. Revisa tu internet.');
      } else {
        setSubmitError(`No se pudo iniciar sesión (${code || 'error-desconocido'}).`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen centered topPadding={32}>
      <View style={styles.header}>
        <IconCircle icon="barbell" size="lg" variant="solid" style={styles.logo} />
        <Text style={[styles.appName, { color: colors.primaryDark }]}>GymFlow</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Registro de entrenamiento
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Iniciar sesión</Text>

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
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          icon="lock-closed-outline"
          secureTextEntry
          style={styles.field}
          error={passwordError}
        />

        <FormError message={submitError} style={styles.formError} />

        <Button onPress={handleLogin} size="lg" style={styles.btn} loading={loading}>
          Entrar
        </Button>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>o</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <Button onPress={() => router.push('/(auth)/register')} variant="outline" size="lg">
          Crear cuenta
        </Button>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  appName: {
    fontFamily: Fonts.display,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tagline: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textTransform: 'uppercase',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: Fonts.bodyRegular,
    marginHorizontal: 12,
    fontSize: 13,
  },
});
