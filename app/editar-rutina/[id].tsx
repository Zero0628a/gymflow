import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ExercisePickerSheet } from '@/components/ui/exercise-picker-sheet';
import { ModalHeader } from '@/components/ui/modal-header';
import { Screen } from '@/components/ui/screen';
import { Toast } from '@/components/ui/toast';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import { useRoutines } from '@/providers/routines-provider';
import type { Exercise, PlannedDay } from '@/types';

const DAYS_OPTIONS = [3, 4, 5, 6];
const DEFAULT_SETS = 3;
const DEFAULT_REPS = '10';
const DEFAULT_REST = '60s';

export default function EditarRutinaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useGymColors();
  const insets = useSafeAreaInsets();
  const { routines, updateRoutine } = useRoutines();
  const { exercises: allExercises, loading: catalogLoading, muscles } = useCatalog();

  const routine = useMemo(() => routines.find((r) => r.id === id), [routines, id]);

  const [name, setName] = useState(routine?.name ?? '');
  const [daysPerWeek, setDaysPerWeek] = useState(routine?.daysPerWeek ?? 3);
  const [selectedIds, setSelectedIds] = useState<string[]>(routine?.exerciseIds ?? []);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [nameError, setNameError] = useState('');
  const [toast, setToast] = useState('');

  const selectedExercises = useMemo(
    () => selectedIds.map((eid) => allExercises.find((e) => e.id === eid)).filter(Boolean) as Exercise[],
    [allExercises, selectedIds]
  );

  const isComplete = name.trim().length > 0 && selectedIds.length > 0;

  function toggleExercise(eid: string) {
    setSelectedIds((prev) =>
      prev.includes(eid) ? prev.filter((e) => e !== eid) : [...prev, eid]
    );
  }

  function moveExercise(from: number, to: number) {
    if (to < 0 || to >= selectedIds.length) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  async function handleSave() {
    setNameError('');
    if (!name.trim()) {
      setNameError('Escribe un nombre para la rutina.');
      return;
    }
    if (!id) return;
    setSaving(true);
    try {
      const weeklyPlan = buildWeeklyPlan(selectedExercises, daysPerWeek, muscles);
      const focusLabel = buildFocusLabel(selectedExercises, muscles);
      await updateRoutine(id, { name, exerciseIds: selectedIds, daysPerWeek, weeklyPlan, focusLabel });
      router.back();
    } catch {
      setToast('No se pudo guardar. Revisá tu conexión.');
    } finally {
      setSaving(false);
    }
  }

  if (!routine) {
    return (
      <Screen>
        <ModalHeader title="Editar Rutina" onClose={() => router.back()} closeIcon="chevron-back" />
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textMuted }]}>Rutina no encontrada.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Toast visible={!!toast} message={toast} variant="error" onHide={() => setToast('')} />
      <ExercisePickerSheet
        visible={showPicker}
        exercises={allExercises}
        muscles={muscles}
        selectedIds={selectedIds}
        onToggle={toggleExercise}
        onClose={() => setShowPicker(false)}
      />
      <ModalHeader
        title="Editar Rutina"
        onClose={() => router.back()}
        closeIcon="chevron-back"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Nombre */}
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Nombre</Text>
          <TextInput
            style={[
              styles.heroInput,
              { color: colors.textPrimary, borderBottomColor: nameError ? colors.danger : colors.border },
            ]}
            placeholder="Nombre de la rutina"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            autoCapitalize="characters"
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
          />
          {nameError ? (
            <Text style={[styles.fieldError, { color: colors.danger }]}>{nameError}</Text>
          ) : (
            <Text style={[styles.helper, { color: colors.textSecondary }]}>
              {catalogLoading ? 'Cargando catálogo...' : `${selectedIds.length} ejercicios · ${daysPerWeek} días/semana`}
            </Text>
          )}
        </View>

        {/* Días por semana */}
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Días de entrenamiento</Text>
          <View style={styles.daysRow}>
            {DAYS_OPTIONS.map((d) => {
              const active = daysPerWeek === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDaysPerWeek(d)}
                  style={({ pressed }) => [
                    styles.dayChip,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.bgSurface,
                    },
                    pressed && { opacity: 0.82 },
                  ]}>
                  <Text style={[styles.dayChipNumber, { color: active ? colors.accent : colors.textPrimary }]}>
                    {d}
                  </Text>
                  <Text style={[styles.dayChipLabel, { color: active ? colors.accent : colors.textMuted }]}>
                    días
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Ejercicios */}
        <View style={styles.block}>
          <View style={styles.sectionRow}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Ejercicios</Text>
            {selectedIds.length > 0 && (
              <Text style={[styles.miniMeta, { color: colors.textMuted }]}>
                {selectedIds.length} seleccionados
              </Text>
            )}
          </View>

          {selectedExercises.length === 0 ? (
            <Pressable
              onPress={() => setShowPicker(true)}
              style={({ pressed }) => [
                styles.emptyPanel,
                { borderColor: colors.border, backgroundColor: colors.bgSurface },
                pressed && { opacity: 0.82 },
              ]}>
              <Ionicons name="add-circle-outline" size={28} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Agregar ejercicios</Text>
              <Text style={[styles.emptyCopy, { color: colors.textSecondary }]}>
                Toca para abrir el catálogo y elegir los ejercicios.
              </Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.selectedList}>
                {selectedExercises.map((exercise, index) => {
                  const muscleName = muscles.find((m) => m.id === exercise.muscleId)?.name ?? '';
                  return (
                    <View
                      key={exercise.id}
                      style={[
                        styles.selectedRow,
                        { borderColor: colors.border, backgroundColor: colors.bgSurface },
                      ]}>
                      <View style={styles.orderBlock}>
                        <Text style={[styles.orderIndex, { color: colors.textMuted }]}>
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                      </View>

                      <View style={styles.selectedInfo}>
                        <Text style={[styles.selectedName, { color: colors.textPrimary }]} numberOfLines={1}>
                          {exercise.name}
                        </Text>
                        <Text style={[styles.selectedMeta, { color: colors.textSecondary }]}>
                          {muscleName}
                        </Text>
                      </View>

                      <View style={styles.rowActions}>
                        <Pressable onPress={() => moveExercise(index, index - 1)} hitSlop={8} disabled={index === 0}>
                          <Ionicons
                            name="arrow-up-outline"
                            size={18}
                            color={index === 0 ? colors.textMuted : colors.textSecondary}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => moveExercise(index, index + 1)}
                          hitSlop={8}
                          disabled={index === selectedIds.length - 1}>
                          <Ionicons
                            name="arrow-down-outline"
                            size={18}
                            color={index === selectedIds.length - 1 ? colors.textMuted : colors.textSecondary}
                          />
                        </Pressable>
                        <Pressable onPress={() => toggleExercise(exercise.id)} hitSlop={8}>
                          <Ionicons name="close-outline" size={20} color={colors.danger} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>

              <Button
                onPress={() => setShowPicker(true)}
                size="md"
                variant="outline"
                icon="add">
                Agregar más ejercicios
              </Button>
            </>
          )}
        </View>

        {/* Preview */}
        {selectedIds.length > 0 && (
          <View style={styles.block}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Vista previa del plan</Text>
            <PlanPreview exercises={selectedExercises} daysPerWeek={daysPerWeek} muscles={muscles} />
          </View>
        )}

      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.bgSurface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}>
        <View style={styles.footerText}>
          <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Estado</Text>
          <Text style={[styles.footerValue, { color: colors.textPrimary }]} numberOfLines={1}>
            {isComplete ? 'Listo para guardar' : 'Falta nombre o ejercicios'}
          </Text>
        </View>
        <Button
          onPress={() => void handleSave()}
          size="lg"
          icon="save-outline"
          loading={saving}
          disabled={!isComplete}>
          Guardar
        </Button>
      </View>
    </Screen>
  );
}

