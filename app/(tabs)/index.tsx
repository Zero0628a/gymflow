import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useAuth } from '@/providers/auth-provider';
import { useCatalog } from '@/providers/catalog-provider';
import { useTraining } from '@/providers/training-provider';
import type {
  PlannedExercise,
  Routine,
  TrainingActionFailure,
  TrainingDay,
} from '@/types';

const MISSED_MESSAGE = 'Este dia ya cerro. Enfocate en tu rutina de hoy para no perder el ritmo.';

export default function HomeScreen() {
  const colors = useGymColors();
  const { logout } = useAuth();
  const { getExerciseById } = useCatalog();
  const {
    activeRoutine,
    today,
    todayKey,
    loading,
    postponeDay,
    toggleExercise,
    weekDays,
  } = useTraining();

  const dateLabel = useMemo(() => formatTodayLabel(new Date()), [todayKey]);

  async function onExercisePress(exerciseId: string) {
    if (!today) return;
    const failure = await toggleExercise(today.dateKey, exerciseId);
    handleFailure(failure);
  }

  async function onPostpone() {
    if (!today) return;
    const failure = await postponeDay(today.dateKey);
    handleFailure(failure);
  }

  if (loading) {
    return (
      <Screen>
        <TopBar onLogout={() => logout()} />
        <View style={styles.loading}>
          <Ionicons name="barbell-outline" size={26} color={colors.textMuted} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Preparando tu sesion
          </Text>
        </View>
      </Screen>
    );
  }

  if (!activeRoutine) {
    return (
      <Screen>
        <TopBar onLogout={() => logout()} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <NoRoutineState />
        </ScrollView>
      </Screen>
    );
  }

  if (!today) {
    return (
      <Screen>
        <TopBar onLogout={() => logout()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar onLogout={() => logout()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header
          dateLabel={dateLabel}
          routine={activeRoutine}
          today={today}
        />

        {today.status === 'rest' ? (
          <RestCard today={today} weekDays={weekDays} />
        ) : (
          <SessionCard
            today={today}
            onExercisePress={onExercisePress}
            getExerciseById={getExerciseById}
            onPostpone={() => void onPostpone()}
          />
        )}

        <WeekStrip weekDays={weekDays} todayKey={todayKey} />
      </ScrollView>
    </Screen>
  );
}

// =============================================================
// Subcomponentes
// =============================================================

function TopBar({ onLogout }: { onLogout: () => void }) {
  const colors = useGymColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topActions}>
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            styles.iconBtn,
            { borderColor: colors.borderStrong, backgroundColor: colors.bgSurface },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function Header({
  dateLabel,
  routine,
  today,
}: {
  dateLabel: string;
  routine: Routine;
  today: TrainingDay;
}) {
  const colors = useGymColors();

  const totalSessions = routine.weeklyPlan?.length ?? routine.daysPerWeek ?? 0;
  const sessionNumber = (today.sessionIndex ?? 0) + 1;
  const eyebrow =
    today.status === 'rest' || today.sessionIndex === null
      ? dateLabel.toUpperCase()
      : `${dateLabel.toUpperCase()} · SESION ${sessionNumber}${totalSessions ? ` / ${totalSessions}` : ''}`;

  // Si la sesion no tiene focus, usar el label como fallback. Si tiene focus,
  // usar focus como titulo (mas descriptivo: "EMPUJE" vs "LUNES").
  const heroTitle =
    today.status === 'rest'
      ? 'DESCANSO'
      : (today.sessionFocus || today.sessionLabel || 'SESION').toUpperCase();

  const showSubtitle =
    today.status !== 'rest' &&
    today.sessionLabel &&
    today.sessionLabel.toUpperCase() !== heroTitle;

  return (
    <View style={styles.header}>
      <Text style={[styles.eyebrow, { color: colors.textSecondary }]} numberOfLines={1}>
        {eyebrow}
      </Text>
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
        {heroTitle}
      </Text>
      {showSubtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
          {today.sessionLabel}
        </Text>
      ) : null}
      <Text style={[styles.routineNote, { color: colors.textMuted }]} numberOfLines={1}>
        {routine.name}
      </Text>
    </View>
  );
}

function SessionCard({
  today,
  onExercisePress,
  getExerciseById,
  onPostpone,
}: {
  today: TrainingDay;
  onExercisePress: (id: string) => void;
  getExerciseById: (id: string) => ReturnType<typeof useCatalog>['exercises'][number] | undefined;
  onPostpone: () => void;
}) {
  const colors = useGymColors();
  const total = today.plannedExercises.length;
  const completed = today.completedExerciseIds.length;
  const allDisabled = today.status === 'missed' || today.status === 'postponed' || !today.isToday;

  return (
    <View style={[styles.sessionCard, { borderColor: colors.border, backgroundColor: colors.bgSurface }]}>
      <View style={styles.sessionTop}>
        <View style={styles.metaBlock}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>EJERCICIOS</Text>
          <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
            {completed} / {total}
          </Text>
        </View>
        <StatusBadge status={today.status} />
      </View>

      {today.status === 'missed' && (
        <View
          style={[
            styles.noticeBox,
            { backgroundColor: colors.danger + '12', borderColor: colors.danger + '34' },
          ]}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{MISSED_MESSAGE}</Text>
        </View>
      )}

      {today.status === 'postponed' && (
        <View
          style={[
            styles.noticeBox,
            { backgroundColor: colors.warning + '12', borderColor: colors.warning + '34' },
          ]}>
          <Ionicons name="pause-circle" size={18} color={colors.warning} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            Pospusiste esta sesion. Manana retomas con la siguiente del plan.
          </Text>
        </View>
      )}

      <View style={styles.exerciseList}>
        {today.plannedExercises.map((planned, index) => (
          <ExerciseRow
            key={`${planned.exerciseId}-${index}`}
            index={index + 1}
            planned={planned}
            checked={today.completedExerciseIds.includes(planned.exerciseId)}
            disabled={allDisabled}
            exerciseName={getExerciseById(planned.exerciseId)?.name ?? planned.exerciseId}
            onToggle={() => onExercisePress(planned.exerciseId)}
            onOpenLog={() =>
              router.push({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pathname: '/sesion/[ejercicio]' as any,
                params: { ejercicio: planned.exerciseId, dateKey: today.dateKey },
              })
            }
          />
        ))}
      </View>

      {today.isToday && today.status !== 'completed' && today.status !== 'postponed' && today.status !== 'missed' && (
        <Button
          onPress={onPostpone}
          variant="outline"
          icon="pause-circle-outline"
          style={styles.postponeBtn}>
          Posponer sesion
        </Button>
      )}
    </View>
  );
}

function ExerciseRow({
  index,
  planned,
  exerciseName,
  checked,
  disabled,
  onToggle,
  onOpenLog,
}: {
  index: number;
  planned: PlannedExercise;
  exerciseName: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  onOpenLog: () => void;
}) {
  const colors = useGymColors();

  const meta = [
    `${planned.sets} × ${planned.reps}`,
    planned.rest ? `${planned.rest} desc.` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        onOpenLog();
      }}
      style={({ pressed }) => [
        styles.exerciseRow,
        {
          backgroundColor: checked ? colors.accentSoft : colors.bgSurfaceAlt,
          borderColor: checked ? colors.accent : colors.border,
          opacity: disabled ? 0.55 : 1,
        },
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.exerciseIndex, { color: checked ? colors.accent : colors.textMuted }]}>
        {String(index).padStart(2, '0')}
      </Text>
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: colors.textPrimary }]} numberOfLines={1}>
          {exerciseName}
        </Text>
        <Text style={[styles.exerciseMeta, { color: colors.textSecondary }]} numberOfLines={1}>
          {meta}
        </Text>
        {planned.note ? (
          <Text style={[styles.exerciseNote, { color: colors.textMuted }]} numberOfLines={2}>
            {planned.note}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          if (disabled) return;
          onToggle();
        }}
        hitSlop={8}
        style={({ pressed }) => [pressed && !disabled && styles.pressed]}>
        <Ionicons
          name={checked ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={checked ? colors.accent : colors.textMuted}
        />
      </Pressable>
    </Pressable>
  );
}

