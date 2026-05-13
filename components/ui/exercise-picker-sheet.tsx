import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import type { Exercise, Muscle } from '@/types';

type Props = {
  visible: boolean;
  exercises: Exercise[];
  muscles: Muscle[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
};

export function ExercisePickerSheet({
  visible,
  exercises,
  muscles,
  selectedIds,
  onToggle,
  onClose,
}: Props) {
  const colors = useGymColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);

  const translateY = useSharedValue(900);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200, mass: 0.9 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(900, { duration: 230 });
      setQuery('');
      setMuscleFilter(null);
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const filteredExercises = useMemo(() => {
    const norm = query.trim().toLowerCase();
    return exercises.filter((e) => {
      const matchesMuscle = muscleFilter ? e.muscleId === muscleFilter : true;
      const matchesQuery = norm
        ? `${e.name} ${e.description}`.toLowerCase().includes(norm)
        : true;
      return matchesMuscle && matchesQuery;
    });
  }, [exercises, muscleFilter, query]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>

      {/* Overlay — opacity only */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet — translateY only */}
      <Animated.View style={[styles.sheetWrapper, sheetStyle]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bgSurface,
              paddingBottom: insets.bottom + 8,
            },
          ]}>

          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                  Ejercicios
                </Text>
                {selectedIds.length > 0 && (
                  <Text style={[styles.selectedCount, { color: colors.accent }]}>
                    {selectedIds.length} seleccionados
                  </Text>
                )}
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { borderColor: colors.accent, backgroundColor: colors.accentSoft },
                  pressed && { opacity: 0.7 },
                ]}>
                <Ionicons name="checkmark" size={18} color={colors.accent} />
              </Pressable>
            </View>
          </View>

          {/* Search */}
          <View
            style={[
              styles.searchBox,
              { borderColor: colors.border, backgroundColor: colors.bgSurfaceAlt },
            ]}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar ejercicio..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Muscle filter — fixed height row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}>
            <FilterChip
              label="Todos"
              active={muscleFilter === null}
              onPress={() => setMuscleFilter(null)}
            />
            {muscles.map((m) => (
              <FilterChip
                key={m.id}
                label={m.name}
                active={muscleFilter === m.id}
                onPress={() => setMuscleFilter(muscleFilter === m.id ? null : m.id)}
              />
            ))}
          </ScrollView>

          {/* Exercise list — takes remaining space */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {filteredExercises.length === 0 ? (
              <View style={styles.emptyRow}>
                <Ionicons name="search-outline" size={28} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Sin resultados
                </Text>
              </View>
            ) : (
              filteredExercises.map((exercise) => {
                const selected = selectedIds.includes(exercise.id);
                const muscleName = muscles.find((m) => m.id === exercise.muscleId)?.name ?? '';
                return (
                  <Pressable
                    key={exercise.id}
                    onPress={() => onToggle(exercise.id)}
                    style={({ pressed }) => [
                      styles.exerciseRow,
                      {
                        borderColor: selected ? colors.accent : colors.border,
                        backgroundColor: selected ? colors.accentSoft : colors.bgSurfaceAlt,
                      },
                      pressed && { opacity: 0.85 },
                    ]}>
                    <View style={styles.exerciseText}>
                      <Text
                        style={[styles.exerciseName, { color: colors.textPrimary }]}
                        numberOfLines={1}>
                        {exercise.name}
                      </Text>
                      <Text
                        style={[styles.exerciseMeta, { color: colors.textSecondary }]}
                        numberOfLines={1}>
                        {muscleName}
                        {exercise.description ? ` · ${exercise.description}` : ''}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.check,
                        {
                          borderColor: selected ? colors.accent : colors.borderStrong,
                          backgroundColor: selected ? colors.accent : 'transparent',
                        },
                      ]}>
                      {selected && (
                        <Ionicons name="checkmark" size={13} color={colors.textInverse} />
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
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
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.accent : colors.bgSurface,
          borderColor: active ? colors.accent : colors.border,
        },
        pressed && { opacity: 0.8 },
      ]}>
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.textInverse : colors.textSecondary },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '12%',
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    // NO gap here — explicit spacing via margins on children
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  selectedCount: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 38,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 34,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
    paddingBottom: 12,
  },
  exerciseRow: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseText: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
  },
  exerciseMeta: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRow: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
  },
});
