import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ActionSheet, type ActionSheetOption } from '@/components/ui/action-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Toast } from '@/components/ui/toast';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { openExerciseVideoSearch } from '@/lib/exercise-video';
import { useAuth } from '@/providers/auth-provider';
import { useCatalog } from '@/providers/catalog-provider';
import { useTraining } from '@/providers/training-provider';
import type {
  PlannedExercise,
  TrainingActionFailure,
  TrainingDay,
  Variant,
} from '@/types';

const MISSED_MESSAGE = 'Este dia ya cerro. Enfocate en tu rutina de hoy para no perder el ritmo.';

export default function HomeScreen() {
  const colors = useGymColors();
  const { exercises, getExerciseById, getVariantsByExercise } = useCatalog();
  const {
    activeRoutine,
    today,
    todayKey,
    loading,
    postponeDay,
    replaceExercise,
    revertExerciseReplacement,
    toggleSet,
    undoPostponeDay,
    weekDays,
  } = useTraining();
  const [toast, setToast] = useState<{ message: string; variant: 'error' | 'warning' | 'info' } | null>(null);
  const [variantTarget, setVariantTarget] = useState<{ dateKey: string; exerciseId: string; name: string } | null>(null);
  // `selectedDateKey` = lo que el usuario tocó (resalta el chip al instante).
  // `visibleDateKey` = lo que realmente se renderiza; solo cambia a mitad de la
  // animación, cuando el contenido viejo ya salió de pantalla.
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [visibleDateKey, setVisibleDateKey] = useState(todayKey);
  // Progreso de la fase activa: 0 = fuera de pantalla, 1 = en reposo.
  const transitionProgress = useSharedValue(1);
  // Signo del desplazamiento durante la fase actual (-1 izq, 1 der).
  const transitionDirection = useSharedValue(1);

  const selectedDay = useMemo(
    () => weekDays.find((day) => day.dateKey === visibleDateKey) ?? today,
    [visibleDateKey, today, weekDays]
  );

  const dayTransitionStyle = useAnimatedStyle(() => {
    const p = transitionProgress.value;
    return {
      opacity: p,
      transform: [
        // Cuanto más lejos del reposo, más desplazado horizontalmente.
        { translateX: (1 - p) * transitionDirection.value * 36 },
      ],
    };
  });

  // Al cambiar visibleDateKey (swap a mitad de transición) el nuevo contenido
  // entra desde el lado opuesto deslizándose hasta su lugar.
  const animateIn = useCallback(() => {
    transitionProgress.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [transitionProgress]);

  useEffect(() => {
    setSelectedDateKey(todayKey);
    setVisibleDateKey(todayKey);
  }, [todayKey]);

  // Cuando el swap de contenido ocurre, lanzamos la entrada. Se hace en effect
  // para garantizar que el nuevo día ya está renderizado fuera de pantalla.
  useEffect(() => {
    if (visibleDateKey === selectedDateKey && transitionProgress.value === 0) {
      animateIn();
    }
  }, [visibleDateKey, selectedDateKey, transitionProgress, animateIn]);

  const swapContent = useCallback(
    (dateKey: string, direction: number) => {
      // El contenido viejo terminó de salir. Reposicionamos el nuevo al lado
      // opuesto (progress sigue en 0) y cambiamos qué día se muestra.
      transitionDirection.value = -direction;
      setVisibleDateKey(dateKey);
    },
    [transitionDirection]
  );

  function selectDay(dateKey: string) {
    if (dateKey === selectedDateKey) return;

    const currentIndex = weekDays.findIndex((day) => day.dateKey === visibleDateKey);
    const nextIndex = weekDays.findIndex((day) => day.dateKey === dateKey);
    const direction = nextIndex >= currentIndex ? 1 : -1;

    // Resalta el chip elegido de inmediato.
    setSelectedDateKey(dateKey);

    // Fase de salida: el contenido actual se desvanece y se desliza hacia
    // `direction`. Al terminar, hacemos el swap en el hilo de JS.
    transitionDirection.value = direction;
    transitionProgress.value = withTiming(
      0,
      { duration: 200, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(swapContent)(dateKey, direction);
      }
    );
  }

  function showToast(message: string, variant: 'error' | 'warning' | 'info' = 'warning') {
    setToast({ message, variant });
  }

  async function onSetPress(exerciseId: string, setIndex: number) {
    if (!today) return;
    const failure = await toggleSet(today.dateKey, exerciseId, setIndex);
    if (failure) handleFailure(failure, showToast);
  }

  async function onPostpone() {
    if (!today) return;
    const failure = await postponeDay(today.dateKey);
    if (failure) handleFailure(failure, showToast);
  }

  async function onUndoPostpone() {
    if (!today) return;
    const failure = await undoPostponeDay(today.dateKey);
    if (failure) handleFailure(failure, showToast);
  }

  async function onReplaceExercise(variant: Variant) {
    if (!variantTarget) return;

    const replacementId = resolveReplacementExerciseId(variant, exercises);
    if (!replacementId) {
      showToast('Esta variante no esta vinculada a un ejercicio del catalogo.', 'warning');
      return;
    }

    const failure = await replaceExercise(variantTarget.dateKey, variantTarget.exerciseId, {
      exerciseId: replacementId,
      name: variant.name,
    });
    if (failure) handleFailure(failure, showToast);
  }

  async function onRevertExercise(exerciseId: string) {
    if (!today) return;
    const failure = await revertExerciseReplacement(today.dateKey, exerciseId);
    if (failure) {
      handleFailure(failure, showToast);
      return;
    }
    showToast('Sustitucion revertida.', 'info');
  }

  if (loading) {
    return (
      <Screen>
        <Toast visible={!!toast} message={toast?.message ?? ''} variant={toast?.variant} onHide={() => setToast(null)} />
        <TopBar />
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
        <Toast visible={!!toast} message={toast?.message ?? ''} variant={toast?.variant} onHide={() => setToast(null)} />
        <TopBar />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <NoRoutineState />
        </ScrollView>
      </Screen>
    );
  }

  if (!today || !selectedDay) {
    return (
      <Screen>
        <TopBar />
      </Screen>
    );
  }

  return (
    <Screen>
      <Toast visible={!!toast} message={toast?.message ?? ''} variant={toast?.variant} onHide={() => setToast(null)} />
      <ActionSheet
        visible={!!variantTarget}
        title={variantTarget ? `Cambiar ${variantTarget.name}` : 'Cambiar ejercicio'}
        subtitle="Elige una alternativa para reemplazarla en la sesion de hoy."
        options={buildVariantOptions(variantTarget?.exerciseId, getVariantsByExercise, onReplaceExercise)}
        onClose={() => setVariantTarget(null)}
      />
      <TopBar />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.dayContent, dayTransitionStyle]}>
          <Header day={selectedDay} />

          {selectedDay.status === 'rest' ? (
            <RestCard day={selectedDay} weekDays={weekDays} />
          ) : (
            <SessionCard
              day={selectedDay}
              onSetPress={onSetPress}
              getExerciseById={getExerciseById}
              getVariantsByExercise={getVariantsByExercise}
              onVariantPress={(exerciseId, name) => setVariantTarget({ dateKey: selectedDay.dateKey, exerciseId, name })}
              onVariantLocked={() => showToast('Desmarca las series antes de cambiar variante.', 'warning')}
              onRevertPress={(exerciseId) => void onRevertExercise(exerciseId)}
              onPostpone={() => void onPostpone()}
              onUndoPostpone={() => void onUndoPostpone()}
            />
          )}
        </Animated.View>

        {/* LinearTransition: cuando el contenido de arriba cambia de altura,
            la barra se desliza suave a su nueva posición en vez de saltar. */}
        <Animated.View layout={LinearTransition.duration(280).easing(Easing.inOut(Easing.cubic))}>
          <WeekStrip weekDays={weekDays} selectedDateKey={selectedDateKey} onSelect={selectDay} />
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

// =============================================================
// Subcomponentes
// =============================================================

function TopBar() {
  const colors = useGymColors();
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const firstName = displayName.trim().split(/\s+/)[0] || 'Usuario';

  return (
    <ScreenHeader
      title={`Hola, ${firstName}`}
      subtitle="Tu plan de hoy"
      right={
        <Pressable
          onPress={() => router.push('/configuracion')}
          style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="person" size={18} color={colors.accent} />
            </View>
          )}
        </Pressable>
      }
    />
  );
}

