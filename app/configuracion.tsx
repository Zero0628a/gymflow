import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/ui/screen';
import { Toast } from '@/components/ui/toast';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { getTrainingWeekdays } from '@/lib/routine-planner';
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

const DEFAULT_TRAINING_WEEKDAYS = getTrainingWeekdays(3);
const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const EQUIPMENT_OPTIONS: { value: RoutineEquipmentSetup; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'gym', label: 'Gimnasio', icon: 'barbell-outline' },
  { value: 'home', label: 'En casa', icon: 'home-outline' },
];

export default function ConfiguracionScreen() {
  const colors = useGymColors();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { profile, saveProfile } = useProfile();
  const hasHydratedProfile = useRef(false);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const email = user?.email ?? 'Sin correo registrado';

  const [goal, setGoal] = useState<RoutineGoal>(profile?.goal ?? 'general');
  const [level, setLevel] = useState<RoutineLevel>(profile?.level ?? 'beginner');
  const [trainingWeekdays, setTrainingWeekdays] = useState<number[]>(
    profile?.trainingWeekdays?.length ? profile.trainingWeekdays : DEFAULT_TRAINING_WEEKDAYS
  );
  const [equipment, setEquipment] = useState<RoutineEquipmentSetup>(profile?.equipment ?? 'gym');
  const [toast, setToast] = useState('');
  const [toastVariant, setToastVariant] = useState<'error' | 'info'>('info');

  useEffect(() => {
    if (!profile || hasHydratedProfile.current) {
      return;
    }

    setGoal(profile.goal);
    setLevel(profile.level);
    setTrainingWeekdays(profile.trainingWeekdays?.length ? profile.trainingWeekdays : getTrainingWeekdays(profile.daysPerWeek));
    setEquipment(profile.equipment);
    hasHydratedProfile.current = true;
  }, [profile]);

  useEffect(() => {
    if (!hasHydratedProfile.current) {
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      saveProfile({ goal, level, daysPerWeek: trainingWeekdays.length, trainingWeekdays, equipment })
        .catch(() => {
          if (cancelled) return;
          setToastVariant('error');
          setToast('No se pudo guardar. Intentá de nuevo.');
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [equipment, goal, level, saveProfile, trainingWeekdays]);

  function toggleTrainingWeekday(day: number) {
    setTrainingWeekdays((current) => {
      if (current.includes(day)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== day);
      }

      return [...current, day].sort((left, right) => {
        const orderLeft = left === 0 ? 7 : left;
        const orderRight = right === 0 ? 7 : right;
        return orderLeft - orderRight;
      });
    });
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Perfil</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHero}>
          <View style={[styles.profilePhotoFrame, { borderColor: colors.border, backgroundColor: colors.bgSurface }]}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profilePhoto} contentFit="cover" />
            ) : (
              <View style={[styles.profilePhotoFallback, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="person" size={34} color={colors.accent} />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        {/* Objetivo */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Mi configuración</Text>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Objetivo</Text>
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
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Nivel</Text>
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

        {/* Días disponibles */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Días disponibles</Text>
            <Text style={[styles.weekdayCounter, { color: colors.textMuted }]}>
              {trainingWeekdays.length} por semana
            </Text>
          </View>
          <View style={styles.weekdayGrid}>
            {WEEKDAY_OPTIONS.map((day) => {
              const active = trainingWeekdays.includes(day.value);
              return (
                <Pressable
                  key={day.value}
                  onPress={() => toggleTrainingWeekday(day.value)}
                  style={({ pressed }) => [
                    styles.weekdayChip,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.bgSurface,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.weekdayLabel, { color: active ? colors.accent : colors.textPrimary }]}>
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Equipo */}
        <View style={styles.section}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Equipamiento</Text>
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

        {/* Cerrar sesión */}
        <Pressable
          onPress={() => void logout()}
          style={({ pressed }) => [
            styles.logoutRow,
            { borderColor: colors.danger + '55', backgroundColor: colors.danger + '10' },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="log-out-outline" size={19} color={colors.danger} />
          <Text style={[styles.logoutTitle, { color: colors.danger }]}>Cerrar sesión</Text>
        </Pressable>

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
    gap: 18,
  },
  profileHero: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
  },
  profilePhotoFrame: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profilePhotoFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 3,
  },
  profileName: {
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 24,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  profileEmail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    gap: 9,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.8,
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
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    textAlign: 'center',
  },
  rowOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  rowChip: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weekdayCounter: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  weekdayGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  weekdayChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
  },
  logoutRow: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
