import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Toast } from '@/components/ui/toast';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';
import type { RoutineEquipmentSetup, RoutineGoal, RoutineLevel } from '@/types';

const GOAL_OPTIONS: { value: RoutineGoal; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'strength', label: 'Fuerza', icon: 'barbell' },
  { value: 'hypertrophy', label: 'Hipertrofia', icon: 'fitness' },
  { value: 'endurance', label: 'Resistencia', icon: 'pulse' },
  { value: 'general', label: 'Forma general', icon: 'body' },
];

const LEVEL_OPTIONS: { value: RoutineLevel; label: string }[] = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const DAYS_OPTIONS = [3, 4, 5, 6];

const EQUIPMENT_OPTIONS: { value: RoutineEquipmentSetup; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'gym', label: 'Gimnasio', icon: 'barbell-outline' },
  { value: 'home', label: 'En casa', icon: 'home-outline' },
];

export default function ConfiguracionScreen() {
  const colors = useGymColors();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { profile, saveProfile } = useProfile();

  const [goal, setGoal] = useState<RoutineGoal>(profile?.goal ?? 'general');
  const [level, setLevel] = useState<RoutineLevel>(profile?.level ?? 'beginner');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(profile?.daysPerWeek ?? 3);
  const [equipment, setEquipment] = useState<RoutineEquipmentSetup>(profile?.equipment ?? 'gym');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVariant, setToastVariant] = useState<'error' | 'info'>('info');

  async function handleSave() {
    setSaving(true);
    try {
      await saveProfile({ goal, level, daysPerWeek, equipment });
      setToastVariant('info');
      setToast('Perfil actualizado');
    } catch {
      setToastVariant('error');
      setToast('No se pudo guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Toast visible={!!toast} message={toast} variant={toastVariant} onHide={() => setToast('')} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { borderColor: colors.borderStrong, backgroundColor: colors.bgSurface },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configuración</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Objetivo */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Objetivo</Text>
          <View style={styles.optionGrid}>
            {GOAL_OPTIONS.map((opt) => {
              const active = goal === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setGoal(opt.value)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.bgSurface,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name={opt.icon} size={22} color={active ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.optionLabel, { color: active ? colors.accent : colors.textPrimary }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Nivel */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Nivel</Text>
          <View style={styles.rowOptions}>
            {LEVEL_OPTIONS.map((opt) => {
              const active = level === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setLevel(opt.value)}
                  style={({ pressed }) => [
                    styles.rowChip,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.bgSurface,
                      flex: 1,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.chipLabel, { color: active ? colors.accent : colors.textPrimary }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Días por semana */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Días por semana</Text>
          <View style={styles.rowOptions}>
            {DAYS_OPTIONS.map((d) => {
              const active = daysPerWeek === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDaysPerWeek(d)}
                  style={({ pressed }) => [
                    styles.rowChip,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.bgSurface,
                      flex: 1,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.chipLabelLarge, { color: active ? colors.accent : colors.textPrimary }]}>
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Equipo */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Equipamiento</Text>
          <View style={styles.rowOptions}>
            {EQUIPMENT_OPTIONS.map((opt) => {
              const active = equipment === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setEquipment(opt.value)}
                  style={({ pressed }) => [
                    styles.rowChip,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.bgSurface,
                      flex: 1,
                      gap: 8,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name={opt.icon} size={18} color={active ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.chipLabel, { color: active ? colors.accent : colors.textPrimary }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button onPress={() => void handleSave()} loading={saving} icon="checkmark-circle-outline">
          Guardar cambios
        </Button>

        {/* Cerrar sesión */}
        <View style={[styles.divider, { borderTopColor: colors.border }]} />
        <Button onPress={() => void logout()} variant="outline" icon="log-out-outline">
          Cerrar sesión
        </Button>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: 20,
    textTransform: 'uppercase',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 28,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '47%',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    textAlign: 'center',
  },
  rowOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  rowChip: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  chipLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    textAlign: 'center',
  },
  chipLabelLarge: {
    fontFamily: Fonts.display,
    fontSize: 22,
    textAlign: 'center',
  },
  divider: {
    borderTopWidth: 1,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.82,
  },
});
