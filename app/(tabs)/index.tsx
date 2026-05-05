import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Fonts } from '@/constants/theme';
import { exercises, muscles } from '@/data/mock';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useAuth } from '@/providers/auth-provider';
import { useTraining } from '@/providers/training-provider';
import type { TrainingActionFailure, TrainingDay, TrainingDayStatus } from '@/types';

const MISSED_DAY_MESSAGE =
  'Este día ya cerró. Enfócate en tu rutina de hoy para no perder el ritmo.';

export default function HomeScreen() {
  const colors = useGymColors();
  const { logout } = useAuth();
  const {
    currentWeek,
    loading,
    postponedCount,
    resetTraining,
    toggleExercise,
    postponeDay,
    weekLabel,
  } = useTraining();
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');

  useEffect(() => {
    if (!currentWeek.length) {
      return;
    }

    if (!currentWeek.some((day) => day.dateKey === selectedDateKey)) {
      const today = currentWeek.find((day) => day.isToday) ?? currentWeek[0];
      setSelectedDateKey(today.dateKey);
    }
  }, [currentWeek, selectedDateKey]);

  if (loading) {
    return (
      <Screen>
        <ScreenHeader
          title="Calendario"
          subtitle="Cargando tu semana"
          right={
            <View style={styles.headerActions}>
              <Pressable
                onPress={onResetPress}
                style={({ pressed }) => [
                  styles.headerIconButton,
                  { borderColor: colors.border, backgroundColor: colors.bgSurface },
                  pressed && styles.headerIconPressed,
                ]}>
                <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
              </Pressable>
              <Pressable
                onPress={() => logout()}
                style={({ pressed }) => [
                  styles.headerIconButton,
                  { borderColor: colors.borderStrong, backgroundColor: colors.bgSurface },
                  pressed && styles.headerIconPressed,
                ]}>
                <Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />
              </Pressable>
            </View>
          }
        />
        <View style={styles.loadingState}>
          <Ionicons name="barbell-outline" size={26} color={colors.textMuted} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Preparando tu calendario local
          </Text>
        </View>
      </Screen>
    );
  }

  const displayWeek = hasAllClosedStates(currentWeek) ? currentWeek : buildMockWeek(currentWeek);
  const selectedDay = displayWeek.find((day) => day.dateKey === selectedDateKey) ?? displayWeek[0];
  const completedCount = displayWeek.filter((day) => day.status === 'completed').length;
  const missedCount = displayWeek.filter((day) => day.status === 'missed').length;

  async function onExercisePress(exerciseId: string) {
    const failure = await toggleExercise(selectedDay.dateKey, exerciseId);
    handleFailure(failure);
  }

  async function onPostponePress() {
    const failure = await postponeDay(selectedDay.dateKey);
    handleFailure(failure);
  }

  function onResetPress() {
    Alert.alert(
      'Resetear calendario',
      'Se borrará tu progreso del calendario y podrás empezar la semana desde cero. Tus rutinas guardadas no se eliminarán.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: () => {
            void resetTraining();
            setSelectedDateKey('');
          },
        },
      ]
    );
  }

  function onDayPress(day: TrainingDay) {
    setSelectedDateKey(day.dateKey);

    if (day.status === 'missed') {
      Alert.alert('Día cerrado', MISSED_DAY_MESSAGE);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title="Tu Semana"
        subtitle={weekLabel}
        right={
          <View style={styles.headerActions}>
            <Pressable
              onPress={onResetPress}
              style={({ pressed }) => [
                styles.headerIconButton,
                { borderColor: colors.border, backgroundColor: colors.bgSurface },
                pressed && styles.headerIconPressed,
              ]}>
              <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => logout()}
              style={({ pressed }) => [
                styles.headerIconButton,
                { borderColor: colors.borderStrong, backgroundColor: colors.bgSurface },
                pressed && styles.headerIconPressed,
              ]}>
              <Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />
            </Pressable>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryBar, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <SummaryStat
            color={colors.success}
            icon="checkmark-circle"
            labelColor={colors.textMuted}
            value={completedCount}
            label="Listos"
          />
          <SummaryStat
            color={colors.warning}
            icon="pause-circle"
            labelColor={colors.textMuted}
            value={postponedCount}
            label="Pausas"
          />
          <SummaryStat
            color={colors.danger}
            icon="close-circle"
            labelColor={colors.textMuted}
            value={missedCount}
            label="Perdidos"
          />
        </View>

        <Card
          style={[
            styles.detailCard,
            { borderColor: selectedDay.isToday ? colors.accent : colors.border, borderWidth: 1.5 },
          ]}>
          <View style={styles.detailHeader}>
            <View
              style={[
                styles.detailImageWrap,
                {
                  backgroundColor: selectedDay.muscleColor + '12',
                  borderColor: selectedDay.muscleColor + '30',
                },
              ]}>
              <Image
                source={muscles.find((muscle) => muscle.id === selectedDay.muscleId)?.image}
                style={styles.detailImage}
                contentFit="contain"
              />
            </View>
            <View style={styles.detailContent}>
              <View style={styles.detailTitleBlock}>
                <Text style={[styles.detailEyebrow, { color: colors.textSecondary }]}>
                  {selectedDay.shortDateLabel}
                </Text>
                <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>
                  {selectedDay.dayLabel} · {selectedDay.muscleName}
                </Text>
              </View>
              <View style={styles.detailBadgeRow}>
                <Badge variant={getStatusVisual(selectedDay.status, colors).badgeVariant}>
                  {getStatusVisual(selectedDay.status, colors).label}
                </Badge>
              </View>
            </View>
          </View>

          <Text style={[styles.detailCopy, { color: colors.textSecondary }]}>
            {getDetailCopy(selectedDay)}
          </Text>

          {selectedDay.status === 'missed' && (
            <View
              style={[
                styles.missedNotice,
                {
                  backgroundColor: colors.danger + '12',
                  borderColor: colors.danger + '34',
                },
              ]}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <View style={styles.missedNoticeTextBlock}>
                <Text style={[styles.missedNoticeTitle, { color: colors.danger }]}>
                  Este día ya cerró
                </Text>
                <Text style={[styles.missedNoticeText, { color: colors.textSecondary }]}>
                  No necesitas editarlo. Mira el día actual o usa reset si quieres reiniciar el calendario.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.exerciseList}>
            {(exercises[selectedDay.muscleId] ?? []).map((exercise) => {
              const checked = selectedDay.completedExerciseIds.includes(exercise.id);
              const disabled = !selectedDay.isToday || selectedDay.status === 'postponed' || selectedDay.status === 'missed';

              return (
                <Pressable
                  key={exercise.id}
                  onPress={() => {
                    if (disabled) {
                      handleFailure(
                        selectedDay.status === 'missed'
                          ? 'closed_missed'
                          : selectedDay.status === 'postponed'
                            ? 'closed_postponed'
                            : 'not_today'
                      );
                      return;
                    }

                    void onExercisePress(exercise.id);
                  }}
                  style={[
                    styles.exerciseItem,
                    {
                      backgroundColor: checked ? colors.accentSoft : colors.bgSurface,
                      borderColor: checked ? colors.accent : colors.border,
                    },
                  ]}>
                  <View style={styles.exerciseInfo}>
                    <Ionicons
                      name={checked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={checked ? colors.accent : colors.textMuted}
                    />
                    <View style={styles.exerciseTextBlock}>
                      <Text style={[styles.exerciseName, { color: colors.textPrimary }]}>
                        {exercise.name}
                      </Text>
                      <Text style={[styles.exerciseDescription, { color: colors.textMuted }]}>
                        {exercise.description}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {selectedDay.isToday && selectedDay.status === 'pending' && (
            <Button
              onPress={() => void onPostponePress()}
              variant="outline"
              icon="pause-circle-outline"
              style={styles.postponeButton}>
              Posponer entrenamiento
            </Button>
          )}
        </Card>

        <View style={styles.weekList}>
          {displayWeek.map((day) => {
            const isSelected = day.dateKey === selectedDay.dateKey;
            const visual = getStatusVisual(day.status, colors);

            return (
              <Pressable
                key={day.dateKey}
                onPress={() => onDayPress(day)}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: visual.background,
                    borderColor: day.isToday
                      ? colors.accent
                      : isSelected
                        ? colors.borderStrong
                        : colors.border,
                    borderWidth: day.isToday ? 2 : isSelected ? 1.5 : 1,
                  },
                ]}>
                <View style={styles.dayCardTop}>
                  <View>
                    <Text style={[styles.dayName, { color: colors.textPrimary }]}>{day.dayLabel}</Text>
                    <Text style={[styles.dayDate, { color: colors.textMuted }]}>
                      {day.shortDateLabel}
                    </Text>
                  </View>
                  <Ionicons name={visual.icon} size={22} color={visual.iconColor} />
                </View>

                <Text style={[styles.muscleName, { color: colors.textPrimary }]}>
                  {day.muscleName}
                </Text>

                {day.status === 'missed' && (
                  <View style={[styles.closedBanner, { backgroundColor: colors.danger + '16' }]}>
                    <Ionicons name="lock-closed" size={12} color={colors.danger} />
                    <Text style={[styles.closedBannerText, { color: colors.danger }]}>
                      Día cerrado
                    </Text>
                  </View>
                )}

                <View style={styles.dayFooter}>
                  <Badge variant={visual.badgeVariant}>{visual.label}</Badge>
                  {day.isToday && (
                    <Text style={[styles.todayLabel, { color: colors.accent }]}>HOY</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

function buildMockWeek(currentWeek: TrainingDay[]) {
  if (!currentWeek.length) {
    return currentWeek;
  }

  const pastDays = currentWeek.filter((day) => day.isPast);
  const demoStatusByIndex: TrainingDayStatus[] = ['completed', 'postponed', 'missed'];

  return currentWeek.map((day) => {
    if (!day.isPast) {
      return day;
    }

    const demoIndex = pastDays.findIndex((pastDay) => pastDay.dateKey === day.dateKey);

    if (demoIndex === -1 || demoIndex >= demoStatusByIndex.length) {
      return day;
    }

    const mockStatus = demoStatusByIndex[demoIndex];

    return {
      ...day,
      status: mockStatus,
      completedExerciseIds:
        mockStatus === 'completed' ? day.exerciseIds.slice(0, Math.min(2, day.exerciseIds.length)) : [],
    };
  });
}

function hasAllClosedStates(days: TrainingDay[]) {
  return (
    days.some((day) => day.status === 'completed') &&
    days.some((day) => day.status === 'postponed') &&
    days.some((day) => day.status === 'missed')
  );
}

function SummaryStat({
  color,
  icon,
  labelColor,
  value,
  label,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelColor: string;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.summaryStat}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

function getStatusVisual(status: TrainingDayStatus, colors: ReturnType<typeof useGymColors>) {
  if (status === 'completed') {
    return {
      label: 'Completado',
      icon: 'checkmark-circle' as const,
      iconColor: colors.success,
      background: colors.success + '12',
      badgeVariant: 'success' as const,
    };
  }

  if (status === 'missed') {
    return {
      label: 'Perdido',
      icon: 'close-circle' as const,
      iconColor: colors.danger,
      background: colors.bgSurfaceAlt,
      badgeVariant: 'danger' as const,
    };
  }

  if (status === 'postponed') {
    return {
      label: 'Pospuesto',
      icon: 'pause-circle' as const,
      iconColor: colors.warning,
      background: colors.warning + '12',
      badgeVariant: 'warning' as const,
    };
  }

  return {
    label: 'Pendiente',
    icon: 'ellipse-outline' as const,
    iconColor: colors.textMuted,
    background: colors.bgSurface,
    badgeVariant: 'outline' as const,
  };
}

function getDetailCopy(day: TrainingDay) {
  if (day.status === 'missed') {
    return MISSED_DAY_MESSAGE;
  }

  if (day.status === 'postponed') {
    return 'Este día quedó marcado como pospuesto y no cuenta como perdido.';
  }

  if (day.isFuture) {
    return 'Este bloque sigue pendiente. El día no se adelanta aunque pierdas sesiones previas.';
  }

  if (day.status === 'completed') {
    return `Registraste ${day.completedExerciseIds.length} ejercicio(s) dentro del día local.`;
  }

  return 'Registra al menos un ejercicio antes de las 23:59 para cerrar el día como completado.';
}

function handleFailure(failure: TrainingActionFailure | null) {
  if (!failure) {
    return;
  }

  if (failure === 'closed_missed') {
    Alert.alert('Día cerrado', MISSED_DAY_MESSAGE);
    return;
  }

  if (failure === 'closed_postponed') {
    Alert.alert('Día pospuesto', 'Este día fue pospuesto y ya quedó cerrado.');
    return;
  }

  if (failure === 'already_completed') {
    Alert.alert('Día completado', 'Ya registraste este día. No hace falta posponerlo.');
    return;
  }

  Alert.alert('Solo hoy', 'Solo puedes registrar ejercicios del día actual.');
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 18,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconPressed: {
    opacity: 0.82,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 84,
  },
  summaryValue: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  weekList: {
    gap: 10,
  },
  dayCard: {
    borderRadius: 18,
    padding: 16,
  },
  dayCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayName: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    fontWeight: '700',
  },
  dayDate: {
    fontFamily: Fonts.monoRegular,
    fontSize: 12,
    marginTop: 2,
  },
  muscleName: {
    fontFamily: Fonts.display,
    fontSize: 20,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  closedBanner: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  closedBannerText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  todayLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  detailCard: {
    padding: 18,
    borderRadius: 22,
  },
  detailImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    width: 72,
    height: 72,
  },
  detailImage: {
    width: 62,
    height: 62,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
    minWidth: 0,
  },
  detailTitleBlock: {
    minWidth: 0,
  },
  detailEyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  detailBadgeRow: {
    marginTop: 10,
  },
  detailCopy: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  missedNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  missedNoticeTextBlock: {
    flex: 1,
    gap: 4,
  },
  missedNoticeTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    fontWeight: '700',
  },
  missedNoticeText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  exerciseList: {
    gap: 10,
    marginTop: 16,
  },
  exerciseItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  exerciseTextBlock: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseDescription: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  postponeButton: {
    marginTop: 16,
  },
});
