import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { Screen } from '@/components/ui/screen';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import { useTraining } from '@/providers/training-provider';
import type { LoggedSet, PlannedExercise } from '@/types';

export default function RegistroEjercicioScreen() {
  const { ejercicio: exerciseId, dateKey } = useLocalSearchParams<{
    ejercicio: string;
    dateKey: string;
  }>();

  const colors = useGymColors();
  const insets = useSafeAreaInsets();
  const { getExerciseById } = useCatalog();
  const { today, getExerciseLog, saveExerciseLog, toggleExercise } = useTraining();

  const exercise = useMemo(
    () => (exerciseId ? getExerciseById(exerciseId) : undefined),
    [exerciseId, getExerciseById]
  );

  const planned: PlannedExercise | undefined = useMemo(
    () => today?.plannedExercises.find((p) => p.exerciseId === exerciseId),
    [today, exerciseId]
  );

  const existingLog = useMemo(
    () => (dateKey && exerciseId ? getExerciseLog(dateKey, exerciseId) : null),
    [dateKey, exerciseId, getExerciseLog]
  );

  const initialSets = useMemo<LoggedSet[]>(() => {
    if (existingLog?.sets?.length) return existingLog.sets;
    const count = planned?.sets ?? 3;
    return Array.from({ length: count }, (_, i) => ({
      setNumber: i + 1,
      weight: 0,
      reps: 0,
    }));
  }, [existingLog, planned]);

  const [sets, setSets] = useState<LoggedSet[]>(initialSets);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSets(initialSets);
  }, [initialSets]);

  function updateSet(index: number, field: 'weight' | 'reps', raw: string) {
    const value = parseFloat(raw) || 0;
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function addSet() {
    setSets((prev) => [
      ...prev,
      { setNumber: prev.length + 1, weight: prev.at(-1)?.weight ?? 0, reps: prev.at(-1)?.reps ?? 0 },
    ]);
  }

  function removeSet(index: number) {
    if (sets.length <= 1) return;
    setSets((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, setNumber: i + 1 }))
    );
  }

  async function handleSave() {
    if (!dateKey || !exerciseId) return;
    const hasData = sets.some((s) => s.weight > 0 || s.reps > 0);
    if (!hasData) {
      Alert.alert('Sin datos', 'Ingresa al menos peso o reps en una serie antes de guardar.');
      return;
    }

    setSaving(true);
    try {
      await saveExerciseLog(dateKey, exerciseId, sets);
      // Marcar el ejercicio como completado si no lo estaba
      if (today && !today.completedExerciseIds.includes(exerciseId)) {
        await toggleExercise(dateKey, exerciseId);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Intentalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}>
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

          <View style={styles.headerText}>
            <Text style={[styles.exerciseName, { color: colors.textPrimary }]} numberOfLines={1}>
              {exercise?.name ?? exerciseId}
            </Text>
            {planned ? (
              <Text style={[styles.plannedMeta, { color: colors.textMuted }]}>
                Plan: {planned.sets} series × {planned.reps}
                {planned.rest ? `  ·  ${planned.rest} desc.` : ''}
              </Text>
            ) : null}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.tableHeader}>
            <Text style={[styles.colLabel, styles.colSerie, { color: colors.textMuted }]}>SERIE</Text>
            <Text style={[styles.colLabel, styles.colWeight, { color: colors.textMuted }]}>KG</Text>
            <Text style={[styles.colLabel, styles.colReps, { color: colors.textMuted }]}>REPS</Text>
            <View style={styles.colDelete} />
          </View>

          {sets.map((set, index) => (
            <SetRow
              key={`set-${set.setNumber}-${index}`}
              set={set}
              onWeightChange={(v) => updateSet(index, 'weight', v)}
              onRepsChange={(v) => updateSet(index, 'reps', v)}
              onRemove={() => removeSet(index)}
              canRemove={sets.length > 1}
            />
          ))}

          <Pressable
            onPress={addSet}
            style={({ pressed }) => [
              styles.addSetBtn,
              { borderColor: colors.border, backgroundColor: colors.bgSurfaceAlt },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
            <Text style={[styles.addSetText, { color: colors.accent }]}>Agregar serie</Text>
          </Pressable>

          {totalVolume > 0 ? (
            <View style={[styles.volumeBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
              <Text style={[styles.volumeLabel, { color: colors.textMuted }]}>VOLUMEN TOTAL</Text>
              <Text style={[styles.volumeValue, { color: colors.accent }]}>
                {totalVolume % 1 === 0 ? totalVolume : totalVolume.toFixed(1)} kg
              </Text>
              <Text style={[styles.volumeSub, { color: colors.textSecondary }]}>
                {sets.length} series registradas
              </Text>
            </View>
          ) : null}

          {planned?.note ? (
            <View style={[styles.noteBox, { borderColor: colors.border, backgroundColor: colors.bgSurfaceAlt }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>{planned.note}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            onPress={() => void handleSave()}
            loading={saving}
            icon="checkmark-circle-outline"
            style={styles.saveBtn}>
            Guardar series
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SetRow({
  set,
  onWeightChange,
  onRepsChange,
  onRemove,
  canRemove,
}: {
  set: LoggedSet;
  onWeightChange: (v: string) => void;
  onRepsChange: (v: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const colors = useGymColors();
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);

  return (
    <View style={[styles.setRow, { borderColor: colors.border, backgroundColor: colors.bgSurface }]}>
      <Text style={[styles.colSerie, styles.setNumber, { color: colors.textMuted }]}>
        {String(set.setNumber).padStart(2, '0')}
      </Text>

      <TextInput
        ref={weightRef}
        style={[styles.colWeight, styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
        keyboardType="decimal-pad"
        defaultValue={set.weight > 0 ? String(set.weight) : ''}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        onChangeText={onWeightChange}
        returnKeyType="next"
        onSubmitEditing={() => repsRef.current?.focus()}
        selectTextOnFocus
      />

      <TextInput
        ref={repsRef}
        style={[styles.colReps, styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
        keyboardType="number-pad"
        defaultValue={set.reps > 0 ? String(set.reps) : ''}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        onChangeText={onRepsChange}
        returnKeyType="done"
        selectTextOnFocus
      />

      <Pressable
        onPress={onRemove}
        disabled={!canRemove}
        style={({ pressed }) => [
          styles.colDelete,
          styles.deleteBtn,
          pressed && canRemove && styles.pressed,
          !canRemove && { opacity: 0.2 },
        ]}>
        <Ionicons name="remove-circle-outline" size={20} color={colors.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 26,
    textTransform: 'uppercase',
  },
  plannedMeta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 6,
    gap: 8,
  },
  colLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  colSerie: {
    width: 36,
    textAlign: 'center',
  },
  colWeight: {
    flex: 1,
    textAlign: 'center',
  },
  colReps: {
    flex: 1,
    textAlign: 'center',
  },
  colDelete: {
    width: 32,
    alignItems: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  setNumber: {
    fontFamily: Fonts.monoData,
    fontSize: 14,
  },
  input: {
    fontFamily: Fonts.monoData,
    fontSize: 20,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlign: 'center',
    minHeight: 44,
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addSetText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
  },
  volumeBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  volumeLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  volumeValue: {
    fontFamily: Fonts.display,
    fontSize: 36,
    lineHeight: 38,
  },
  volumeSub: {
    fontFamily: Fonts.monoRegular,
    fontSize: 12,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveBtn: {
    width: '100%',
  },
  pressed: {
    opacity: 0.82,
  },
});