function Header({
  day,
}: {
  day: TrainingDay;
}) {
  const colors = useGymColors();

  const sessionNumber = (day.sessionIndex ?? 0) + 1;
  const eyebrow =
    day.status === 'rest' || day.sessionIndex === null
      ? `${day.dayLabel.toUpperCase()} · ${day.shortDateLabel.toUpperCase()}`
      : `${day.dayLabel.toUpperCase()} · ${day.shortDateLabel.toUpperCase()} · SESION ${sessionNumber}`;

  // Si la sesion no tiene focus, usar el label como fallback. Si tiene focus,
  // usar focus como titulo (mas descriptivo: "EMPUJE" vs "LUNES").
  const heroTitle =
    day.status === 'rest'
      ? 'DESCANSO'
      : (day.sessionFocus || day.sessionLabel || 'SESION').toUpperCase();

  // El heroTitle puede ser corto ("EMPUJE") o largo ("EMPUJE · TRACCION · PIERNA").
  // Bajamos el tamano por tramos para que entre prolijo sin desbordar.
  const titleSize =
    heroTitle.length > 24 ? 24 : heroTitle.length > 18 ? 30 : heroTitle.length > 12 ? 36 : 44;
  const titleLineHeight = titleSize + 2;

  return (
    <View style={styles.header}>
      <Text style={[styles.eyebrow, { color: colors.textSecondary }]} numberOfLines={1}>
        {eyebrow}
      </Text>
      <Text
        style={[
          styles.title,
          { color: colors.textPrimary, fontSize: titleSize, lineHeight: titleLineHeight },
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}>
        {heroTitle}
      </Text>
    </View>
  );
}

function SessionCard({
  day,
  onSetPress,
  getExerciseById,
  getVariantsByExercise,
  onVariantPress,
  onVariantLocked,
  onRevertPress,
  onPostpone,
  onUndoPostpone,
}: {
  day: TrainingDay;
  onSetPress: (exerciseId: string, setIndex: number) => void;
  getExerciseById: (id: string) => ReturnType<typeof useCatalog>['exercises'][number] | undefined;
  getVariantsByExercise: (id: string) => ReturnType<typeof useCatalog>['variants'];
  onVariantPress: (exerciseId: string, name: string) => void;
  onVariantLocked: () => void;
  onRevertPress: (exerciseId: string) => void;
  onPostpone: () => void;
  onUndoPostpone: () => void;
}) {
  const colors = useGymColors();
  const total = day.plannedExercises.length;
  const completed = day.completedExerciseIds.length;
  const toggleDisabled = day.status === 'missed' || day.status === 'postponed' || !day.isToday;
  const variantChangeLocked = toggleDisabled || day.status === 'completed';

  return (
    <View style={styles.sessionSection}>
      <View style={styles.sessionTop}>
        <View style={styles.metaBlock}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>EJERCICIOS</Text>
          <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
            {completed} / {total}
          </Text>
        </View>
        <StatusBadge status={day.status} />
      </View>

      {day.status === 'missed' && (
        <View
          style={[
            styles.noticeBox,
            { backgroundColor: colors.danger + '12', borderColor: colors.danger + '34' },
          ]}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{MISSED_MESSAGE}</Text>
        </View>
      )}

      {day.status === 'postponed' && (
        <View
          style={[
            styles.noticeBox,
            { backgroundColor: colors.warning + '12', borderColor: colors.warning + '34' },
          ]}>
          <Ionicons name="pause-circle" size={18} color={colors.warning} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            Pospusiste esta sesion. Retomas en el siguiente dia de entrenamiento.
          </Text>
        </View>
      )}

      <View style={styles.exerciseList}>
        {day.plannedExercises.map((planned, index) => {
          const baseName = getExerciseById(planned.exerciseId)?.name ?? planned.replacementName ?? planned.exerciseId;
          const originalId = planned.originalExerciseId ?? planned.exerciseId;
          const variantCount = getVariantsByExercise(originalId).length;
          const completedSetIndexes = day.completedSets[planned.exerciseId] ?? [];

          return (
            <ExerciseRow
              key={`${planned.exerciseId}-${index}`}
              index={index + 1}
              planned={planned}
              completedSetIndexes={completedSetIndexes}
              toggleDisabled={toggleDisabled}
              exerciseName={baseName}
              variantCount={variantCount}
              onSetPress={(setIndex) => onSetPress(planned.exerciseId, setIndex)}
              onVariantsPress={() => {
                if (variantChangeLocked || completedSetIndexes.length > 0) {
                  onVariantLocked();
                  return;
                }
                onVariantPress(originalId, baseName);
              }}
              onRevertPress={() => onRevertPress(planned.exerciseId)}
              variantLocked={variantChangeLocked || completedSetIndexes.length > 0}
            />
          );
        })}
      </View>

      {day.isToday && day.status === 'postponed' && (
        <SessionActionButton
          onPress={onUndoPostpone}
          icon="play-circle-outline">
          Reanudar sesion
        </SessionActionButton>
      )}

      {day.isToday && day.status !== 'completed' && day.status !== 'postponed' && day.status !== 'missed' && (
        <SessionActionButton
          onPress={onPostpone}
          icon="pause-circle-outline">
          Posponer sesion
        </SessionActionButton>
      )}
    </View>
  );
}

function SessionActionButton({
  children,
  icon,
  onPress,
}: {
  children: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const colors = useGymColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sessionActionButton,
        { borderColor: colors.borderStrong },
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={17} color={colors.textPrimary} style={styles.sessionActionIcon} />
      <Text style={[styles.sessionActionText, { color: colors.textPrimary }]}>{children}</Text>
    </Pressable>
  );
}

function ExerciseRow({
  index,
  planned,
  exerciseName,
  completedSetIndexes,
  toggleDisabled,
  variantCount,
  onSetPress,
  onVariantsPress,
  onRevertPress,
  variantLocked,
}: {
  index: number;
  planned: PlannedExercise;
  exerciseName: string;
  completedSetIndexes: number[];
  toggleDisabled: boolean;
  variantCount: number;
  onSetPress: (setIndex: number) => void;
  onVariantsPress: () => void;
  onRevertPress: () => void;
  variantLocked: boolean;
}) {
  const colors = useGymColors();

  const totalSets = Math.max(planned.sets ?? 1, 1);
  const completedSetCount = completedSetIndexes.length;
  const allDone = completedSetCount >= totalSets;

  const meta = [
    `${totalSets} × ${planned.reps}`,
    planned.rest ? `${planned.rest} desc.` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <View
      style={[
        styles.exerciseRow,
        {
          backgroundColor: allDone ? colors.accentSoft : colors.bgSurface,
          borderColor: allDone ? colors.accent : colors.border,
          opacity: toggleDisabled ? 0.92 : 1,
        },
      ]}>
      <View style={styles.exerciseLeftRail}>
        <Text style={[styles.exerciseIndex, { color: allDone ? colors.accent : colors.textMuted }]}>
          {String(index).padStart(2, '0')}
        </Text>
        {variantCount > 0 ? (
          <Pressable
            onPress={onVariantsPress}
            disabled={variantLocked}
            hitSlop={10}
            style={({ pressed }) => [
              styles.variantIconBtn,
              { backgroundColor: colors.accentSoft, opacity: variantLocked ? 0.45 : 1 },
              pressed && !variantLocked && styles.pressed,
            ]}>
            <Ionicons
              name="swap-horizontal-outline"
              size={18}
              color={colors.accent}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.exerciseInfo}>
        {/* Fila 1: nombre del ejercicio (tocar abre Youtube con la tecnica) */}
        <Pressable
          onPress={() => void openExerciseVideoSearch(exerciseName)}
          hitSlop={6}
          style={({ pressed }) => [styles.nameWrap, pressed && styles.pressed]}>
          <Text style={[styles.exerciseName, { color: colors.textPrimary }]} numberOfLines={2}>
            {exerciseName}
          </Text>
          <Ionicons name="logo-youtube" size={16} color={colors.danger} />
        </Pressable>

        {/* Fila 2: meta + (si aplica) revertir */}
        <View style={styles.exerciseMetaRow}>
          <Text style={[styles.exerciseMeta, { color: colors.textSecondary }]} numberOfLines={1}>
            {meta}
          </Text>
          {planned.originalExerciseId ? (
            <Text
              onPress={onRevertPress}
              suppressHighlighting
              style={[styles.revertInline, { color: colors.accent }]}
              numberOfLines={1}>
              · Revertir
            </Text>
          ) : null}
        </View>

        {/* Fila 3: pildoritas a la izquierda + chip de variantes a la derecha */}
        <View style={styles.setChipsRow}>
          {Array.from({ length: totalSets }, (_, setIndex) => {
            const isDone = completedSetIndexes.includes(setIndex);
            return (
              <Pressable
                key={setIndex}
                onPress={() => {
                  if (toggleDisabled) return;
                  onSetPress(setIndex);
                }}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.setChip,
                  {
                    backgroundColor: isDone ? colors.accent : colors.bgSurface,
                    borderColor: isDone ? colors.accent : colors.border,
                  },
                  pressed && !toggleDisabled && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.setChipText,
                    { color: isDone ? colors.bgCanvas : colors.textSecondary },
                  ]}>
                  {setIndex + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {planned.note ? (
          <Text style={[styles.exerciseNote, { color: colors.textMuted }]} numberOfLines={2}>
            {planned.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function buildVariantOptions(
  exerciseId: string | undefined,
  getVariantsByExercise: (id: string) => Variant[],
  onSelect: (variant: Variant) => void
): ActionSheetOption[] {
  if (!exerciseId) return [];

  const variants = getVariantsByExercise(exerciseId);
  if (variants.length === 0) {
    return [
      {
        label: 'Sin variantes disponibles',
        icon: 'alert-circle-outline',
        onPress: () => {},
      },
    ];
  }

  return variants.map((variant) => ({
    label: variant.name,
    icon: 'swap-horizontal-outline' as const,
    onPress: () => onSelect(variant),
  }));
}

function resolveReplacementExerciseId(variant: Variant, exercises: ReturnType<typeof useCatalog>['exercises']) {
  if (variant.replacementExerciseId && exercises.some((exercise) => exercise.id === variant.replacementExerciseId)) {
    return variant.replacementExerciseId;
  }

  const normalizedVariant = normalizeExerciseName(variant.name);
  return exercises.find((exercise) => normalizeExerciseName(exercise.name) === normalizedVariant)?.id;
}

function normalizeExerciseName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function RestCard({ day, weekDays }: { day: TrainingDay; weekDays: TrainingDay[] }) {
  const colors = useGymColors();
  const next = weekDays.find(
    (candidate) =>
      candidate.dateKey > day.dateKey && candidate.status !== 'rest' && candidate.plannedExercises.length > 0
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

function WeekStrip({
  weekDays,
  selectedDateKey,
  onSelect,
}: {
  weekDays: TrainingDay[];
  selectedDateKey: string;
  onSelect: (dateKey: string) => void;
}) {
  const colors = useGymColors();

  return (
    <View style={styles.weekStrip}>
      <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>TU SEMANA</Text>
      <View style={styles.weekRow}>
        {weekDays.map((day) => {
          const visual = getStatusVisual(day.status, colors);
          const selected = day.dateKey === selectedDateKey;
          return (
            <Pressable
              key={day.dateKey}
              onPress={() => onSelect(day.dateKey)}
              style={[
                styles.weekChip,
                {
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.bgSurface,
                  borderWidth: selected ? 1.5 : 1,
                },
              ]}>
              <Text
                style={[
                  styles.weekChipDay,
                  { color: day.isToday ? colors.accent : colors.textMuted },
                ]}>
                {day.isToday ? 'HOY' : day.dayLabel.slice(0, 3).toUpperCase()}
              </Text>
              <Ionicons name={visual.icon} size={16} color={visual.color} />
              <Text style={[styles.weekChipDate, { color: colors.textSecondary }]}>
                {day.shortDateLabel.split(' ')[0]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: TrainingDay['status'] }) {
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

function handleFailure(
  failure: TrainingActionFailure,
  show: (msg: string, variant?: 'error' | 'warning' | 'info') => void
) {
  if (failure === 'closed_missed') show(MISSED_MESSAGE, 'error');
  else if (failure === 'closed_postponed') show('Esta sesion ya quedo cerrada por hoy.', 'warning');
  else if (failure === 'already_completed') show('Ya cerraste el dia. No hace falta posponer.', 'info');
  else if (failure === 'exercise_already_started') show('Desmarca las series antes de cambiar variante.', 'warning');
  else show('Solo podes registrar ejercicios del dia actual.', 'warning');
}

// =============================================================
// Estilos
// =============================================================

const styles = StyleSheet.create({
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  dayContent: {
    gap: 24,
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
  sessionSection: {
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  exerciseIndex: {
    fontFamily: Fonts.monoData,
    fontSize: 13,
    width: 34,
    textAlign: 'center',
  },
  exerciseLeftRail: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  exerciseInfo: {
    flex: 1,
    gap: 6,
    alignSelf: 'stretch',
  },
  exerciseName: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'left',
    flexShrink: 1,
  },
  nameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    alignSelf: 'stretch',
  },
  revertInline: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseMeta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 12,
    textAlign: 'left',
    flexShrink: 1,
  },
  replacementMeta: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  revertText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  variantLink: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  variantLinkText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
  },
  variantIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techniqueLink: {
    minHeight: 26,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  techniqueLinkText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
  },
  exerciseNote: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  setChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
    alignSelf: 'stretch',
  },
  setChip: {
    minWidth: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setChipText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
  },
  setProgressText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    marginLeft: 4,
  },
  sessionActionButton: {
    marginTop: 4,
    alignSelf: 'stretch',
    height: 44,
    borderWidth: 1.5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sessionActionIcon: {
    // El layout flex de sessionActionButton ya posiciona el icono al lado del
    // texto sin colisiones. No necesita estilos propios.
  },
  sessionActionText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
