import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';

import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { RoutinesProvider } from '@/providers/routines-provider';
import { TrainingProvider } from '@/providers/training-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GymFlowColors, GymFlowDarkColors, NavigationThemes } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(auth)',
};

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? GymFlowDarkColors : GymFlowColors;
  const router = useRouter();
  const segments = useSegments();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [loading, router, segments, user]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bgCanvas,
        }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? NavigationThemes.dark : NavigationThemes.light}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="ejercicios/[musculo]"
          options={{
            title: '',
            headerBackTitle: 'Inicio',
            headerTintColor: colors.accent,
            headerStyle: { backgroundColor: colors.bgSurface },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="variantes/[ejercicio]"
          options={{
            title: '',
            headerBackTitle: 'Ejercicios',
            headerTintColor: colors.accent,
            headerStyle: { backgroundColor: colors.bgSurface },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="crear-rutina"
          options={{
            title: 'Crear Rutina',
            headerTintColor: colors.accent,
            headerStyle: { backgroundColor: colors.bgSurface },
            headerShadowVisible: false,
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RoutinesProvider>
            <TrainingProvider>
              <RootNavigator />
            </TrainingProvider>
          </RoutinesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
