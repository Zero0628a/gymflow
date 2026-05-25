import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { AuthScreen } from '@/components/ui/auth-screen';
import { Button }     from '@/components/ui/button';
import { FormError }  from '@/components/ui/form-error';
import { Input }      from '@/components/ui/input';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useAuth } from '@/providers/auth-provider';
import { Fonts } from '@/constants/theme';
import { signInWithGoogle, GoogleSignInCancelled } from '@/lib/google-auth';

const GYMFLOW_LOGO = require('@/assets/images/logo.png');
const GOOGLE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>`;

export default function LoginScreen() {
  const colors = useGymColors();
  const { signIn } = useAuth();

  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    pulse.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [logoOpacity, logoScale, pulse]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * pulse.value }],
  }));

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

  async function handleGoogleLogin() {
    setSubmitError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error instanceof GoogleSignInCancelled) {
        return;
      }
      console.error('Error con Google sign-in:', error);
      const code = error?.code ?? '';
      if (code === 'auth/account-exists-with-different-credential') {
        setSubmitError('Esta cuenta ya esta registrada con otro metodo.');
      } else if (code === 'PLAY_SERVICES_NOT_AVAILABLE' || code === 2) {
        setSubmitError('Google Play Services no esta disponible en este dispositivo.');
      } else if (code === 'auth/network-request-failed') {
        setSubmitError('Sin conexion. Revisa tu internet.');
      } else {
        setSubmitError('No se pudo iniciar sesion con Google.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen topPadding={16} contentStyle={styles.screen}>
      <View style={styles.brandBlock}>
        <Animated.View
          style={[styles.logoWrap, logoAnimStyle]}>
          <Image source={GYMFLOW_LOGO} style={styles.logo} contentFit="contain" />
        </Animated.View>
        <Text style={styles.appName}>
          <Text style={{ color: colors.textPrimary }}>Gym</Text>
          <Text style={{ color: colors.accent }}>Flow</Text>
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Registro de entrenamiento</Text>
      </View>

      <View style={styles.formBlock}>
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

        <Button onPress={handleLogin} size="md" style={styles.btn} loading={loading} icon="log-in-outline">
          Entrar
        </Button>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>O continua con</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <Pressable
          onPress={handleGoogleLogin}
          style={({ pressed }) => [
            styles.googleButton,
            { borderColor: colors.borderStrong, backgroundColor: colors.bgSurface },
            pressed && styles.pressed,
          ]}>
          <GoogleMark />
          <Text style={[styles.googleLabel, { color: colors.textPrimary }]}>Continuar con Google</Text>
        </Pressable>

        <Text style={[styles.registerPrompt, { color: colors.textSecondary }]}>
          ¿No tienes una cuenta?{' '}
          <Text style={{ color: colors.accent, fontFamily: Fonts.bodyBold }} onPress={() => router.push('/(auth)/register')}>
            Registrate
          </Text>
        </Text>
      </View>
    </AuthScreen>
  );
}

function GoogleMark() {
  return <SvgXml xml={GOOGLE_LOGO_SVG} width={22} height={22} />;
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoWrap: {
    width: 92,
    height: 92,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 24,
  },
  appName: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  tagline: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    marginTop: 4,
  },
  formBlock: {
    gap: 11,
  },
  googleButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  field: {
    marginBottom: 0,
  },
  formError: {
    marginTop: -4,
  },
  btn: {
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: Fonts.bodyRegular,
    marginHorizontal: 12,
    fontSize: 12,
  },
  registerPrompt: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 2,
  },
  pressed: {
    opacity: 0.86,
  },
});
