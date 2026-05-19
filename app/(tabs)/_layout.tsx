import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useGymColors } from '@/hooks/use-gym-colors';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline',
  rutinas: 'barbell-outline',
  historial: 'calendar-outline',
  explore: 'body-outline',
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useGymColors();
  // Ancho de cada celda de tab; se mide en el layout para posicionar la píldora.
  const [tabWidth, setTabWidth] = useState(0);
  const pillX = useSharedValue(0);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.bgSurface, borderTopColor: colors.border },
      ]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width / state.routes.length;
        setTabWidth(w);
        // Coloca la píldora bajo el tab activo sin animar (estado inicial).
        pillX.value = w * state.index;
      }}>
      {/* Barra fina deslizante en el borde superior del tab activo. */}
      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: tabWidth - 40,
              marginHorizontal: 20,
              backgroundColor: colors.accent,
            },
            pillStyle,
          ]}
        />
      ) : null}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.title === 'string' ? options.title : route.name;
        const focused = state.index === index;
        const color = focused ? colors.accent : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
            // Desliza la píldora hacia el tab tocado.
            pillX.value = withTiming(tabWidth * index, {
              duration: 280,
              easing: Easing.inOut(Easing.cubic),
            });
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            android_ripple={{ color: 'transparent' }}>
            <TabIcon
              name={TAB_ICONS[route.name] ?? 'ellipse-outline'}
              color={color}
              focused={focused}
            />
            <Text
              style={[
                styles.label,
                { color },
              ]}
              numberOfLines={1}>
              {label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(focused ? 1.15 : 1, { duration: 200 }) }],
    opacity: withTiming(focused ? 1 : 0.6, { duration: 200 }),
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={name} size={22} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const colors = useGymColors();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bgCanvas },
        animation: 'fade',
      }}>
      <Tabs.Screen name="index" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="rutinas" options={{ title: 'Rutinas' }} />
      <Tabs.Screen name="historial" options={{ title: 'Historial' }} />
      <Tabs.Screen name="explore" options={{ title: 'Musculos' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 72,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    borderRadius: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