// =============================================================
// Plan preview
// =============================================================

function PlanPreview({
  exercises,
  daysPerWeek,
  muscles,
}: {
  exercises: Exercise[];
  daysPerWeek: number;
  muscles: { id: string; name: string }[];
}) {
  const colors = useGymColors();
  const plan = buildWeeklyPlan(exercises, daysPerWeek, muscles);

  return (
    <View style={styles.preview}>
      {plan.map((day, i) => (
        <View
          key={i}
          style={[styles.previewDay, { borderColor: colors.border, backgroundColor: colors.bgSurface }]}>
          <View style={styles.previewDayHeader}>
            <Text style={[styles.previewDayLabel, { color: colors.accent }]}>{day.label}</Text>
            <Text style={[styles.previewDayFocus, { color: colors.textMuted }]}>{day.focus}</Text>
          </View>
          {day.exercises.map((ex) => {
            const exName = exercises.find((e) => e.id === ex.exerciseId)?.name ?? ex.exerciseId;
            return (
              <Text key={ex.exerciseId} style={[styles.previewExLine, { color: colors.textSecondary }]}>
                · {exName}  {ex.sets}×{ex.reps}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// =============================================================
// Helpers
// =============================================================

function buildWeeklyPlan(
  exercises: Exercise[],
  daysPerWeek: number,
  muscles: { id: string; name: string }[]
): PlannedDay[] {
  if (exercises.length === 0) return [];
  const days = Math.max(1, daysPerWeek);
  const buckets: Exercise[][] = Array.from({ length: days }, () => []);
  const sorted = [...exercises].sort((a, b) => a.muscleId.localeCompare(b.muscleId));
  sorted.forEach((e, i) => { buckets[i % days].push(e); });

  return buckets.map((bucket, i) => {
    const focusMuscles = [...new Set(bucket.map((e) => e.muscleId))]
      .slice(0, 2)
      .map((mId) => muscles.find((m) => m.id === mId)?.name ?? mId);
    return {
      label: `Sesión ${i + 1}`,
      focus: focusMuscles.join(' + ') || 'Entrenamiento',
      exercises: bucket.map((e) => ({
        exerciseId: e.id,
        sets: DEFAULT_SETS,
        reps: DEFAULT_REPS,
        rest: DEFAULT_REST,
      })) as PlannedDay['exercises'],
    };
  });
}

function buildFocusLabel(
  exercises: Exercise[],
  muscles: { id: string; name: string }[]
): string | undefined {
  if (exercises.length === 0) return undefined;
  const counts = new Map<string, number>();
  for (const e of exercises) counts.set(e.muscleId, (counts.get(e.muscleId) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
  return top.map(([mId]) => muscles.find((m) => m.id === mId)?.name ?? mId).join(' · ');
}

// =============================================================
// Styles
// =============================================================

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 160,
    gap: 32,
  },
  block: { gap: 14 },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroInput: {
    borderBottomWidth: 1,
    fontFamily: Fonts.display,
    fontSize: 36,
    lineHeight: 40,
    paddingBottom: 10,
  },
  helper: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldError: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dayChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  dayChipNumber: {
    fontFamily: Fonts.display,
    fontSize: 26,
    lineHeight: 28,
  },
  dayChipLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  miniMeta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  emptyPanel: {
    borderWidth: 1.5,
    borderRadius: 20,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 22,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  emptyCopy: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
  selectedList: { gap: 10 },
  selectedRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderBlock: {
    width: 28,
    alignItems: 'center',
  },
  orderIndex: {
    fontFamily: Fonts.monoData,
    fontSize: 13,
  },
  selectedInfo: { flex: 1, gap: 3 },
  selectedName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
  },
  selectedMeta: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  preview: {
    gap: 10,
  },
  previewDay: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  previewDayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewDayLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  previewDayFocus: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  previewExLine: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    flex: 1,
  },
  footerLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  footerValue: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    marginTop: 2,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
  },
});
