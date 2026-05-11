import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import type { Variant } from '@/types';

export default function VariantesScreen() {
  const { ejercicio } = useLocalSearchParams<{ ejercicio: string }>();
  const colors = useGymColors();
  const { getExerciseById, getVariantsByExercise, loading } = useCatalog();

  const exercise = getExerciseById(ejercicio ?? '');
  const lista = getVariantsByExercise(ejercicio ?? '');

  return (
    <Screen>
      <ScreenHeader
        title="Variantes"
        subtitle={loading ? 'Cargando alternativas' : `Base para ${exercise?.name ?? 'ejercicio'}`}
        left={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />

      {exercise ? (
        <View style={[styles.originCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <Text style={[styles.originLabel, { color: colors.accent }]}>Ejercicio original</Text>
          <Text style={[styles.originTitle, { color: colors.textPrimary }]}>{exercise.name}</Text>
          <Text style={[styles.originBody, { color: colors.textSecondary }]}>{exercise.description}</Text>
        </View>
      ) : null}

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VariantRow item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="swap-horizontal-outline"
              title="Sin variantes"
              description="Todavia no hay alternativas cargadas para este ejercicio."
            />
          ) : null
        }
      />
    </Screen>
  );
}

function VariantRow({ item }: { item: Variant }) {
  const colors = useGymColors();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name="swap-horizontal-outline" size={18} color={colors.accent} />
      </View>

      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.rowBody, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  originCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  originLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  originTitle: {
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 32,
    textTransform: 'uppercase',
  },
  originBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
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
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 4,
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
});
