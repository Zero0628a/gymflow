import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="ejercicios/[musculo]"
          options={{ title: '', headerBackTitle: 'Inicio', headerTintColor: '#1565C0' }}
        />
        <Stack.Screen
          name="variantes/[ejercicio]"
          options={{ title: '', headerBackTitle: 'Ejercicios', headerTintColor: '#1565C0' }}
        />
        <Stack.Screen
          name="crear-rutina"
          options={{ title: 'Crear Rutina', headerTintColor: '#1565C0' }}
        />
      </Stack>
      <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
