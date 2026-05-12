import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { ModalHeader } from '@/components/ui/modal-header';
import { Screen } from '@/components/ui/screen';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import { useRoutines } from '@/providers/routines-provider';
import type { Exercise } from '@/types';

export default function CrearRutinaScreen() {
  const colors = useGymColors();
  const { createRoutine } = useRoutines();
  const { exercises: allExercises, loading: catalogLoading, muscles } = useCatalog();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);

  const selectedExercises = useMemo(
    () => selectedIds.map((id) => allExercises.find((exercise) => exercise.id === id)).filter(Boolean) as Exercise[],
    [allExercises, selectedIds]
  );

  const visibleExercises = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return allExercises.filter((exercise) => {
      const matchesFilter = muscleFilter ? exercise.muscleId === muscleFilter : true;
      const matchesQuery = normalized
        ? `${exercise.name} ${exercise.description}`.toLowerCase().includes(normalized)
        : true;

      return matchesFilter && matchesQuery;
    });
  }, [allExercises, muscleFilter, query]);

  const summary = useMemo(() => buildSummary(selectedExercises, muscles), [muscles, selectedExercises]);
  const isComplete = name.trim().length > 0 && selectedIds.length > 0;

  function toggleExercise(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  }

  function moveExercise(from: number, to: number) {
    if (to < 0 || to >= selectedIds.length) {
      return;
    }

    setSelectedIds((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  async function handleSave(status: 'draft' | 'ready') {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Escribe un nombre para la rutina.');
      return;
    }

    if (status === 'ready' && selectedIds.length === 0) {
      Alert.alert('Sin ejercicios', 'Agrega al menos un ejercicio para guardarla.');
      return;
    }

    setSaving(true);

    try {
      await createRoutine({
        name,
        exerciseIds: selectedIds,
        focusLabel: summary.focusLabel,
        status,
      });

      Alert.alert(
        status === 'draft' ? 'Borrador guardado' : 'Rutina guardada',
        status === 'draft'
          ? 'La rutina quedó lista para retomarla después.'
          : `"${name.trim()}" ya está disponible en tus rutinas.`,
        [{ text: 'Aceptar', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error al guardar rutina:', error);
      Alert.alert('No se pudo guardar', 'Revisá tu conexión y probá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ModalHeader
        title="Nueva Rutina"
        onClose={() => router.back()}
        closeIcon="chevron-back"
        actionLabel="Borrador"
        onAction={() => void handleSave('draft')}
        actionDisabled={saving || !name.trim()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.block}>
          <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Nombre</Text>
          <TextInput
            style={[
              styles.heroInput,
              {
                color: colors.textPrimary,
                borderBottomColor: colors.border,
              },
            ]}
            placeholder="Nombre de la rutina"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            value={name}
            onChangeText={setName}
          />
          <Text style={[styles.helper, { color: colors.textSecondary }]}>
            {catalogLoading ? 'Cargando catalogo...' : summary.supportLine}
          </Text>
        </View>

        <View style={styles.block}>
          <View style={styles.sectionRow}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Ejercicios</Text>
            <Text style={[styles.miniMeta, { color: colors.textMuted }]}>
              {selectedIds.length} seleccionados
            </Text>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={[styles.emptyPanel, { borderColor: colors.border, backgroundColor: colors.bgSurface }]}>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aún no agregaste ejercicios</Text>
              <Text style={[styles.emptyCopy, { color: colors.textSecondary }]}>
                Arma la base y luego ordena el recorrido de la sesión.
              </Text>
            </View>
          ) : (
            <View style={styles.selectedList}>
              {selectedExercises.map((exercise, index) => (
                <View
                  key={exercise.id}
                  style={[
                    styles.selectedRow,
                    { borderColor: colors.border, backgroundColor: colors.bgSurface },
                  ]}>
                  <View style={styles.orderBlock}>
                    <Ionicons name="reorder-three-outline" size={18} color={colors.textMuted} />
                    <Text style={[styles.orderIndex, { color: colors.textMuted }]}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                  </View>

                  <View style={styles.selectedInfo}>
                    <Text style={[styles.selectedName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {exercise.name}
                    </Text>
                    <Text style={[styles.selectedMeta, { color: colors.textSecondary }]}>
                      {getMuscleName(muscles, exercise.muscleId)}
                    </Text>
                  </View>

                  <View style={styles.rowActions}>
                    <Pressable onPress={() => moveExercise(index, index - 1)} hitSlop={8}>
                      <Ionicons name="arrow-up-outline" size={18} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => moveExercise(index, index + 1)} hitSlop={8}>
                      <Ionicons name="arrow-down-outline" size={18} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => toggleExercise(exercise.id)} hitSlop={8}>
                      <Ionicons name="close-outline" size={20} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Button
            onPress={() => setShowPicker((value) => !value)}
            size="md"
            variant="outline"
            icon={showPicker ? 'remove' : 'add'}>
            {showPicker ? 'Ocultar ejercicios' : 'Agregar ejercicio'}
          </Button>
        </View>

        {showPicker && (
          <View style={styles.block}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Biblioteca</Text>

            <View
              style={[
                styles.searchBox,
                { borderColor: colors.border, backgroundColor: colors.bgSurfaceAlt },
              ]}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Buscar ejercicio"
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}>
              <FilterChip
                label="Todos"
                active={muscleFilter === null}
                onPress={() => setMuscleFilter(null)}
              />
              {muscles.map((muscle) => (
                <FilterChip
                  key={muscle.id}
                  label={muscle.name}
                  active={muscleFilter === muscle.id}
                  onPress={() => setMuscleFilter(muscle.id)}
                />
              ))}
            </ScrollView>

            <View style={styles.libraryList}>
              {visibleExercises.map((exercise) => {
                const selected = selectedIds.includes(exercise.id);

                return (
                  <Pressable
                    key={exercise.id}
                    onPress={() => toggleExercise(exercise.id)}
                    style={({ pressed }) => [
                      styles.libraryRow,
                      {
                        borderColor: selected ? colors.accent : colors.border,
                        backgroundColor: selected ? colors.bgSurface : colors.bgSurfaceAlt,
                      },
                      pressed && styles.libraryPressed,
                    ]}>
                    <View style={styles.libraryText}>
                      <Text style={[styles.libraryName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {exercise.name}
                      </Text>
                      <Text style={[styles.libraryMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                        {getMuscleName(muscles, exercise.muscleId)} · {exercise.description}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.pickerCheck,
                        {
                          borderColor: selected ? colors.accent : colors.borderStrong,
                          backgroundColor: selected ? colors.accent : 'transparent',
                        },
                      ]}>
                      {selected && <Ionicons name="checkmark" size={14} color={colors.textInverse} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.bgSurface, borderTopColor: colors.border },
        ]}>
        <View>
          <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Estado actual</Text>
          <Text style={[styles.footerValue, { color: colors.textPrimary }]}>
            {isComplete ? 'Lista para guardar' : 'Falta nombre o ejercicios'}
          </Text>
        </View>

        <Button
          onPress={() => void handleSave('ready')}
          size="lg"
          icon="save-outline"
          loading={saving}
          disabled={!isComplete}>
          Guardar rutina
        </Button>
      </View>
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useGymColors();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? colors.accent : colors.bgSurface,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}>
      <Text style={[styles.filterText, { color: active ? colors.textInverse : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function getMuscleName(muscles: { id: string; name: string }[], muscleId: string) {
  return muscles.find((muscle) => muscle.id === muscleId)?.name ?? 'General';
}

function buildSummary(
  selectedExercises: Exercise[],
  muscles: { id: string; name: string }[]
) {
  if (selectedExercises.length === 0) {
    return {
      focusLabel: undefined,
      supportLine: 'Sin ejercicios todavía.',
    };
  }

  const counts = new Map<string, number>();
  for (const exercise of selectedExercises) {
    counts.set(exercise.muscleId, (counts.get(exercise.muscleId) ?? 0) + 1);
  }

  const ordered = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  const focusLabel = ordered
    .slice(0, 2)
    .map(([muscleId]) => getMuscleName(muscles, muscleId))
    .join(' · ');

  return {
    focusLabel,
    supportLine: `${selectedExercises.length} ejercicios · ${focusLabel}`,
  };
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 160,
    gap: 28,
  },
  block: {
    gap: 14,
  },
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
    textTransform: 'uppercase',
  },
  helper: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
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
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  emptyCopy: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  selectedList: {
    gap: 10,
  },
  selectedRow: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    gap: 2,
  },
  orderIndex: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
  },
  selectedInfo: {
    flex: 1,
    gap: 3,
  },
  selectedName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
  },
  selectedMeta: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterRow: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  libraryList: {
    gap: 10,
  },
  libraryRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  libraryPressed: {
    opacity: 0.92,
  },
  libraryText: {
    flex: 1,
    gap: 4,
  },
  libraryName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
  },
  libraryMeta: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
  },
  pickerCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
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
});
