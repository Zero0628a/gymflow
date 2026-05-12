import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Fonts } from '@/constants/theme';
import { useGymColors } from '@/hooks/use-gym-colors';
import { useCatalog } from '@/providers/catalog-provider';
import type { Muscle } from '@/types';

export default function MusculosScreen() {
  const colors = useGymColors();
  const { loading, muscles } = useCatalog();

  return (
    <Screen>
      <ScreenHeader
        title="Musculos"
        subtitle={loading ? 'Consultando catalogo' : `${muscles.length} grupos disponibles`}
      />

      <FlatList
        data={muscles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => <MuscleCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="body-outline"
              title="Catalogo vacio"
              description="No hay grupos musculares disponibles."
            />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Biblioteca</Text>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Elige la zona a entrenar</Text>
            <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
              Explora ejercicios y variantes por grupo muscular.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

function MuscleCard({ item }: { item: Muscle }) {
  const colors = useGymColors();

  return (
    <Pressable
      onPress={() => router.push(`/ejercicios/${item.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.bgSurface,
          borderColor: colors.border,
        },
        pressed && styles.cardPressed,
      ]}>
      <View style={styles.cardTop}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Musculo</Text>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      </View>

      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.name}</Text>

      {item.image ? <Image source={item.image} style={styles.cardImage} contentFit="contain" /> : null}

      <View style={styles.cardFooter}>
        <Text style={[styles.cardFooterText, { color: colors.textMuted }]}>Ver ejercicios</Text>
        <Ionicons name="arrow-forward-outline" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 12,
  },
  headerBlock: {
    marginBottom: 18,
    gap: 8,
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
  heroBody: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  gridRow: {
    gap: 12,
  },
  card: {
    flex: 1,
    minHeight: 210,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardTitle: {
    fontFamily: Fonts.display,
    fontSize: 26,
    lineHeight: 28,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  cardImage: {
    width: '100%',
    height: 92,
    marginTop: 12,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardFooterText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
