import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import type { Exercise } from '@/types';

export default function EjerciciosScreen() {
  const { musculo } = useLocalSearchParams<{ musculo: string }>();
  const colors = useGymColors();
  const { getExercisesByMuscle, getMuscleById, getVariantsByExercise, loading } = useCatalog();

  const muscle = getMuscleById(musculo ?? '');
  const lista = getExercisesByMuscle(musculo ?? '');

  return (
    <Screen>
      <ScreenHeader
        title={muscle?.name ?? 'Ejercicios'}
        subtitle={loading ? 'Cargando catalogo' : `${lista.length} ejercicios disponibles`}
        left={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        }
      />

      {muscle ? (
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.border,
            },
          ]}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Musculo</Text>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{muscle.name}</Text>
            <Text style={[styles.heroText, { color: colors.textSecondary }]}>
              Elige un ejercicio y sigue directo hacia variantes funcionales si la maquina esta ocupada.
            </Text>
          </View>
          {muscle.image ? <Image source={muscle.image} style={styles.heroImage} contentFit="contain" /> : null}
        </View>
      ) : null}

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ExerciseRow item={item} index={index} variantCount={getVariantsByExercise(item.id).length} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="barbell-outline"
              title="Sin ejercicios"
              description="Todavia no hay ejercicios cargados para este musculo."
            />
          ) : null
        }
      />
    </Screen>
  );
}

function ExerciseRow({ item, index, variantCount }: { item: Exercise; index: number; variantCount: number }) {
  const colors = useGymColors();
  const variantLabel = variantCount === 1 ? '1 variante' : `${variantCount} variantes`;

  return (
    <Pressable
      onPress={() => router.push(`/variantes/${item.id}`)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        },
        pressed && styles.rowPressed,
      ]}>
      <View style={styles.rowLeft}>
        <Text style={[styles.index, { color: colors.accent }]}>{String(index + 1).padStart(2, '0')}</Text>
      </View>

      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.rowBody, { color: colors.textSecondary }]}>{item.description}</Text>
        <View style={styles.rowMeta}>
          <Text style={[styles.variantCount, { color: colors.accent }]}>{variantLabel}</Text>
          <Text style={[styles.variantAction, { color: colors.textSecondary }]}>Ver alternativas</Text>
        </View>
      </View>

      <Ionicons name="arrow-forward-outline" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    minHeight: 160,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: Fonts.display,
    fontSize: 34,
    lineHeight: 36,
    textTransform: 'uppercase',
  },
  heroText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  heroImage: {
    width: 116,
    height: 116,
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  row: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowLeft: {
    width: 34,
  },
  index: {
    fontFamily: Fonts.monoData,
    fontSize: 12,
  },
  rowContent: {
    flex: 1,
    gap: 5,
  },
  rowTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
  },
  rowBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  rowMeta: {
    marginTop: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  variantCount: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
  },
  variantAction: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
  },
});