function RestCard({ today, weekDays }: { today: TrainingDay; weekDays: TrainingDay[] }) {
  const colors = useGymColors();
  const next = weekDays.find(
    (day) =>
      day.dateKey > today.dateKey && day.status !== 'rest' && day.plannedExercises.length > 0
  );

  return (
    <View style={[styles.restCard, { borderColor: colors.border, backgroundColor: colors.bgSurface }]}>
      <Ionicons name="moon-outline" size={32} color={colors.textSecondary} />
      <Text style={[styles.restTitle, { color: colors.textPrimary }]}>Dia de descanso</Text>
      <Text style={[styles.restBody, { color: colors.textSecondary }]}>
        Tu cuerpo crece en la recuperacion. Hidratate bien y enfocate en dormir.
      </Text>
      {next ? (
        <View style={[styles.nextBlock, { borderColor: colors.border }]}>
          <Text style={[styles.nextLabel, { color: colors.textMuted }]}>PROXIMA SESION</Text>
          <Text style={[styles.nextTitle, { color: colors.textPrimary }]}>
            {next.dayLabel} · {next.sessionLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function WeekStrip({ weekDays, todayKey }: { weekDays: TrainingDay[]; todayKey: string }) {
  const colors = useGymColors();

  return (
    <View style={styles.weekStrip}>
      <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>TU SEMANA</Text>
      <View style={styles.weekRow}>
        {weekDays.map((day) => {
          const visual = getStatusVisual(day.status, colors);
          const isToday = day.dateKey === todayKey;
          return (
            <View
              key={day.dateKey}
              style={[
                styles.weekChip,
                {
                  borderColor: isToday ? colors.accent : colors.border,
                  backgroundColor: isToday ? colors.accentSoft : colors.bgSurface,
                  borderWidth: isToday ? 1.5 : 1,
                },
              ]}>
              <Text style={[styles.weekChipDay, { color: colors.textMuted }]}>
                {day.dayLabel.slice(0, 3).toUpperCase()}
              </Text>
              <Ionicons name={visual.icon} size={16} color={visual.color} />
              <Text style={[styles.weekChipDate, { color: colors.textSecondary }]}>
                {day.shortDateLabel.split(' ')[0]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: TrainingDay['status'] }) {
  const colors = useGymColors();
  const map = {
    completed: { variant: 'success' as const, label: 'Completada' },
    partial: { variant: 'warning' as const, label: 'En progreso' },
    pending: { variant: 'outline' as const, label: 'Pendiente' },
    missed: { variant: 'danger' as const, label: 'Perdida' },
    postponed: { variant: 'warning' as const, label: 'Pospuesta' },
    rest: { variant: 'outline' as const, label: 'Descanso' },
  } as const;
  const info = map[status];
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function NoRoutineState() {
  const colors = useGymColors();
  return (
    <View style={styles.empty}>
      <Ionicons name="barbell-outline" size={48} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>SIN RUTINA ACTIVA</Text>
      <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
        Activa una rutina desde la biblioteca para empezar a marcar tus sesiones del dia.
      </Text>
      <Button onPress={() => router.push('/(tabs)/rutinas')} icon="arrow-forward" iconPosition="right" style={styles.emptyBtn}>
        Ir a rutinas
      </Button>
    </View>
  );
}

// =============================================================
// Utilidades de UI
// =============================================================

function getStatusVisual(status: TrainingDay['status'], colors: ReturnType<typeof useGymColors>) {
  switch (status) {
    case 'completed':
      return { icon: 'checkmark-circle' as const, color: colors.success };
    case 'partial':
      return { icon: 'time-outline' as const, color: colors.warning };
    case 'postponed':
      return { icon: 'pause-circle' as const, color: colors.warning };
    case 'missed':
      return { icon: 'close-circle' as const, color: colors.danger };
    case 'rest':
      return { icon: 'moon-outline' as const, color: colors.textMuted };
    default:
      return { icon: 'ellipse-outline' as const, color: colors.textMuted };
  }
}

function handleFailure(failure: TrainingActionFailure | null) {
  if (!failure) return;
  if (failure === 'closed_missed') Alert.alert('Dia cerrado', MISSED_MESSAGE);
  else if (failure === 'closed_postponed') Alert.alert('Sesion pospuesta', 'Esta sesion ya quedo cerrada por hoy.');
  else if (failure === 'already_completed') Alert.alert('Sesion completada', 'Ya cerraste el dia. No hace falta posponer.');
  else Alert.alert('Solo hoy', 'Solo podes registrar ejercicios del dia actual.');
}

const longDateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
});

function formatTodayLabel(date: Date) {
  return longDateFormatter.format(date);
}

// =============================================================
// Estilos
// =============================================================

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 24,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
  },
  header: {
    gap: 8,
    marginTop: 12,
  },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 44,
    lineHeight: 46,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 20,
  },
  routineNote: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  sessionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  metaBlock: {
    gap: 2,
  },
  metaLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 34,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  noticeText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseIndex: {
    fontFamily: Fonts.monoData,
    fontSize: 13,
    width: 24,
    textAlign: 'center',
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseMeta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 12,
  },
  exerciseNote: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  postponeBtn: {
    marginTop: 4,
  },
  restCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  restTitle: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 30,
    textTransform: 'uppercase',
  },
  restBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
  nextBlock: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 16,
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  },
  nextLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  nextTitle: {
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  weekStrip: {
    gap: 12,
    marginTop: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  weekChip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 4,
  },
  weekChipDay: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  weekChipDate: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
    gap: 14,
  },
  emptyTitle: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 34,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  emptyBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  emptyBtn: {
    marginTop: 16,
  },
});
